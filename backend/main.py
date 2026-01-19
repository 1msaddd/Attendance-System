import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from deepface import DeepFace
import cv2
import numpy as np
import base64
import os
import pickle
from datetime import datetime

# --- CONFIGURATION ---
app = FastAPI(title="DeepFace Embedding API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File to store the "Numbers" (Embeddings)
DB_FILE = "face_db.pkl"

# Load DB into memory on startup
if os.path.exists(DB_FILE):
    try:
        with open(DB_FILE, "rb") as f:
            face_db = pickle.load(f)
        print(f"[INFO] Loaded {len(face_db)} users from database.")
    except Exception:
        face_db = {}
        print("[WARN] Database file corrupted or empty. Starting new.")
else:
    face_db = {}
    print("[INFO] No database found. Starting new.")

# --- DATA MODELS ---
class RegisterRequest(BaseModel):
    nim: str
    name: str
    images: List[str] # List of Base64 strings

class VerifyRequest(BaseModel):
    image: str
    model: str = "Facenet512"

# --- HELPER FUNCTIONS ---
def base64_to_cv2(base64_string):
    """Convert base64 to OpenCV image"""
    try:
        if "," in base64_string:
            encoded_data = base64_string.split(',')[1]
        else:
            encoded_data = base64_string
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except:
        return None

def save_db():
    """Save memory dict to disk"""
    with open(DB_FILE, "wb") as f:
        pickle.dump(face_db, f)

def find_cosine_distance(source_representation, test_representation):
    """Manual calculation of Cosine Distance"""
    a = np.matmul(np.transpose(source_representation), test_representation)
    b = np.sum(np.multiply(source_representation, source_representation))
    c = np.sum(np.multiply(test_representation, test_representation))
    return 1 - (a / (np.sqrt(b) * np.sqrt(c)))

# --- ENDPOINTS ---

@app.get("/stats")
def get_stats():
    return {"status": "success", "total_users": len(face_db)}

@app.post("/register")
def register(req: RegisterRequest):
    if not req.nim or not req.name or not req.images:
        raise HTTPException(status_code=400, detail="Missing data")

    embeddings = []
    
    # Process all 3 images (Front, Left, Right)
    for img_b64 in req.images:
        img = base64_to_cv2(img_b64)
        if img is None: continue

        try:
            # Generate embedding (list of numbers)
            # We use Facenet512 as the standard for storage
            results = DeepFace.represent(
                img_path=img, 
                model_name="Facenet512", 
                enforce_detection=False
            )
            if results:
                embeddings.append(results[0]["embedding"])
        except Exception as e:
            print(f"Skipping an image due to error: {e}")
            continue

    if not embeddings:
        raise HTTPException(status_code=400, detail="No faces detected in the photos")

    # Store in memory: NIM -> {Name, List of Embeddings}
    # We do NOT average them. We keep all distinct angles.
    face_db[req.nim] = {
        "name": req.name,
        "embeddings": embeddings 
    }
    
    save_db() # Save to .pkl file
    
    return {"status": "success", "message": f"Registered {req.name} with {len(embeddings)} vectors."}

@app.post("/verify")
def verify(req: VerifyRequest):
    img = base64_to_cv2(req.image)
    if img is None: raise HTTPException(status_code=400, detail="Invalid image")

    try:
        # 1. Convert incoming face to numbers
        target_embedding = DeepFace.represent(
            img_path=img,
            model_name="Facenet512",
            enforce_detection=False
        )[0]["embedding"]
    except:
        return {"status": "failed", "message": "No face detected"}

    # 2. Compare against EVERY saved embedding in the DB
    best_match_nim = None
    best_match_name = None
    min_distance = 100.0 # Start high

    # Threshold for Facenet512 (usually 0.30 is good)
    THRESHOLD = 0.30 

    for nim, data in face_db.items():
        user_name = data["name"]
        user_embeddings = data["embeddings"]

        # Check against all stored angles for this user
        for saved_emb in user_embeddings:
            distance = find_cosine_distance(saved_emb, target_embedding)
            
            if distance < min_distance:
                min_distance = distance
                best_match_nim = nim
                best_match_name = user_name

    # 3. Determine result
    if min_distance <= THRESHOLD:
        confidence = max(0, (1 - (min_distance / THRESHOLD)) * 100)
        return {
            "status": "success",
            "data": {
                "nim": best_match_nim,
                "name": best_match_name,
                "distance": round(min_distance, 4),
                "confidence": f"{confidence:.2f}%",
                "model": "Facenet512"
            }
        }
    else:
        return {"status": "failed", "message": "Face not recognized"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)