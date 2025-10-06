from fastapi import APIRouter, Query, Depends
from typing import Optional
from sqlalchemy.orm import Session
from .services import NHLService
from ...database.config import get_db

router = APIRouter()
nhl_service = NHLService()

@router.get("/standings")
async def get_standings(
    season: str = Query("20242025", description="NHL season (e.g., 20242025)"),
    start_date: Optional[str] = Query(None, description="Start date for filtering (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date for filtering (YYYY-MM-DD)"),
    division: Optional[str] = Query(None, description="Filter by division"),
    conference: Optional[str] = Query(None, description="Filter by conference"),
    db: Session = Depends(get_db)
):
    """Get NHL standings with optional filtering - uses database for speed"""
    try:
        standings = await nhl_service.get_standings(
            season, start_date, end_date, division, conference, db
        )
        return standings
    except Exception as e:
        return {"error": str(e)}

@router.get("/teams")
async def get_teams(db: Session = Depends(get_db)):
    """Get all NHL teams"""
    try:
        teams = await nhl_service.get_teams(db)
        return teams
    except Exception as e:
        return {"error": str(e)}

@router.get("/seasons")
async def get_available_seasons():
    """Get available seasons"""
    try:
        seasons = await nhl_service.get_available_seasons()
        return seasons
    except Exception as e:
        return {"error": str(e)}

@router.post("/sync")
async def sync_data(
    season: str = Query("20242025", description="Season to sync"),
    db: Session = Depends(get_db)
):
    """Manually trigger data sync (admin endpoint)"""
    try:
        result = await nhl_service.sync_current_season_data(db, season)
        return result
    except Exception as e:
        return {"error": str(e)}
