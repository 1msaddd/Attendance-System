import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from deepface import DeepFace
import cv2
import numpy as np
import base64
import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI(title="DeepFace API (Fast)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_URL = os.environ.get("DB_URL")
CONN = None  # Global connection variable

def get_db_connection():
    """Get existing connection or create a new one (Persistent Connection)"""
    global CONN
    try:
        # Check if connection is dead or None
        if CONN is None or CONN.closed != 0:
            print("[INFO] Connecting to Database...")
            if not DB_URL:
                raise Exception("DB_URL not found")
            CONN = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
    except Exception as e:
        print(f"[ERR] Connection failed: {e}")
        # Retry once immediately if failed
        CONN = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
    
    return CONN

def init_db():
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS users (nim TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);''')
        c.execute('''CREATE TABLE IF NOT EXISTS embeddings (id SERIAL PRIMARY KEY, nim TEXT REFERENCES users(nim), vector JSONB);''')
        c.execute('''CREATE TABLE IF NOT EXISTS logs (id SERIAL PRIMARY KEY, nim TEXT, name TEXT, model TEXT, confidence TEXT, distance REAL, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);''')
        conn.commit()
        print("[INFO] Database initialized.")
    except Exception as e:
        print(f"[ERR] Init failed: {e}")

if DB_URL: init_db()

# --- MODELS ---
class RegisterRequest(BaseModel):
    nim: str
    name: str
    images: List[str]

class UploadRequest(BaseModel):
    nim: str
    images: List[str]

class VerifyRequest(BaseModel):
    image: str
    model: str = "Facenet512"

# --- HELPERS ---
def base64_to_cv2(base64_string):
    try:
        if "," in base64_string: encoded_data = base64_string.split(',')[1]
        else: encoded_data = base64_string
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except: return None

def find_cosine_distance(source, test):
    a = np.matmul(np.transpose(source), test)
    b = np.sum(np.multiply(source, source))
    c = np.sum(np.multiply(test, test))
    return 1 - (a / (np.sqrt(b) * np.sqrt(c)))

# --- FAST ENDPOINTS ---

@app.get("/dashboard")
def get_dashboard_data():
    """Fetches ALL dashboard data in ONE fast query"""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # 1. Get Counts
        c.execute("SELECT COUNT(*) as count FROM users")
        users = c.fetchone()['count']
        c.execute("SELECT COUNT(*) as count FROM logs")
        total_logs = c.fetchone()['count']
        
        # 2. Get Recent Logs
        c.execute("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50")
        rows = c.fetchall()
        
        # Format timestamps
        for row in rows:
            if row['timestamp']: row['timestamp'] = str(row['timestamp'])
            
        # Don't close connection! Keep it open for next request.
        return {
            "status": "success", 
            "stats": {"total_users": users, "total_logs": total_logs},
            "logs": rows
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/register")
def register(req: RegisterRequest):
    if not req.nim or not req.name or not req.images:
        raise HTTPException(status_code=400, detail="Missing data")

    new_embeddings = []
    for img_b64 in req.images:
        img = base64_to_cv2(img_b64)
        if img is None: continue
        try:
            # FAST MODE: detector_backend="opencv"
            results = DeepFace.represent(img_path=img, model_name="Facenet512", enforce_detection=False, detector_backend="opencv")
            if results: new_embeddings.append(results[0]["embedding"])
        except: continue

    if not new_embeddings:
        raise HTTPException(status_code=400, detail="No faces detected")

    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("INSERT INTO users (nim, name) VALUES (%s, %s) ON CONFLICT (nim) DO UPDATE SET name = EXCLUDED.name", (req.nim, req.name))
        for emb in new_embeddings:
            c.execute("INSERT INTO embeddings (nim, vector) VALUES (%s, %s)", (req.nim, json.dumps(emb)))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"status": "success", "message": f"Registered {req.name}"}

@app.post("/upload-dataset")
def upload_dataset(req: UploadRequest):
    if not req.nim or not req.images: raise HTTPException(status_code=400, detail="Missing data")

    new_embeddings = []
    for img_b64 in req.images:
        img = base64_to_cv2(img_b64)
        if img is None: continue
        try:
            # FAST MODE
            results = DeepFace.represent(img_path=img, model_name="Facenet512", enforce_detection=False, detector_backend="opencv")
            if results: new_embeddings.append(results[0]["embedding"])
        except: continue

    if not new_embeddings: raise HTTPException(status_code=400, detail="No faces detected")

    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT name FROM users WHERE nim = %s", (req.nim,))
        if not c.fetchone(): raise HTTPException(status_code=404, detail="User not found")

        for emb in new_embeddings:
            c.execute("INSERT INTO embeddings (nim, vector) VALUES (%s, %s)", (req.nim, json.dumps(emb)))
        conn.commit()
    except HTTPException as he: raise he
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

    return {"status": "success", "message": f"Added {len(new_embeddings)} photos"}

@app.post("/verify")
def verify(req: VerifyRequest):
    img = base64_to_cv2(req.image)
    if img is None: raise HTTPException(status_code=400, detail="Invalid image")

    try:
        # FAST MODE
        target_embedding = DeepFace.represent(img_path=img, model_name="Facenet512", enforce_detection=False, detector_backend="opencv")[0]["embedding"]
    except:
        return {"status": "failed", "message": "No face detected"}

    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT u.nim, u.name, e.vector FROM users u JOIN embeddings e ON u.nim = e.nim")
        rows = c.fetchall()
        
        best_match_nim, best_match_name = None, None
        min_distance = 100.0
        THRESHOLD = 0.30

        for row in rows:
            db_vector = row['vector']
            if isinstance(db_vector, str): db_vector = json.loads(db_vector)
            dist = find_cosine_distance(db_vector, target_embedding)
            if dist < min_distance:
                min_distance = dist
                best_match_nim = row['nim']
                best_match_name = row['name']

        if min_distance <= THRESHOLD:
            confidence = f"{max(0, (1 - (min_distance / THRESHOLD)) * 100):.2f}%"
            c.execute("INSERT INTO logs (nim, name, model, confidence, distance) VALUES (%s, %s, %s, %s, %s)", 
                      (best_match_nim, best_match_name, "Facenet512", confidence, float(min_distance)))
            conn.commit()
            return {"status": "success", "data": {"nim": best_match_nim, "name": best_match_name, "confidence": confidence, "distance": round(min_distance, 4)}}
        else:
            return {"status": "failed", "message": "Face not recognized"}
            
    except Exception as e:
        return {"status": "error", "message": f"DB Error: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)