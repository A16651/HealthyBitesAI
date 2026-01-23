"""Product search and retrieval API routes.

This module provides FastAPI routes for searching products and retrieving
product details from the Open Food Facts database.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List
import logging

from Backend.services import openfoodfacts_service
from Backend.models.product_models import (
    ProductSearchResponse, 
    ProductDetail, 
    ProductResponse
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/search", response_model=ProductSearchResponse)
async def search_products(
    q: str = Query(..., description="Product name or barcode to search for"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results to return")
) -> ProductSearchResponse:
    """Search for products in the Open Food Facts database.
    
    This endpoint searches for products by name or barcode using intelligent
    matching strategies. It first attempts an exact match, then falls back to
    longest-word matching if no results are found.
    
    Args:
        q: The search query (product name or keywords).
        limit: Maximum number of results to return (1-50).
    
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
async def get_product_detail(code: str) -> ProductDetail:
    """Retrieve detailed information for a specific product.
    
    This endpoint fetches comprehensive product information including
    ingredients, nutritional information, and images from Open Food Facts.
    
    Args:
        code: The product's barcode/code identifier.
    
    Returns:
        ProductDetail object containing full product information.
        
    Raises:
        HTTPException: 404 if product not found.
        
    Example:
        GET /api/v1/product/3017620422003
    """
    try:
        product = openfoodfacts_service.get_product_details(code)
        
        if not product:
            logger.warning(f"Product not found for code: {code}")
            raise HTTPException(
                status_code=404,
                detail=f"Product with code '{code}' not found"
            )
        
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
async def barcode_search(code: str) -> ProductResponse:
    """Search for a product by barcode.
    
    This endpoint performs a direct barcode lookup and returns basic
    product information.
    
    Args:
        code: The product's barcode (EAN/UPC).
    
    Returns:
        ProductResponse containing basic product information.
        
    Raises:
        HTTPException: 404 if product not found.
        
    Example:
        GET /api/v1/barcode/8901063018761
    """
    try:
        product = openfoodfacts_service.barcode_search(code)
        
        if not product:
            logger.warning(f"Product not found for barcode: {code}")
            raise HTTPException(
                status_code=404,
                detail=f"Product with barcode '{code}' not found"
            )
        
        logger.info(f"Barcode search successful for: {code}")
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error in barcode search for '{code}': {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during barcode search"
        )