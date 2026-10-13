from typing_extensions import Literal
from typing import Annotated

from fastapi import FastAPI, HTTPException, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from rag.retrival import search_chunk
from rag.db import get_user_history, save_message_to_db, save_exchange_to_db
from bots.bot import get_response, get_streaming_response

from pydantic import BaseModel, Field

import anthropic
from anthropic.types import MessageParam

from rag.embeddings import embed
from service.generateUID import generate_uid

import asyncio

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
    message: str = Field(
        max_length=2000, description="The user's message to the chatbot."
    )


class ChatResponse(BaseModel):
    response: str


class Cookies(BaseModel):
    session_id: str | None = Field(description="Session ID from cookies.", default=None)


async def stream_and_save(session_id: str, history: list[MessageParam], user_input: str):
    chunks: list[str] = []

    try:
        async for text in get_streaming_response(history):
            chunks.append(text)
            yield text
    except anthropic.APIError as e:
        print(f"Anthropic API error: {e}")
        raise 

    await save_exchange_to_db(session_id, user_input, "".join(chunks))

async def prepend_first_chunk(first_chunk: str, rest):
    """Yield the chunk we already took out, then everything else."""
    yield first_chunk
    async for chunk in rest:
        yield chunk


@app.post("/chat/stream")
async def chat_streaming(request: ChatRequest, cookies: Annotated[Cookies, Cookie()]):
    # Validate the request and message
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    user_input = request.message.replace("\x00", "")  # Remove null characters from the input
    session_id = cookies.session_id
    is_new_session = False

    if session_id is None:
        is_new_session = True
        session_id = generate_uid()  # Generate a new session ID if not present

    # Remove <company_information> and <question> tags from the user input
    for tag in ("company_information", "question"):
        user_input = user_input.replace(f"<{tag}>", "").replace(f"</{tag}>", "")

    # Retrieval of RAG operation: Get the context based on the user's input
    vector = await asyncio.to_thread(embed, user_input)  # Embed the user's input to get the vector representation
    context = await search_chunk(vector)  # Get the context based on the user's input
    # Augmentation of RAG operation: Create a prompt that includes the user's input and the retrieved context
    bot_prompt =  f'''
        <company_information>
        {context}
        </company_information>
        <question>
        {user_input}
        </question>
        '''

    user_unique_history: list[MessageParam] = await get_user_history(session_id)  # Retrieve the user's message history from the database

    user_unique_history.append({"role": "user", "content": bot_prompt})  # Add the user's message that includes context to the list
    # print(f"User history for session {session_id}: {user_unique_history}")  # Debugging: Print the user's message history to the console

    gen = stream_and_save(session_id, user_unique_history, user_input)  # Start streaming the response and saving it to the database

    try:
        first_chunk = await anext(gen)
    except anthropic.APIError:
        # stream_and_save has already logged it and removed the user message
        raise HTTPException(
            status_code=503, detail="Pagi is unavailable right now. Please try again shortly."
        )
    except StopAsyncIteration:
        # The stream ended without producing any text
        raise HTTPException(status_code=502, detail="Pagi didn't reply. Please try again.")

    response = StreamingResponse(
        prepend_first_chunk(first_chunk, gen),
        media_type="text/plain",
    )

    if is_new_session:
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            max_age=60 * 30,
            samesite="lax",
        )  # Set the session_id cookie for new sessions

    # print(message_history)  # Debugging: Print the message history to the console
    return response
