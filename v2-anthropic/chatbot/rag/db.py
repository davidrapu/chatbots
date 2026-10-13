import psycopg
from pgvector.psycopg import register_vector, register_vector_async
import os
import asyncio
from service.generateUID import generate_uid
from anthropic.types import MessageParam
from dotenv import load_dotenv
load_dotenv()


def get_connection():
    """
    Establish a connection to the PostgreSQL database using the DATABASE_URL environment variable.
    @return: A psycopg connection object.
    """
    conn = psycopg.connect(os.environ["DATABASE_URL"])
    register_vector(conn)
    return conn


async def get_connection_async():
    """
    Establish a connection to the PostgreSQL database using the DATABASE_URL environment variable.
    @return: A psycopg connection object.
    """
    conn = await psycopg.AsyncConnection.connect(os.environ["DATABASE_URL"])
    await register_vector_async(conn)
    return conn

async def get_user_history(session_id: str) -> list[MessageParam]:
    """
    Retrieve the message history for a specific user session from the database.
    @param session_id: The unique identifier for the user session.
    @return: A list of MessageParams objects representing the user's message history.
    """
    async with await get_connection_async() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT role, content FROM chat_history WHERE session_id = %s ORDER BY id ASC",
                (session_id,),
            )
            result = await cur.fetchall()
            return [{"role": row[0], "content": row[1]} for row in result]


async def save_message_to_db(session_id: str, role: str, content: str):
    """
    Save a message to the database for a specific user session.
    @param session_id: The unique identifier for the user session.
    @param role: The role of the message sender (e.g., 'user' or 'assistant').
    @param content: The content of the message to be saved.
    """
    async with await get_connection_async() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO chat_history (session_id, role, content) VALUES (%s, %s, %s)",
                (session_id, role, content),
            )

async def save_exchange_to_db(session_id: str, user_input: str, assistant_response: str):
    """
    Save a complete exchange (user message and assistant response) to the database for a specific user session.
    @param session_id: The unique identifier for the user session.
    @param user_input: The content of the user's message.
    @param assistant_response: The content of the assistant's response.
    """
    async with await get_connection_async() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO chat_history (session_id, role, content) VALUES (%s, %s, %s)",
                (session_id, "user", user_input),
            )
            await cur.execute(
                "INSERT INTO chat_history (session_id, role, content) VALUES (%s, %s, %s)",
                (session_id, "assistant", assistant_response),
            )

if __name__ == "__main__":
    # Test to see all the tables in the database
    async def test_tables():
        async with await get_connection_async() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT * FROM chat_history")
                tables = await cur.fetchall()
                print("Rows in chat_history table:")
                for row in tables:
                    print(row)

    asyncio.run(test_tables(), loop_factory=asyncio.SelectorEventLoop)
