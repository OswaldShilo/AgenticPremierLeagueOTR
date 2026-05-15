import httpx
import time
from config import FOOTBALL_API_BASE, HEADERS

_cache: dict = {}
CACHE_TTL = 15  # seconds


def _get(path: str, params: dict = None) -> dict:
    key = f"{path}?{params}"
    now = time.time()
    if key in _cache and now - _cache[key]["ts"] < CACHE_TTL:
        return _cache[key]["data"]

    url = f"{FOOTBALL_API_BASE}{path}"
    with httpx.Client(timeout=10) as client:
        r = client.get(url, headers=HEADERS, params=params or {})
        r.raise_for_status()
        data = r.json()

    _cache[key] = {"data": data, "ts": now}
    return data


def get_live_fixtures(league_ids: str = "all") -> dict:
    return _get("/fixtures", {"live": league_ids})


def get_fixture(fixture_id: int) -> dict:
    return _get("/fixtures", {"id": fixture_id})


def get_events(fixture_id: int) -> dict:
    return _get("/fixtures/events", {"fixture": fixture_id})


def get_lineups(fixture_id: int) -> dict:
    return _get("/fixtures/lineups", {"fixture": fixture_id})


def get_statistics(fixture_id: int) -> dict:
    return _get("/fixtures/statistics", {"fixture": fixture_id})


def get_standings(league_id: int, season: int) -> dict:
    return _get("/standings", {"league": league_id, "season": season})
