from sqlalchemy import Column, Integer, String, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..config import Base
from datetime import date

class TeamHistory(Base):
    __tablename__ = "team_history"

    id = Column(Integer, primary_key=True, index=True)
    franchise_id = Column(Integer, index=True, nullable=False)
    abbrev = Column(String(5), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)  # NULL means current
    division = Column(String(50))
    conference = Column(String(50))
    metadata_json = Column(JSON)

    def is_active_on(self, date_to_check: date) -> bool:
        """Check if this team version was active on a specific date"""
        if self.start_date > date_to_check:
            return False
        if self.end_date and self.end_date < date_to_check:
            return False
        return True

    def to_dict(self):
        return {
            "id": self.id,
            "franchise_id": self.franchise_id,
            "abbrev": self.abbrev,
            "name": self.name,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "division": self.division,
            "conference": self.conference
        }