from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Use the same database configuration as the server
# In Docker Compose, we connect to the mysql service using the service name as hostname
DB_HOST = os.environ.get('DB_HOST', 'mysql')
DB_USER = os.environ.get('DB_USER', 'agricultural_user')
DB_PASS = os.environ.get('DB_PASS', 'agricultural_pass')
DB_NAME = os.environ.get('DB_NAME', 'senior')
DB_PORT = os.environ.get('DB_PORT', '3306')

DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Add connection pool and other settings for better performance
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
