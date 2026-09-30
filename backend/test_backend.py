import os
import sys

sys.path.insert(0, os.getcwd())

import io
from PIL import Image, ImageDraw
import numpy as np
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def create_test_leaf_image(color=(34, 139, 34)) -> bytes:
    """Create a realistic synthetic leaf image with veins for testing."""
    img = Image.new("RGB", (256, 256), color=(240, 240, 235))
    draw = ImageDraw.Draw(img)
    # Draw leaf shape
    draw.polygon([(128, 20), (220, 128), (170, 230), (128, 245), (86, 230), (36, 128)], fill=color)
    # Draw main vein
    draw.line([(128, 20), (128, 245)], fill=(20, 100, 20), width=3)
    # Draw side veins
    for y in range(50, 220, 30):
        draw.line([(128, y), (170, y - 15)], fill=(25, 110, 25), width=2)
        draw.line([(128, y), (86, y - 15)], fill=(25, 110, 25), width=2)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()


def create_blank_unsuitable_image() -> bytes:
    """Create an unsuitable monochrome non-crop image with sufficient size (>4KB)."""
    gray = np.random.randint(80, 160, (300, 300), dtype=np.uint8)
    arr = np.stack([gray, gray, gray], axis=-1)
    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    return buf.getvalue()


def run_tests():
    print("=== STARTING BACKEND SUITE VERIFICATION ===")

    # 1. Health checks
    print("\n1. Testing Health Endpoints...")
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("   [OK] /api/health ->", r.json())

    r_db = client.get("/api/health/database")
    assert r_db.status_code == 200 and r_db.json()["connected"] is True
    print("   [OK] /api/health/database -> connected: True")

    r_ai = client.get("/api/health/ai")
    assert r_ai.status_code == 200 and r_ai.json()["model_loaded"] is True
    print("   [OK] /api/health/ai -> model_loaded: True, classes:", r_ai.json()["supported_classes"])

    # 2. Crops endpoints
    print("\n2. Testing Crop Catalog...")
    r_crops = client.get("/api/crops")
    assert r_crops.status_code == 200
    crops = r_crops.json()
    assert len(crops) >= 14, f"Expected at least 14 crops, got {len(crops)}"
    print(f"   [OK] /api/crops returned {len(crops)} crops")

    sample_crop = crops[0]
    crop_id = sample_crop["id"]
    r_detail = client.get(f"/api/crops/{crop_id}")
    assert r_detail.status_code == 200
    detail = r_detail.json()
    assert "supported_diseases" in detail and len(detail["supported_diseases"]) > 0
    print(f"   [OK] Crop detail for '{detail['name']}' has {len(detail['supported_diseases'])} conditions")

    # 3. Authentication
    print("\n3. Testing Authentication...")
    import uuid
    test_email = f"farmer_{uuid.uuid4().hex[:6]}@example.com"
    test_password = "SecurePassword123"

    # Register
    r_reg = client.post("/api/auth/register", json={
        "name": "Kiran Kumar",
        "email": test_email,
        "password": test_password
    })
    assert r_reg.status_code == 201, f"Register failed: {r_reg.text}"
    token_data = r_reg.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    user_id = token_data["user"]["id"]
    print("   [OK] Registration succeeded for", test_email)

    # Duplicate registration should return 409
    r_dup = client.post("/api/auth/register", json={
        "name": "Duplicate",
        "email": test_email,
        "password": test_password
    })
    assert r_dup.status_code == 409
    print("   [OK] Duplicate registration correctly rejected with 409 Conflict")

    # Login valid
    r_login = client.post("/api/auth/login", json={
        "email": test_email,
        "password": test_password
    })
    assert r_login.status_code == 200
    print("   [OK] Login succeeded")

    # Login invalid
    r_bad_login = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "WrongPassword"
    })
    assert r_bad_login.status_code == 401
    print("   [OK] Invalid login rejected with 401 Unauthorized")

    # Current user /me
    auth_headers = {"Authorization": f"Bearer {token}"}
    r_me = client.get("/api/auth/me", headers=auth_headers)
    assert r_me.status_code == 200 and r_me.json()["email"] == test_email
    print("   [OK] /api/auth/me verified identity:", r_me.json()["name"])

    # 4. Assessment with Real AI Inference
    print("\n4. Testing Real AI Assessment Inference...")
    leaf_bytes = create_test_leaf_image()

    # Find Tomato crop id
    tomato_crop = next((c for c in crops if c["name"] == "Tomato"), crops[0])

    r_assess = client.post(
        "/api/assessments",
        headers=auth_headers,
        data={
            "crop_id": tomato_crop["id"],
            "image_source": "mobile"
        },
        files={
            "file": ("tomato_test_leaf.jpg", leaf_bytes, "image/jpeg")
        }
    )
    assert r_assess.status_code == 201, f"Assessment creation failed: {r_assess.text}"
    assessment = r_assess.json()
    assert assessment["id"] is not None
    assert assessment["status"] in ("healthy", "disease_detected", "low_confidence")
    print(f"   [OK] Assessment created successfully! ID: {assessment['id']}")
    print(f"        Detected Condition: {assessment['predicted_condition']}")
    print(f"        Confidence: {assessment['confidence']} ({assessment['confidence_level']})")
    print(f"        Status: {assessment['status']}")

    if assessment.get("recommendation"):
        print(f"        Recommendation: {len(assessment['recommendation']['management'])} management steps, {len(assessment['recommendation']['prevention'])} prevention steps")

    assessment_id = assessment["id"]

    # 5. Assessment Details & History
    print("\n5. Testing Assessment Retrieval & History...")
    r_get = client.get(f"/api/assessments/{assessment_id}", headers=auth_headers)
    assert r_get.status_code == 200 and r_get.json()["id"] == assessment_id
    print("   [OK] /api/assessments/{id} retrieved record")

    r_list = client.get("/api/assessments", headers=auth_headers)
    assert r_list.status_code == 200 and r_list.json()["total"] >= 1
    print(f"   [OK] /api/assessments listed {r_list.json()['total']} assessments")

    r_stats = client.get("/api/assessments/stats", headers=auth_headers)
    assert r_stats.status_code == 200 and r_stats.json()["total_assessments"] >= 1
    print("   [OK] /api/assessments/stats returned:", r_stats.json()["total_assessments"], "total assessments")

    # 6. Unsuitable image test
    print("\n6. Testing Unsuitable Image Handling...")
    blank_bytes = create_blank_unsuitable_image()
    r_unsuitable = client.post(
        "/api/assessments",
        headers=auth_headers,
        data={
            "crop_id": tomato_crop["id"],
            "image_source": "manual"
        },
        files={
            "file": ("blank_gray.jpg", blank_bytes, "image/jpeg")
        }
    )
    assert r_unsuitable.status_code == 201
    unsuitable_res = r_unsuitable.json()
    assert unsuitable_res["status"] == "invalid_image"
    print("   [OK] Unsuitable blank image correctly classified as:", unsuitable_res["status"])
    print("        Message:", unsuitable_res.get("message"))

    print("\n=== ALL BACKEND TESTS PASSED WITH 100% SUCCESS! ===")


if __name__ == "__main__":
    run_tests()
