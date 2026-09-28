from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bot import get_response
from pydantic import BaseModel, Field
import anthropic

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str = Field(max_length=2000, description="The user's message to the chatbot.")

class ChatResponse(BaseModel):
    response: str


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request or not request.message:
        raise HTTPException(status_code=400, detail="Request body must contain a 'message' field.")
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    user_input = request.message
    try:
        bot_response = await get_response(user_input)
        return {"response": bot_response}
    except anthropic.APIError as e:
        print(f"Anthropic API error: {e}")
        raise HTTPException(status_code=500, detail="Error communicating with the AI service.")

