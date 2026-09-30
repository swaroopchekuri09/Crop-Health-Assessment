import os
from typing import Optional
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.database import Database
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "crop_health_db")

_client: Optional[MongoClient] = None
_db: Optional[Database] = None


def get_mongo_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    return _client


def get_db() -> Database:
    global _db
    if _db is None:
        client = get_mongo_client()
        _db = client[MONGODB_DATABASE]
    return _db


def init_db_indexes():
    """Create essential MongoDB indexes idempotently."""
    db = get_db()
    
    # Users index
    db["users"].create_index([("email", ASCENDING)], unique=True)
    
    # Crops index
    db["crops"].create_index([("name", ASCENDING)], unique=True)
    db["crops"].create_index([("supported_by_ai", ASCENDING)])
    
    # Diseases index
    db["diseases"].create_index([("model_class", ASCENDING)], unique=True)
    db["diseases"].create_index([("crop_id", ASCENDING)])
    
    # Recommendations index
    db["recommendations"].create_index([("disease_id", ASCENDING)], unique=True)
    
    # Assessments index
    db["assessments"].create_index([("user_id", ASCENDING)])
    db["assessments"].create_index([("created_at", DESCENDING)])
    db["assessments"].create_index([("status", ASCENDING)])
    db["assessments"].create_index([("crop_id", ASCENDING)])


def check_db_health() -> dict:
    """Check connectivity to MongoDB server."""
    try:
        client = get_mongo_client()
        client.admin.command('ping')
        return {
            "status": "ok",
            "database": MONGODB_DATABASE,
            "connected": True
        }
    except Exception as e:
        return {
            "status": "error",
            "database": MONGODB_DATABASE,
            "connected": False,
            "error": "MongoDB server is unavailable"
        }
