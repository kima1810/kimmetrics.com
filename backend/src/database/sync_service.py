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
        days_checked = 0
        
        print(f"   Syncing from {start_date.date()} to {end_date.date()}")
        
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            days_checked += 1
            
            if days_checked % 10 == 0:
                print(f"   Progress: {days_checked} days checked, {games_synced} games synced...")
            
            try:
                daily_games = self.client.schedule.daily_schedule(date=date_str)
                games_list = daily_games if isinstance(daily_games, list) else daily_games.get('games', [])
                
                games_to_upsert = []
                for game in games_list:
                    # SKIP non-NHL games (game_type 2 = regular season, 3 = playoffs)
                    game_type = game.get('gameType', 0)
                    if game_type not in [2, 3]:
                        continue
                    
                    start_time_str = game.get('startTimeUTC', '')
                    if not start_time_str:
                        continue
                    
                    try:
                        game_date = datetime.fromisoformat(start_time_str.replace('Z', '+00:00')).date()
                    except:
                        continue
                    
                    home_abbrev = game.get('homeTeam', {}).get('abbrev')
                    away_abbrev = game.get('awayTeam', {}).get('abbrev')
                    
                    if not home_abbrev or not away_abbrev:
                        continue
                    
                    games_to_upsert.append({
                        'id': game.get('id'),
                        'game_date': game_date,
                        'season': season,
                        'game_type': game_type,
                        'game_state': game.get('gameState', ''),
                        'home_team_abbrev': home_abbrev,
                        'away_team_abbrev': away_abbrev,
                        'home_score': game.get('homeTeam', {}).get('score', 0),
                        'away_score': game.get('awayTeam', {}).get('score', 0),
                        'period_type': game.get('periodDescriptor', {}).get('periodType', 'REG')
                    })
                
                if games_to_upsert:
                    bulk_upsert_games(db, games_to_upsert)
                    games_synced += len(games_to_upsert)
            
            except Exception as e:
                # Silently continue on errors (don't crash sync)
                pass
            
            current_date += timedelta(days=1)
        
        print(f"   Completed: {days_checked} days checked, {games_synced} total games synced")
        return games_synced
    
    def sync_current_season(self, db: Session, season: str = "20242025"):
        """Sync entire current season"""
        latest_date = get_latest_game_date(db, season)
        
        if latest_date:
            start_date = datetime.combine(latest_date, datetime.min.time()) + timedelta(days=1)
            print(f"   Database has games up to {latest_date}")
            print(f"   Syncing new games from {start_date.date()} onwards...")
        else:
            start_date = datetime(int(season[:4]), 10, 1)
            print(f"   No games in database, syncing full season from {start_date.date()}")
        
        end_date = datetime.now()
        
        return self.sync_games_for_date_range(db, start_date, end_date, season)