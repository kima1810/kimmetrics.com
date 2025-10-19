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
            # Parse dates if provided
            start_date_obj = self._parse_date(start_date)
            end_date_obj = self._parse_date(end_date)
            
            if start_date_obj and end_date_obj:
                # For date ranges, determine which seasons are involved
                start_season = self._get_season_for_date(start_date_obj)
                end_season = self._get_season_for_date(end_date_obj)
                
                # If no specific season requested but date range spans multiple seasons,
                # use all seasons in the range
                if season == "20242025" and start_season != end_season:
                    season = None  # This will make the DB query include all relevant seasons
                
                # Use database for custom date ranges (FAST!)
                if not db:
                    # Fallback to old method if no db connection
                    return await self._get_standings_fallback(
                        season, start_date, end_date, division, conference
                    )
                
                return await self._get_standings_from_db(
                    season, start_date, end_date, division, conference, db
                )
            else:
                # Use league standings API for full season (still fast)
                standings = self.client.standings.league_standings(season=season)
                return self._filter_standings(standings, division, conference)
        except Exception as e:
            raise Exception(f"Failed to fetch standings: {str(e)}")
    
    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime.date]:
        """Parse date string to date object"""
        if not date_str:
            return None
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    
    def _get_season_for_date(self, date_obj: datetime.date) -> str:
        """Get NHL season for a given date"""
        year = date_obj.year
        if date_obj.month < 7:  # Jan-Jun are part of previous year's season
            return f"{year-1}{year}"
        return f"{year}{year+1}"
    
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
            # If season provided, default start to season start; otherwise pick Oct 1 of end_date's season
            if season:
                start_date = f"{season[:4]}-10-01"
            else:
                # derive season from end_date
                end_dt_tmp = self._parse_date(end_date)
                start_date = f"{(end_dt_tmp.year if end_dt_tmp.month >= 7 else end_dt_tmp.year-1)}-10-01"

        # Parse date objects
        start_dt = self._parse_date(start_date)
        end_dt = self._parse_date(end_date)

        if not start_dt or not end_dt:
            raise ValueError("Invalid start_date or end_date provided")

        # Determine seasons that the date range spans
        start_season = self._get_season_for_date(start_dt)
        end_season = self._get_season_for_date(end_dt)

        seasons_to_sync = []
        # build list of seasons between start_season and end_season inclusive
        if start_season == end_season:
            seasons_to_sync = [start_season]
        else:
            # seasons are strings like '20232024' — increment year ranges
            s_year = int(start_season[:4])
            e_year = int(end_season[:4])
            for y in range(s_year, e_year + 1):
                seasons_to_sync.append(f"{y}{y+1}")

        # For each season in range, sync the portion of dates that fall within that season's bounds
        for s in seasons_to_sync:
            season_start = datetime(int(s[:4]), 10, 1).date()
            season_end = datetime(int(s[:4]) + 1, 6, 30).date()

            portion_start = max(start_dt, season_start)
            portion_end = min(end_dt, season_end)

            if portion_start > portion_end:
                continue

            latest_in_db = get_latest_game_date(db, s)
            # If DB doesn't have up to portion_end, sync missing days
            if not latest_in_db or latest_in_db < portion_end:
                sync_start = (latest_in_db + timedelta(days=1)) if latest_in_db else datetime(int(s[:4]), 10, 1).date()
                sync_end = min(portion_end, datetime.now().date())

                if sync_start <= sync_end:
                    self.sync_service.sync_games_for_date_range(
                        db,
                        datetime.combine(sync_start, datetime.min.time()),
                        datetime.combine(sync_end, datetime.min.time()),
                        s
                    )

        # Calculate standings from database
        return calculate_standings_from_db(
            db, start_dt, end_dt, None if len(seasons_to_sync) > 1 else seasons_to_sync[0], division, conference
        )
    
    async def _get_standings_fallback(
        self,
        season: str,
        start_date: Optional[str],
        end_date: Optional[str],
        division: Optional[str],
        conference: Optional[str]
    ):
        """Fallback to API method if database not available"""
        # Just return full season if no DB
        standings = self.client.standings.league_standings(season=season)
        return self._filter_standings(standings, division, conference)
    
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