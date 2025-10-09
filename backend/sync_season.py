#!/usr/bin/env python3
"""
Sync a specific season
Usage: python sync_season.py SEASON START_DATE END_DATE
Example: python sync_season.py 20232024 2023-10-01 2024-04-30
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.database.config import SessionLocal
from src.database.sync_service import DatabaseSyncService
from datetime import datetime

def main():
    if len(sys.argv) < 4:
        print("Usage: python sync_season.py SEASON START_DATE END_DATE")
        print("Example: python sync_season.py 20232024 2023-10-01 2024-04-30")
        sys.exit(1)
    
    season = sys.argv[1]
    start_date = datetime.fromisoformat(sys.argv[2])
    end_date = datetime.fromisoformat(sys.argv[3])
    
    print(f"Syncing {season} season from {start_date.date()} to {end_date.date()}...")
    db = SessionLocal()
    sync_service = DatabaseSyncService()
    
    try:
        games = sync_service.sync_games_for_date_range(db, start_date, end_date, season)
        print(f"✓ Synced {games} games")
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()