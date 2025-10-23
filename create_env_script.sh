#!/bin/bash

# Define the target .env file path in the home directory
ENV_FILE="$HOME/.env"

# Check if GEMINI_API_KEY is already set in the environment
if [ -z "$GEMINI_API_KEY" ]; then
  read -p "Enter your Gemini API Key: " GEMINI_API_KEY
fi


echo "This script will create a .env file in your home directory (~/.env) and set appropriate permissions."
echo ""

# Create .env file
echo "Creating .env file at $ENV_FILE..."
echo "GEMINI_API_KEY=\"$API_KEY\"" > "$ENV_FILE"

# Set permissions to owner read/write only
echo "Setting permissions for $ENV_FILE to 600 (owner read/write only)..."
chmod 600 "$ENV_FILE"

echo ".env file created in your home directory and permissions set successfully."
echo "This global .env file does not need to be added to .gitignore in individual projects."
echo "You may need to restart your terminal for the changes to take effect in new sessions."