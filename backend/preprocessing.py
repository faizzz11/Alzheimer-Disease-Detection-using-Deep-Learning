"""
preprocessing.py
────────────────────────────────────────────────────────────────
Image preprocessing pipeline — must match EXACTLY what was used
during training (see notebook 03_data_preprocessing.ipynb):

  - Resize to 224×224
  - Convert to RGB
  - ToTensor  (scales to [0,1])
  - Normalize with ImageNet mean/std
    mean = [0.485, 0.456, 0.406]
    std  = [0.229, 0.224, 0.225]

Also contains validation helpers:
  - is_valid_image_format()   → format check (MIME / extension)
  - looks_like_mri()          → lightweight heuristic (grayscale-ish, correct dims)
────────────────────────────────────────────────────────────────
"""

import io
import numpy as np
from PIL import Image
import torch
from torchvision import transforms

# ── Training transform (MUST match deploy_config.json exactly) ───────────────
# deploy_config.json: "img_size": 128  ← NOT 224!
# Streamlit predict() uses: T.Resize((img_size, img_size)) where img_size=128
PREPROCESS = transforms.Compose([
    transforms.Resize((128, 128)),       # ← 128x128 to match Streamlit
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

# Accepted MIME types
ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def is_valid_image_format(filename: str, content_type: str) -> bool:
    """
    Returns True if filename extension AND MIME type are allowed.
    """
    import os
    ext = os.path.splitext(filename.lower())[1]
    return ext in ALLOWED_EXTENSIONS and content_type.lower() in ALLOWED_MIME_TYPES


def looks_like_mri(image: Image.Image) -> bool:
    """
    Lightweight heuristic to reject obviously non-MRI images.

    MRI brain scans have certain visual properties:
      - Predominantly dark background (high proportion of very dark pixels)
      - Low colour saturation (near-grayscale)
      - Reasonable image dimensions (not tiny thumbnails)

    This is intentionally lenient — it is meant to catch clear mistakes
    (e.g. uploading a photo of a cat or a selfie), NOT to replace clinical review.
    Returns True if the image plausibly looks like a medical scan.
    """
    width, height = image.size

    # ── 1. Minimum size check ─────────────────────────────────────────────────
    if width < 64 or height < 64:
        return False

    # ── 2. Colour saturation check ────────────────────────────────────────────
    # MRI images are essentially grayscale; even if stored as RGB the R, G, B
    # channels are nearly identical → low per-pixel channel variance.
    rgb = image.convert("RGB")
    arr = np.array(rgb, dtype=np.float32)  # shape: (H, W, 3)

    # Standard deviation across colour channels per pixel
    channel_std = arr.std(axis=2)          # shape: (H, W)
    mean_colour_variance = channel_std.mean()

    # Natural photos have high colour variance; grayscale MRI images have low variance.
    # Threshold tuned empirically — values above ~30 suggest a colourful natural image.
    if mean_colour_variance > 35:
        return False

    # ── 3. Dark-background check ──────────────────────────────────────────────
    # MRI scans have a large black background; ≥20 % of pixels should be dark.
    gray = np.array(image.convert("L"), dtype=np.float32)
    dark_fraction = (gray < 30).mean()

    if dark_fraction < 0.10:
        # Less than 10 % dark pixels — not typical for a brain MRI scan
        return False

    return True


def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """
    Decode raw image bytes, convert to RGB, apply the training transform,
    and return a batched tensor of shape (1, 3, 224, 224).

    Raises:
        ValueError  – if the image cannot be decoded
    """
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise ValueError(f"Cannot decode image: {exc}") from exc

    tensor = PREPROCESS(image)          # shape: (3, 224, 224)
    return tensor.unsqueeze(0)          # shape: (1, 3, 224, 224)


def open_pil_image(image_bytes: bytes) -> Image.Image:
    """Open and return a PIL image (for MRI heuristic check)."""
    return Image.open(io.BytesIO(image_bytes))
