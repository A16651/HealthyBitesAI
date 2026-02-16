"""Database connection and session management.

This module provides SQLAlchemy database connection setup and session factory
for MySQL database operations.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
import logging
from Backend.config import get_settings

logger = logging.getLogger(__name__)

# Base class for all ORM models
Base = declarative_base()

# Get settings
settings = get_settings()

# Database URL configuration
# Format: mysql+mysql-connector-python://user:password@host:port/database
DATABASE_URL = None

def get_database_url():
    """Construct MySQL database URL from settings."""
    global DATABASE_URL
    
    if DATABASE_URL:
        return DATABASE_URL
    
    # Build database URL from settings or environment
    db_user = getattr(settings, 'db_user', 'root')
    db_password = getattr(settings, 'db_password', '')
    db_host = getattr(settings, 'db_host', 'localhost')
    db_port = getattr(settings, 'db_port', 3306)
    db_name = getattr(settings, 'db_name', 'healthybites')
    
    if db_password:
        DATABASE_URL = (
            f"mysql+mysqlconnector://{db_user}:{db_password}"
            f"@{db_host}:{db_port}/{db_name}"
        )
    else:
        DATABASE_URL = (
            f"mysql+mysqlconnector://{db_user}"
            f"@{db_host}:{db_port}/{db_name}"
        )
    
    return DATABASE_URL

def get_engine():
    """Get SQLAlchemy engine for MySQL connection."""
    try:
        url = get_database_url()
        logger.info(f"Connecting to database: {url.split('@')[1] if '@' in url else 'unknown'}")
        
        engine = create_engine(
            url,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,  # Test connections before using them
            echo=False  # Set to True for SQL debugging
        )
        
        logger.info("Database engine created successfully")
        return engine
    except Exception as e:
        logger.error(f"Failed to create database engine: {e}")
        raise

# Create engine and session factory
engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Create all tables defined in models."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise

def get_db():
    """Dependency to get database session for FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
