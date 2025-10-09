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
    season = sys.argv[1] if len(sys.argv) > 1 else "20242025"
    
    print(f"Syncing {season} season...")
    db = SessionLocal()
    sync_service = DatabaseSyncService()
    
    try:
        games = sync_service.sync_current_season(db, season)
        print(f"✓ Synced {games} new games")
    except Exception as e:
        print(f"✗ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()