from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
import shutil
import os
import sqlite3
import io
from pydub import AudioSegment  # For .caf transcoding
from analyzer import get_audio_features

AudioSegment.converter = "/usr/local/bin/ffmpeg"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp_storage"
os.makedirs(TEMP_DIR, exist_ok=True)

# This remains for standard files, but we will use the new /play route for .caf
app.mount("/sounds", StaticFiles(directory="temp_storage"), name="sounds")

DB_NAME = "algorhythm.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            bpm REAL,
            energy REAL,
            category TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.get("/")
def home():
    return {"message": "AlgoRhythm API is Online!"}

# NEW: The Transcoder Route for Chrome Compatibility
@app.get("/play/{filename}")
async def play_audio(filename: str):
    file_path = os.path.join(TEMP_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    # If it's a .caf file, transcode it to .wav in memory for Chrome
    if filename.lower().endswith(".caf"):
        try:
            # Pydub uses FFmpeg to read the .caf
            audio = AudioSegment.from_file(file_path, format="caf")
            out = io.BytesIO()
            audio.export(out, format="wav")
            out.seek(0)
            return StreamingResponse(out, media_type="audio/wav")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Transcoding error: {str(e)}")
    
    # For standard files (.mp3, .wav), serve normally
    return FileResponse(file_path)

@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    temp_path = os.path.join(TEMP_DIR, file.filename)
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    results = get_audio_features(temp_path)
    
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO songs (filename, bpm, energy, category)
        VALUES (?, ?, ?, ?)
    ''', (file.filename, results['bpm'], results['energy'], results['category']))
    conn.commit()
    conn.close()
    
    return {"status": "Saved to Database", "data": results}

@app.get("/library")
def get_library():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM songs")
    rows = cursor.fetchall()
    conn.close()
    return {"library": rows}

@app.delete("/songs/{song_id}")
def delete_song(song_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT filename FROM songs WHERE id = ?", (song_id,))
    row = cursor.fetchone()
    
    if row:
        filename = row[0]
        file_path = os.path.join(TEMP_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        cursor.execute("DELETE FROM songs WHERE id = ?", (song_id,))
        conn.commit()
        
    conn.close()
    return {"message": "Successfully deleted"}