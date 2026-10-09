from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
def embed(data):
    embeddings = model.encode(data)
    return embeddings