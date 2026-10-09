import numpy as np
from numpy.typing import NDArray
from rag.db import get_connection_async
from rag.embeddings import embed


async def search_chunk(vector: NDArray[np.float32], top_k: int = 3):
    """
    Search for the most relevant chunks based on the provided vector.

    @param vector: The embedding vector to search against.
    @param top_k: The number of top results to return.
    @return: A string containing the top_k most relevant chunks, formatted with section, question, and answer.
    """

    async with await get_connection_async() as conn:
        cur = await conn.execute(
            """
                SELECT question, answer, section
                FROM faq_chunks
                ORDER BY embedding <=> %s
                LIMIT %s;
                """,
            (vector, top_k),
        )
        results = await cur.fetchall()
        context = "\n".join(
            [
                f"Section: {text[2]}\nQuestion: {text[0]}\nAnswer: {text[1]}"
                for text in results
            ]
        )
        # print(context) # Debugging: Print the context to verify the retrieved chunks
        return context
