import os
import torch

# Current directory (models/weights)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Directly point to your folder
model_path = os.path.join(BASE_DIR, "mask_rcnn_refuge2.pth")

# Output file
output_path = os.path.join(BASE_DIR, "rcnn_detector_clean.pth")

print("📂 Looking for model at:", model_path)

try:
    model = torch.jit.load(model_path)
    print("✅ Loaded as TorchScript")
except Exception as e:
    print("⚠️ TorchScript failed:", e)
    print("Trying torch.load...")
    model = torch.load(model_path, map_location="cpu")
    print("✅ Loaded as standard PyTorch model")

torch.save(model, output_path)

print(f"✅ Converted and saved to: {output_path}")