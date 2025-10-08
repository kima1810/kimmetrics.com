from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from ..config import Base
from datetime import date

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True)  # NHL game ID
    game_date = Column(Date, nullable=False, index=True)
    season = Column(String(10), nullable=False, index=True)
    game_type = Column(Integer, nullable=False)  # 2 = regular season, 3 = playoffs
    game_state = Column(String(20), nullable=False)
    
    home_team_abbrev = Column(String(5), ForeignKey('teams.abbrev'), nullable=False)
    away_team_abbrev = Column(String(5), ForeignKey('teams.abbrev'), nullable=False)
    
    home_score = Column(Integer)
    away_score = Column(Integer)
    
    period_type = Column(String(10))  # REG, OT, SO
    
    # Relationships
    home_team = relationship("Team", foreign_keys=[home_team_abbrev])
    away_team = relationship("Team", foreign_keys=[away_team_abbrev])
    
    # Composite indexes for fast queries
    __table_args__ = (
        Index('idx_game_date_season', 'game_date', 'season'),
        Index('idx_season_teams', 'season', 'home_team_abbrev', 'away_team_abbrev'),
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "game_date": self.game_date.isoformat() if self.game_date else None,
            "season": self.season,
            "home_team_abbrev": self.home_team_abbrev,
            "away_team_abbrev": self.away_team_abbrev,
            "home_score": self.home_score,
            "away_score": self.away_score,
            "period_type": self.period_type,
            "game_state": self.game_state
        }