"""Main application entry point for HealthyBitesAI Backend.

This module initializes the FastAPI application, configures middleware,
and sets up API routes.

Typical usage:
    Run directly: python main.py
    Or with uvicorn: uvicorn main:app --host 0.0.0.0 --port 8000
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from Backend.config import get_settings
from Backend.routes import products, analysis

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load settings
settings = get_settings()

# Initialize FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="Backend API for Label Padhega India - A Food Transparency Application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
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


@app.get("/")
async def root():
    """Root endpoint providing API information.
    
    Returns:
        Dictionary containing welcome message, documentation links, and status.
    """
    return {
        "message": "Welcome to Label Padhega India Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "running",
        "endpoints": {
            "search": f"{settings.api_v1_str}/search",
            "product_detail": f"{settings.api_v1_str}/product/{{code}}",
            "barcode_search": f"{settings.api_v1_str}/barcode/{{code}}",
            "analyze": f"{settings.api_v1_str}/analyze",
            "analyze_product": f"{settings.api_v1_str}/analyze/product/{{code}}",
            "ocr": f"{settings.api_v1_str}/ocr"
        }
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
    
    logger.info(f"Starting {settings.app_name} on {settings.host}:{settings.port}")
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level=settings.log_level
    )
