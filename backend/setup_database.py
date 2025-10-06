#!/usr/bin/env python3
"""
Database setup script for Kimmetrics
Run this to initialize the database and sync initial data
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.database.__init__ import init_database
from src.database.config import SessionLocal
from src.database.sync_service import DatabaseSyncService
from datetime import datetime

def setup():
    print("=" * 60)
    print("Kimmetrics Database Setup")
    print("=" * 60)
    
    # Step 1: Create tables
    print("\n1. Creating database tables...")
    init_database()
    
    # Step 2: Sync teams
    print("\n2. Syncing NHL teams...")
    db = SessionLocal()
    sync_service = DatabaseSyncService()
    
    try:
        teams_count = sync_service.sync_teams(db)
        print(f"   ✓ Synced {teams_count} teams")
        
        # Step 3: Sync current season games
        print("\n3. Syncing 2024-25 season games...")
        print("   This may take 5-10 minutes...")
        
        season = "20242025"
        start_date = datetime(2024, 10, 1)
        end_date = datetime.now()
        
        games_count = sync_service.sync_games_for_date_range(
            db, start_date, end_date, season
        )
        print(f"   ✓ Synced {games_count} games")
        
        print("\n" + "=" * 60)
        print("✓ Database setup complete!")
        print("=" * 60)
        print("\nYou can now start the API server with:")
        print("  uvicorn src.main:app --reload")
        
    except Exception as e:
        print(f"\n✗ Error during setup: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    setup()