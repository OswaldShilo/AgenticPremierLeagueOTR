import asyncio
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

import agent
from config import POLL_INTERVAL
from routers import fixtures, f1, ai as ai_router


# --- WebSocket connection manager ---

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, data: dict):
        message = json.dumps(data)
        for ws in list(self.active):
            try:
                await ws.send_text(message)
            except Exception:
                self.disconnect(ws)


manager = ConnectionManager()


# --- App lifespan (starts background agent) ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    agent.broadcast_fn = manager.broadcast
    task = asyncio.create_task(agent.poll_loop(POLL_INTERVAL))
    yield
    task.cancel()


app = FastAPI(title="Kickoff API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fixtures.router)
app.include_router(f1.router)
app.include_router(ai_router.router)


# --- WebSocket chat endpoint ---

@app.websocket("/ws/chat/{fixture_id}")
async def chat_ws(ws: WebSocket, fixture_id: int):
    await manager.connect(ws)
    try:
        while True:
            text = await ws.receive_text()
            data = json.loads(text)
            await manager.broadcast({
                "type": "chat",
                "fixture_id": fixture_id,
                "user": data.get("user", "Fan"),
                "message": data.get("message", ""),
            })
    except WebSocketDisconnect:
        manager.disconnect(ws)


@app.get("/health")
def health():
    return {"status": "ok"}
