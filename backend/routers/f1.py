from fastapi import APIRouter
from services.f1_api import get_races, get_drivers, get_standings_drivers, get_standings_teams

router = APIRouter(prefix="/api/f1", tags=["f1"])


@router.get("/races/{season}")
def races(season: int):
    return get_races(season)


@router.get("/drivers/{season}")
def drivers(season: int):
    return get_drivers(season)


@router.get("/standings/drivers/{season}")
def driver_standings(season: int):
    return get_standings_drivers(season)


@router.get("/standings/teams/{season}")
def team_standings(season: int):
    return get_standings_teams(season)
