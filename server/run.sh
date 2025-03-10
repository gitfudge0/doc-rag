#!/bin/bash

# Check Python version
if ! command -v python3 &> /dev/null; then
  echo "Python 3 is required but not installed. Please install Python 3.8 or higher."
  exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install pip upgrade tools first - this might help with SSL issues
echo "Upgrading pip..."
pip install --upgrade pip

# Check if we need to install dependencies
if [ ! -f "venv/.installed" ]; then
  echo "Installing dependencies (this might take a while)..."
  
  # Try pip install first
  pip install -r requirements.txt && touch venv/.installed
  
  # Check if installation was successful
  if [ $? -ne 0 ]; then
    echo "Dependency installation failed."
    echo "This might be due to SSL issues or network connectivity."
    echo "If you're experiencing SSL errors, please check your Python installation."
    exit 1
  fi
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "Creating .env file..."
  cp .env.example .env
  echo "Please edit .env file to add your Anthropic API key"
  echo "Open .env in an editor and replace your_api_key_here with your actual API key"
  exit 1
fi

# Run the application
echo "Starting the server..."
python app.py