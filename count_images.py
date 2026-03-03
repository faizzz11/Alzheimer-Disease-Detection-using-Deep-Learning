import os
data_dir = "Data"
for cls in os.listdir(data_dir):
    path = os.path.join(data_dir, cls)
    if os.path.isdir(path):
        count = len([f for f in os.listdir(path) if os.path.isfile(os.path.join(path, f))])
        print(f"{cls}: {count} images")

try:
    import torch
    print(f"\nCUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")
except ImportError:
    print("\nPyTorch not installed yet")
