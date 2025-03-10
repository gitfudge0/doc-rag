FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV FLASK_APP=app.py
ENV PORT=8000
ENV PYTHONUNBUFFERED=1
ENV CORS_ORIGINS="http://localhost"

# Create directory for chromadb
RUN mkdir -p /app/chroma_db

# Expose the port
EXPOSE 8000

# Run the application
CMD ["python", "app.py"]