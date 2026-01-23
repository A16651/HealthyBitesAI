"""Test configuration and fixtures.

This module provides pytest fixtures and configuration for all tests.
"""

import pytest
import sys
import os
from typing import Generator

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def test_client() -> Generator[TestClient, None, None]:
    """Provide a test client for the FastAPI application.
    
    Yields:
        TestClient instance for making test requests.
    """
    with TestClient(app) as client:
        yield client


@pytest.fixture
def sample_product_code() -> str:
    """Provide a sample product barcode for testing.
    
    Returns:
        A known product barcode from Open Food Facts.
    """
    return "3017620422003"  # Nutella


@pytest.fixture
def sample_search_query() -> str:
    """Provide a sample search query for testing.
    
    Returns:
        A common product search query.
    """
    return "Nutella"


@pytest.fixture
def sample_ingredients() -> str:
    """Provide sample ingredients text for testing.
    
    Returns:
        A sample ingredient list.
    """
    return "Sugar, Palm Oil, Hazelnuts, Cocoa, Skimmed Milk Powder, Whey Powder, Lecithin, Vanillin"


@pytest.fixture
def mock_env_vars(monkeypatch):
    """Mock environment variables for testing.
    
    Args:
        monkeypatch: Pytest monkeypatch fixture.
    """
    monkeypatch.setenv("IBM_API_KEY", "test_api_key")
    monkeypatch.setenv("IBM_SERVICE_URL", "https://test.ibm.com")
    monkeypatch.setenv("PROJECT_ID", "test_project_id")
