#!/bin/bash

# Start Ollama in the background
ollama serve &

# Wait for Ollama to be ready
echo "Waiting for Ollama to start..."
until curl -s http://localhost:11434/api/tags > /dev/null; do
    sleep 2
done
echo "Ollama is ready!"

# Pull the required models (first time only, will be cached)
echo "Pulling embedding model..."
ollama pull nomic-embed-text

echo "Pulling chat model..."
ollama pull qwen2.5:3b-instruct-q3_K_S

# Run Prisma commands
echo "Applying database schema..."
npx prisma db push

# Seed the knowledge base
echo "Seeding knowledge base..."
npm run seed

# Start the backend
echo "Starting backend server..."
node src/server.js