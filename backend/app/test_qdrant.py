from app.vectorstore.qdrant_manager import get_client

client = get_client()

print(client.get_collections())