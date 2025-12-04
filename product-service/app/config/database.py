from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL from environment
# Default connection string for dedicated Product Service database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://product_user:product_pass@postgres-product:5432/product_database"
)

#SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=True  # Set to False in production
)

#SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    """
    Dependency function to get database session.
    Use in FastAPI routes with Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#connection function
def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as conn:
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False