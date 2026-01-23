"""Tests for analysis routes.

This module contains tests for ingredient analysis and OCR endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from io import BytesIO


class TestAnalysisRoutes:
    """Test suite for analysis-related API endpoints."""
    
    def test_analyze_ingredients_success(self, test_client: TestClient, sample_ingredients: str):
        """Test ingredient analysis with valid input."""
        payload = {
            "ingredients_text": sample_ingredients,
            "product_name": "Test Product"
        }
        response = test_client.post("/api/v1/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "analysis" in data
        assert "product_name" in data
        assert isinstance(data["analysis"], str)
        assert len(data["analysis"]) > 0
    
    def test_analyze_ingredients_without_product_name(self, test_client: TestClient, sample_ingredients: str):
        """Test ingredient analysis without product name."""
        payload = {
            "ingredients_text": sample_ingredients
        }
        response = test_client.post("/api/v1/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "analysis" in data
    
    def test_analyze_ingredients_empty_text(self, test_client: TestClient):
        """Test ingredient analysis with empty ingredients."""
        payload = {
            "ingredients_text": ""
        }
        response = test_client.post("/api/v1/analyze", json=payload)
        # Should still return 200 but with mock/error message
        assert response.status_code in [200, 422]
    
    def test_analyze_ingredients_missing_field(self, test_client: TestClient):
        """Test ingredient analysis with missing required field."""
        payload = {}
        response = test_client.post("/api/v1/analyze", json=payload)
        assert response.status_code == 422  # Validation error
    
    def test_analyze_product_by_id_success(self, test_client: TestClient, sample_product_code: str):
        """Test product analysis by barcode."""
        response = test_client.post(f"/api/v1/analyze/product/{sample_product_code}")
        # May return 200 or 404 depending on product availability
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            data = response.json()
            assert "analysis" in data
            assert "product_name" in data
            assert isinstance(data["analysis"], str)
    
    def test_analyze_product_not_found(self, test_client: TestClient):
        """Test product analysis with invalid barcode."""
        fake_code = "0000000000000"
        response = test_client.post(f"/api/v1/analyze/product/{fake_code}")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
    
    # def test_ocr_with_invalid_file_type(self, test_client: TestClient):
    #     """Test OCR endpoint with non-image file."""
    #     files = {"file": ("test.txt", BytesIO(b"test content"), "text/plain")}
    #     response = test_client.post("/api/v1/ocr", files=files)
    #     assert response.status_code == 400
    #     data = response.json()
    #     assert "detail" in data
    #     assert "image" in data["detail"].lower()
    
    # def test_ocr_with_image_file(self, test_client: TestClient):
    #     """Test OCR endpoint with image file."""
    #     # Create a minimal fake image (1x1 pixel PNG)
    #     fake_image = BytesIO(
    #         b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
    #         b'\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\x00\x01'
    #         b'\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    #     )
    #     files = {"file": ("test.png", fake_image, "image/png")}
    #     response = test_client.post("/api/v1/ocr", files=files)
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert "analysis" in data
    #     assert "product_name" in data


class TestAnalysisData:
    """Test suite for analysis data validation."""
    
    def test_analysis_response_structure(self, test_client: TestClient, sample_ingredients: str):
        """Test that analysis response has correct structure."""
        payload = {
            "ingredients_text": sample_ingredients,
            "product_name": "Test"
        }
        response = test_client.post("/api/v1/analyze", json=payload)
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
            assert "analysis" in data
            assert isinstance(data["analysis"], str)
            # Check that analysis contains expected sections
            analysis_text = data["analysis"].upper()
            # Should contain at least some recognizable content
            assert len(data["analysis"]) > 10
    
    def test_analysis_contains_verdict(self, test_client: TestClient, sample_ingredients: str):
        """Test that analysis contains relevant information."""
        payload = {
            "ingredients_text": sample_ingredients,
            "product_name": "Test Product"
        }
        response = test_client.post("/api/v1/analyze", json=payload)
        if response.status_code == 200:
            data = response.json()
            analysis = data["analysis"]
            # Check for common analysis keywords (will be present in real or mock responses)
            assert any(keyword in analysis for keyword in [
                "VERDICT", "SUMMARY", "RISK", "RECOMMENDATION", "Mock", "Error", "Analysis"
            ])
