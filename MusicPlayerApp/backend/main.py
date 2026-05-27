from fastapi import FastAPI
from pydantic import BaseModel
import openai

app = FastAPI()
openai.api_key = "your-openai-api-key"

class MoodRequest(BaseModel):
    mood: str

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

@app.get("/")
def root():
    return {"message": "Music API is running 🎵"}
