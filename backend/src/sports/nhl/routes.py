from fastapi import APIRouter, Query
from typing import Optional
from .services import NHLService

router = APIRouter()
nhl_service = NHLService()

@router.get("/standings")
async def get_standings(
    season: str = Query("20242025", description="NHL season (e.g., 20242025)"),
    start_date: Optional[str] = Query(None, description="Start date for filtering (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date for filtering (YYYY-MM-DD)"),
    division: Optional[str] = Query(None, description="Filter by division"),
    conference: Optional[str] = Query(None, description="Filter by conference")
):
    """Get NHL standings with optional filtering"""
    try:
        standings = await nhl_service.get_standings(season, start_date, end_date, division, conference)
        return standings
    except Exception as e:
        return {"error": str(e)}

@router.get("/teams")
async def get_teams():
    """Get all NHL teams"""
    try:
        teams = await nhl_service.get_teams()
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
