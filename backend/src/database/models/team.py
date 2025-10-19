from sqlalchemy import Column, Integer, String, JSON, Date
from sqlalchemy.orm import relationship
from ..config import Base
from datetime import date
from typing import Optional

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    abbrev = Column(String(5), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    franchise_id = Column(Integer, index=True)
    division = Column(String(50))
    conference = Column(String(50))
    metadata_json = Column(JSON)  # Store full team data
    
    def get_name_for_date(self, target_date: date) -> tuple[str, str]:
        """
        Get the appropriate team name and abbreviation for a specific date
        Returns: (name, abbrev)
        """
        from .team_history import TeamHistory
        from ...core.database import SessionLocal
        
        db = SessionLocal()
        try:
            # Get all historical entries for this franchise
            history = db.query(TeamHistory).filter(
                TeamHistory.franchise_id == self.franchise_id
            ).order_by(TeamHistory.start_date.desc()).all()
            
            # Find the applicable team version
            for entry in history:
                if entry.is_active_on(target_date):
                    return entry.name, entry.abbrev
                    
            # If no historical entry found, return current name
            return self.name, self.abbrev
        finally:
            db.close()
    
    def get_display_name(self, start_date: date, end_date: date) -> tuple[str, str]:
        """
        Get appropriate display name for a date range
        For ranges spanning a relocation, returns combined name
        Returns: (display_name, display_abbrev)
        """
        from .team_history import TeamHistory
        from ...core.database import SessionLocal
        
        db = SessionLocal()
        try:
            # Get all team versions active in this date range
            history = db.query(TeamHistory).filter(
                TeamHistory.franchise_id == self.franchise_id,
                TeamHistory.start_date <= end_date,
                (TeamHistory.end_date.is_(None) | (TeamHistory.end_date >= start_date))
            ).order_by(TeamHistory.start_date.desc()).all()
            
            if not history:
                return self.name, self.abbrev
                
            if len(history) == 1:
                return history[0].name, history[0].abbrev
                
            # Multiple versions - combine names (e.g., "Arizona Coyotes/Utah Mammoth")
            names = []
            abbrevs = []
            for entry in history:
                if entry.name not in names:
                    names.append(entry.name)
                if entry.abbrev not in abbrevs:
                    abbrevs.append(entry.abbrev)
                    
            return " / ".join(names), "/".join(abbrevs)
        finally:
            db.close()
    
    def to_dict(self, start_date: Optional[date] = None, end_date: Optional[date] = None):
        """
        Convert to dictionary, optionally providing date-appropriate names
        """
        if start_date and end_date:
            display_name, display_abbrev = self.get_display_name(start_date, end_date)
        elif start_date:
            display_name, display_abbrev = self.get_name_for_date(start_date)
        else:
            display_name, display_abbrev = self.name, self.abbrev
            
        return {
            "id": self.id,
            "abbrev": display_abbrev,
            "name": display_name,
            "franchise_id": self.franchise_id,
            "division": self.division,
            "conference": self.conference
        }