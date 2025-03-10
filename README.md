# RAG Application

A Retrieval-Augmented Generation (RAG) application with a React frontend and Python Flask backend.

## 🚨 DISCLAIMER 🚨

**This project is a Work In Progress (WIP)**. Features may be incomplete, the codebase is subject to significant changes, and there may be bugs and performance issues. Use at your own risk for development and testing purposes only.

## Project Overview

This application consists of:

- **Client**: React/TypeScript frontend with Vite
- **Server**: Python Flask backend with:
  - RAG implementation using ChromaDB for vector storage
  - Integration with LLMs via Anthropic's API
  - REST API endpoints for chat interactions

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Make (optional, for using the Makefile commands)

### Setup and Running with Docker

1. **Clone this repository**:
   ```bash
   git clone <repository-url>
   cd rag
   ```

2. **Set up environment variables**:
   ```bash
   make setup-env
   ```
   Then edit the `server/.env` file with your API keys and configuration.

3. **Build and start the application**:
   ```bash
   make start
   ```
   This will build the Docker images and start the containers in the background.

4. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Makefile Commands

- `make setup-env` - Create .env file from sample
- `make build` - Build Docker images
- `make up` - Start containers in the background
- `make start` - Build and start containers
- `make down` - Stop and remove containers
- `make restart` - Restart containers
- `make logs` - Show and follow logs
- `make clean` - Clean up everything

### Development Mode

For local development without Docker:

1. **Start the backend**:
   ```bash
   make server-dev
   ```

2. **Start the frontend**:
   ```bash
   make client-dev
   ```

## Architecture

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Flask with Flask-CORS
- **Vector Database**: ChromaDB
- **LLM Service**: Anthropic's Claude via API

## Environment Variables

Key environment variables needed:

- `PORT`: Server port (default: 8000)
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `ANTHROPIC_API_KEY`: Your Anthropic API key

## Contributing

This is a work in progress. Feel free to contribute by opening issues and pull requests.

## License

[Your License Here]