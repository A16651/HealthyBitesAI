# =============================================================================
# HealthyBitesAI — Local Development Dockerfile
#
# NOTE: This is for LOCAL development only.
# In production (Render), Dockerfile.backend and Dockerfile.frontend are used
# (managed in the deployment branch).
#
# For local convenience this file can still build a combined image,
# but the canonical deployment is two separate services.
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

# For local dev, the frontend calls the backend at this URL.
# Override at build time if needed: docker build --build-arg NEXT_PUBLIC_API_URL=...
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Production runtime (backend only — frontend is a separate concern)
# ---------------------------------------------------------------------------
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# --- Python dependencies ---------------------------------------------------
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# --- Backend code -----------------------------------------------------------
COPY Backend/ ./Backend/
COPY main.py ./

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
