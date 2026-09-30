import os
import urllib.request

MODEL_URL = "https://huggingface.co/onnx-community/mobilenet_v2_1.0_224-plant-disease-identification-ONNX/resolve/main/onnx/model_quantized.onnx"
CONFIG_URL = "https://huggingface.co/onnx-community/mobilenet_v2_1.0_224-plant-disease-identification-ONNX/raw/main/config.json"


def download_plant_disease_model():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(base_dir, "model_assets")
    os.makedirs(assets_dir, exist_ok=True)

    model_dest = os.path.join(assets_dir, "model_quantized.onnx")
    config_dest = os.path.join(assets_dir, "config.json")

    print(f"Downloading PlantVillage ONNX Model to {model_dest}...")
    urllib.request.urlretrieve(MODEL_URL, model_dest)
    print(f"Downloaded model: {os.path.getsize(model_dest):,} bytes.")

    print(f"Downloading Model Config to {config_dest}...")
    urllib.request.urlretrieve(CONFIG_URL, config_dest)
    print("Download complete.")


if __name__ == "__main__":
    download_plant_disease_model()
