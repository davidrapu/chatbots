# Pagi backend

FastAPI server for Pagi, the Page Financials FAQ chatbot. It answers questions
from the company FAQ using Claude (`claude-haiku-4-5-20251001`) and streams the
reply to the React frontend in `../frontend`.

## Setup

Install the dependencies:

```bash
pip install "fastapi[standard]" anthropic python-dotenv
```

`sentence-transformers` is only needed for `embeddings_excercise.py`.

Create a `.env` file in this folder:

```
ANTHROPIC_API_KEY=sk-ant-...
```

`load_dotenv()` doesn't override variables already set in your shell. If you get
401 errors, check that there's no old `ANTHROPIC_API_KEY` set in your environment.

## Run

From this folder:

```bash
python -m fastapi dev main.py
```

The API runs at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`. Use `python -m fastapi` rather than `fastapi`,
because Windows Smart App Control blocks the unsigned `fastapi.exe` launcher.

CORS only allows `http://localhost:5173` (the Vite dev server). Open the
frontend at `localhost`, not `127.0.0.1`, or the session cookie won't be sent.

## Endpoints

| Method | Path           | Body                     | Returns                          |
| ------ | -------------- | ------------------------ | -------------------------------- |
| POST   | `/chat`        | `{"message": "..."}`     | `{"response": "..."}`            |
| POST   | `/chat/stream` | `{"message": "..."}`     | Reply streamed as plain text     |

- `message` must be non-empty and at most 2000 characters (400 or 422 otherwise)
- `/chat/stream` returns 503 if Claude is unreachable, 502 if it sends nothing
- A `session_id` cookie (HttpOnly, 30 minutes) keys the conversation history,
  so follow-up questions have context. History is in memory and is lost when
  the server restarts

## Files

| File                       | What it does                                              |
| -------------------------- | --------------------------------------------------------- |
| `main.py`                  | FastAPI app, routes, CORS, session cookie, history store  |
| `bot.py`                   | Claude client, system prompt, company FAQ, judge prompt   |
| `service/generateUID.py`   | Generates session IDs                                     |
| `tests/test_cases.py`      | 30 eval cases (question, category, expected behaviour)    |
| `tests/test_chat_response.py` | Runs the evals and grades replies with an LLM judge    |
| `embeddings_excercise.py`  | Phase 5 practice: FAQ retrieval with local embeddings     |

## Evals

From this folder:

```bash
python -m tests.test_chat_response
```

This sends every test case to Pagi, then asks a separate judge call to grade
each reply against the expected behaviour. Results go to `test_results.txt`
(Pagi's replies) and `grading_results.txt` (grades and reasons). A full run is
about 60 API calls.
