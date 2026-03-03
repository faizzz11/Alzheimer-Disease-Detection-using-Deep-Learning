"""
main.py — FastAPI Backend for Alzheimer's MRI Classification
────────────────────────────────────────────────────────────────
Endpoints:
  GET  /           → health check
  POST /predict    → accept image upload, run ResNet18 inference,
                     return prediction JSON

Run with:
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
────────────────────────────────────────────────────────────────
"""

import time
import torch
import torch.nn.functional as F

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

from model_loader import load_model, get_model, CLASS_NAMES
from preprocessing import (
    is_valid_image_format,
    looks_like_mri,
    preprocess_image,
    open_pil_image,
)


# ── Lifespan: load model once at startup ─────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the model when the server starts, clean up on shutdown."""
    print("[Startup] Loading Alzheimer's detection model ...")
    load_model()
    print("[Startup] Model ready. Server is live at http://localhost:8000")
    yield
    print("[Shutdown] Server shutting down.")


# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Alzheimer's MRI Classifier API",
    description="ResNet18 model trained on OASIS / Kaggle Alzheimer's dataset. "
                "Classifies brain MRI scans into 4 dementia stages.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS — allow the Next.js frontend (localhost:3000) to call this API ───────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",   # in case Next.js runs on alternate port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Response schemas ──────────────────────────────────────────────────────────
class ProbabilityMap(BaseModel):
    """Maps each class name to its softmax probability (0–1)."""
    non_demented: float
    very_mild_dementia: float
    mild_dementia: float
    moderate_dementia: float


class PredictionResponse(BaseModel):
    prediction: str          # e.g. "Mild Dementia"
    confidence: float        # e.g. 0.87
    probabilities: dict      # {class_name: probability}
    model_version: str
    inference_time_ms: float
    timestamp: str


class ErrorResponse(BaseModel):
    error: str


# ── Helper: build human-readable class key from raw class name ────────────────
def _class_key(name: str) -> str:
    """'Very mild Dementia' → 'Very Mild Dementia' (title-case normalisation)."""
    # Map raw training label → display label
    mapping = {
        "Mild Dementia":        "Mild Dementia",
        "Moderate Dementia":    "Moderate Dementia",
        "Non Demented":         "Non Demented",
        "Very mild Dementia":   "Very Mild Dementia",   # normalise capital M
    }
    return mapping.get(name, name)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "Alzheimer's MRI Classifier API is running.",
        "classes": [_class_key(c) for c in CLASS_NAMES],
    }


@app.post(
    "/predict",
    response_model=PredictionResponse,
    tags=["Prediction"],
    summary="Classify an MRI brain scan",
    description=(
        "Upload a JPG or PNG brain MRI image. "
        "Returns the predicted dementia stage, confidence score, "
        "and full probability distribution across all 4 classes."
    ),
)
async def predict(file: UploadFile = File(..., description="Brain MRI image (JPG/PNG/WEBP)")):
    """
    Accepts an uploaded image file, validates it, runs inference,
    and returns the classification result.
    """

    # ── 1. Format validation ──────────────────────────────────────────────────
    if not is_valid_image_format(file.filename or "", file.content_type or ""):
        raise HTTPException(
            status_code=400,
            detail={
                "error": (
                    "Wrong file format. Please upload a JPG, PNG, or WEBP image. "
                    "Other file types (PDF, DICOM, etc.) are not supported."
                )
            },
        )

    # ── 2. Read image bytes ───────────────────────────────────────────────────
    image_bytes = await file.read()

    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail={"error": "Uploaded file is empty. Please upload a valid image."},
        )

    if len(image_bytes) > 20 * 1024 * 1024:   # 20 MB hard cap
        raise HTTPException(
            status_code=413,
            detail={"error": "File is too large. Maximum allowed size is 20 MB."},
        )

    # ── 3. MRI heuristic validation ───────────────────────────────────────────
    try:
        pil_image = open_pil_image(image_bytes)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail={"error": "Could not read image. The file may be corrupted."},
        )

    if not looks_like_mri(pil_image):
        raise HTTPException(
            status_code=422,
            detail={
                "error": (
                    "Wrong image uploaded. Please upload an MRI brain image only. "
                    "The uploaded image does not appear to be a brain MRI scan."
                )
            },
        )

    # ── 4. Preprocess ─────────────────────────────────────────────────────────
    try:
        input_tensor = preprocess_image(image_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={"error": f"Image preprocessing failed: {exc}"},
        )

    # ── 5. Inference ──────────────────────────────────────────────────────────
    model, device = get_model()

    t0 = time.perf_counter()
    with torch.no_grad():
        input_tensor = input_tensor.to(device)
        logits = model(input_tensor)                     # shape: (1, 4)
        probabilities = F.softmax(logits, dim=1)         # shape: (1, 4)
    t1 = time.perf_counter()

    inference_ms = round((t1 - t0) * 1000, 2)

    # ── 6. Parse results ──────────────────────────────────────────────────────
    probs_np = probabilities[0].cpu().numpy()            # shape: (4,)
    pred_idx = int(probs_np.argmax())

    raw_label = CLASS_NAMES[pred_idx]
    display_label = _class_key(raw_label)
    confidence = float(probs_np[pred_idx])

    # Build the probability dictionary (display labels, 4 decimal places)
    prob_dict = {
        _class_key(CLASS_NAMES[i]): round(float(probs_np[i]), 4)
        for i in range(len(CLASS_NAMES))
    }

    from datetime import datetime, timezone
    timestamp = datetime.now(timezone.utc).isoformat()

    return PredictionResponse(
        prediction=display_label,
        confidence=round(confidence, 4),
        probabilities=prob_dict,
        model_version="v1.0.0-ResNet18",
        inference_time_ms=inference_ms,
        timestamp=timestamp,
    )
