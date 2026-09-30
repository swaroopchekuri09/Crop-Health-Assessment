from pymongo.collection import Collection
from database.connection import get_db


def get_users_collection() -> Collection:
    return get_db()["users"]


def get_crops_collection() -> Collection:
    return get_db()["crops"]


def get_diseases_collection() -> Collection:
    return get_db()["diseases"]


def get_recommendations_collection() -> Collection:
    return get_db()["recommendations"]


def get_assessments_collection() -> Collection:
    return get_db()["assessments"]


def get_expert_reviews_collection() -> Collection:
    return get_db()["expert_reviews"]
