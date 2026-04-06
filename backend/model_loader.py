"""
model_loader.py
────────────────────────────────────────────────────────────────
Responsible for:
  - Loading the best trained PyTorch model (ResNet18) from disk
  - Keeping it in memory as a singleton (loaded once at app startup)
  - Exposing the model and device globally to the rest of the app

The best_model.pth was trained as ResNet18 fine-tuned on 4 classes:
  0: Mild Dementia
  1: Moderate Dementia
  2: Non Demented
  3: Very Mild Dementia
────────────────────────────────────────────────────────────────
"""

import os
import torch
import torchvision.models as models
import torch.nn as nn

# ── Class label mapping (must match training order / deploy_config.json) ──────
# From deployment/deploy_config.json "class_names" array (index-ordered)
CLASS_NAMES = [
    "Mild Dementia",
    "Moderate Dementia",
    "Non Demented",
    "Very mild Dementia",   # lowercase 'm' — matches training dataset folder
]

NUM_CLASSES = len(CLASS_NAMES)

# ── Resolve model path ─────────────────────────────────────────────────────────
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(_THIS_DIR, "..", "models", "best_model.pth")

# ── Globals ───────────────────────────────────────────────────────────────────
_model: nn.Module | None = None
_device: torch.device | None = None


def build_resnet18(num_classes: int) -> nn.Module:
    """
    Reconstruct the ResNet18 architecture EXACTLY as in app.py (Streamlit):

      model.fc = nn.Sequential(nn.Dropout(0.3), nn.Linear(512, num_classes))

    ← Dropout is 0.3 (NOT 0.5).
    """
    model = models.resnet18(weights=None)
    in_features = model.fc.in_features          # 512 for ResNet-18
    model.fc = nn.Sequential(
        nn.Dropout(p=0.3),                      # must match training code
        nn.Linear(in_features, num_classes),
    )
    return model


def load_model() -> tuple[nn.Module, torch.device]:
    """
    Load the model from disk.  Called once at application startup.
    Returns (model, device).
    """
    global _model, _device

    if _model is not None:
        return _model, _device  # already loaded — return cached

    # ── Device selection ─────────────────────────────────────────────────────
    if torch.cuda.is_available():
        _device = torch.device("cuda")
    elif torch.backends.mps.is_available():
        _device = torch.device("mps")     # Apple Silicon GPU
    else:
        _device = torch.device("cpu")

    print(f"[ModelLoader] Using device: {_device}")

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"[ModelLoader] Model file not found at: {MODEL_PATH}\n"
            f"Make sure best_model.pth is inside the /models folder."
        )

    # ── Build architecture ───────────────────────────────────────────────────
    model = build_resnet18(NUM_CLASSES)

    # ── Load weights ─────────────────────────────────────────────────────────
    # Streamlit's load_model_cached() uses: checkpoint["model_state_dict"]
    # The deployment checkpoint is always saved as a dict with that key.
    checkpoint = torch.load(MODEL_PATH, map_location=_device, weights_only=False)

    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state = checkpoint["model_state_dict"]
    elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        state = checkpoint["state_dict"]
    else:
        state = checkpoint   # raw state dict fallback

    model.load_state_dict(state)
    model.to(_device)
    model.eval()   # ← critical — disable BatchNorm / Dropout

    _model = model
    print(f"[ModelLoader] Model loaded successfully from: {MODEL_PATH}")
    return _model, _device


def get_model() -> tuple[nn.Module, torch.device]:
    """
    Returns the cached (model, device) pair.
    Raises RuntimeError if load_model() was never called.
    """
    if _model is None or _device is None:
        raise RuntimeError("Model not loaded. Call load_model() first.")
    return _model, _device
