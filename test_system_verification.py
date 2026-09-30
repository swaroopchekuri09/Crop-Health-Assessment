import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_full_system():
    print("Testing Full System Integration...")
    
    # 1. Health check
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Backend health: OK")

    # 2. AI Health check
    res = requests.get(f"{BASE_URL}/health/ai")
    assert res.status_code == 200, f"AI Health check failed: {res.text}"
    ai_data = res.json()
    assert ai_data["model_loaded"] is True
    assert ai_data["supported_classes"] == 38
    assert len(ai_data["supported_crops"]) == 14
    print(f"[PASS] AI Health: Model loaded ({ai_data['supported_classes']} classes, {len(ai_data['supported_crops'])} crops)")

    # 3. Crops endpoint without params
    res = requests.get(f"{BASE_URL}/crops")
    assert res.status_code == 200
    all_crops = res.json()
    assert len(all_crops) == 68, f"Expected 68 crops, got {len(all_crops)}"
    ai_supported = [c for c in all_crops if c["ai_supported"]]
    assert len(ai_supported) == 14, f"Expected 14 AI-supported crops, got {len(ai_supported)}"
    print(f"[PASS] Crop Catalog: Total {len(all_crops)}, AI Supported {len(ai_supported)}")

    # 4. Search query
    res = requests.get(f"{BASE_URL}/crops", params={"search": "capsicum"})
    assert res.status_code == 200
    capsicum = res.json()
    assert len(capsicum) >= 1
    assert "Bell Pepper" in capsicum[0]["name"]
    print(f"[PASS] Crop Search 'capsicum' -> {capsicum[0]['name']}")

    # 5. Category filter
    res = requests.get(f"{BASE_URL}/crops", params={"category": "Vegetable"})
    assert res.status_code == 200
    vegetables = res.json()
    assert len(vegetables) == 24
    print(f"[PASS] Category filter 'Vegetable' -> {len(vegetables)} crops")

    # 6. Auth Login
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "farmer@agrihealth.org",
        "password": "FarmerPass2025!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] Auth Login: OK")

    # 7. Dashboard Stats with new counts
    stats_res = requests.get(f"{BASE_URL}/assessments/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "ai_supported_crops_count" in stats
    assert stats["ai_supported_crops_count"] == 14
    assert stats["total_crops_count"] == 68
    print(f"[PASS] Dashboard Stats: {stats}")

    print("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY (100%)")

if __name__ == "__main__":
    test_full_system()
