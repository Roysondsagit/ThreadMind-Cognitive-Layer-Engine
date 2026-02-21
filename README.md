# 🧠 ThreadMind: Cognitive Layer Engine

ThreadMind is not a bookmarking tool—it is a cognitive expansion layer that captures, analyzes, and resurfaces digital entropy.

### Try this project on : [thread-mind-cognitive-layer-engine.vercel.app](https://thread-mind-cognitive-layer-engine.vercel.app)

### Check out the working demo:

<video src="demo.mp4" controls width="600"></video>

## 📁 Folder Structure (Production Ready)

```text
threadmind/
├── backend/                # Python / FastAPI
│   ├── app/
│   │   ├── main.py         # Entry Point
│   │   ├── routes/         # API endpoints (Vault, Bot, Search)
│   │   ├── services/       # AI (Gemini), Scraping, Scoring
│   │   ├── db/             # MongoDB / Vector DB client
│   │   └── utils/          # Formatting & Math
│   ├── requirements.txt
│   └── .env.example
├── frontend/               # React / Vite
│   ├── src/
│   │   ├── components/     # UI Layer
│   │   ├── services/       # API & AI Clients
│   │   └── types.ts        # Data Contracts
└── README.md
```

## 🗄️ Database Schema (MongoDB)

```json
{
  "_id": "ObjectId",
  "user_id": "string (indexed)",
  "content_type": "enum ['url', 'text', 'voice']",
  "original_link": "string (nullable)",
  "raw_text": "string (scraped body content)",
  "summary": "string (1-line AI summary)",
  "tags": ["string"],
  "intent": "enum ['Idea', 'Inspiration', 'Resource', 'Task']",
  "category": "enum ['Fitness', 'Coding', 'Food', 'Travel', 'Design', 'Other']",
  "embedding_id": "string (link to Pinecone/VectorDB)",
  "view_count": "number",
  "last_viewed": "ISODate",
  "created_at": "ISODate"
}
```
*Index Recommendations:* `user_id`, `created_at`, `category`.

## 💾 Data Storage

- **Default:** Data is stored in browser **localStorage** (no setup required).
- **MongoDB:** To use MongoDB, run the backend and set `VITE_API_URL` in `.env.local`.

### Using MongoDB

1. Install MongoDB locally or create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Install backend deps and run:
   ```bash
   cd backend && pip install -r requirements.txt
   MONGODB_URI="mongodb://localhost:27017" uvicorn main:app --reload --port 8000
   ```
3. In project root `.env.local`, add:
   ```
   VITE_API_URL=http://localhost:8000
   ```
4. Restart the frontend (`npm run dev`).

## ⚙️ Smart Resurfacing Algorithm (Python Implementation)

```python
import random
import datetime

def calculate_score(last_viewed_at, semantic_relevance=0.5):
    # Normalize time since last viewed (Max score at 7 days)
    delta = datetime.datetime.now() - last_viewed_at
    hours_diff = delta.total_seconds() / 3600
    time_weight = min(hours_diff / 168, 1.0)
    
    random_boost = random.random()
    
    final_score = (0.5 * semantic_relevance) + \
                  (0.3 * time_weight) + \
                  (0.2 * random_boost)
    return final_score
```

## 🚀 3-Day Build Plan

1.  **Day 1: Capture Pipeline**. Build the WhatsApp Webhook and Gemini Extraction Layer. Get data into MongoDB.
2.  **Day 2: Intelligence Layer**. Implement Semantic Search and the Scoring Engine. Build the React Dashboard.
3.  **Day 3: UX & Polish**. Add Voice Rescue, the Cognitive Assistant chatbot, and final animations.

