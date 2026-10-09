# FAQ chatbot backend (practice project)

A practice project for learning to build LLM chatbots. This FastAPI server
answers questions about an example company's FAQ using retrieval-augmented
generation (RAG): each message is embedded, the most
similar FAQ entries are found in Postgres with pgvector, and Claude
(`claude-haiku-4-5-20251001`) answers from those entries only. The reply is
streamed to the React frontend in `../frontend`.

## How a message flows

1. **Embed:** the visitor's message becomes a 384-number vector
   (`all-MiniLM-L6-v2`, runs locally).
2. **Retrieve:** the 3 closest FAQ chunks by cosine distance (`<=>`).
3. **Augment:** the chunks go into the latest user message as
   `<company_information>`, followed by the visitor's text in `<question>`.
   History keeps only the plain text.
4. **Generate:** Claude streams the reply, following the system prompt in
   `prompts/main_system.py`.

## Setup

All commands run from this folder.

### 1. Python packages

```bash
pip install "fastapi[standard]" anthropic python-dotenv "psycopg[binary]" pgvector sentence-transformers
```

The first run downloads the embedding model (about 90 MB).

### 2. Environment variables

Create `.env` in this folder:

```
ANTHROPIC_API_KEY=sk-ant-...
POSTGRES_PASSWORD=choose-a-dev-password
DATABASE_URL=postgresql://postgres:<password>@localhost:5433/vector%20db
```

- `POSTGRES_PASSWORD` is read by `compose.yaml` and becomes the container's
  password. `DATABASE_URL` must use the same password, URL-encoded if it contains
  characters like `@`, `/`, `:` or `#`.
- `load_dotenv()` doesn't override variables already set in your shell. If you
  get 401 errors from Claude, check for an old `ANTHROPIC_API_KEY` in your
  environment.

### 3. Database (Docker)

```bash
docker compose up -d
```

This starts Postgres 18 with pgvector on **port 5433**, not the usual 5432,
because this machine also runs a Windows-installed Postgres on 5432. Data is kept
in the `pgdata` volume, so it survives `docker compose down`. Use
`docker compose down -v` to wipe it.

Create the table (once, on a fresh database):

```bash
docker compose exec -T db psql -U postgres -d "vector db" -f - < rag/schema.sql
```

### 4. Ingest the FAQ

Run once at setup:

```bash
python -m rag.ingestion
```

This splits `data/company_info.py` into question-and-answer chunks, embeds
them and inserts them. Running it again inserts duplicates. To re-ingest, empty
the table first with `TRUNCATE faq_chunks;`.

## Run

```bash
python -m fastapi dev main.py
```

The API runs at `http://localhost:8000`, with interactive docs at
`/docs`.

- **Use `python -m fastapi`, not `fastapi`.** Windows Smart App Control blocks the
  unsigned `fastapi.exe` launcher.
- **On Windows, async psycopg can't use the default Proactor event loop.**
  `fastapi dev` works because its reloader uses the Selector loop. Without
  reload, start uvicorn with the right loop:
  ```bash
  python -m uvicorn main:app --loop asyncio:SelectorEventLoop
  ```
- **CORS only allows `http://localhost:5173`** (the Vite dev server). Open the
  frontend at `localhost`, not `127.0.0.1`, or the session cookie won't be sent.

## Endpoint

| Method | Path           | Body                 | Returns                      |
| ------ | -------------- | -------------------- | ---------------------------- |
| POST   | `/chat/stream` | `{"message": "..."}` | Reply streamed as plain text |

- `message` must be non-empty and at most 2000 characters (400 or 422 otherwise).
- Returns 503 if Claude is unreachable, and 502 if it sends nothing.
- A `session_id` cookie (HttpOnly, 30 minutes) keys the conversation history.
  History is kept in memory and is lost when the server restarts.

## Files

| Path                          | What it does                                            |
| ----------------------------- | ------------------------------------------------------- |
| `main.py`                     | Route, CORS, session cookie, history, RAG steps         |
| `bots/bot.py`                 | Claude client and streaming                             |
| `prompts/main_system.py`      | The chatbot's system prompt                             |
| `prompts/judge_system.py`     | System prompt for the eval judge (uses the full FAQ)    |
| `rag/embeddings.py`           | Loads the embedding model once; `embed()`               |
| `rag/db.py`                   | Sync (ingestion) and async (retrieval) DB connections   |
| `rag/retrival.py`             | `search_chunk()`: vector search for the top chunks      |
| `rag/ingestion.py`            | One-off script: chunk, embed and insert the FAQ         |
| `rag/schema.sql`              | pgvector extension and `faq_chunks` table               |
| `data/company_info.py`        | Example FAQ text (source for ingestion)                 |
| `judge/judge_bot.py`          | LLM-as-judge that grades replies                        |
| `tests/`                      | 30 eval cases and the runner                            |
| `compose.yaml`                | Postgres + pgvector container                           |
| `embeddings_excercise.py`     | Phase 5 practice script                                 |

## Evals (on hold)

```bash
python -m tests.test_chat_response
```

This sends 30 test cases to the chatbot and grades each reply with a separate judge
call. Results go to `test_results.txt` and `grading_results.txt`. The runner
still calls the bot **without retrieval**, so its results don't reflect the RAG
version yet.
