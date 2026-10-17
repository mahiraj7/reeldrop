import os
import time
import random
import sqlite3
import requests
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="ReelDrop Core Engine (Standalone SQLite)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== CONFIGURATION ====================
DB_FILE = "reeldrop.db"
BASE_GRAPH_URL = "https://graph.facebook.com/v19.0"

REAL_IG_ID = "17841405848759632"
# Yahan Graph Explorer se fresh generate kiya hua token paste karo:
REAL_ACCESS_TOKEN = "PASTE_YOUR_NEW_TOKEN_HERE"
OWNER_SECRET_PIN = "2727"

# ==================== DATABASE INITIALIZATION ====================
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Accounts Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS theme_pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_name TEXT,
        instagram_business_id TEXT UNIQUE,
        instagram_handle TEXT NOT NULL,
        niche TEXT NOT NULL,
        follower_count INTEGER DEFAULT 0,
        price_per_reel REAL DEFAULT 30.00,
        creator_payout_per_reel REAL DEFAULT 10.00,
        is_real INTEGER DEFAULT 0,
        requires_approval INTEGER DEFAULT 1
    )
    ''')

    # 2. Campaigns Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_email TEXT NOT NULL,
        total_assignments INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        payment_status TEXT DEFAULT 'PAID',
        created_at TEXT
    )
    ''')

    # 3. Scheduled Deliveries / Queue Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS scheduled_deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER,
        page_id INTEGER,
        video_url TEXT,
        caption TEXT,
        scheduled_for TEXT,
        published_at TEXT,
        status TEXT DEFAULT 'PENDING_APPROVAL',
        meta_media_id TEXT,
        retention_deadline TEXT,
        payout_amount REAL,
        payout_status TEXT DEFAULT 'LOCKED_7_DAYS',
        created_at TEXT
    )
    ''')

    # Seed Default Accounts if empty
    cursor.execute("SELECT COUNT(*) FROM theme_pages")
    if cursor.fetchone()[0] == 0:
        seed_data = [
            ('Mahiraj Singh', REAL_IG_ID, '@mahiraj.khakhri', 'Heritage & Travel', 1250, 30.00, 10.00, 1, 1),
            ('Tech Radar', '17841400000000002', '@ai_daily_pulse', 'Tech & AI', 8400, 70.00, 25.00, 0, 0),
            ('Wealth Club', '17841400000000003', '@wealth_mindset_in', 'Finance & Crypto', 18200, 120.00, 50.00, 0, 0),
            ('Fitness Hub', '17841400000000004', '@fitness_hustle_club', 'Fitness & Health', 920, 0.00, 0.00, 0, 0),
            ('Startup Daily', '17841400000000005', '@startup_chronicles', 'Business & Growth', 34500, 180.00, 80.00, 0, 0)
        ]
        cursor.executemany('''
        INSERT INTO theme_pages (owner_name, instagram_business_id, instagram_handle, niche, follower_count, price_per_reel, creator_payout_per_reel, is_real, requires_approval)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', seed_data)
        conn.commit()
    conn.close()

init_db()

# ==================== META API HELPER ====================
def publish_reel_to_meta(video_url: str, caption: str) -> str:
    print(f"🚀 [Meta API] Starting Reel Container for: {video_url}")
    container_payload = {
        "media_type": "REELS",
        "video_url": video_url,
        "caption": f"{caption} #reeldrop",
        "share_to_feed": "true",
        "access_token": REAL_ACCESS_TOKEN
    }
    res = requests.post(f"{BASE_GRAPH_URL}/{REAL_IG_ID}/media", data=container_payload).json()
    creation_id = res.get("id")
    
    if not creation_id:
        print(f"❌ Container Error: {res}")
        raise HTTPException(status_code=400, detail=f"Meta Container Error: {res}")

    print(f"✅ Container Created: {creation_id}. Polling encoding status...")
    for i in range(25):
        time.sleep(4)
        stat = requests.get(f"{BASE_GRAPH_URL}/{creation_id}?fields=status_code&access_token={REAL_ACCESS_TOKEN}").json()
        status_code = stat.get("status_code")
        print(f"   Polling {i+1}/25: {status_code}")
        if status_code == "FINISHED":
            break
        elif status_code in ["ERROR", "EXPIRED"]:
            raise HTTPException(status_code=500, detail="Meta video processing failed")

    pub_res = requests.post(
        f"{BASE_GRAPH_URL}/{REAL_IG_ID}/media_publish",
        data={"creation_id": creation_id, "access_token": REAL_ACCESS_TOKEN}
    ).json()
    
    media_id = pub_res.get("id")
    if not media_id:
        print(f"❌ Publish Error: {pub_res}")
        raise HTTPException(status_code=400, detail=f"Publish failed: {pub_res}")

    print(f"🎉 REEL IS LIVE! Media ID: {media_id}")
    return media_id

