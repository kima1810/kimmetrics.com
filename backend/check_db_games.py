#!/usr/bin/env python3
"""
Diagnostic script to check what games are in the database
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from datetime import datetime
from src.database.config import SessionLocal
from src.database.models import Game

def main():
    db = SessionLocal()
    
    try:
        # Get the 20 most recent games by date
        recent_games = db.query(Game).order_by(Game.game_date.desc()).limit(20).all()
        
        print(f"Most recent 20 games in database:")
        print("-" * 80)
        
        today = datetime.now().date()
        future_count = 0
        
        for game in recent_games:
            future_marker = " [FUTURE]" if game.game_date > today else ""
            if game.game_date > today:
                future_count += 1
            
            print(f"{game.game_date} | {game.season} | {game.away_team_abbrev} @ {game.home_team_abbrev} | {game.game_state}{future_marker}")
        
        print("-" * 80)
        print(f"\nToday's date: {today}")
        print(f"Future-dated games found: {future_count}")
        
        if future_count > 0:
            print("\n⚠️  WARNING: Database contains future-dated games!")
            print("This prevents daily_sync from working correctly.")
            print("\nTo fix: You can delete future-dated games with:")
            print(f"  DELETE FROM games WHERE game_date > '{today}';")
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
