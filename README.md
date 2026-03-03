<div align="center">

# 🧠 Alzheimer's Disease Detection System
### Data-Driven Framework for Early Detection of Alzheimer's Disease Using MRI Brain Images

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.x-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://streamlit.io)

**A complete end-to-end deep learning project** — from raw MRI data to a production-grade full-stack web application — classifying brain MRI scans into 4 Alzheimer's dementia stages with **96.8% test accuracy**.

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Live Demo Architecture](#-live-demo-architecture)
- [Dataset](#-dataset)
- [Model Performance](#-model-performance)
- [Project Structure](#-project-structure)
- [Notebooks Walkthrough](#-notebooks-walkthrough)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
  - [Option A — Streamlit App](#option-a--streamlit-app-classic)
  - [Option B — Next.js + FastAPI Full Stack](#option-b--nextjs--fastapi-full-stack-new)
- [API Reference](#-api-reference)
- [Frontend Pages](#-frontend-pages)
- [How It Works](#-how-it-works)
- [Class Imbalance Strategy](#-class-imbalance-strategy)
- [Model Architecture](#-model-architecture)
- [Results & Evaluation](#-results--evaluation)
- [Common Errors & Fixes](#-common-errors--fixes)

---

## 🔬 Project Overview

Alzheimer's Disease (AD) is the most common cause of dementia, affecting over **55 million people globally** (WHO, 2023). Early detection through neuroimaging enables timely clinical intervention. This project builds a **production-ready AI system** that classifies 2D axial MRI brain scans into 4 stages:

| Stage | Clinical Meaning |
|-------|-----------------|
| 🟢 **Non Demented** | Healthy — no signs of cognitive decline |
| 🟡 **Very Mild Dementia** | Earliest detectable stage — subtle memory lapses |
| 🟠 **Mild Dementia** | Noticeable cognitive decline — daily life affected |
| 🔴 **Moderate Dementia** | Significant impairment — requires clinical intervention |

> ⚠️ **Disclaimer:** This system is a research and educational tool. It is **NOT** a clinical diagnostic device. Always consult a qualified neurologist or radiologist.

---

## 🏗️ Live Demo Architecture

```
                    ┌──────────────────────────────┐
                    │   User's Browser              │
                    │   Next.js Frontend             │
                    │   localhost:3000               │
                    └─────────────┬────────────────-┘
                                  │  POST /predict
                                  │  (multipart/form-data)
                    ┌─────────────▼────────────────-┐
                    │   FastAPI Backend              │
                    │   localhost:8000               │
                    │                               │
                    │  1. Format validation          │
                    │  2. MRI heuristic check        │
                    │  3. Resize → 128×128           │
                    │  4. ImageNet normalise          │
                    │  5. ResNet-18 inference        │
                    │  6. Softmax → probabilities    │
                    └─────────────┬────────────────-┘
                                  │  JSON response
                    ┌─────────────▼────────────────-┐
                    │   deployment/best_model.pth   │
                    │   ResNet-18 Fine-tuned         │
                    │   Val Acc: 96.28%              │
                    │   Test Acc: 96.82%             │
                    └──────────────────────────────-┘
```

---

## 📂 Dataset

| Property | Detail |
|----------|--------|
| **Source** | [OASIS MRI Dataset](https://sites.wustl.edu/oasisbrains/) |
| **Total images** | ~20,960 annotated MRI slices |
| **Image type** | 2D axial T1-weighted MRI brain slices |
| **Format** | JPG (stored in class-named folders) |

### Class Distribution (highly imbalanced)

| Class | Training Samples | % of Data | Weight Applied |
|-------|-----------------|-----------|----------------|
| Non Demented | ~6,400 | ~46.6% | 1.05× |
| Very Mild Dementia | ~5,002 | ~36.4% | 0.38× |
| Mild Dementia | ~2,500 | ~18.2% | 1.05× |
| Moderate Dementia | ~450 | ~0.5% | **10.73×** |

> **Key challenge:** Moderate Dementia is heavily underrepresented (100:1 ratio vs. Non Demented). Handled via weighted sampling + weighted loss.

### Train / Val / Test Split

| Split | Size | Ratio |
|-------|------|-------|
| Train | 14,672 | 70% |
| Validation | 3,144 | 15% |
| Test | 3,144 | 15% |

*Stratified split ensures all classes are proportionally represented in every set.*

---

## 📊 Model Performance

### Final Model — ResNet-18 Fine-tuned

| Metric | Score |
|--------|-------|
| **Test Accuracy** | **96.82%** |
| **Macro F1-Score** | **96.35%** |
| **Weighted F1** | 96.83% |
| **Macro Precision** | 94.76% |
| **Macro Recall** | 98.07% |
| **Validation Accuracy** | 96.28% |
| **Test Set Size** | 3,144 images |

### Per-Class Metrics

| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| Mild Dementia | 94.47% | 95.47% | 94.97% | 751 |
| Moderate Dementia | 93.59% | **100.00%** | 96.69% | 73 |
| Non Demented | 92.58% | **100.00%** | 96.15% | 262 |
| Very Mild Dementia | 98.42% | 96.79% | 97.60% | 2,058 |

> The model achieves **100% recall on Moderate Dementia** (the most critical class clinically — missing a severe case is unacceptable).

### Model Comparison

| Model | Val Accuracy | Notes |
|-------|-------------|-------|
| Baseline Custom CNN | ~65-70% | 3-block Conv, trained from scratch |
| EfficientNet-B0 | ~88% | Good accuracy/FLOPS ratio |
| VGG-16 | ~90% | Large, slower inference |
| **ResNet-18 (Best)** | **96.28%** | ✅ Selected — best balance of accuracy, speed, size |

---

## 📁 Project Structure

```
Alzeimher Projecttt done/
│
├── 📓 NOTEBOOKS — ML Research Pipeline
│   ├── 01_project_overview.ipynb          # Problem statement, dataset overview
│   ├── 02_data_exploration.ipynb          # EDA, visualizations, statistics
│   ├── 03_data_preprocessing.ipynb        # Transforms, splits, DataLoaders
│   ├── 04_model_training_baseline.ipynb   # Custom CNN from scratch
│   ├── 05_model_training_transfer_learning.ipynb  # ResNet18, EfficientNet, VGG16
│   ├── 06_model_evaluation.ipynb          # Confusion matrix, classification report
│   ├── 07_model_saving_and_loading.ipynb  # Inference pipeline, JSON export
│   └── 08_web_app_integration.ipynb       # Streamlit integration guide
│
├── 📊 DATA
│   └── Data/
│       ├── Mild Dementia/                 # ~5,002 MRI slices
│       ├── Moderate Dementia/             # ~448 MRI slices
│       ├── Non Demented/                  # ~6,400 MRI slices
│       └── Very mild Dementia/            # ~8,960 MRI slices
│
├── 🤖 MODELS
│   ├── models/
│   │   ├── baseline_cnn.pth               # Custom CNN checkpoint
│   │   ├── resnet18.pth                   # ResNet-18 checkpoint
│   │   ├── efficientnet_b0.pth            # EfficientNet-B0 checkpoint
│   │   ├── vgg16.pth                      # VGG-16 checkpoint
│   │   ├── best_model.pth                 # Best model (evaluation reference)
│   │   └── evaluation_results.json        # Test set metrics (JSON)
│   └── deployment/
│       ├── best_model.pth                 # ✅ Production model (used by both apps)
│       └── deploy_config.json             # img_size, class names, normalization params
│
├── 📦 PROCESSED DATA
│   └── processed/
│       ├── train_files.csv                # 14,672 training paths + labels
│       ├── val_files.csv                  # 3,144 validation paths + labels
│       ├── test_files.csv                 # 3,144 test paths + labels
│       └── preprocessing_config.json      # Full preprocessing config with class weights
│
├── 🌐 STREAMLIT APP (Classic)
│   └── app.py                             # Full Streamlit web app
│
├── ⚡ FASTAPI BACKEND (New)
│   └── backend/
│       ├── main.py                        # FastAPI app, /predict endpoint, CORS
│       ├── model_loader.py                # Singleton model loader (ResNet-18)
│       ├── preprocessing.py               # Image transforms + MRI validation heuristic
│       └── requirements.txt               # Backend Python dependencies
│
├── 🖥️ NEXT.JS FRONTEND (New)
│   └── alzheimer-frontend/
│       ├── app/
│       │   ├── page.tsx                   # Landing page (hero, features, demo)
│       │   ├── upload/page.tsx            # MRI upload + real-time analysis
│       │   ├── results/page.tsx           # Results, confidence ring, probability bars
│       │   ├── layout.tsx                 # Root layout with metadata
│       │   └── globals.css                # Design system (Medical Blue theme)
│       ├── components/
│       │   ├── Navbar.tsx                 # Fixed top navigation
│       │   └── Footer.tsx                 # Site footer
│       ├── lib/
│       │   ├── api.ts                     # Real FastAPI client (POST /predict)
│       │   └── mockData.ts                # Legacy mock data (preserved, unused)
│       ├── public/                        # Static assets
│       ├── .env.local                     # NEXT_PUBLIC_API_URL config
│       └── package.json
│
├── 📈 VISUALIZATIONS (Auto-generated)
│   ├── class_distribution.png             # Bar chart of class counts
│   ├── class_imbalance_analysis.png       # Imbalance visualization
│   ├── augmentation_examples.png          # Data augmentation samples
│   ├── sample_images_grid.png             # 4×4 MRI grid per class
│   ├── pixel_intensity_distributions.png  # Per-class intensity histograms
│   ├── mean_images_per_class.png          # Average pixel appearance per class
│   ├── baseline_cnn_training_curves.png   # Loss/accuracy curves for baseline
│   ├── model_comparison_bar.png           # Model comparison bar chart
│   ├── model_comparison_curves.png        # Training curves comparison
│   ├── confusion_matrix.png               # Test set confusion matrix
│   ├── per_class_metrics.png              # Precision/Recall/F1 per class
│   ├── confidence_distribution.png        # Confidence score distribution
│   └── sample_predictions.png             # Sample correct/incorrect predictions
│
└── 📄 DOCUMENTATION
    ├── README.md                           # This file
    ├── PROJECT_IMPLEMENTATION_PLAN.md      # Detailed project plan & research paper prompt
    └── requirements.txt                    # Root Python dependencies (Streamlit stack)
```

---

## 📓 Notebooks Walkthrough

### `01_project_overview.ipynb` — Problem Setup
- Defines the 4-class Alzheimer's classification problem
- Loads and counts images per class using `os.listdir()`
- Generates class distribution bar chart
- Highlights the extreme class imbalance challenge (100:1 ratio)
- Outlines the full 8-notebook pipeline

### `02_data_exploration.ipynb` — Exploratory Data Analysis
- Renders a 4×4 grid of sample MRI images from each class
- Plots image dimension distribution (all images are same size)
- Computes **per-class pixel intensity distributions** (MRI scans show characteristic dark backgrounds)
- Calculates dataset statistics: mean dimensions, disk size, count per class
- Visualizes the mean image per class (shows visible structural differences between stages)

### `03_data_preprocessing.ipynb` — Data Pipeline
Implements the complete preprocessing pipeline:

```python
# Training transforms (augmentation)
transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Validation/Test transforms (no augmentation)
transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])
```

- Saves train/val/test file splits to `processed/*.csv`
- Saves full config to `processed/preprocessing_config.json`
- Implements `WeightedRandomSampler` to oversample minority classes

### `04_model_training_baseline.ipynb` — Custom CNN
Trains a 3-block CNN from scratch as the baseline reference:

```
Input (3×128×128)
→ Conv2d(3→32) → BatchNorm → ReLU → MaxPool2d
→ Conv2d(32→64) → BatchNorm → ReLU → MaxPool2d
→ Conv2d(64→128) → BatchNorm → ReLU → MaxPool2d
→ AdaptiveAvgPool2d(1) → Flatten
→ Linear(128→64) → ReLU → Dropout(0.5)
→ Linear(64→4)
```

- Adam optimizer, lr=1e-3, weight decay=1e-4
- CrossEntropyLoss with class weights
- ReduceLROnPlateau scheduler, early stopping (patience=7)
- Saves best checkpoint to `models/baseline_cnn.pth`
- Generates training curve plots

### `05_model_training_transfer_learning.ipynb` — Transfer Learning
Fine-tunes 3 pretrained ImageNet models in a **two-stage strategy**:

**Stage 1 — Head Only (15 epochs):**
Freeze all convolutional layers → train only the new classification head

**Stage 2 — Fine-tuning (10 epochs):**
Unfreeze last 2 blocks → train end-to-end at a smaller learning rate

| Model | Parameters | VRAM | Architecture Change |
|-------|-----------|------|---------------------|
| ResNet-18 | 11.7M | ~2GB | `fc = Sequential(Dropout(0.3), Linear(512, 4))` |
| EfficientNet-B0 | 5.3M | ~1.5GB | `classifier = Sequential(Dropout(0.3), Linear(1280, 4))` |
| VGG-16 | 138M | ~4GB | `classifier[6] = Sequential(Dropout(0.3), Linear(4096, 4))` |

- Saves all model checkpoints to `models/`
- Generates comparison bar charts and training curves
- Selects best model → saves to `models/best_model.pth` and `deployment/best_model.pth`

### `06_model_evaluation.ipynb` — Rigorous Testing
- Loads best model, runs inference on the full **3,144-image test set**
- Generates confusion matrix heatmap (seaborn)
- Outputs full scikit-learn classification report
- Saves metrics to `models/evaluation_results.json`
- Visualizes correct vs. incorrect predictions with original MRI images
- Plots confidence score distributions per class

### `07_model_saving_and_loading.ipynb` — Deployment Pipeline
- Saves model checkpoint as `{"model_state_dict": ..., "epoch": ..., "val_acc": ...}`
- Exports `deployment/deploy_config.json` with all inference parameters
- Implements and tests a clean `predict_single_image()` function
- Verifies predictions are identical before and after save/load cycle
- Tests on one image from each of the 4 classes

### `08_web_app_integration.ipynb` — Integration Guide
- Documents the Streamlit deployment architecture
- Explains the preprocessing → inference → display pipeline
- Provides launch instructions and cloud deployment notes

---

## 🛠️ Tech Stack

### Machine Learning
| Library | Version | Purpose |
|---------|---------|---------|
| Python | 3.10+ | Base language |
| PyTorch | 2.x | Deep learning framework |
| torchvision | matching | Model architectures + transforms |
| scikit-learn | latest | Metrics, stratified splits |
| Pillow | latest | Image I/O |
| NumPy | latest | Numerical operations |
| Matplotlib / Seaborn | latest | Visualization |
| tqdm | latest | Progress bars |

### Backend (FastAPI)
| Library | Version | Purpose |
|---------|---------|---------|
| FastAPI | ≥0.115 | REST API framework |
| uvicorn | ≥0.32 | ASGI server |
| python-multipart | ≥0.0.18 | File upload support |
| Pydantic | ≥2.0 | Request/response validation |

### Frontend (Next.js)
| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 15 | React framework |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| Lucide React | latest | Icon library |
| jsPDF | latest | Professional PDF report generation |
| Framer Motion | 12 | Animations |

### Classic App (Streamlit)
| Library | Purpose |
|---------|---------|
| Streamlit | Web UI framework |
| Matplotlib | Probability bar charts |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Python 3.10+
python3 --version

# Node.js 18+
node --version
```

---

### Option A — Streamlit App (Classic)

The original Streamlit web app. Simpler setup, runs as a single Python process.

```bash
# 1. Navigate to project root
cd "Alzeimher Projecttt done"

# 2. Create virtual environment
python3 -m venv .venv
source .venv/bin/activate          # macOS/Linux
# .venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run
streamlit run app.py
```

Open [http://localhost:8501](http://localhost:8501) in your browser.

---

### Option B — Next.js + FastAPI Full Stack (New)

The modern full-stack version with a premium Next.js frontend and FastAPI backend.

#### Terminal 1 — FastAPI Backend

```bash
cd "[main project directory]/backend"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Start server (auto-reloads on file changes)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
[Startup] Loading Alzheimer's detection model ...
[ModelLoader] Using device: mps          # or cuda / cpu
[ModelLoader] Model loaded successfully from: .../deployment/best_model.pth
[Startup] Model ready. Server is live at http://localhost:8000
INFO:     Application startup complete.
```

#### Terminal 2 — Next.js Frontend

```bash
cd "[main project directory]/alzheimer-frontend"

# Install Node dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference

### `GET /`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Alzheimer's MRI Classifier API is running.",
  "classes": ["Mild Dementia", "Moderate Dementia", "Non Demented", "Very Mild Dementia"]
}
```

---

### `POST /predict`
Submit an MRI brain scan for classification.

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | Brain MRI image (JPG, PNG, or WEBP) |

**Success Response (200):**
```json
{
  "prediction": "Mild Dementia",
  "confidence": 0.8712,
  "probabilities": {
    "Mild Dementia": 0.8712,
    "Non Demented": 0.0521,
    "Very Mild Dementia": 0.0623,
    "Moderate Dementia": 0.0144
  },
  "model_version": "v1.0.0-ResNet18",
  "inference_time_ms": 84.3,
  "timestamp": "2026-03-03T17:00:00.000Z"
}
```

**Error Responses:**

| HTTP Code | Trigger | Error Message |
|-----------|---------|---------------|
| `400` | Wrong file format | "Wrong file format. Please upload a JPG, PNG, or WEBP image." |
| `400` | Empty/corrupt file | "Could not read image. The file may be corrupted." |
| `413` | File > 20 MB | "File is too large. Maximum allowed size is 20 MB." |
| `422` | Non-MRI image | "Wrong image uploaded. Please upload an MRI brain image only." |

**Interactive API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🖥️ Frontend Pages

### Landing Page (`/`)
- Hero section with animated statistics (96.8% accuracy, 4 classes, <100ms inference)
- Feature cards: AI-powered analysis, instant results, privacy-first
- Clinical stages explainer with severity indicators
- How it works — 3-step process
- Call-to-action linking to upload page

### Upload Page (`/upload`)
- Drag-and-drop upload zone
- Client-side validation (format, file size)
- Real-time progress bar during server-side inference
- Clear error messages for invalid uploads (including non-MRI images)
- Navigates automatically to results on success

### Results Page (`/results`)
- SVG confidence ring with animated fill
- Predicted stage displayed with color-coded severity badge
- Animated probability distribution bars for all 4 classes
- Uploaded MRI scan preview
- Real inference time display
- **Export PDF Report** button — generates a professional medical-style PDF using `jsPDF` (no buttons appear in the PDF, clean A4 layout with header, scan image, probabilities, and medical disclaimer)
- "Analyze Another Scan" button

---

## ⚙️ How It Works

### Preprocessing Pipeline (identical in both Streamlit and FastAPI)

```python
transforms.Compose([
    transforms.Resize((128, 128)),    # Resize to training resolution
    transforms.ToTensor(),            # [0,255] → [0,1], HWC → CHW
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],  # ImageNet mean
        std =[0.229, 0.224, 0.225]   # ImageNet std
    )
])
```

### MRI Validation Heuristic (FastAPI only)
Before running the model, the backend performs a lightweight non-MRI rejection check:
1. **Colour saturation check** — MRI images are near-grayscale; high colour variance rejects natural photos
2. **Dark background check** — MRI scans have large black backgrounds; ≥10% dark pixels required
3. **Minimum dimension check** — Image must be at least 64×64 pixels

### Inference
```python
with torch.no_grad():
    logits = model(input_tensor)              # (1, 4)
    probs  = F.softmax(logits, dim=1)[0]      # (4,)
    pred   = probs.argmax().item()            # index of predicted class
```

---

## ⚖️ Class Imbalance Strategy

The dataset has a severe imbalance (Moderate Dementia ≈ 0.5% of data). Three techniques were combined:

1. **Weighted Random Sampling** (`WeightedRandomSampler`)
   - Each mini-batch is constructed by oversampling rare classes
   - Moderate Dementia receives **10.73×** more sampling weight than average

2. **Weighted Cross-Entropy Loss**
   - Loss function penalizes errors on minority classes more heavily
   - `class_weights = [1.05, 10.73, 3.00, 0.38]` for classes `[Mild, Moderate, Non, Very Mild]`

3. **Data Augmentation** (training only)
   - Horizontal flips, rotations, affine transforms, color jitter create diverse training examples
   - More effective than simple duplication since it generates structurally unique inputs

**Result:** The model achieves **100% recall on Moderate Dementia** despite having only ~450 training examples for that class.

---

## 🏛️ Model Architecture

### ResNet-18 (Fine-tuned) — Production Model

```
ResNet-18 Backbone (pretrained on ImageNet 1K)
├── Conv2d(3, 64) → BatchNorm → ReLU → MaxPool
├── Layer 1: 2× BasicBlock(64→64)
├── Layer 2: 2× BasicBlock(64→128, stride=2)
├── Layer 3: 2× BasicBlock(128→256, stride=2)
├── Layer 4: 2× BasicBlock(256→512, stride=2)
└── AdaptiveAvgPool2d(1×1) → Flatten(512)

Classification Head (custom, trained from scratch)
└── Sequential(
        Dropout(p=0.3),
        Linear(512 → 4)
    )
```

- **Input:** 128×128 RGB image, ImageNet-normalized
- **Output:** 4 logits → softmax probabilities
- **Parameters:** ~11.7M total, ~513K trainable (head only in Stage 1)
- **Checkpoint format:** `{"model_state_dict": ..., "epoch": N, "val_acc": X}`

---

## 📉 Results & Evaluation

### Confusion Matrix (Test Set — 3,144 images)

```
                  Predicted
                  Mild   Mod   Non   VMild
Actual  Mild   [  717     1     1    32  ]   ← 4.4% missed (very mild confusion)
        Mod    [    0    73     0     0  ]   ← 100% recall ✅
        Non    [    0     0   262     0  ]   ← 100% recall ✅
        VMild  [   42     4    20  1992  ]   ← 96.8% correct
```

### Key Observations
- **Moderate Dementia** — Perfect recall (0 missed cases). Critical for clinical safety.
- **Non Demented** — Perfect recall (no false negatives on healthy brains).
- **Mild ↔ Very Mild confusion** — 32 Mild cases classified as Very Mild (the most clinically similar stages). This is expected given the subtle visual difference.
- **Very Mild** — 42 cases misclassified as Mild (slightly more severe staging). Conservative error.

---

## 🔧 Common Errors & Fixes

### Backend Errors

**`FileNotFoundError: Model file not found`**
```bash
# Ensure deployment/best_model.pth exists
ls "Alzeimher Projecttt done/deployment/best_model.pth"
```

**`RuntimeError: Error(s) in loading state_dict`**
The FC layer architecture must match exactly:
```python
model.fc = nn.Sequential(nn.Dropout(0.3), nn.Linear(512, 4))
#                                   ^^^
#                               NOT 0.5 — must match training code
```

**`ERROR: [Errno 48] Address already in use`**
```bash
lsof -ti:8000 | xargs kill -9
uvicorn main:app --port 8000 --reload
```

**`torch==X.Y.Z not found`**
Use `>=` version pins instead of exact pins — PyTorch releases vary by platform:
```
torch>=2.6.0
torchvision>=0.21.0
```

### Frontend Errors

**"Cannot connect to the analysis server"**
- Backend is not running → start it with `uvicorn main:app --port 8000 --reload`
- Wrong port → update `NEXT_PUBLIC_API_URL` in `alzheimer-frontend/.env.local`

**"Wrong image uploaded. Please upload an MRI brain image only"**
- The image failed the MRI heuristic check (too colourful or lacks dark background)
- Ensure you are uploading a real grayscale MRI brain scan

**Different predictions between Streamlit and Next.js**
Both apps must use:
- Same model file: `deployment/best_model.pth` ✅
- Same image size: `128×128` ✅
- Same Dropout: `nn.Dropout(0.3)` ✅
- Same checkpoint key: `checkpoint["model_state_dict"]` ✅

---

## 📄 License

This project is developed as a **Final Year Undergraduate Research Project**.

Dataset: [OASIS MRI Dataset](https://www.oasis-brains.org/) — publicly available for research purposes.

---

## 👤 Author

**Final Year Project**
*Data-Driven Framework for Early Detection of Alzheimer's Disease Using MRI Brain Images*

Built with PyTorch · FastAPI · Next.js · Streamlit

---

<div align="center">

*"Early detection saves lives. AI makes early detection scalable."*

</div>
