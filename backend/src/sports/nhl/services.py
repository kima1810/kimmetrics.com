from nhlpy import NHLClient
from datetime import datetime, timedelta
from typing import List, Dict, Optional

class NHLService:
    def __init__(self):
        self.client = NHLClient()
    
    async def get_standings(self, season: str = "20242025", start_date: Optional[str] = None, end_date: Optional[str] = None, division: Optional[str] = None, conference: Optional[str] = None):
        """Get NHL standings with optional date range and division/conference filtering"""
        try:
            print(f"Getting standings - Season: {season}, Start: {start_date}, End: {end_date}, Div: {division}, Conf: {conference}")
            
            # Apply smart date defaults
            if start_date or end_date:
                season_start = f"{season[:4]}-10-01"
                today = datetime.now().strftime('%Y-%m-%d')
                
                if start_date and not end_date:
                    end_date = today
                elif end_date and not start_date:
                    start_date = season_start
                
                print(f"Calculating custom date range: {start_date} to {end_date}")
                return await self._calculate_standings_from_monthly_schedules(season, start_date, end_date, division, conference)
            else:
                # Use league standings for full season
                standings = self.client.standings.league_standings(season=season)
                return self._filter_standings(standings, division, conference)
        except Exception as e:
            print(f"Error in get_standings: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to fetch standings: {str(e)}")
    
    async def _calculate_standings_from_monthly_schedules(self, season: str, start_date: str, end_date: str, division: Optional[str] = None, conference: Optional[str] = None):
        """Calculate standings by fetching team schedules by month"""
        try:
            print(f"Calculating standings from monthly schedules: {start_date} to {end_date}")
            
            start_dt = datetime.fromisoformat(start_date)
            end_dt = datetime.fromisoformat(end_date)
            
            # Get all teams
            teams_response = self.client.teams.teams()
            print(f"Found {len(teams_response)} teams")
            
            # Initialize stats
            team_stats = {}
            for team in teams_response:
                abbrev = team.get('abbr', '')
                if not abbrev:
                    continue
                
                team_stats[abbrev] = {
                    'teamName': {'default': team.get('name', 'Unknown')},
                    'teamAbbrev': {'default': abbrev},
                    'team': team,
                    'gamesPlayed': 0,
                    'wins': 0,
                    'losses': 0,
                    'otLosses': 0,
                    'points': 0,
                    'goalFor': 0,
                    'goalAgainst': 0,
                    'goalDifferential': 0,
                    'divisionName': team.get('division', {}).get('name', ''),
                    'conferenceName': team.get('conference', {}).get('name', '')
                }
            
            # Get unique months in date range
            months_to_fetch = set()
            current = start_dt
            while current <= end_dt:
                months_to_fetch.add(current.strftime('%Y-%m'))
                if current.month == 12:
                    current = current.replace(year=current.year + 1, month=1, day=1)
                else:
                    current = current.replace(month=current.month + 1, day=1)
            
            print(f"Fetching schedules for {len(months_to_fetch)} months from {len(teams_response)} teams")
            
            games_processed = 0
            processed_game_ids = set()
            teams_processed = 0
            
            for team in teams_response:
                abbrev = team.get('abbr', '')
                if not abbrev or abbrev not in team_stats:
                    continue
                
                teams_processed += 1
                
                for month_str in months_to_fetch:
                    try:
                        schedule = self.client.schedule.team_monthly_schedule(
                            team_abbr=abbrev, 
                            month=month_str
                        )
                        
                        # Handle both dict with 'games' key and direct list
                        games = schedule if isinstance(schedule, list) else schedule.get('games', [])
                        
                        for game in games:
                            game_id = game.get('id')
                            
                            if game_id in processed_game_ids:
                                continue
                            
                            # Check date range
                            game_date_str = game.get('gameDate', '')
                            if not game_date_str:
                                continue
                            
                            try:
                                game_date = datetime.fromisoformat(game_date_str.split('T')[0])
                                if game_date < start_dt or game_date > end_dt:
                                    continue
                            except:
                                continue
                            
                            # Only completed games
                            if game.get('gameState') not in ['OFF', 'FINAL']:
                                continue
                            
                            home_abbrev = game.get('homeTeam', {}).get('abbrev')
                            away_abbrev = game.get('awayTeam', {}).get('abbrev')
                            
                            if not home_abbrev or not away_abbrev:
                                continue
                            if home_abbrev not in team_stats or away_abbrev not in team_stats:
                                continue
                            
                            home_score = game.get('homeTeam', {}).get('score', 0)
                            away_score = game.get('awayTeam', {}).get('score', 0)
                            
                            # Update stats
                            team_stats[home_abbrev]['gamesPlayed'] += 1
                            team_stats[away_abbrev]['gamesPlayed'] += 1
                            
                            team_stats[home_abbrev]['goalFor'] += home_score
                            team_stats[home_abbrev]['goalAgainst'] += away_score
                            team_stats[away_abbrev]['goalFor'] += away_score
                            team_stats[away_abbrev]['goalAgainst'] += home_score
                            
                            period_type = game.get('periodDescriptor', {}).get('periodType', 'REG')
                            is_overtime = period_type in ['OT', 'SO']
                            
                            if home_score > away_score:
                                team_stats[home_abbrev]['wins'] += 1
                                team_stats[home_abbrev]['points'] += 2
                                if is_overtime:
                                    team_stats[away_abbrev]['otLosses'] += 1
                                    team_stats[away_abbrev]['points'] += 1
                                else:
                                    team_stats[away_abbrev]['losses'] += 1
                            else:
                                team_stats[away_abbrev]['wins'] += 1
                                team_stats[away_abbrev]['points'] += 2
                                if is_overtime:
                                    team_stats[home_abbrev]['otLosses'] += 1
                                    team_stats[home_abbrev]['points'] += 1
                                else:
                                    team_stats[home_abbrev]['losses'] += 1
                            
                            team_stats[home_abbrev]['goalDifferential'] = team_stats[home_abbrev]['goalFor'] - team_stats[home_abbrev]['goalAgainst']
                            team_stats[away_abbrev]['goalDifferential'] = team_stats[away_abbrev]['goalFor'] - team_stats[away_abbrev]['goalAgainst']
                            
                            processed_game_ids.add(game_id)
                            games_processed += 1
                    
                    except Exception as e:
                        print(f"Error fetching {month_str} schedule for {abbrev}: {e}")
                        continue
                
                if teams_processed % 10 == 0:
                    print(f"Processed {teams_processed}/{len(teams_response)} teams, {games_processed} games")
            
            print(f"Processed {games_processed} games from {teams_processed} teams")
            
            # Filter and sort
            standings_list = list(team_stats.values())
            standings_list = self._filter_team_standings(standings_list, division, conference)
            standings_list = [s for s in standings_list if s['gamesPlayed'] > 0]
            standings_list.sort(key=lambda x: (-x['points'], -x['goalDifferential']))
            
            print(f"Returning {len(standings_list)} teams")
            
            return {'standings': standings_list}
            
        except Exception as e:
            print(f"Error: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to calculate standings: {str(e)}")
    
    def _filter_standings(self, standings: Dict, division: Optional[str], conference: Optional[str]) -> Dict:
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
        if not division and not conference:
            return standings_list
        
        filtered = []
        for team_stat in standings_list:
            if division and team_stat.get('divisionName', '').lower() != division.lower():
                continue
            if conference and team_stat.get('conferenceName', '').lower() != conference.lower():
                continue
            filtered.append(team_stat)
        
        return filtered
    
    async def get_teams(self):
        try:
            teams = self.client.teams.teams()
            return {'teams': teams}
        except Exception as e:
            raise Exception(f"Failed to fetch teams: {str(e)}")
    
    async def get_available_seasons(self):
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