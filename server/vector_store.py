import os
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()


class VectorStore:
    def __init__(self):
        persist_directory = os.getenv("CHROMA_PERSIST_DIRECTORY", "./chroma_db")

        # Create the persist directory if it doesn't exist
        os.makedirs(persist_directory, exist_ok=True)

        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=persist_directory, settings=Settings(anonymized_telemetry=False)
        )

        # Use sentence-transformers for embedding
        self.embedding_function = (
            embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="all-MiniLM-L6-v2"
            )
        )

        # Create or get the collection
        self.collection = self.client.get_or_create_collection(
            name="interstim_documents",
            embedding_function=self.embedding_function,
            metadata={"description": "educational materials"},
        )

    def add_documents(self, documents: List[Dict[str, Any]]) -> None:
        """Add documents to the vector store."""
        ids = []
        texts = []
        metadatas = []

        for i, doc in enumerate(documents):
            # Create a unique ID
            doc_id = (
                f"{doc['metadata']['article_number']}_{doc['metadata']['chunk_index']}"
            )

            # Clean metadata - remove None values which ChromaDB doesn't accept
            cleaned_metadata = {}
            for key, value in doc["metadata"].items():
                if value is not None:
                    if isinstance(value, (str, int, float, bool)):
                        cleaned_metadata[key] = value
                    else:
                        # Convert other types to string
                        cleaned_metadata[key] = str(value)
                else:
                    # Replace None with empty string
                    cleaned_metadata[key] = ""

            ids.append(doc_id)
            texts.append(doc["text"])
            metadatas.append(cleaned_metadata)

        # Add in batches to avoid memory issues with large datasets
        batch_size = 100
        for i in range(0, len(ids), batch_size):
            end_idx = min(i + batch_size, len(ids))
            self.collection.add(
                ids=ids[i:end_idx],
                documents=texts[i:end_idx],
                metadatas=metadatas[i:end_idx],
            )

        print(f"Added {len(ids)} document chunks to the vector store.")

    def query(self, query_text: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Query the vector store for similar documents."""
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results,
            include=["documents", "metadatas", "distances"],
        )

        # Format the results
        formatted_results = []
        for i, doc in enumerate(results["documents"][0]):
            formatted_results.append(
                {
                    "text": doc,
                    "metadata": results["metadatas"][0][i],
                    "distance": results["distances"][0][i],
                }
            )

        return formatted_results

    def get_document_count(self) -> int:
        """Get the number of documents in the collection."""
        return self.collection.count()

    def clear(self) -> None:
        """Clear all documents from the collection."""
        self.client.delete_collection(name="interstim_documents")
        self.collection = self.client.get_or_create_collection(
            name="interstim_documents",
            embedding_function=self.embedding_function,
            metadata={"description": "educational materials"},
        )

