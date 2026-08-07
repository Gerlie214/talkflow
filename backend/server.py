from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from seed_topics import TOPICS, FREE_PROMPTS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="TalkFlow API")
api = APIRouter(prefix="/api")


# ===== Models =====
class Topic(BaseModel):
    id: str
    category: str
    title: str
    description: str
    difficulty: str
    duration_min: int
    sentences: List[str]


class SessionCreate(BaseModel):
    device_id: str
    mode: str  # guided | free | custom
    topic_id: Optional[str] = None
    topic_title: str
    duration_sec: int
    sentences_total: int
    sentences_completed: int
    completion_pct: float
    audio_saved: bool = False


class Session(SessionCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CustomScriptCreate(BaseModel):
    device_id: str
    title: str
    content: str


class CustomScript(CustomScriptCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ===== Routes =====
@api.get("/")
async def root():
    return {"message": "TalkFlow API is running"}


@api.get("/topics", response_model=List[Topic])
async def list_topics(category: Optional[str] = None, difficulty: Optional[str] = None):
    topics = TOPICS
    if category:
        topics = [t for t in topics if t["category"].lower() == category.lower()]
    if difficulty:
        topics = [t for t in topics if t["difficulty"].lower() == difficulty.lower()]
    return topics


@api.get("/topics/categories")
async def list_categories():
    cats = {}
    for t in TOPICS:
        cats.setdefault(t["category"], 0)
        cats[t["category"]] += 1
    return [{"name": name, "count": count} for name, count in cats.items()]


@api.get("/topics/{topic_id}", response_model=Topic)
async def get_topic(topic_id: str):
    for t in TOPICS:
        if t["id"] == topic_id:
            return t
    raise HTTPException(status_code=404, detail="Topic not found")


@api.get("/free-prompts")
async def get_free_prompts():
    return {"prompts": FREE_PROMPTS}


@api.post("/sessions", response_model=Session)
async def create_session(payload: SessionCreate):
    obj = Session(**payload.model_dump())
    await db.sessions.insert_one(obj.model_dump())
    return obj


@api.get("/sessions", response_model=List[Session])
async def list_sessions(device_id: str, limit: int = 50):
    docs = (
        await db.sessions.find({"device_id": device_id}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(limit)
    )
    return docs


@api.delete("/sessions/{session_id}")
async def delete_session(session_id: str, device_id: str):
    res = await db.sessions.delete_one({"id": session_id, "device_id": device_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"ok": True}


@api.get("/stats")
async def get_stats(device_id: str):
    sessions = await db.sessions.find({"device_id": device_id}, {"_id": 0}).to_list(1000)
    total_sessions = len(sessions)
    total_seconds = sum(s.get("duration_sec", 0) for s in sessions)
    topics_completed = len({s.get("topic_id") for s in sessions if s.get("topic_id")})

    # Streak calc (consecutive days with a session)
    from datetime import date, timedelta
    days = set()
    for s in sessions:
        try:
            d = datetime.fromisoformat(s["created_at"]).date()
            days.add(d)
        except Exception:
            continue
    streak = 0
    today = date.today()
    d = today
    while d in days:
        streak += 1
        d = d - timedelta(days=1)
    # If today has no session but yesterday does, streak continues from yesterday
    if streak == 0 and (today - timedelta(days=1)) in days:
        d = today - timedelta(days=1)
        while d in days:
            streak += 1
            d = d - timedelta(days=1)

    # Weekly buckets (last 7 days)
    weekly = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        secs = sum(
            s.get("duration_sec", 0)
            for s in sessions
            if s.get("created_at", "").startswith(day.isoformat())
        )
        weekly.append({"day": day.isoformat(), "seconds": secs})

    return {
        "total_sessions": total_sessions,
        "total_seconds": total_seconds,
        "topics_completed": topics_completed,
        "streak": streak,
        "weekly": weekly,
    }


@api.post("/custom-scripts", response_model=CustomScript)
async def create_custom_script(payload: CustomScriptCreate):
    obj = CustomScript(**payload.model_dump())
    await db.custom_scripts.insert_one(obj.model_dump())
    return obj


@api.get("/custom-scripts", response_model=List[CustomScript])
async def list_custom_scripts(device_id: str):
    docs = (
        await db.custom_scripts.find({"device_id": device_id}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(200)
    )
    return docs


@api.get("/custom-scripts/{script_id}", response_model=CustomScript)
async def get_custom_script(script_id: str, device_id: str):
    doc = await db.custom_scripts.find_one({"id": script_id, "device_id": device_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Custom script not found")
    return doc


@api.delete("/custom-scripts/{script_id}")
async def delete_custom_script(script_id: str, device_id: str):
    res = await db.custom_scripts.delete_one({"id": script_id, "device_id": device_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Custom script not found")
    return {"ok": True}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
