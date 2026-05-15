import os
from dotenv import load_dotenv

load_dotenv()

API_SPORTS_KEY = os.getenv("API_SPORTS_KEY", "")
FOOTBALL_API_BASE = os.getenv("FOOTBALL_API_BASE", "https://v3.football.api-sports.io")
F1_API_BASE = os.getenv("F1_API_BASE", "https://v1.formula-1.api-sports.io")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL_SECONDS", "30"))

HEADERS = {
    "x-apisports-key": API_SPORTS_KEY,
}
