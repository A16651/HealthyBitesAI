"""Database models for caching product data.

This module defines SQLAlchemy ORM models for storing:
1. Product information (name, image URL)
2. Product analysis results
3. Product ingredients information
"""

from sqlalchemy import Column, String, Text, DateTime, Integer, Numeric, Index
from sqlalchemy.sql import func
from Backend.database import Base
import json
from typing import Optional, Dict, Any


class Product(Base):
    """Model for storing product information.
    
    Attributes:
        barcode: Product barcode (unique identifier)
        product_name: Name of the product
        brand: Brand name of the product
        image_url: URL of the product image
        created_at: Timestamp of creation
        updated_at: Timestamp of last update
    """
    __tablename__ = "products"

    barcode = Column(String(50), primary_key=True, unique=True, index=True)
    product_name = Column(String(255), nullable=False)
    brand = Column(String(255), nullable=True)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Create index on product_name for faster search
    __table_args__ = (
        Index('idx_product_name', 'product_name'),
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary."""
        return {
            'id': self.barcode,
            'product_name': self.product_name,
            'brand': self.brand,
            'image_url': self.image_url
        }


class ProductAnalysis(Base):
    """Model for storing product analysis results.
    
    Attributes:
        barcode: Product barcode (foreign key reference)
        analysis_sections: JSON array of analysis sections
        overall_verdict: Overall health rating/verdict
        created_at: Timestamp of analysis
        updated_at: Timestamp of last update
    """
    __tablename__ = "product_analysis"

    barcode = Column(String(50), primary_key=True, unique=True, index=True)
    analysis_sections = Column(Text, nullable=False)  # JSON array stored as text
    overall_verdict = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def set_sections(self, sections: list):
        """Store analysis sections as JSON."""
        self.analysis_sections = json.dumps(sections, ensure_ascii=False)

    def get_sections(self) -> list:
        """Retrieve analysis sections from JSON."""
        try:
            return json.loads(self.analysis_sections) if self.analysis_sections else []
        except (json.JSONDecodeError, TypeError):
            return []

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary."""
        return {
            'barcode': self.barcode,
            'analysis_sections': self.get_sections(),
            'overall_verdict': self.overall_verdict
        }


class ProductIngredients(Base):
    """Model for storing product ingredients information.
    
    Attributes:
        barcode: Product barcode (unique identifier)
        ingredients_text: Raw ingredients text
        nutrients_data: JSON object containing nutritional information
        created_at: Timestamp of creation
        updated_at: Timestamp of last update
    """
    __tablename__ = "product_ingredients"

    barcode = Column(String(50), primary_key=True, unique=True, index=True)
    ingredients_text = Column(Text, nullable=False)
    nutrients_data = Column(Text, nullable=True)  # JSON object stored as text
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def set_nutrients(self, nutrients: Dict[str, Any]):
        """Store nutrients as JSON."""
        self.nutrients_data = json.dumps(nutrients, ensure_ascii=False)

    def get_nutrients(self) -> Dict[str, Any]:
        """Retrieve nutrients from JSON."""
        try:
            return json.loads(self.nutrients_data) if self.nutrients_data else {}
        except (json.JSONDecodeError, TypeError):
            return {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary."""
        return {
            'id': self.barcode,
            'ingredients_text': self.ingredients_text,
            'nutriments': self.get_nutrients()
        }
