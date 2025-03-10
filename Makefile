.PHONY: build up down restart logs clean help setup-env

# Default target
help:
	@echo "Available commands:"
	@echo "  make setup-env - Create .env file from sample"
	@echo "  make build     - Build all Docker images"
	@echo "  make up        - Start all containers in the background"
	@echo "  make start     - Build and start all containers in the background"
	@echo "  make down      - Stop and remove all containers"
	@echo "  make restart   - Restart all containers"
	@echo "  make logs      - Follow logs from all containers"
	@echo "  make clean     - Stop and remove containers, networks, volumes, and images"

# Build the images
build:
	docker compose build

# Start the containers in the background
up:
	docker compose up -d

# Build and start the containers in the background
start: build up

# Stop and remove containers
down:
	docker compose down

# Restart the containers
restart:
	docker compose restart

# Follow the logs
logs:
	docker compose logs -f

# Clean everything
clean:
	docker compose down -v --rmi local

# Run the client development server locally
client-dev:
	cd client && yarn dev

# Run the server locally
server-dev:
	cd server && python app.py

# Set up environment from sample
setup-env:
	@if [ ! -f server/.env ]; then \
		cp server/.env.sample server/.env; \
		echo "Created server/.env from .env.sample. Please edit with your settings."; \
	else \
		echo "server/.env already exists."; \
	fi
