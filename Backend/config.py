"""Application configuration settings.

This module provides configuration management using Pydantic Settings.
Settings are loaded from environment variables or a .env file.

Typical usage example:
    from Backend.config import get_settings
    settings = get_settings()
    print(settings.app_name)
"""

import os
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables.
    
    This class uses Pydantic Settings to load and validate configuration
    from environment variables or a .env file. Settings are cached using
    lru_cache for performance.
    
    Attributes:
        app_name: The application name.
        api_v1_str: The API version prefix.
        ibm_api_key: IBM Cloud API key for Watson services.
        ibm_service_url: IBM Watson service URL.
        project_id: IBM Watson project ID.
        watson_discovery_api_key: Watson Discovery API key for OCR.
        watson_discovery_url: Watson Discovery service URL.
        discovery_environment_id: Discovery environment ID.
        discovery_collection_id: Discovery collection ID.
        host: Server host address.
        port: Server port number.
        log_level: Logging level (debug, info, warning, error).
        db_user: MySQL database user.
        db_password: MySQL database password.
        db_host: MySQL database host.
        db_port: MySQL database port.
        db_name: MySQL database name.
        use_database_cache: Whether to use database caching for products.
    """
    
    # Application Settings
    app_name: str = "Label Padhega India Backend"
    api_v1_str: str = "/api/v1"
    
    # IBM Watson AI Credentials
    ibm_api_key: str = ""
    ibm_service_url: str = ""
    project_id: str = ""
    
    # Watson Discovery / OCR Credentials
    watson_discovery_api_key: str = ""
    watson_discovery_url: str = ""
    discovery_environment_id: str = ""
    discovery_collection_id: str = ""
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "info"
    
    # MySQL Database Configuration
    db_user: str = "root"
    db_password: str = "Intentinal#Bad_Practice_36"
    db_host: str = "localhost"
    db_port: int = 3306
    db_name: str = "healthybites"
    use_database_cache: bool = True
    
    class Config:
        """Pydantic configuration for Settings class.
        
        Attributes:
            env_file: Path to .env file for loading environment variables.
            case_sensitive: Whether environment variable names are case-sensitive.
            extra: How to handle extra fields in .env (ignore, forbid, allow).
        """
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Allow extra fields in .env without raising errors


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings.
    
    This function returns a cached instance of Settings to avoid
    re-reading environment variables on every call.
    
    Returns:
        Settings object containing all application configuration.
        
    Example:
        >>> settings = get_settings()
        >>> print(settings.app_name)
        'Label Padhega India Backend'
    """
    return Settings()
