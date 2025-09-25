from nhlpy import NHLClient
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import asyncio

class NHLService:
    def __init__(self):
        self.client = NHLClient()
    
    async def get_standings(self, season: str = "20242025", start_date: Optional[str] = None, end_date: Optional[str] = None, division: Optional[str] = None, conference: Optional[str] = None):
        """Get NHL standings with optional date range and division/conference filtering"""
        try:
            if start_date or end_date:
                # Calculate standings from game data for date range
                return await self._calculate_standings_from_games(season, start_date, end_date, division, conference)
            else:
                # Use league standings for full season
                standings = self.client.standings.league_standings(season=season)
                return self._filter_standings(standings, division, conference)
        except Exception as e:
            raise Exception(f"Failed to fetch standings: {str(e)}")
    
    async def _calculate_standings_from_games(self, season: str, start_date: Optional[str] = None, end_date: Optional[str] = None, division: Optional[str] = None, conference: Optional[str] = None):
        """Calculate standings from individual game results within date range"""
        try:
            # Get all teams first
            teams = self.client.teams.teams()
            team_stats = {}
            
            # Initialize stats for each team
            for team in teams:
                team_id = team['id']
                team_stats[team_id] = {
                    'team': team,
                    'gamesPlayed': 0,
                    'wins': 0,
                    'losses': 0,
                    'overtimeLosses': 0,
                    'points': 0,
                    'goalsFor': 0,
                    'goalsAgainst': 0,
                    'goalDifferential': 0
                }
            
            # Get games within date range for each team
            for team in teams:
                team_abbr = team['abbrev']
                
                # Get team's season schedule
                schedule = self.client.schedule.team_season_schedule(team_abbr=team_abbr, season=season)
                
                # Filter games by date range
                for game in schedule.get('games', []):
                    game_date = game.get('gameDate', '')
                    
                    # Check if game is within date range
                    if self._is_date_in_range(game_date, start_date, end_date):
                        # Process completed games only
                        if game.get('gameState') in ['OFF', 'FINAL']:
                            await self._process_game_for_standings(game, team_stats)
            
            # Convert to list and filter by division/conference
            standings_list = list(team_stats.values())
            standings_list = self._filter_team_standings(standings_list, division, conference)
            
            # Sort by points (descending), then by goal differential
            standings_list.sort(key=lambda x: (-x['points'], -x['goalDifferential']))
            
            return {'standings': standings_list}
            
        except Exception as e:
            raise Exception(f"Failed to calculate standings from games: {str(e)}")
    
    def _is_date_in_range(self, game_date: str, start_date: Optional[str], end_date: Optional[str]) -> bool:
        """Check if game date is within the specified range"""
        if not game_date:
            return False
            
        try:
            game_dt = datetime.fromisoformat(game_date.replace('Z', '+00:00'))
            
            if start_date:
                start_dt = datetime.fromisoformat(start_date + 'T00:00:00+00:00')
                if game_dt < start_dt:
                    return False
            
            if end_date:
                end_dt = datetime.fromisoformat(end_date + 'T23:59:59+00:00')
                if game_dt > end_dt:
                    return False
            
            return True
        except:
            return False
    
    async def _process_game_for_standings(self, game: Dict, team_stats: Dict):
        """Process a single game and update team standings"""
        try:
            home_team_id = game['homeTeam']['id']
            away_team_id = game['awayTeam']['id']
            home_score = game['homeTeam'].get('score', 0)
            away_score = game['awayTeam'].get('score', 0)
            
            # Update games played
            team_stats[home_team_id]['gamesPlayed'] += 1
            team_stats[away_team_id]['gamesPlayed'] += 1
            
            # Update goals for/against
            team_stats[home_team_id]['goalsFor'] += home_score
            team_stats[home_team_id]['goalsAgainst'] += away_score
            team_stats[away_team_id]['goalsFor'] += away_score
            team_stats[away_team_id]['goalsAgainst'] += home_score
            
            # Determine winner and update wins/losses/points
            if home_score > away_score:
                # Home team wins
                if game.get('periodDescriptor', {}).get('periodType') == 'OT' or game.get('periodDescriptor', {}).get('periodType') == 'SO':
                    # Away team gets OT loss
                    team_stats[home_team_id]['wins'] += 1
                    team_stats[home_team_id]['points'] += 2
                    team_stats[away_team_id]['overtimeLosses'] += 1
                    team_stats[away_team_id]['points'] += 1
                else:
                    # Regular win/loss
                    team_stats[home_team_id]['wins'] += 1
                    team_stats[home_team_id]['points'] += 2
                    team_stats[away_team_id]['losses'] += 1
            else:
                # Away team wins
                if game.get('periodDescriptor', {}).get('periodType') == 'OT' or game.get('periodDescriptor', {}).get('periodType') == 'SO':
                    # Home team gets OT loss
                    team_stats[away_team_id]['wins'] += 1
                    team_stats[away_team_id]['points'] += 2
                    team_stats[home_team_id]['overtimeLosses'] += 1
                    team_stats[home_team_id]['points'] += 1
                else:
                    # Regular win/loss
                    team_stats[away_team_id]['wins'] += 1
                    team_stats[away_team_id]['points'] += 2
                    team_stats[home_team_id]['losses'] += 1
            
            # Update goal differential
            for team_id in [home_team_id, away_team_id]:
                team_stats[team_id]['goalDifferential'] = team_stats[team_id]['goalsFor'] - team_stats[team_id]['goalsAgainst']
                
        except Exception as e:
            print(f"Error processing game: {e}")
    
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
    
    def _filter_team_standings(self, standings_list: List[Dict], division: Optional[str], conference: Optional[str]) -> List[Dict]:
        """Filter calculated standings by division/conference"""
        if not division and not conference:
            return standings_list
        
        filtered = []
        for team_stat in standings_list:
            team = team_stat['team']
            if division and team.get('division', {}).get('name', '').lower() != division.lower():
                continue
            if conference and team.get('conference', {}).get('name', '').lower() != conference.lower():
                continue
            filtered.append(team_stat)
        
        return filtered
    
    async def get_teams(self):
        """Get all NHL teams"""
        try:
            teams = self.client.teams.teams()
            return {'teams': teams}
        except Exception as e:
            raise Exception(f"Failed to fetch teams: {str(e)}")
    
    async def get_available_seasons(self):
        """Get available seasons"""
        try:
            # Get season info from the API
            season_info = self.client.standings.season_standing_manifest()
            return season_info
        except Exception as e:
            # Return some default seasons if API call fails
            return {
                'seasons': [
                    '20242025', '20232024', '20222023', '20212022', '20202021',
                    '20192020', '20182019', '20172018', '20162017', '20152016'
                ]
            }
