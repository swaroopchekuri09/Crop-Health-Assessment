import os
import sys

sys.path.insert(0, os.getcwd())
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_crop_api():
    print("=== TESTING EXPANDED CROP API ===")

    # 1. Total crops
    all_crops = client.get('/api/crops').json()
    print('Total crops returned:', len(all_crops))
    assert len(all_crops) >= 60, f"Expected >= 60 crops, got {len(all_crops)}"

    # 2. Filter category=Vegetable
    veggies = client.get('/api/crops?category=Vegetable').json()
    print('Vegetables returned:', len(veggies))
    assert len(veggies) >= 20, f"Expected >= 20 vegetables, got {len(veggies)}"

    # 3. Filter ai_supported=true
    ai_true = client.get('/api/crops?ai_supported=true').json()
    print('AI supported crops returned:', len(ai_true))
    assert len(ai_true) == 14, f"Expected 14 AI crops, got {len(ai_true)}"

    # 4. Filter ai_supported=false
    ai_false = client.get('/api/crops?ai_supported=false').json()
    print('Non-AI supported crops returned:', len(ai_false))
    assert len(ai_false) >= 50, f"Expected >= 50 non-AI crops, got {len(ai_false)}"

    # 5. Search capsicum
    capsicum_search = client.get('/api/crops?search=capsicum').json()
    print('Search "capsicum" returned:', [c['name'] for c in capsicum_search])
    assert any('Bell Pepper' in c['name'] for c in capsicum_search)

    # 6. Search paddy
    paddy_search = client.get('/api/crops?search=paddy').json()
    print('Search "paddy" returned:', [c['name'] for c in paddy_search])
    assert any('Rice' in c['name'] for c in paddy_search)

    # 7. AI Health
    ai_health = client.get('/api/health/ai').json()
    print('AI Health supported_classes:', ai_health['supported_classes'])
    print('AI Health verified supported crops:', ai_health['supported_crops'])
    assert len(ai_health['supported_crops']) == 14

    print("\nALL EXPANDED CROP API TESTS PASSED WITH 100% SUCCESS!")

if __name__ == '__main__':
    test_crop_api()
