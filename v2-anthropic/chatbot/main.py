from fastapi import FastAPI, Response, HTTPException
from bot import get_response
from pydantic import BaseModel
import anthropic

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    user_input = request.message
    if not user_input.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty/.")
    try:
        bot_response = await get_response(user_input)
        return {"response": bot_response}
    except anthropic.APIError as e:
        print(f"Anthropic API error: {e}")
        raise HTTPException(status_code=500, detail="Error communicating with the AI service.")
