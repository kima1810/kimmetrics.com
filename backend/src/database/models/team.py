from sqlalchemy import Column, Integer, String, JSON
from ..config import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    abbrev = Column(String(5), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    franchise_id = Column(Integer, index=True)
    division = Column(String(50))
    conference = Column(String(50))
    metadata_json = Column(JSON)  # Store full team data
    
    def to_dict(self):
        return {
            "id": self.id,
            "abbrev": self.abbrev,
            "name": self.name,
            "franchise_id": self.franchise_id,
            "division": self.division,
            "conference": self.conference
        }