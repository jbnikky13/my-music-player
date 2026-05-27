from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import openai

app = FastAPI()
openai.api_key = "your-openai-api-key"

class MoodRequest(BaseModel):
    mood: str

class VibeRequest(BaseModel):
    vibe: str        # e.g. "Happy", "Workout", "Jazz"
    songs: List[str] # list of song titles from the phone

@app.post("/recommend")
async def recommend_songs(request: MoodRequest):
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a music recommendation assistant."},
            {"role": "user", "content": f"Recommend 5 songs for someone feeling {request.mood}. Return as a list."}
        ]
    )
    return {"recommendations": response.choices[0].message.content}

@app.post("/match-vibe")
async def match_vibe(request: VibeRequest):
    song_list = "\n".join(request.songs)

    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a smart music DJ. Given a vibe and a list of songs, return only the song titles that best match the vibe. Return as a plain list, one song per line."
            },
            {
                "role": "user",
                "content": f"Vibe: {request.vibe}\n\nSongs:\n{song_list}\n\nWhich songs match this vibe?"
            }
        ]
    )

    matched = response.choices[0].message.content.strip().split("\n")
    return {"matched_songs": matched}

@app.get("/")
def root():
    return {"message": "Music API is running 🎵"}
