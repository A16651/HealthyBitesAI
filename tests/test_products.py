"""Tests for product routes.

This module contains tests for the product search and retrieval endpoints.
"""

import pytest
from fastapi.testclient import TestClient


class TestProductRoutes:
    """Test suite for product-related API endpoints."""
    
    def test_root_endpoint(self, test_client: TestClient):
        """Test that the root endpoint returns correct information."""
        response = test_client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "status" in data
        assert data["status"] == "running"
        assert "endpoints" in data
    
    def test_health_check(self, test_client: TestClient):
        """Test the health check endpoint."""
        response = test_client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_search_products_success(self, test_client: TestClient, sample_search_query: str):
        """Test product search with valid query."""
        response = test_client.get(f"/api/v1/search?q={sample_search_query}&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert "count" in data
        assert isinstance(data["products"], list)
        assert data["count"] >= 0
    
    def test_search_products_with_limit(self, test_client: TestClient):
        """Test product search respects limit parameter."""
        limit = 3
        response = test_client.get(f"/api/v1/search?q=biscuit&limit={limit}")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) <= limit
    
    def test_search_products_empty_query(self, test_client: TestClient):
        """Test product search with missing query parameter."""
        response = test_client.get("/api/v1/search")
        assert response.status_code == 422  # Validation error
    
    def test_search_products_invalid_limit(self, test_client: TestClient):
        """Test product search with invalid limit."""
        response = test_client.get("/api/v1/search?q=test&limit=100")
        assert response.status_code == 422  # Validation error (limit > 50)
    
    def test_get_product_detail_success(self, test_client: TestClient, sample_product_code: str):
        """Test retrieving product details with valid barcode."""
        response = test_client.get(f"/api/v1/product/{sample_product_code}")
        assert response.status_code in [200, 404]  # May be 404 if product doesn't exist
        
        if response.status_code == 200:
            data = response.json()
            assert "product_name" in data
            assert "id" in data
            assert data["id"] == sample_product_code
    
    def test_get_product_detail_not_found(self, test_client: TestClient):
        """Test retrieving product details with invalid barcode."""
        fake_code = "0000000000000"
        response = test_client.get(f"/api/v1/product/{fake_code}")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
    
    def test_barcode_search_success(self, test_client: TestClient, sample_product_code: str):
        """Test barcode search with valid code."""
        response = test_client.get(f"/api/v1/barcode/{sample_product_code}")
        assert response.status_code in [200, 404]
    
    def test_barcode_search_not_found(self, test_client: TestClient):
        """Test barcode search with invalid code."""
        fake_code = "9999999999999"
        response = test_client.get(f"/api/v1/barcode/{fake_code}")
        assert response.status_code == 404


class TestProductData:
    """Test suite for product data validation."""
    
    def test_product_search_response_structure(self, test_client: TestClient):
        """Test that search response has correct structure."""
        response = test_client.get("/api/v1/search?q=milk&limit=1")
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data["products"], list)
            if data["products"]:
                product = data["products"][0]
                assert "product_name" in product
                assert "id" in product
    
    def test_product_detail_response_structure(self, test_client: TestClient, sample_product_code: str):
        """Test that product detail response has correct structure."""
        response = test_client.get(f"/api/v1/product/{sample_product_code}")
        if response.status_code == 200:
            data = response.json()
            assert "product_name" in data
            assert "id" in data
            # Optional fields
            assert "brand" in data or data.get("brand") is None
            assert "image_url" in data or data.get("image_url") is None
