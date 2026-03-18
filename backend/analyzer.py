import librosa
import numpy as np
import os

def get_audio_features(file_path):
    if not os.path.exists(file_path):
        return {"error": f"File '{file_path}' not found!"}

    y, sr = librosa.load(file_path, sr=None)
    
    # 1. Tempo (BPM)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    bpm = float(np.mean(tempo))
    
    # 2. Energy (Loudness)
    energy = float(np.mean(librosa.feature.rms(y=y)))

    # 3. Instrument Classification (Replacing raw Brightness)
    brightness = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
    
    if brightness < 1200:
        category = "KICK / BASS"
    elif brightness < 2800:
        category = "SNARE / LOOP"
    else:
        category = "HAT / TOP"

    return {
        "bpm": round(bpm, 2),
        "energy": round(energy, 4),
        "category": category
    }