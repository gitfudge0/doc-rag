import os
import uuid
from flask import Flask, request, jsonify
from rag_service import RAGService
from flask.logging import create_logger
from flask_cors import CORS
import logging

# Create Flask app
app = Flask(__name__)

# Set up CORS - get allowed origins from environment variable
cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173")
# Split by comma if multiple origins
origins = [origin.strip() for origin in cors_origins.split(",")]
CORS(app, resources={r"/api/*": {"origins": origins}})

logger = create_logger(app)
logger.setLevel(logging.INFO)

# Initialize RAG service
rag_service = RAGService()

# Initialize the service at startup
logger.info("Initializing RAG service...")
rag_service.initialize_vector_store()
logger.info("RAG service initialized successfully.")

@app.route('/api/chat', methods=['POST'])
def chat():
    """Endpoint to handle chat requests."""
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        # Extract required parameters
        query = data.get('query')
        session_id = data.get('session_id')
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
            
        # Generate a session ID if not provided
        if not session_id:
            session_id = str(uuid.uuid4())
            
        # Get response from RAG service
        result = rag_service.get_response(query, session_id)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/session/clear', methods=['POST'])
def clear_session():
    """Endpoint to clear a conversation session."""
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400
            
        # Clear the conversation
        success = rag_service.clear_conversation(session_id)
        
        if success:
            return jsonify({"message": "Conversation cleared successfully"})
        else:
            return jsonify({"error": "Session not found"}), 404
            
    except Exception as e:
        logger.error(f"Error clearing session: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/reload', methods=['POST'])
def reload_documents():
    """Endpoint to force reload all documents."""
    try:
        logger.info("Reloading all documents...")
        rag_service.initialize_vector_store(force_reload=True)
        logger.info("Documents reloaded successfully.")
        
        return jsonify({"message": "Documents reloaded successfully"})
        
    except Exception as e:
        logger.error(f"Error reloading documents: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':    
    # Start the server
    port = int(os.environ.get('PORT', 8000))  # Changed from 5000 to 8000
    app.run(host='0.0.0.0', port=port, debug=True)