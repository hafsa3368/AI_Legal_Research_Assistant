from qdrant_client.models import VectorParams, Distance
from app.vectorstore.qdrant_manager import get_client
from app.config import COLLECTION_NAME

client = get_client()

client.recreate_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(
        size=768,
        distance=Distance.COSINE
    )
)

print(f"Collection '{COLLECTION_NAME}' created successfully.")