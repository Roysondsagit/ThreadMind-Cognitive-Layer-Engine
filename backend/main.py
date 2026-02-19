
import os
import datetime
from typing import List, Optional, Any
from fastapi import FastAPI, HTTPException, Request, Body
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId

# ENV SETUP
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "threadmind"
API_KEY = os.getenv("API_KEY")

app = FastAPI(title="ThreadMind Cognitive Engine")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB CLIENT
client = AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]


def doc_to_dict(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict."""
    d = dict(doc)
    d["_id"] = str(d["_id"])
    if "last_viewed" in d and hasattr(d["last_viewed"], "isoformat"):
        d["last_viewed"] = d["last_viewed"].isoformat()
    if "created_at" in d and hasattr(d["created_at"], "isoformat"):
        d["created_at"] = d["created_at"].isoformat()
    return d


# SCHEMAS
class ThreadBase(BaseModel):
    user_id: str
    content_type: str
    original_content: str
    title: str
    summary: str
    extracted_text: Optional[str] = None
    tags: List[str]
    intent: str
    category: str


class ThreadCreate(ThreadBase):
    pass


# ROUTES
@app.post("/api/threads", response_model=dict)
async def create_thread(thread: ThreadCreate):
    """
    Called by the frontend or WhatsApp Bot after AI processing.
    """
    thread_data = thread.dict()
    thread_data["view_count"] = 0
    thread_data["last_viewed"] = datetime.datetime.utcnow()
    thread_data["created_at"] = datetime.datetime.utcnow()

    result = await db.threads.insert_one(thread_data)
    return {"id": str(result.inserted_id), "status": "stored"}


@app.get("/api/threads/{user_id}")
async def get_user_threads(user_id: str) -> List[dict]:
    cursor = db.threads.find({"user_id": user_id}).sort("created_at", -1)
    return [doc_to_dict(t) async for t in cursor]


@app.patch("/api/threads/{thread_id}/view")
async def mark_thread_viewed(thread_id: str):
    try:
        result = await db.threads.update_one(
            {"_id": ObjectId(thread_id)},
            {
                "$inc": {"view_count": 1},
                "$set": {"last_viewed": datetime.datetime.utcnow()},
            },
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Thread not found")
        return {"status": "ok"}
    except Exception as e:
        if "invalid" in str(e).lower() or "id" in str(e).lower():
            raise HTTPException(status_code=400, detail="Invalid thread ID")
        raise


@app.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request):
    """
    Twilio Webhook Endpoint.
    1. Parse incoming Message
    2. Identify User
    3. Trigger AI Layer (Gemini)
    4. Store in DB
    5. Reply via Twilio
    """
    form_data = await request.form()
    sender = form_data.get("From")
    body = form_data.get("Body")
    media_url = form_data.get("MediaUrl0")

    # [CONCEPTUAL AI FLOW]
    # analysis = await process_content_via_gemini(body or media_url)
    # await db.threads.insert_one({...})
    # await twilio_client.send_message(to=sender, body=f"🔥 Rescued: {analysis.title}")

    return {"status": "ok"}

@app.delete("/api/threads/{thread_id}")
async def delete_thread(thread_id: str):
    try:
        result = await db.threads.delete_one({"_id": ObjectId(thread_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Thread not found")
        return {"status": "deleted"}
    except Exception as e:
        if "invalid" in str(e).lower() or "id" in str(e).lower():
            raise HTTPException(status_code=400, detail="Invalid thread ID")
        raise

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
