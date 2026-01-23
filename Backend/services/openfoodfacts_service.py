"""Service for interacting with Open Food Facts API.

This module provides a service class for searching and retrieving product information
from the Open Food Facts database. It implements intelligent search strategies with
fallback mechanisms.

Typical usage example:
    service = OpenFoodFactsService()
    products = service.search_products("Amul Butter", limit=10)
    product_detail = service.get_product_details("885155001234")
"""

import requests
import logging
from typing import List, Optional, Set
from Backend.models.product_models import ProductBase, ProductDetail

logger = logging.getLogger(__name__)


class OpenFoodFactsService:
    """Service for Open Food Facts API interactions.
    
    This service provides methods to search for products and retrieve detailed
    product information from the Open Food Facts database. It implements a
    rule-based search strategy with fallback to longest-word matching.
    
    Attributes:
        base_search_url: Base URL for product search API.
        base_product_url: Base URL for product details API.
        timeout: Request timeout in seconds.
    """
    
    def __init__(
        self,
        base_search_url: str = "https://world.openfoodfacts.org/cgi/search.pl",
        base_product_url: str = "https://world.openfoodfacts.org/api/v0/product/",
        timeout: int = 10
    ):
        """Initializes the OpenFoodFactsService.
        
        Args:
            base_search_url: The base URL for the search API endpoint.
            base_product_url: The base URL for the product details API endpoint.
            timeout: Request timeout in seconds. Defaults to 10.
        """
        self.base_search_url = base_search_url
        self.base_product_url = base_product_url
        self.timeout = timeout
    
    def search_products(self, query: str, limit: int = 5) -> List[ProductBase]:
        """Searches for products using intelligent query matching.
        
        This method implements a two-stage search strategy:
        1. Exact query search - Returns immediately if results are found.
        2. Longest-word fallback - Splits query and searches top 3 longest words.
        
        Args:
            query: The search query (product name or keywords).
            limit: Maximum number of results to return. Defaults to 5.
            
        Returns:
            A list of ProductBase objects matching the search criteria.
            Returns empty list if no products are found.
            
        Example:
            >>> service = OpenFoodFactsService()
            >>> products = service.search_products("Amul Butter", limit=5)
            >>> print(f"Found {len(products)} products")
        """
        # Stage 1: Exact query search
        products = self._execute_search(query, page_size=limit)
        
        if products:
            logger.info(f"Exact search for '{query}' returned {len(products)} results")
            return products
        
        # Stage 2: Fallback to longest-word matching
        words = query.split()
        
        if len(words) > 1:
            logger.info(f"Exact search failed for '{query}', trying longest-word strategy")
            return self._fallback_longest_word_search(words, limit)
        
        logger.warning(f"No products found for single-word query: '{query}'")
        return []
    
    def _fallback_longest_word_search(
        self, 
        words: List[str], 
        limit: int
    ) -> List[ProductBase]:
        """Performs fallback search using longest words from query.
        
        Args:
            words: List of words from the original query.
            limit: Maximum number of results per word.
            
        Returns:
            Combined list of products from individual word searches, with duplicates removed.
        """
        # Sort by length descending and take top 3
        longest_words = sorted(words, key=len, reverse=True)[:3]
        
        fallback_results = []
        seen_ids: Set[str] = set()
        
        for word in longest_words:
            word_results = self._execute_search(word, page_size=limit)
            
            for product in word_results:
                if product.id not in seen_ids:
                    fallback_results.append(product)
                    seen_ids.add(product.id)
        
        logger.info(f"Fallback search using {longest_words} returned {len(fallback_results)} results")
        return fallback_results
    
    def _execute_search(self, search_term: str, page_size: int) -> List[ProductBase]:
        """Executes raw API search request.
        
        Args:
            search_term: The term to search for.
            page_size: Number of results to fetch.
            
        Returns:
            List of ProductBase objects from the API response.
            Returns empty list on error or no results.
        """
        params = {
            "search_terms": search_term,
            "search_simple": 1,
            "action": "process",
            "json": 1,
            "page_size": page_size
        }
        
        try:
            response = requests.get(
                self.base_search_url, 
                params=params, 
                timeout=self.timeout
            )
            response.raise_for_status()
            data = response.json()
            
            products = []
            for item in data.get('products', []):
                products.append(ProductBase(
                    product_name=item.get('product_name', 'Unknown Product'),
                    brand=item.get('brands', 'Unknown Brand'),
                    image_url=item.get('image_front_small_url', ''),
                    id=item.get('code')
                ))
            
            return products
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed for term '{search_term}': {e}")
            return []
        except (ValueError, KeyError) as e:
            logger.error(f"Failed to parse response for term '{search_term}': {e}")
            return []
    
    def get_product_details(self, barcode: str) -> Optional[ProductDetail]:
        """Retrieves detailed information for a specific product.
        
        Args:
            barcode: The product's barcode/code identifier.
            
        Returns:
            ProductDetail object if found, None otherwise.
            
        Example:
            >>> service = OpenFoodFactsService()
            >>> product = service.get_product_details("3017620422003")
            >>> if product:
            ...     print(f"Product: {product.product_name}")
        """
        url = f"{self.base_product_url}{barcode}.json"
        
        try:
            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            if data.get('status') == 1:
                product = data.get('product', {})
                return ProductDetail(
                    product_name=product.get('product_name', 'Unknown Product'),
                    brand=product.get('brands', 'Unknown Brand'),
                    image_url=product.get('image_front_url'),
                    id=barcode,
                    ingredients_text=product.get('ingredients_text'),
                    nutriments=product.get('nutriments')
                )
            
            logger.warning(f"Product not found for barcode: {barcode}")
            return None
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch product details for barcode '{barcode}': {e}")
            return None
        except (ValueError, KeyError) as e:
            logger.error(f"Failed to parse product details for barcode '{barcode}': {e}")
            return None
    
    def barcode_search(self, code: str) -> Optional[dict]:
        """Searches for a product by barcode and returns raw product data.
        
        Args:
            code: Product barcode (EAN/UPC).
            
        Returns:
            Dictionary containing product data if found, None otherwise.
            
        Note:
            This method returns the raw product dictionary from the API,
            unlike get_product_details which returns a ProductDetail object.
        """
        url = f"{self.base_product_url}{code}.json"
        
        try:
            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            if data.get("status") == 1:
                logger.info(f"Successfully found product for barcode: {code}")
                return data.get("product")
            
            logger.warning(f"Product not found for barcode: {code}")
            return None
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error while searching barcode '{code}': {e}")
            return None
        except ValueError as e:
            logger.error(f"Invalid JSON response for barcode '{code}': {e}")
            return None


# Global service instance for backward compatibility
_service_instance = OpenFoodFactsService()

def search_products(query: str, limit: int = 10) -> List[ProductBase]:
    """Legacy function wrapper for OpenFoodFactsService.search_products."""
    return _service_instance.search_products(query, limit)

def get_product_details(barcode: str) -> Optional[ProductDetail]:
    """Legacy function wrapper for OpenFoodFactsService.get_product_details."""
    return _service_instance.get_product_details(barcode)

def barcode_search(code: str) -> Optional[dict]:
    """Legacy function wrapper for OpenFoodFactsService.barcode_search."""
    return _service_instance.barcode_search(code)