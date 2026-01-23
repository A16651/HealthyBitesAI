# Multi-stage Dockerfile Starts both Backend and Frontend
# 1: Build Frontend (Next.js Static Export)
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY Frontend/package*.json ./
RUN npm ci --only=production

# Copy frontend source code
COPY Frontend/ ./

# Build Next.js application - generates static files in /out or .next/standalone
RUN npm run build

# 2: Setup Python Backend
FROM python:3.12-slim AS backend

WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY Backend/ ./Backend/
COPY main.py .

# Copy built frontend static files from the builder stage
COPY --from=frontend-builder /app/frontend/.next/standalone /app/frontend/.next/standalone
COPY --from=frontend-builder /app/frontend/.next/static /app/frontend/.next/static
COPY --from=frontend-builder /app/frontend/public /app/frontend/public

# Install Node.js in the backend container to serve Next.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Expose ports for both services
EXPOSE 8000 3000

# Create a startup script to run both services
RUN echo '#!/bin/bash\n\
    # Start Backend (uvicorn)\n\
    uvicorn main:app --host 0.0.0.0 --port 8000 &\n\
    # Start Frontend (Next.js)\n\
    cd /app/frontend && node .next/standalone/server.js &\n\
    # Wait for both processes\n\
    wait' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]
