from typing import Dict, List, Any
from document_processor import DocumentProcessor
from vector_store import VectorStore
from llm_service import LLMService

class RAGService:
    def __init__(self):
        self.document_processor = DocumentProcessor()
        self.vector_store = VectorStore()
        self.llm_service = LLMService()
        self.conversation_histories = {}  # Dictionary to track conversations by session ID
        
    def initialize_vector_store(self, force_reload: bool = False) -> None:
        """Initialize the vector store by processing all documents and adding them."""
        # Check if we need to reload the documents
        if force_reload or self.vector_store.get_document_count() == 0:
            # Clear existing documents if reloading
            if force_reload:
                self.vector_store.clear()
                
            # Process all documents
            print("Processing documents...")
            documents = self.document_processor.process_all_documents()
            
            # Add to vector store
            print(f"Adding {len(documents)} document chunks to vector store...")
            self.vector_store.add_documents(documents)
            print("Vector store initialized successfully.")
        else:
            print(f"Vector store already contains {self.vector_store.get_document_count()} document chunks.")
    
    def start_new_conversation(self, session_id: str) -> None:
        """Initialize a new conversation for the given session ID."""
        self.conversation_histories[session_id] = []
        
    def get_response(self, query: str, session_id: str, n_results: int = 5) -> Dict[str, Any]:
        """
        Process a user query and return a response using RAG.
        
        Args:
            query: The user's question
            session_id: Unique identifier for the conversation session
            n_results: Number of document chunks to retrieve
            
        Returns:
            A dictionary containing the response and metadata
        """
        # Ensure session exists
        if session_id not in self.conversation_histories:
            self.start_new_conversation(session_id)
            
        # Query the vector store
        retrieved_docs = self.vector_store.query(query, n_results=n_results)
        
        # If no relevant documents found, return "don't know" response
        if not retrieved_docs:
            response = "I don't have enough information to answer that question."
        else:
            # Generate response using LLM
            response = self.llm_service.generate_response(
                query=query,
                context_docs=retrieved_docs,
                conversation_history=self.conversation_histories[session_id]
            )
        
        # Update conversation history
        self.conversation_histories[session_id].append({"role": "user", "content": query})
        self.conversation_histories[session_id].append({"role": "assistant", "content": response})
        
        # Prepare source references
        sources = []
        for doc in retrieved_docs:
            source = {
                "title": doc["metadata"].get("title", "Unknown Title"),
                "article_number": doc["metadata"].get("article_number", "Unknown"),
                "relevance_score": 1.0 - doc["distance"]  # Convert distance to relevance score
            }
            if source not in sources:
                sources.append(source)
        
        # Return response with metadata
        return {
            "response": response,
            "sources": sources,
            "session_id": session_id
        }
        
    def clear_conversation(self, session_id: str) -> bool:
        """Clear the conversation history for a session."""
        if session_id in self.conversation_histories:
            self.conversation_histories[session_id] = []
            return True
        return False