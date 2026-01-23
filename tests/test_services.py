"""Tests for service modules.

This module contains unit tests for backend services.
"""

import pytest
from unittest.mock import Mock, patch
from Backend.services.openfoodfacts_service import OpenFoodFactsService
from Backend.services.watson_ai_service import WatsonAIService
from Backend.services.watson_ocr_service import WatsonOCRService


class TestOpenFoodFactsService:
    """Test suite for OpenFoodFactsService."""
    
    def test_service_initialization(self):
        """Test service initializes with default values."""
        service = OpenFoodFactsService()
        assert service.base_search_url == "https://world.openfoodfacts.org/cgi/search.pl"
        assert service.base_product_url == "https://world.openfoodfacts.org/api/v0/product/"
        assert service.timeout == 10
    
    def test_service_custom_initialization(self):
        """Test service initializes with custom values."""
        service = OpenFoodFactsService(
            base_search_url="https://custom.url",
            timeout=20
        )
        assert service.base_search_url == "https://custom.url"
        assert service.timeout == 20
    
    @patch('Backend.services.openfoodfacts_service.requests.get')
    def test_search_products_success(self, mock_get):
        """Test successful product search."""
        mock_response = Mock()
        mock_response.json.return_value = {
            "products": [
                {
                    "product_name": "Test Product",
                    "brands": "Test Brand",
                    "code": "123456",
                    "image_front_small_url": "http://example.com/image.jpg"
                }
            ]
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        service = OpenFoodFactsService()
        results = service.search_products("test", limit=10)
        
        assert len(results) == 1
        assert results[0].product_name == "Test Product"
        assert results[0].brand == "Test Brand"
    
    @patch('Backend.services.openfoodfacts_service.requests.get')
    def test_search_products_api_error(self, mock_get):
        """Test product search handles API errors."""
        mock_get.side_effect = Exception("API Error")
        
        service = OpenFoodFactsService()
        results = service.search_products("test")
        
        assert results == []
    
    @patch('Backend.services.openfoodfacts_service.requests.get')
    def test_get_product_details_success(self, mock_get):
        """Test successful product detail retrieval."""
        mock_response = Mock()
        mock_response.json.return_value = {
            "status": 1,
            "product": {
                "product_name": "Test Product",
                "brands": "Test Brand",
                "ingredients_text": "Sugar, Water",
                "nutriments": {"energy": 100}
            }
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        service = OpenFoodFactsService()
        result = service.get_product_details("123456")
        
        assert result is not None
        assert result.product_name == "Test Product"
        assert result.ingredients_text == "Sugar, Water"
    
    @patch('Backend.services.openfoodfacts_service.requests.get')
    def test_get_product_details_not_found(self, mock_get):
        """Test product detail retrieval when product not found."""
        mock_response = Mock()
        mock_response.json.return_value = {"status": 0}
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        service = OpenFoodFactsService()
        result = service.get_product_details("000000")
        
        assert result is None


class TestWatsonAIService:
    """Test suite for WatsonAIService."""
    
    def test_service_initialization_unconfigured(self):
        """Test service initializes in unconfigured state."""
        service = WatsonAIService(api_key="", service_url="", project_id="")
        assert not service.is_configured
    
    def test_service_initialization_configured(self):
        """Test service initializes in configured state."""
        service = WatsonAIService(
            api_key="test_key",
            service_url="https://test.ibm.com",
            project_id="test_id"
        )
        assert service.is_configured
        assert service.api_key == "test_key"
    
    def test_analyze_ingredients_mock_mode(self):
        """Test ingredient analysis in mock mode."""
        service = WatsonAIService(api_key="", service_url="", project_id="")
        result = service.analyze_ingredients("Sugar, Salt", "Test Product")
        
        assert isinstance(result, str)
        assert "Mock" in result or "Error" in result or "VERDICT" in result
    
    def test_get_mock_analysis(self):
        """Test mock analysis generation."""
        service = WatsonAIService()
        result = service._get_mock_analysis("Sugar, Water")
        
        assert isinstance(result, str)
        assert "OVERALL VERDICT" in result
        assert "Mock Mode" in result


class TestWatsonOCRService:
    """Test suite for WatsonOCRService."""
    
    def test_service_initialization_unconfigured(self):
        """Test service initializes in unconfigured state."""
        service = WatsonOCRService(
            api_key="",
            service_url="",
            environment_id="",
            collection_id=""
        )
        assert not service.is_configured
    
    def test_service_initialization_configured(self):
        """Test service initializes with configured credentials."""
        service = WatsonOCRService(
            api_key="test_key",
            service_url="https://test.ibm.com",
            environment_id="test_env",
            collection_id="test_col"
        )
        assert service.is_configured
    
    def test_extract_text_mock_mode(self):
        """Test OCR text extraction in mock mode."""
        service = WatsonOCRService(api_key="", service_url="", environment_id="", collection_id="")
        result = service.extract_text_from_image(b"fake_image_data", "test.jpg")
        
        assert isinstance(result, str)
        assert "Mock" in result or "not configured" in result
    
    def test_mock_ocr_process(self):
        """Test legacy mock OCR method."""
        service = WatsonOCRService()
        result = service.mock_ocr_process()
        
        assert isinstance(result, str)
        assert len(result) > 0


class TestServiceBackwardCompatibility:
    """Test suite for backward compatibility of legacy function wrappers."""
    
    def test_openfoodfacts_legacy_functions(self):
        """Test that legacy module-level functions still work."""
        from Backend.services.openfoodfacts_service import search_products, get_product_details
        
        # These should not raise errors
        assert callable(search_products)
        assert callable(get_product_details)
    
    def test_watson_ai_legacy_function(self):
        """Test that legacy Watson AI function still works."""
        from Backend.services.watson_ai_service import analyze_ingredients_with_watson
        
        assert callable(analyze_ingredients_with_watson)
        result = analyze_ingredients_with_watson("Sugar", "Test")
        assert isinstance(result, str)
    
    def test_watson_ocr_legacy_functions(self):
        """Test that legacy Watson OCR functions still work."""
        from Backend.services.watson_ocr_service import mock_ocr_process, extract_text_from_image
        
        assert callable(mock_ocr_process)
        assert callable(extract_text_from_image)
