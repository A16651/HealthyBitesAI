"""Main application entry point for HealthyBitesAI Backend.

This module initializes the FastAPI application, configures middleware,
and sets up API routes.

Architecture (production / Render — Two-Service Deployment):
  Backend  (this service)  → FastAPI on port 8000
  Frontend (separate service) → Next.js on port 3000
  Frontend calls backend via NEXT_PUBLIC_API_URL environment variable.
  No reverse proxy — services are fully independent.

Typical usage:
    Run directly: python main.py
    Or with uvicorn: uvicorn main:app --host 0.0.0.0 --port 8000
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

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


# Lifecycle events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""

    # Startup
    logger.info("Initializing database...")
    try:
        create_tables()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning(f"Could not initialize database: {e}. Continuing without database caching.")

    logger.info("HealthyBitesAI Backend is ready.")

    yield

    # Shutdown
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
# Allow all origins so the separate frontend service can call this backend.
# In production you may want to restrict this to your frontend's URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


@app.get("/")
async def root():
    """Root endpoint — confirms the backend is running."""
    return {
        "service": settings.app_name,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring.

    Returns:
        Dictionary indicating service health status.
    """
    return {"status": "healthy", "service": settings.app_name}


if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting {settings.app_name} on 0.0.0.0:8000")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.log_level
    )