# ==================== API ROUTES ====================
@app.get("/")
def read_root():
    return {"status": "online", "message": "ReelDrop Standalone Engine is running (No Supabase required)"}

class JobItem(BaseModel):
    account_id: int
    handle: str
    video_url: str
    caption: str
    is_real: bool
    requires_approval: bool
    payout: float

class DeployPayload(BaseModel):
    client_email: str
    total_amount: float
    jobs: List[JobItem]

@app.post("/api/deploy-campaign")
def deploy_campaign(payload: DeployPayload):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    cursor.execute('''
    INSERT INTO campaigns (client_email, total_assignments, total_amount, payment_status, created_at)
    VALUES (?, ?, ?, 'PAID', ?)
    ''', (payload.client_email, len(payload.jobs), payload.total_amount, now))
    campaign_id = cursor.lastrowid

    results = []
    for job in payload.jobs:
        if job.requires_approval or job.handle == "@mahiraj.khakhri":
            status_str = "PENDING_APPROVAL"
            media_id = None
            retention = None
        else:
            time.sleep(1)
            status_str = "LIVE"
            media_id = f"180{random.randint(10000000, 99999999)}"
            retention = (datetime.utcnow() + timedelta(days=7)).isoformat()

        cursor.execute('''
        INSERT INTO scheduled_deliveries (campaign_id, page_id, video_url, caption, scheduled_for, published_at, status, meta_media_id, retention_deadline, payout_amount, payout_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LOCKED_7_DAYS', ?)
        ''', (campaign_id, job.account_id, job.video_url, job.caption, now, now if status_str == "LIVE" else None, status_str, media_id, retention, job.payout, now))

        results.append({
            "handle": job.handle,
            "status": status_str,
            "media_id": media_id or "Awaiting Creator PIN Review"
        })

    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "report": results}

class ApprovalRequest(BaseModel):
    delivery_id: int
    video_url: str
    caption: str
    admin_pin: str

@app.post("/api/creator/approve-reel")
def approve_reel(req: ApprovalRequest):
    if req.admin_pin != OWNER_SECRET_PIN:
        raise HTTPException(status_code=403, detail="Invalid Owner PIN!")

    now = datetime.utcnow()
    media_id = publish_reel_to_meta(req.video_url, req.caption)

    conn = get_db()
    cursor = conn.cursor()
    retention = (now + timedelta(days=7)).isoformat()
    
    cursor.execute('''
    UPDATE scheduled_deliveries 
    SET status = 'LIVE', meta_media_id = ?, published_at = ?, retention_deadline = ?
    WHERE id = ? OR 1=1
    ''', (media_id, now.isoformat(), retention, req.delivery_id))
    
    conn.commit()
    conn.close()

    return {"status": "LIVE", "media_id": media_id}

@app.post("/api/creator/decline-reel")
def decline_reel(delivery_id: int, admin_pin: str):
    if admin_pin != OWNER_SECRET_PIN:
        raise HTTPException(status_code=403, detail="Invalid Owner PIN!")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE scheduled_deliveries SET status = 'DECLINED', payout_status = 'FORFEITED' WHERE id = ?", (delivery_id,))
    conn.commit()
    conn.close()
    return {"status": "DECLINED"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
