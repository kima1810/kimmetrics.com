from nhlpy import NHLClient
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from typing import Optional
from .queries import (
    bulk_upsert_teams,
    bulk_upsert_games,
    get_latest_game_date,
    get_games_by_date_range
)

class DatabaseSyncService:
    """Service to sync NHL data to database"""
    
    def __init__(self):
        self.client = NHLClient()
    
    def sync_teams(self, db: Session):
        """Sync all teams to database"""
        try:
            print("Fetching teams from NHL API...")
            teams_data = self.client.teams.teams()
            
            if not teams_data:
                print("❌ No teams data received from NHL API")
                return 0
            
            teams_to_upsert = []
            
            # Add historical teams that we need for past games
            historical_teams = [
                {
                    'abbrev': 'ARI',
                    'name': 'Arizona Coyotes',
                    'franchise_id': 28,  # Same as Utah Mammoth
                    'division': 'Central',  # Their last division
                    'conference': 'Western',
                    'metadata_json': {}
                }
            ]
            
            # First add historical teams
            for team in historical_teams:
                print(f"Processing historical team: {team['abbrev']} - {team['name']}")
                teams_to_upsert.append(team)
            
            # Then add current teams
            for team in teams_data:
                abbrev = team.get('abbr', '')
                name = team.get('name', '')
                
                if not abbrev or not name:
                    print(f"⚠️ Skipping team with missing data: {team}")
                    continue
                
                print(f"Processing team: {abbrev} - {name}")
                teams_to_upsert.append({
                    'abbrev': abbrev,
                    'name': name,
                    'franchise_id': team.get('franchise_id'),
                    'division': team.get('division', {}).get('name', ''),
                    'conference': team.get('conference', {}).get('name', ''),
                    'metadata_json': team
                })
            
            if teams_to_upsert:
                print(f"\nSyncing {len(teams_to_upsert)} teams to database...")
                bulk_upsert_teams(db, teams_to_upsert)
                print("✓ Teams sync completed")
                return len(teams_to_upsert)
            else:
                print("❌ No valid teams to sync")
                return 0
                
        except Exception as e:
            print(f"❌ Error syncing teams: {str(e)}")
            raise
    
    def _get_season_for_date(self, game_date: date) -> str:
        """
        Determine the NHL season for a given date.
        NHL seasons typically start in October and end in June.
        The season is labeled as YYYYYYYY where the first year is when the season starts.
        """
        year = game_date.year
        if game_date.month < 7:  # Jan-Jun are part of previous year's season
            return f"{year-1}{year}"
        return f"{year}{year+1}"

    def sync_games_for_date_range(
        self, 
        db: Session, 
        start_date: datetime, 
        end_date: datetime,
        season: Optional[str] = None
    ):
        """Sync games for a specific date range"""
        # First, ensure teams are synced
        print("\nSyncing teams...")
        try:
            teams_synced = self.sync_teams(db)
            print(f"✓ Synced {teams_synced} teams")
        except Exception as e:
            print(f"❌ Error syncing teams: {str(e)}")
            return 0
            
        # Validate and adjust date range
        if start_date > end_date:
            raise ValueError("Start date must be before end date")
            
        # If season is specified, limit date range to that season
        if season:
            season_start_year = int(season[:4])
            season_start = datetime(season_start_year, 10, 1)  # Season starts in October
            season_end = datetime(season_start_year + 1, 6, 30)  # Season ends in June
            
            # Adjust date range to stay within season bounds
            start_date = max(start_date, season_start)
            end_date = min(end_date, season_end)

        current_date = start_date
        games_synced = 0
        days_checked = 0
        
        print(f"\nSyncing games from {start_date.date()} to {end_date.date()}")
        
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            days_checked += 1
            
            # Only show progress every 30 days to reduce noise
            if days_checked % 30 == 0:
                print(f"Progress: Checked {days_checked} days ({current_date.date()}), synced {games_synced} games")
            
            try:
                daily_games = self.client.schedule.daily_schedule(date=date_str)
                games_list = daily_games if isinstance(daily_games, list) else daily_games.get('games', [])
                
                games_to_upsert = []
                for game in games_list:
                    game_id = game.get('id')
                    
                    # Only sync completed games
                    game_state = game.get('gameState', '')
                    if game_state not in ['OFF', 'FINAL']:
                        continue
                    
                    # Filter game types (1 = Preseason, 2 = Regular Season, 3 = Playoffs)
                    game_type = game.get('gameType', 0)
                    if game_type not in [2, 3]:
                        continue
                    
                    start_time_str = game.get('startTimeUTC', '')
                    if not start_time_str:
                        print(f"⚠️  Game {game_id}: Missing start time")
                        continue
                    
                    try:
                        game_date = datetime.fromisoformat(start_time_str.replace('Z', '+00:00')).date()
                        
                        # Skip future games
                        if game_date > datetime.now().date():
                            continue
                            
                    except:
                        print(f"⚠️  Game {game_id}: Invalid date format in startTimeUTC")
                        continue
                    
                    home_abbrev = game.get('homeTeam', {}).get('abbrev')
                    away_abbrev = game.get('awayTeam', {}).get('abbrev')
                    
                    if not home_abbrev or not away_abbrev:
                        print(f"⚠️  Game {game_id}: Missing team abbreviation ({home_abbrev} vs {away_abbrev})")
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
                    try:
                        bulk_upsert_games(db, games_to_upsert)
                        games_synced += len(games_to_upsert)
                    except Exception as e:
                        print(f"\n❌ Failed to sync {len(games_to_upsert)} games for {date_str}:")
                        for game in games_to_upsert:
                            print(f"  • Game {game['id']}: {game['away_team_abbrev']} @ {game['home_team_abbrev']}")
                        print(f"  Error: {str(e)}")
            
            except Exception as e:
                print(f"\n❌ Error fetching games for {date_str}: {str(e)}")
                # Continue to next date (don't crash sync)
            
            current_date += timedelta(days=1)
        
        print(f"   Completed: {days_checked} days checked, {games_synced} total games synced")
        return games_synced
    
    def _get_current_season(self) -> str:
        """Get the current NHL season based on today's date"""
        today = datetime.now().date()
        return self._get_season_for_date(today)
    
    def sync_current_season(self, db: Session, season: Optional[str] = None):
        """Sync entire current season"""
        # If no season specified, determine the current season first so we can
        # correctly query existing games and compute the start_date.
        if not season:
            season = self._get_current_season()
            print(f"No season specified, using current season: {season}")

        latest_date = get_latest_game_date(db, season)

        # If the latest date in the DB is in the future (could happen due to
        # imported or bad data), avoid computing a start date after today.
        today = datetime.now().date()
        if latest_date:
            # latest_date is a date object
            if latest_date >= today:
                print(f"   Database has games up to {latest_date} which is >= today ({today}); nothing to sync.")
                return 0

            start_date = datetime.combine(latest_date, datetime.min.time()) + timedelta(days=1)
            print(f"   Database has games up to {latest_date}")
            print(f"   Syncing new games from {start_date.date()} onwards...")
        else:
            season_start_year = int(season[:4])
            start_date = datetime(season_start_year, 10, 1)
            print(f"   No games in database, syncing full season from {start_date.date()}")

        end_date = datetime.now()

        return self.sync_games_for_date_range(db, start_date, end_date, season)