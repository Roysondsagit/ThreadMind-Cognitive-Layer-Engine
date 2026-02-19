
# 🧠 ThreadMind: Cognitive Layer Engine

ThreadMind is not a bookmarking tool—it is a cognitive expansion layer that captures, analyzes, and resurfaces digital entropy.

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

## 🎤 Demo Script (2 Minutes)

- **Problem (20s)**: "We consume 100x more info than we remember. We save bookmarks to die."
- **Solution (40s)**: "ThreadMind is your cognitive layer. Send a messy Instagram link to our WhatsApp bot. Gemini instantly extracts the value, tags it, and files it."
- **The Magic (40s)**: "But it doesn't just sit there. Our Resurfacing Engine tracks your obsessions. Because I've been saving coding links today, it's surfacing this forgotten API doc from last week."
- **Closing (20s)**: "Memory is a choice. Choose ThreadMind."
