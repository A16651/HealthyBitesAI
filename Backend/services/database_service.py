"""Database service for caching product data.

This module provides services to store and retrieve cached product information
from MySQL database to avoid redundant API calls.
"""

import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from Backend.models.database_models import Product, ProductAnalysis, ProductIngredients

logger = logging.getLogger(__name__)


class ProductDatabaseService:
    """Service for managing cached product data in database."""

    @staticmethod
    def get_product(db: Session, barcode: str) -> Optional[Dict[str, Any]]:
        """Retrieve product information from database.
        
        Args:
            db: Database session
            barcode: Product barcode
            
        Returns:
            Product data as dictionary or None if not found
        """
        try:
            product = db.query(Product).filter(Product.barcode == barcode).first()
            if product:
                logger.info(f"Found product in cache: {barcode}")
                return product.to_dict()
            return None
        except SQLAlchemyError as e:
            logger.error(f"Database error retrieving product {barcode}: {e}")
            return None

    @staticmethod
    def store_product(db: Session, barcode: str, product_name: str, brand: Optional[str] = None, image_url: Optional[str] = None) -> bool:
        """Store product information in database.
        
        Args:
            db: Database session
            barcode: Product barcode
            product_name: Name of the product
            brand: Brand name (optional)
            image_url: Product image URL (optional)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Check if product already exists
            existing = db.query(Product).filter(Product.barcode == barcode).first()
            
            if existing:
                # Update existing product
                existing.product_name = product_name
                if brand:
                    existing.brand = brand
                if image_url:
                    existing.image_url = image_url
                logger.info(f"Updated product in cache: {barcode}")
            else:
                # Create new product
                product = Product(
                    barcode=barcode,
                    product_name=product_name,
                    brand=brand,
                    image_url=image_url
                )
                db.add(product)
                logger.info(f"Stored new product in cache: {barcode}")
            
            db.commit()
            return True
        except SQLAlchemyError as e:
            logger.error(f"Database error storing product {barcode}: {e}")
            db.rollback()
            return False

    @staticmethod
    def get_product_analysis(db: Session, barcode: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached analysis for a product.
        
        Args:
            db: Database session
            barcode: Product barcode
            
        Returns:
            Analysis data as dictionary or None if not found
        """
        try:
            analysis = db.query(ProductAnalysis).filter(ProductAnalysis.barcode == barcode).first()
            if analysis:
                logger.info(f"Found analysis in cache: {barcode}")
                return analysis.to_dict()
            return None
        except SQLAlchemyError as e:
            logger.error(f"Database error retrieving analysis for {barcode}: {e}")
            return None

    @staticmethod
    def store_product_analysis(db: Session, barcode: str, analysis_sections: List[str], overall_verdict: Optional[str] = None) -> bool:
        """Store analysis results in database.
        
        Args:
            db: Database session
            barcode: Product barcode
            analysis_sections: List of analysis section texts
            overall_verdict: Overall health rating/verdict (optional)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Check if analysis already exists
            existing = db.query(ProductAnalysis).filter(ProductAnalysis.barcode == barcode).first()
            
            if existing:
                # Update existing analysis
                existing.set_sections(analysis_sections)
                if overall_verdict:
                    existing.overall_verdict = overall_verdict
                logger.info(f"Updated analysis in cache: {barcode}")
            else:
                # Create new analysis
                analysis = ProductAnalysis(barcode=barcode)
                analysis.set_sections(analysis_sections)
                if overall_verdict:
                    analysis.overall_verdict = overall_verdict
                db.add(analysis)
                logger.info(f"Stored new analysis in cache: {barcode}")
            
            db.commit()
            return True
        except SQLAlchemyError as e:
            logger.error(f"Database error storing analysis for {barcode}: {e}")
            db.rollback()
            return False

    @staticmethod
    def get_product_ingredients(db: Session, barcode: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached ingredients for a product.
        
        Args:
            db: Database session
            barcode: Product barcode
            
        Returns:
            Ingredients data as dictionary or None if not found
        """
        try:
            ingredients = db.query(ProductIngredients).filter(ProductIngredients.barcode == barcode).first()
            if ingredients:
                logger.info(f"Found ingredients in cache: {barcode}")
                return ingredients.to_dict()
            return None
        except SQLAlchemyError as e:
            logger.error(f"Database error retrieving ingredients for {barcode}: {e}")
            return None

    @staticmethod
    def store_product_ingredients(db: Session, barcode: str, ingredients_text: str, nutrients_data: Optional[Dict[str, Any]] = None) -> bool:
        """Store ingredients information in database.
        
        Args:
            db: Database session
            barcode: Product barcode
            ingredients_text: Raw ingredients text
            nutrients_data: Nutritional information as dictionary (optional)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Check if ingredients record already exists
            existing = db.query(ProductIngredients).filter(ProductIngredients.barcode == barcode).first()
            
            if existing:
                # Update existing record
                existing.ingredients_text = ingredients_text
                if nutrients_data:
                    existing.set_nutrients(nutrients_data)
                logger.info(f"Updated ingredients in cache: {barcode}")
            else:
                # Create new record
                ingredients = ProductIngredients(barcode=barcode, ingredients_text=ingredients_text)
                if nutrients_data:
                    ingredients.set_nutrients(nutrients_data)
                db.add(ingredients)
                logger.info(f"Stored new ingredients in cache: {barcode}")
            
            db.commit()
            return True
        except SQLAlchemyError as e:
            logger.error(f"Database error storing ingredients for {barcode}: {e}")
            db.rollback()
            return False

    @staticmethod
    def cache_complete_product(db: Session, barcode: str, product_data: Dict[str, Any], analysis_sections: Optional[List[str]] = None) -> bool:
        """Store complete product data in database (convenience method).
        
        Args:
            db: Database session
            barcode: Product barcode
            product_data: Complete product data from API
            analysis_sections: Optional analysis sections to cache
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Store product info
            ProductDatabaseService.store_product(
                db,
                barcode,
                product_data.get('product_name', ''),
                product_data.get('brand'),
                product_data.get('image_url')
            )
            
            # Store ingredients if available
            if product_data.get('ingredients_text'):
                ProductDatabaseService.store_product_ingredients(
                    db,
                    barcode,
                    product_data['ingredients_text'],
                    product_data.get('nutriments')
                )
            
            # Store analysis if available
            if analysis_sections:
                ProductDatabaseService.store_product_analysis(
                    db,
                    barcode,
                    analysis_sections
                )
            
            logger.info(f"Cached complete product data: {barcode}")
            return True
        except Exception as e:
            logger.error(f"Error caching complete product {barcode}: {e}")
            return False
