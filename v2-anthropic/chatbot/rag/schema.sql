-- Run once on a fresh database, before rag.ingestion
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS faq_chunks (
  id serial PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  embedding vector(384) NOT NULL, -- all-MiniLM-L6-v2 outputs 384 numbers
  section text NOT NULL
);
