from fastapi import APIRouter
from services.football_api import (
    get_live_fixtures, get_fixture, get_events, get_lineups, get_statistics
)

router = APIRouter(prefix="/api/football", tags=["football"])


@router.get("/live")
def live_fixtures():
    return get_live_fixtures()


@router.get("/fixture/{fixture_id}")
def fixture_detail(fixture_id: int):
    return get_fixture(fixture_id)


@router.get("/fixture/{fixture_id}/events")
def fixture_events(fixture_id: int):
    return get_events(fixture_id)


@router.get("/fixture/{fixture_id}/lineups")
def fixture_lineups(fixture_id: int):
    return get_lineups(fixture_id)


@router.get("/fixture/{fixture_id}/stats")
def fixture_stats(fixture_id: int):
    return get_statistics(fixture_id)
