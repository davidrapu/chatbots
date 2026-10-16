FROM python:3.14-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -c 'from sentence_transformers import SentenceTransformer; model = SentenceTransformer("all-MiniLM-L6-v2")'
COPY . .
ENV HF_HUB_OFFLINE=1
CMD ["fastapi", "run", "main.py", "--host", "0.0.0.0"]