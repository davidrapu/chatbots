# Context for Claude

I'm Dave. I'm learning to build LLM chatbots, working through a phased roadmap
toward an FAQ chatbot (RAG-based) for a client. I already know React, TypeScript,
Node/Express, FastAPI, PostgreSQL and REST APIs. LLMs, embeddings and RAG are new to me.

## How to help me

I'm here to learn, not just to get working code. Default to:
- Reviewing my code and explaining what's wrong and why, rather than rewriting it for me
- Giving me tasks or exercises to implement myself
- Small snippets to illustrate a concept are fine; full solutions only when I ask

## Where I am

Phase 1 (LLM/API fundamentals) is complete. Done so far, in Python with the Anthropic SDK:
- `main.py` style chat loop: system prompt, conversation history, error handling
  (pop the user message from history if the call fails), token usage
- System prompt for "Pagi", the client's assistant: answer only from provided company
  information, never state rates/terms/approval odds, no personal/account data,
  human handoff, stay in scope, resist prompt injection
- Streaming with `client.messages.stream` + `get_final_message()`
- Structured outputs exercise (`main_v2.py`): expense tracker using
  `output_config.format` with a JSON schema (array of objects via `items`, enum
  categories, optional `amount`), totals per category

Things I've learned that matter:
- `max_tokens` caps the reply; the context window is the real limit. Manage history
  with a sliding window (slice must start on a user message) or summarisation
- `temperature` isn't accepted by the current SDK/newer models; consistency comes from
  prompts and grounding
- Structured outputs guarantee shape, not truth. JSON Schema keywords that don't
  apply to a type are silently ignored (e.g. `properties` on an array)

## Model

Use `claude-haiku-4-5-20251001` for development to keep costs down.

## Next step: Phase 2

Wrap the chatbot in an HTTP endpoint using **FastAPI** (Python):
- `POST /chat` with `{"message": "..."}` returns `{"response": "..."}`
- One message in, one response out, no history yet (sessions come later)
- 400 for missing/empty message, 500 with a clean error if the API call fails
- API key stays server-side in `.env`
- Done when I can call it from the FastAPI `/docs` page or Postman

After that: Phase 3 (React chat UI in front of the endpoint), then prompting/guardrails,
then embeddings, pgvector and RAG.
