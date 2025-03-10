# RAG System

This is a Retrieval-Augmented Generation (RAG) system built for answering questions using the Anthropic Claude API. The system uses HTML documents in the `./data` folder as its knowledge base.

## Features

- **Document Processing**: Extracts and processes HTML content from the data folder
- **Vector Storage**: Uses ChromaDB to store and retrieve document embeddings
- **Conversational Memory**: Maintains conversation history for contextual responses
- **LLM Integration**: Uses Anthropic's Claude model for natural language generation
- **API Endpoints**: Flask-based REST API for easy integration

## Setup

### Prerequisites

- Python 3.8+
- An Anthropic API key

### Installation & Usage

The simplest way to set up and run the system is to use the provided script:

```bash
./run.sh
```

This script will:

1. Create a virtual environment if needed
2. Install all required dependencies
3. Create a `.env` file if it doesn't exist
4. Start the server

The first time you run it, you'll be prompted to edit the `.env` file to add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_api_key_here
CHROMA_PERSIST_DIRECTORY=./chroma_db
```

After adding your API key, run the script again to start the server.

### Manual Setup (Alternative)

If you prefer to set up manually:

1. Create a virtual environment (recommended):

```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create and edit `.env` file:

```bash
cp .env.example .env
# Edit .env to add your API key
```

4. Start the server:

```bash
python app.py
```

The server will initialize by processing all documents in the `./data` folder and adding them to the vector store. This happens only once, unless you explicitly request a reload.

The server will be running at http://localhost:8000 by default.

2. Interact with the API:

### Chat Endpoint

```
POST /api/chat
```

Request body:

```json
{
  "query": "What do you do?",
  "session_id": "optional-session-id"
}
```

Response:

```json
{
  "response": "I can...",
  "sources": [
    {
      "title": "Introduction",
      "article_number": 1,
      "relevance_score": 0.92
    }
  ],
  "session_id": "session-id"
}
```

### Clear Session Endpoint

```
POST /api/session/clear
```

Request body:

```json
{
  "session_id": "your-session-id"
}
```

### Reload Documents Endpoint

```
POST /api/reload
```

## Architecture

The system consists of several components:

1. **DocumentProcessor**: Handles loading and processing HTML files from the data directory.
2. **VectorStore**: Manages document embeddings and retrieval using ChromaDB.
3. **LLMService**: Interacts with the Anthropic API to generate responses.
4. **RAGService**: Orchestrates the entire process, from document retrieval to response generation.
5. **Flask API**: Provides HTTP endpoints for interacting with the RAG system.

## Example Usage

### Python Client

```python
import requests

# Start a new chat
response = requests.post(
    "http://localhost:8000/api/chat",
    json={"query": "What can you do?"}
)

session_id = response.json()["session_id"]
print(response.json()["response"])

# Continue the conversation
response = requests.post(
    "http://localhost:8000/api/chat",
    json={
        "query": "How does it work?",
        "session_id": session_id
    }
)

print(response.json()["response"])

# Clear the conversation
requests.post(
    "http://localhost:8000/api/session/clear",
    json={"session_id": session_id}
)
```

### Postman Collection

A Postman collection is included for testing the API:

1. Import the file `API.postman_collection.json` into Postman
2. Start with the "Chat" request to initiate a conversation
3. The collection includes a script that automatically saves the session ID as a variable
4. Use "Chat - Continue Conversation" for follow-up questions with the same session ID
5. Use "Clear Session" to reset a conversation

The collection includes example responses and detailed descriptions for each endpoint.

