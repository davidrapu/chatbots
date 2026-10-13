-- Active: 1773245852757@@localhost@5432@vector db
-- Run once on a fresh database, before rag.ingestion
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS faq_chunks (
  id serial PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  embedding vector(384) NOT NULL, -- all-MiniLM-L6-v2 outputs 384 numbers
  section text NOT NULL
);

CREATE TYPE ROLES AS ENUM ('user', 'assistant');

CREATE TABLE IF NOT EXISTS chat_history (
  id serial PRIMARY KEY,
  session_id TEXT NOT NULL,
  role ROLES NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);