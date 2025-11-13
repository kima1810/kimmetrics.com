from sqlalchemy.orm import Session
from typing import List, Optional
from ..models import Team

def get_all_teams(db: Session) -> List[Team]:
    """Get all teams from database"""
    return db.query(Team).all()

def get_team_by_abbrev(db: Session, abbrev: str) -> Optional[Team]:
    """Get team by abbreviation"""
    return db.query(Team).filter(Team.abbrev == abbrev).first()

def upsert_team(db: Session, team_data: dict) -> Team:
    """Insert or update team"""
    team = db.query(Team).filter(Team.abbrev == team_data['abbrev']).first()
    
    if team:
        # Update existing
        for key, value in team_data.items():
            setattr(team, key, value)
    else:
        # Create new
        team = Team(**team_data)
        db.add(team)
    
    db.commit()
    db.refresh(team)
    return team

def bulk_upsert_teams(db: Session, teams_data: List[dict]) -> List[Team]:
    """Bulk insert or update teams"""
    teams = []
    for team_data in teams_data:
        teams.append(upsert_team(db, team_data))
    return teams