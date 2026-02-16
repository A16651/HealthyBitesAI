# =============================================================================
# HealthyBitesAI — Production Dockerfile
# Single container: FastAPI backend (public) + Next.js frontend (internal)
#
# Architecture:
#   FastAPI  → :8000 (public)
#   Next.js  → :3000 (internal only, proxied by FastAPI)
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Build Next.js frontend
# ---------------------------------------------------------------------------
FROM node:20-alpine AS frontend-build

WORKDIR /build

COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY Frontend/ ./

# In production, API calls go to same origin (empty base URL)
# This ensures fetch('/api/v1/search') works via the FastAPI reverse proxy
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Production runtime
# ---------------------------------------------------------------------------
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# --- Node.js runtime (needed to serve Next.js standalone) ------------------
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get purge -y --auto-remove curl gnupg && \
    rm -rf /var/lib/apt/lists/*

# --- Python dependencies ---------------------------------------------------
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# --- Backend code -----------------------------------------------------------
COPY Backend/ ./Backend/
COPY main.py ./

# --- Frontend (standalone build output only — no source, no node_modules) ---
COPY --from=frontend-build /build/.next/standalone ./Frontend/
COPY --from=frontend-build /build/.next/static     ./Frontend/.next/static

# --- Entrypoint --------------------------------------------------------------
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Backend always runs on port 8000 — Next.js runs internally on 3000
EXPOSE 8000

# Health check hits FastAPI's /health endpoint on port 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

ENTRYPOINT ["./entrypoint.sh"]
