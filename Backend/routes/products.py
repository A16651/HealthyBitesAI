"""Product search and retrieval API routes.

This module provides FastAPI routes for searching products and retrieving
product details from the Open Food Facts database with optional database caching.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from typing import List
import logging

from Backend.services import openfoodfacts_service
from Backend.services.database_service import ProductDatabaseService
from Backend.models.product_models import (
    ProductSearchResponse, 
    ProductDetail, 
    ProductResponse
)
from Backend.database import get_db
from Backend.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter()


@router.get("/search", response_model=ProductSearchResponse)
async def search_products(
    q: str = Query(..., description="Product name or barcode to search for"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results to return"),
    db: Session = Depends(get_db)
) -> ProductSearchResponse:
    """Search for products in the Open Food Facts database.
    
    This endpoint searches for products by name or barcode using intelligent
    matching strategies. It first attempts an exact match, then falls back to
    longest-word matching if no results are found.
    
    Args:
        q: The search query (product name or keywords).
        limit: Maximum number of results to return (1-50).
        db: Database session for caching.
    
    Returns:
        ProductSearchResponse containing list of matching products and count.
        
    Example:
        GET /api/v1/search?q=Amul%20Butter&limit=10
    """
    try:
        products = openfoodfacts_service.search_products(q, limit)
        logger.info(f"Search for '{q}' returned {len(products)} results")
        return ProductSearchResponse(products=products, count=len(products))
    except Exception as e:
        logger.exception(f"Error searching products for query '{q}': {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while searching for products"
        )


@router.get("/product/{code}", response_model=ProductDetail)
async def get_product_detail(code: str, db: Session = Depends(get_db)) -> ProductDetail:
    """Retrieve detailed information for a specific product.
    
    This endpoint fetches comprehensive product information including
    ingredients, nutritional information, and images from Open Food Facts.
    Results are cached in the database for faster subsequent requests.
    
    Args:
        code: The product's barcode/code identifier.
        db: Database session for caching.
    
    Returns:
        ProductDetail object containing full product information.
        
    Raises:
        HTTPException: 404 if product not found.
        
    Example:
        GET /api/v1/product/3017620422003
    """
    try:
        # Try to get from cache first if database caching is enabled
        if settings.use_database_cache:
            cached = ProductDatabaseService.get_product_ingredients(db, code)
            if cached:
                logger.info(f"Retrieved cached ingredients for product: {code}")
                # Merge with cached product info
                cached_product = ProductDatabaseService.get_product(db, code)
                if cached_product:
                    return ProductDetail(
                        product_name=cached_product.get('product_name', ''),
                        brand=cached_product.get('brand'),
                        image_url=cached_product.get('image_url'),
                        id=code,
                        ingredients_text=cached.get('ingredients_text'),
                        nutriments=cached.get('nutriments')
                    )
        
        # Fetch from API if not in cache
        product = openfoodfacts_service.get_product_details(code)
        
        if not product:
            logger.warning(f"Product not found for code: {code}")
            raise HTTPException(
                status_code=404,
                detail=f"Product with code '{code}' not found"
            )
        
        # Cache the result if database caching is enabled
        if settings.use_database_cache:
            ProductDatabaseService.cache_complete_product(db, code, product.__dict__)
        
        logger.info(f"Retrieved details for product: {code}")
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error fetching product details for '{code}': {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching product details"
        )


@router.get("/barcode/{code}", response_model=ProductResponse)
async def barcode_search(code: str, db: Session = Depends(get_db)) -> ProductResponse:
    """Search for a product by barcode.
    
    This endpoint performs a direct barcode lookup and returns basic
    product information. Results are cached in the database for faster
    subsequent requests.
    
    Args:
        code: The product's barcode (EAN/UPC).
        db: Database session for caching.
    
    Returns:
        ProductResponse containing basic product information.
        
    Raises:
        HTTPException: 404 if product not found.
        
    Example:
        GET /api/v1/barcode/8901063018761
    """
    try:
        # Try to get from cache first if database caching is enabled
        if settings.use_database_cache:
            cached = ProductDatabaseService.get_product(db, code)
            if cached:
                logger.info(f"Retrieved cached product for barcode: {code}")
                return ProductResponse(
                    code=code,
                    product_name=cached.get('product_name', 'Unknown Product'),
                    brand=cached.get('brand', 'Unknown Brand'),
                    image_url=cached.get('image_url'),
                    id=code
                )
        
        # Fetch from API if not in cache
        product_data = openfoodfacts_service.barcode_search(code)
        
        if not product_data:
            logger.warning(f"Product not found for barcode: {code}")
            raise HTTPException(
                status_code=404,
                detail=f"Product with barcode '{code}' not found"
            )
        
        # Cache the product
        if settings.use_database_cache:
            ProductDatabaseService.store_product(
                db,
                code,
                product_data.get('product_name', 'Unknown Product'),
                product_data.get('brands'),
                product_data.get('image_front_url') or product_data.get('image_url')
            )
        
        # Transform raw OpenFoodFacts data to ProductResponse format
        product_response = ProductResponse(
            code=code,
            product_name=product_data.get('product_name', 'Unknown Product'),
            brand=product_data.get('brands', 'Unknown Brand'),
            image_url=product_data.get('image_front_url') or product_data.get('image_url'),
            id=code
        )
        
        logger.info(f"Barcode search successful for: {code}")
        return product_response
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error in barcode search for '{code}': {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during barcode search"
        )