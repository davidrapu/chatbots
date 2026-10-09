from data.company_info import COMPANY_INFO
from rag.db import get_connection
from rag.embeddings import embed



def add_chunk(chunk: dict):
    """
    Add a new chunk to the database.
    @param chunk: A dictionary representing the chunk to add. Must include keys for 'question', 'answer', 'embedding', and 'section'.
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO faq_chunks (question, answer, embedding, section) VALUES (%s, %s, %s, %s)",
                (
                    chunk["question"],
                    chunk["answer"],
                    chunk["embedding"],
                    chunk["section"],
                ),
            )
            conn.commit()


# ingestion
# Split the data into chunks
chunk_list = []
current_section = ""
chunk_dict = {}
split1 = COMPANY_INFO.strip().split("\n")
for text in split1:
    if text.strip().endswith("?"):
        chunk_dict["question"] = text.strip()
    elif text.strip().endswith("."):
        chunk_dict["answer"] = text.strip()
    else:
        current_section = text.strip()
        chunk_dict["section"] = current_section
    if len(chunk_dict) >= 2:
        if "question" not in chunk_dict or "answer" not in chunk_dict:
            continue

        if "section" not in chunk_dict:
            chunk_dict["section"] = current_section

        chunk_dict["text"] = (
            chunk_dict["section"]
            + "\n"
            + chunk_dict["question"]
            + "\n"
            + chunk_dict["answer"]
        )
        chunk_list.append(chunk_dict)
        chunk_dict = {}

# Embedding the chunks
embeddings = embed([chunk["text"] for chunk in chunk_list])

# Add the chunks to the database
for chunk, embedding in zip(chunk_list, embeddings):
    chunk["embedding"] = embedding.tolist()
    add_chunk(chunk                                                                            )
