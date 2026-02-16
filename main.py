"""Main application entry point for HealthyBitesAI Backend.

This module initializes the FastAPI application, configures middleware,
sets up API routes, and reverse-proxies frontend requests to the
internal Next.js server.

Architecture (production / Render):
  FastAPI  ──▶  $PORT (public, Render-exposed)
  Next.js  ──▶  :3000 (internal only)
  FastAPI proxies all non-API traffic to Next.js transparently.

Typical usage:
    Run directly: python main.py
    Or with uvicorn: uvicorn main:app --host 0.0.0.0 --port 8000
"""

import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from contextlib import asynccontextmanager
import httpx

from Backend.config import get_settings
from Backend.routes import products, analysis
from Backend.database import create_tables

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load settings
settings = get_settings()

# Internal Next.js URL (never exposed publicly)
FRONTEND_INTERNAL_URL = os.environ.get("FRONTEND_INTERNAL_URL", "http://127.0.0.1:3000")

# Async HTTP client for proxying (connection pooling, keep-alive)
proxy_client: httpx.AsyncClient | None = None


# Lifecycle events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    global proxy_client

    # Startup
    logger.info("Initializing database...")
    try:
        create_tables()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning(f"Could not initialize database: {e}. Continuing without database caching.")

    # Create persistent HTTP client for proxying
    proxy_client = httpx.AsyncClient(
        base_url=FRONTEND_INTERNAL_URL,
        timeout=30.0,
        follow_redirects=True,
    )
    logger.info(f"Proxy client ready → {FRONTEND_INTERNAL_URL}")

    yield

    # Shutdown
    if proxy_client:
        await proxy_client.aclose()
    logger.info("Shutting down application...")


# Initialize FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="Backend API for Label Padhega India - A Food Transparency Application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(
    products.router,
    prefix=settings.api_v1_str,
    tags=["Products"]
)
app.include_router(
    analysis.router,
    prefix=settings.api_v1_str,
    tags=["Analysis"]
)


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring.

    Returns:
        Dictionary indicating service health status.
    """
    return {"status": "healthy", "service": settings.app_name}


# ─────────────────────────────────────────────────────────────────────
# Reverse Proxy: Forward all non-API requests to Next.js
# This MUST be the last route so it doesn't interfere with API routes.
# ─────────────────────────────────────────────────────────────────────

# Headers we should NOT forward to the client (hop-by-hop headers)
HOP_BY_HOP_HEADERS = frozenset({
    "connection", "keep-alive", "proxy-authenticate",
    "proxy-authorization", "te", "trailers",
    "transfer-encoding", "upgrade",
})


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy_to_frontend(request: Request, path: str):
    """
    Catch-all reverse proxy: forwards requests to the internal Next.js server.
    API routes (/api/v1/*, /docs, /redoc, /health) are handled by FastAPI routers above.
    Everything else (/, /analysis/123, /_next/*, etc.) goes to Next.js.
    """
    if proxy_client is None:
        return Response(content="Frontend proxy not initialized", status_code=503)

    # Build target URL
    url = f"/{path}"
    if request.url.query:
        url = f"{url}?{request.url.query}"

    # Forward headers (strip hop-by-hop)
    headers = {}
    for key, value in request.headers.items():
        if key.lower() not in HOP_BY_HOP_HEADERS and key.lower() != "host":
            headers[key] = value

    try:
        # Read request body (for POST, PUT, etc.)
        body = await request.body()

        # Forward the request to Next.js
        proxy_response = await proxy_client.request(
            method=request.method,
            url=url,
            headers=headers,
            content=body if body else None,
        )

        # Build response headers (strip hop-by-hop)
        response_headers = {}
        for key, value in proxy_response.headers.items():
            if key.lower() not in HOP_BY_HOP_HEADERS:
                response_headers[key] = value

        return Response(
            content=proxy_response.content,
            status_code=proxy_response.status_code,
            headers=response_headers,
        )

    except httpx.ConnectError:
        logger.error(f"Cannot connect to frontend at {FRONTEND_INTERNAL_URL}")
        return Response(
            content="Frontend service unavailable. Please try again in a moment.",
            status_code=502,
        )
    except httpx.TimeoutException:
        logger.error(f"Timeout connecting to frontend at {FRONTEND_INTERNAL_URL}")
        return Response(
            content="Frontend service timed out.",
            status_code=504,
        )
    except Exception as e:
        logger.error(f"Proxy error: {e}")
        return Response(
            content="Internal proxy error.",
            status_code=500,
        )


if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting {settings.app_name} on {settings.host}:{settings.port}")

    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level=settings.log_level
    )
