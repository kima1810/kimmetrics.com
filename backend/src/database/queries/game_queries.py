from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional, Dict
from datetime import date, datetime
from ..models import Game, Team

def get_games_by_date_range(
    db: Session, 
    start_date: date, 
    end_date: date, 
    season: Optional[str] = None
) -> List[Game]:
    """Get all completed games within date range"""
    query = db.query(Game).filter(
        and_(
            Game.game_date >= start_date,
            Game.game_date <= end_date,
            Game.game_state.in_(['OFF', 'FINAL'])
        )
    )
    
    if season:
        query = query.filter(Game.season == season)
    
    return query.all()

def get_game_by_id(db: Session, game_id: int) -> Optional[Game]:
    """Get specific game by ID"""
    return db.query(Game).filter(Game.id == game_id).first()

def upsert_game(db: Session, game_data: dict) -> Game:
    """Insert or update game"""
    game = db.query(Game).filter(Game.id == game_data['id']).first()
    
    if game:
        # Update existing
        for key, value in game_data.items():
            setattr(game, key, value)
    else:
        # Create new
        game = Game(**game_data)
        db.add(game)
    
    db.commit()
    db.refresh(game)
    return game

def bulk_upsert_games(db: Session, games_data: List[dict]) -> List[Game]:
    """Bulk insert or update games"""
    games = []
    for game_data in games_data:
        games.append(upsert_game(db, game_data))
    return games

def calculate_standings_from_db(
    db: Session,
    start_date: date,
    end_date: date,
    season: str,
    division: Optional[str] = None,
    conference: Optional[str] = None
) -> Dict:
    """
    Calculate standings from database games (FAST!)
    This is the money query - replaces slow API calls
    """
    # Get all games in range
    games = get_games_by_date_range(db, start_date, end_date, season)
    
    # Get all teams for initialization
    teams = db.query(Team).all()
    
    # Initialize team stats
    team_stats = {}
    for team in teams:
        # Apply filters
        if division and team.division.lower() != division.lower():
            continue
        if conference and team.conference.lower() != conference.lower():
            continue
            
        team_stats[team.abbrev] = {
            'teamName': {'default': team.name},
            'teamAbbrev': {'default': team.abbrev},
            'team': team.to_dict(),
            'gamesPlayed': 0,
            'wins': 0,
            'losses': 0,
            'otLosses': 0,
            'points': 0,
            'goalFor': 0,
            'goalAgainst': 0,
            'goalDifferential': 0,
            'divisionName': team.division,
            'conferenceName': team.conference
        }
    
    # Process each game
    for game in games:
        home = game.home_team_abbrev
        away = game.away_team_abbrev
        
        if home not in team_stats or away not in team_stats:
            continue
        
        # Update games played and goals
        team_stats[home]['gamesPlayed'] += 1
        team_stats[away]['gamesPlayed'] += 1
        team_stats[home]['goalFor'] += game.home_score
        team_stats[home]['goalAgainst'] += game.away_score
        team_stats[away]['goalFor'] += game.away_score
        team_stats[away]['goalAgainst'] += game.home_score
        
        # Determine winner and points
        is_overtime = game.period_type in ['OT', 'SO']
        
        if game.home_score > game.away_score:
            team_stats[home]['wins'] += 1
            team_stats[home]['points'] += 2
            if is_overtime:
                team_stats[away]['otLosses'] += 1
                team_stats[away]['points'] += 1
            else:
                team_stats[away]['losses'] += 1
        else:
            team_stats[away]['wins'] += 1
            team_stats[away]['points'] += 2
            if is_overtime:
                team_stats[home]['otLosses'] += 1
                team_stats[home]['points'] += 1
            else:
                team_stats[home]['losses'] += 1
        
        # Update goal differential
        team_stats[home]['goalDifferential'] = team_stats[home]['goalFor'] - team_stats[home]['goalAgainst']
        team_stats[away]['goalDifferential'] = team_stats[away]['goalFor'] - team_stats[away]['goalAgainst']
    
    # Convert to list and sort
    standings_list = [s for s in team_stats.values() if s['gamesPlayed'] > 0]
    standings_list.sort(key=lambda x: (-x['points'], -x['goalDifferential']))
    
    return {'standings': standings_list}

def get_latest_game_date(db: Session, season: str) -> Optional[date]:
    """Get the most recent game date in database for a season"""
    result = db.query(func.max(Game.game_date)).filter(Game.season == season).scalar()
    return result