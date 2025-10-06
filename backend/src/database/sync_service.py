from nhlpy import NHLClient
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import Optional
from .queries import (
    bulk_upsert_teams,
    bulk_upsert_games,
    get_latest_game_date
)

class DatabaseSyncService:
    """Service to sync NHL data to database"""
    
    def __init__(self):
        self.client = NHLClient()
    
    def sync_teams(self, db: Session):
        """Sync all teams to database"""
        teams_data = self.client.teams.teams()
        
        teams_to_upsert = []
        for team in teams_data:
            teams_to_upsert.append({
                'abbrev': team.get('abbr', ''),
                'name': team.get('name', ''),
                'franchise_id': team.get('franchise_id'),
                'division': team.get('division', {}).get('name', ''),
                'conference': team.get('conference', {}).get('name', ''),
                'metadata_json': team
            })
        
        bulk_upsert_teams(db, teams_to_upsert)
        return len(teams_to_upsert)
    
    def sync_games_for_date_range(
        self, 
        db: Session, 
        start_date: datetime, 
        end_date: datetime,
        season: str
    ):
        """Sync games for a specific date range"""
        current_date = start_date
        games_synced = 0
        
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            
            try:
                daily_games = self.client.schedule.daily_schedule(date=date_str)
                
                games_to_upsert = []
                for game in daily_games.get('games', []):
                    game_date_str = game.get('gameDate', '')
                    if not game_date_str:
                        continue
                    
                    game_date = datetime.fromisoformat(game_date_str.split('T')[0]).date()
                    
                    games_to_upsert.append({
                        'id': game.get('id'),
                        'game_date': game_date,
                        'season': season,
                        'game_type': game.get('gameType', 2),
                        'game_state': game.get('gameState', ''),
                        'home_team_abbrev': game.get('homeTeam', {}).get('abbrev'),
                        'away_team_abbrev': game.get('awayTeam', {}).get('abbrev'),
                        'home_score': game.get('homeTeam', {}).get('score', 0),
                        'away_score': game.get('awayTeam', {}).get('score', 0),
                        'period_type': game.get('periodDescriptor', {}).get('periodType', 'REG')
                    })
                
                if games_to_upsert:
                    bulk_upsert_games(db, games_to_upsert)
                    games_synced += len(games_to_upsert)
            
            except Exception as e:
                print(f"Error syncing {date_str}: {e}")
            
            current_date += timedelta(days=1)
        
        return games_synced
    
    def sync_current_season(self, db: Session, season: str = "20242025"):
        """Sync entire current season"""
        # Get latest game date in DB
        latest_date = get_latest_game_date(db, season)
        
        if latest_date:
            # Sync from day after latest to today
            start_date = latest_date + timedelta(days=1)
        else:
            # Sync entire season
            start_date = datetime(int(season[:4]), 10, 1)
        
        end_date = datetime.now()
        
        return self.sync_games_for_date_range(db, start_date, end_date, season)