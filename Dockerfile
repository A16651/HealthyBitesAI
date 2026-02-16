# =============================================================================
# HealthyBitesAI — Production Dockerfile
# Single container: FastAPI backend + Next.js frontend (standalone)
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Build Next.js frontend
# ---------------------------------------------------------------------------
FROM node:20-alpine AS frontend-build

WORKDIR /build

COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY Frontend/ ./
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

EXPOSE 8000 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8000}/health')" || exit 1

ENTRYPOINT ["./entrypoint.sh"]
