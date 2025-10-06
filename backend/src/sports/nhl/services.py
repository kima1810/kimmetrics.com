from nhlpy import NHLClient
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from ...database.config import get_db
from ...database.queries import (
    calculate_standings_from_db,
    get_latest_game_date,
    get_all_teams
)
from ...database.sync_service import DatabaseSyncService

class NHLService:
    def __init__(self):
        self.client = NHLClient()
        self.sync_service = DatabaseSyncService()
    
    async def get_standings(
        self, 
        season: str = "20242025", 
        start_date: Optional[str] = None, 
        end_date: Optional[str] = None, 
        division: Optional[str] = None, 
        conference: Optional[str] = None,
        db: Session = None
    ):
        """Get NHL standings - uses database for custom date ranges"""
        try:
            if start_date or end_date:
                # Use database for custom date ranges (FAST!)
                return await self._get_standings_from_db(
                    season, start_date, end_date, division, conference, db
                )
            else:
                # Use league standings API for full season (still fast)
                standings = self.client.standings.league_standings(season=season)
                return self._filter_standings(standings, division, conference)
        except Exception as e:
            raise Exception(f"Failed to fetch standings: {str(e)}")
    
    async def _get_standings_from_db(
        self,
        season: str,
        start_date: Optional[str],
        end_date: Optional[str],
        division: Optional[str],
        conference: Optional[str],
        db: Session
    ):
        """Calculate standings from database (instant!)"""
        # Apply smart date defaults
        if start_date and not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        elif end_date and not start_date:
            start_date = f"{season[:4]}-10-01"
        
        # Ensure data is synced up to end_date
        latest_in_db = get_latest_game_date(db, season)
        end_dt = datetime.fromisoformat(end_date).date()
        
        if not latest_in_db or latest_in_db < end_dt:
            # Sync missing data
            sync_start = latest_in_db + timedelta(days=1) if latest_in_db else datetime(int(season[:4]), 10, 1)
            sync_end = min(end_dt, datetime.now().date())
            
            self.sync_service.sync_games_for_date_range(
                db,
                datetime.combine(sync_start, datetime.min.time()),
                datetime.combine(sync_end, datetime.min.time()),
                season
            )
        
        # Calculate standings from database
        start_dt = datetime.fromisoformat(start_date).date()
        
        return calculate_standings_from_db(
            db, start_dt, end_dt, season, division, conference
        )
    
    def _filter_standings(self, standings: Dict, division: Optional[str], conference: Optional[str]) -> Dict:
        """Filter full season standings by division/conference"""
        if not division and not conference:
            return standings
        
        filtered_standings = []
        for team in standings.get('standings', []):
            if division and team.get('divisionName', '').lower() != division.lower():
                continue
            if conference and team.get('conferenceName', '').lower() != conference.lower():
                continue
            filtered_standings.append(team)
        
        return {'standings': filtered_standings}
    
    async def get_teams(self, db: Session = None):
        """Get all NHL teams - from database if available"""
        try:
            if db:
                teams = get_all_teams(db)
                if teams:
                    return {'teams': [t.to_dict() for t in teams]}
            
            # Fallback to API
            teams = self.client.teams.teams()
            return {'teams': teams}
        except Exception as e:
            raise Exception(f"Failed to fetch teams: {str(e)}")
    
    async def get_available_seasons(self):
        """Get available seasons"""
        try:
            season_info = self.client.standings.season_standing_manifest()
            return season_info
        except Exception as e:
            return {
                'seasons': [
                    '20242025', '20232024', '20222023', '20212022', '20202021',
                    '20192020', '20182019', '20172018', '20162017', '20152016'
                ]
            }
    
    async def sync_current_season_data(self, db: Session, season: str = "20242025"):
        """Manually trigger sync of current season"""
        teams_synced = self.sync_service.sync_teams(db)
        games_synced = self.sync_service.sync_current_season(db, season)
        
        return {
            'teams_synced': teams_synced,
            'games_synced': games_synced
        }