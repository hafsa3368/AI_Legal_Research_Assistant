from dotenv import load_dotenv
import os

load_dotenv()

QDRANT_HOST = os.getenv("QDRANT_HOST")
QDRANT_PORT = int(os.getenv("QDRANT_PORT"))

OLLAMA_URL = os.getenv("OLLAMA_URL")

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL")
LLM_MODEL = os.getenv("LLM_MODEL")

COLLECTION_NAME = os.getenv("COLLECTION_NAME")