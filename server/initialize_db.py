#!/usr/bin/env python3

from rag_service import RAGService
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Initialize the vector database by processing all documents."""
    logger.info("Starting database initialization...")
    
    # Create a RAG service instance
    rag_service = RAGService()
    
    # Force reload of all documents
    logger.info("Processing and embedding all documents...")
    rag_service.initialize_vector_store(force_reload=True)
    
    logger.info("Database initialization complete!")

if __name__ == "__main__":
    main()