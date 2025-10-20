#!/usr/bin/env python3
"""
Daily sync script - run this daily to update game data
Usage: python daily_sync.py [season]
Example: python daily_sync.py 20242025
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.database.config import SessionLocal
from src.database.sync_service import DatabaseSyncService

def main():
    # If a season (YYYYYYYY) is provided as an argument, use it; otherwise
    # pass None so the sync service will determine the current season.
    season = sys.argv[1] if len(sys.argv) > 1 else None

    if season:
        print(f"Syncing {season} season...")
    else:
        print("Syncing current season...")
    db = SessionLocal()
    sync_service = DatabaseSyncService()
    
    try:
        # If no season was provided on the command line, determine and
        # print the current season now so it's obvious what will be synced.
        if not season:
            detected = sync_service._get_current_season()
            print(f"Detected current season: {detected}")
            season = detected

        games = sync_service.sync_current_season(db, season)
        print(f"✓ Synced {games} new games")
    except Exception as e:
        print(f"✗ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()