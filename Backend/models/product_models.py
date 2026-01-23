"""Product data models.

This module defines Pydantic models for product-related data structures
used throughout the application.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Any


class ProductBase(BaseModel):
    """Base product model with essential information.
    
    This model represents the core product information returned in
    search results and listings.
    
    Attributes:
        product_name: The name of the product.
        brand: The brand name (optional).
        image_url: URL to the product image (optional).
        id: Unique product identifier (barcode or code).
    """
    product_name: str = Field(..., description="Product name")
    brand: Optional[str] = Field(None, description="Brand name")
    image_url: Optional[str] = Field(None, description="URL to product image")
    id: str = Field(..., description="Product barcode or unique identifier")


class ProductSearchRequest(BaseModel):
    """Request model for product search.
    
    Attributes:
        query: The search query string.
        limit: Maximum number of results to return (default 10).
    """
    query: str = Field(..., description="Search query (product name or keywords)")
    limit: int = Field(10, ge=1, le=50, description="Maximum number of results")


class ProductSearchResponse(BaseModel):
    """Response model for product search.
    
    Attributes:
        products: List of products matching the search criteria.
        count: Total number of products returned.
    """
    products: List[ProductBase] = Field(..., description="List of matching products")
    count: int = Field(..., description="Number of products returned")


class ProductDetail(ProductBase):
    """Detailed product model with ingredients and nutrition.
    
    This model extends ProductBase with additional detailed information
    including ingredients and nutritional data.
    
    Attributes:
        ingredients_text: Full ingredient list text (optional).
        nutriments: Nutritional information dictionary (optional).
    """
    ingredients_text: Optional[str] = Field(
        None,
        description="Full text of ingredient list"
    )
    nutriments: Optional[Any] = Field(
        None,
        description="Nutritional information (dict with various nutrients)"
    )


class ProductResponse(BaseModel):
    """Simplified product response model.
    
    This model is used for barcode search responses with basic product info.
    
    Attributes:
        code: Product barcode.
        product_name: Product name.
        brand: Brand name (optional).
        image_url: URL to product image (optional).
        id: Product identifier (optional).
    """
    code: str = Field(..., description="Product barcode")
    product_name: str = Field(..., description="Product name")
    brand: Optional[str] = Field(None, description="Brand name")
    image_url: Optional[str] = Field(None, description="Product image URL")
    id: Optional[str] = Field(None, description="Product identifier")
