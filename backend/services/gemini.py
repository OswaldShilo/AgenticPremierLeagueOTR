from config import GEMINI_API_KEY

_client = None


def _get_client():
    global _client
    if _client is None and GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _client = genai.GenerativeModel("gemini-1.5-flash")
    return _client


def generate_event_commentary(event: dict, match_context: dict) -> str:
    client = _get_client()
    if not client:
        return _stub_commentary(event, match_context)

    home = match_context.get("home", "Home")
    away = match_context.get("away", "Away")
    score = match_context.get("score", "0-0")
    minute = event.get("time", {}).get("elapsed", "?")
    event_type = event.get("type", "")
    player = event.get("player", {}).get("name", "Unknown")
    detail = event.get("detail", "")

    prompt = (
        f"Football match: {home} vs {away}, current score {score}.\n"
        f"Event at minute {minute}: {event_type} - {detail} by {player}.\n"
        f"Write 2-3 sentences of engaging, tactical AI commentary for fans watching live. "
        f"Be specific, energetic, and include relevant context if possible. Max 60 words."
    )

    response = client.generate_content(prompt)
    return response.text.strip()


def answer_fan_question(question: str, match_context: dict) -> str:
    client = _get_client()
    if not client:
        return "AI co-pilot is offline — add GEMINI_API_KEY to .env to enable it."

    home = match_context.get("home", "Home")
    away = match_context.get("away", "Away")
    score = match_context.get("score", "0-0")
    minute = match_context.get("minute", "?")

    prompt = (
        f"You are an expert football analyst AI embedded in a live match app.\n"
        f"Current match: {home} vs {away}, score {score}, minute {minute}.\n"
        f"Fan question: {question}\n"
        f"Answer concisely in 2-3 sentences. Be direct and insightful."
    )

    response = client.generate_content(prompt)
    return response.text.strip()


def _stub_commentary(event: dict, match_context: dict) -> str:
    player = event.get("player", {}).get("name", "A player")
    event_type = event.get("type", "event")
    minute = event.get("time", {}).get("elapsed", "?")
    home = match_context.get("home", "Home")
    away = match_context.get("away", "Away")

    stubs = {
        "Goal": f"GOAL! {player} finds the net at minute {minute}! The crowd goes wild as {home} and {away} battle it out.",
        "Card": f"Controversy at minute {minute}! {player} receives a card — this could change the shape of the game significantly.",
        "subst": f"Tactical switch at minute {minute}. {player} comes on — the manager is looking to change the dynamic here.",
    }
    return stubs.get(event_type, f"{event_type} at minute {minute} involving {player}.")
