FROM node:20-bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    nodejs \
    npm \
    postgresql-client \
    zstd \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set working directory
WORKDIR /app

# Copy backend files
COPY package*.json ./
COPY prisma ./prisma/
COPY src ./src/
COPY scripts ./scripts/

# Install Node dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy start script
COPY start.sh .
RUN chmod +x start.sh

# Expose the port (Hugging Face expects 7860)
EXPOSE 7860

# Start Ollama and the backend
CMD ["./start.sh"]