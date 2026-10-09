import psycopg
from pgvector.psycopg import register_vector, register_vector_async
import os
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
