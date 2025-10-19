from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
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
    """Bulk insert or update teams in a single transaction"""
    teams = []
    try:
        # First, load all existing teams
        existing_teams = {team.abbrev: team for team in db.query(Team).all()}
        
        # Track which teams we've processed
        processed_abbrevs = set()
        
        # Process all teams in a single transaction
        for team_data in teams_data:
            abbrev = team_data['abbrev']
            processed_abbrevs.add(abbrev)
            
            if abbrev in existing_teams:
                # Update existing team, preserving ID and relationships
                team = existing_teams[abbrev]
                # Only update if something changed
                if (team.name != team_data['name'] or 
                        team.division != team_data.get('division') or 
                        team.conference != team_data.get('conference')):
                    for key, value in team_data.items():
                        setattr(team, key, value)
            else:
                # Create new team
                team = Team(**team_data)
                db.add(team)
            
            teams.append(team)
        
        # Keep existing teams that weren't in the update
        # (like historical teams we still need)
        for abbrev, team in existing_teams.items():
            if abbrev not in processed_abbrevs:
                teams.append(team)
        
        # Commit all changes at once
        db.commit()
        
        # Refresh all teams
        for team in teams:
            db.refresh(team)
            
        return teams
    except Exception as e:
        db.rollback()
        print(f"❌ Error upserting teams: {str(e)}")
        print("Teams that were being processed:")
        for team_data in teams_data:
            print(f"  • {team_data['abbrev']} - {team_data['name']}")
        raise Exception(f"Failed to sync teams: {str(e)}")