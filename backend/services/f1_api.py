import httpx
import time
from config import F1_API_BASE, HEADERS

_cache: dict = {}
CACHE_TTL = 15


def _get(path: str, params: dict = None) -> dict:
    key = f"{path}?{params}"
    now = time.time()
    if key in _cache and now - _cache[key]["ts"] < CACHE_TTL:
        return _cache[key]["data"]

    url = f"{F1_API_BASE}{path}"
    with httpx.Client(timeout=10) as client:
        r = client.get(url, headers=HEADERS, params=params or {})
        r.raise_for_status()
        data = r.json()

    _cache[key] = {"data": data, "ts": now}
    return data


def get_current_season() -> dict:
    return _get("/seasons")


def get_races(season: int) -> dict:
    return _get("/races", {"season": season})


def get_live_timing() -> dict:
    return _get("/rankings/fastestlaps")


def get_drivers(season: int) -> dict:
    return _get("/drivers", {"season": season})


def get_standings_drivers(season: int) -> dict:
    return _get("/rankings/drivers", {"season": season})


def get_standings_teams(season: int) -> dict:
    return _get("/rankings/teams", {"season": season})
