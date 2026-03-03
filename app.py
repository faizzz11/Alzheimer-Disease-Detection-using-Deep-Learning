"""
Alzheimer's Disease Detection - Web Application
================================================
A premium Streamlit web app for MRI brain scan classification.
Uses a ResNet18 model fine-tuned on the OASIS MRI Dataset.

Classes: Non Demented, Very Mild Dementia, Mild Dementia, Moderate Dementia

Run:  streamlit run app.py
"""

import streamlit as st
import torch
import torch.nn as nn
import torchvision.transforms as T
import torchvision.models as models
from PIL import Image
import json
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")
from pathlib import Path
from datetime import datetime
import io
import base64

# ============================================================
# Page Config
# ============================================================
st.set_page_config(
    page_title="Alzheimer's Disease Detection | AI-Powered MRI Analysis",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================
# Custom CSS — Premium Dark Theme
# ============================================================
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    /* Global */
    .stApp {
        font-family: 'Inter', sans-serif;
    }

    /* Hero Header */
    .hero-header {
        background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
        color: white;
        border-radius: 16px;
        padding: 2.5rem 2rem;
        margin-bottom: 2rem;
        text-align: center;
        box-shadow: 0 8px 32px rgba(48, 43, 99, 0.3);
        border: 1px solid rgba(255,255,255,0.08);
    }
    .hero-header h1 {
        font-size: 2.2rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
        background: linear-gradient(90deg, #a78bfa, #60a5fa, #34d399);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .hero-header p {
        font-size: 1rem;
        color: #a0aec0;
        margin: 0;
    }

    /* Result Cards */
    .result-card {
        padding: 2rem;
        border-radius: 16px;
        text-align: center;
        margin: 1rem 0;
        box-shadow: 0 4px 24px rgba(0,0,0,0.15);
        border: 1px solid rgba(255,255,255,0.08);
    }
    .result-healthy {
        background: linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%);
        color: white;
    }
    .result-warning {
        background: linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%);
        color: white;
    }
    .result-danger {
        background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%);
        color: white;
    }
    .result-card h2 {
        font-size: 1.8rem;
        font-weight: 700;
        margin: 0;
    }
    .result-card h3 {
        font-size: 1.2rem;
        font-weight: 400;
        margin: 0.5rem 0 0 0;
        opacity: 0.9;
    }

    /* Metric Cards */
    .metric-row {
        display: flex;
        gap: 1rem;
        margin: 1rem 0;
    }
    .metric-card {
        flex: 1;
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
        color: white;
        padding: 1.2rem;
        border-radius: 12px;
        text-align: center;
        border: 1px solid rgba(255,255,255,0.1);
    }
    .metric-card .metric-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #a78bfa;
    }
    .metric-card .metric-label {
        font-size: 0.8rem;
        color: #9ca3af;
        margin-top: 0.3rem;
    }

    /* Info Cards */
    .info-card {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        color: #e2e8f0;
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.08);
        margin-bottom: 1rem;
    }
    .info-card h4 {
        color: #a78bfa;
        margin: 0 0 0.5rem 0;
    }

    /* Sidebar styling */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
    }
    section[data-testid="stSidebar"] .stMarkdown {
        color: #e2e8f0;
    }

    /* Footer */
    .footer {
        text-align: center;
        padding: 2rem;
        color: #64748b;
        font-size: 0.85rem;
        border-top: 1px solid rgba(255,255,255,0.05);
        margin-top: 3rem;
    }
    .footer a {
        color: #a78bfa;
        text-decoration: none;
    }

    /* Upload area */
    .upload-zone {
        border: 2px dashed #4c1d95;
        border-radius: 16px;
        padding: 2rem;
        text-align: center;
        background: rgba(76, 29, 149, 0.05);
    }

    /* Probability table */
    .prob-table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
    }
    .prob-table th, .prob-table td {
        padding: 0.6rem 1rem;
        text-align: left;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .prob-table th {
        color: #a78bfa;
        font-weight: 600;
    }

    /* Hide default streamlit elements for cleaner UI */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
</style>
""", unsafe_allow_html=True)


# ============================================================
# Model Loading (cached)
# ============================================================
@st.cache_resource
def load_model_cached():
    """Load model and config (cached for performance)."""
    deploy_dir = Path("deployment")

    with open(deploy_dir / "deploy_config.json", "r") as f:
        config = json.load(f)

    # Load evaluation results if available
    eval_results = None
    eval_path = Path("models") / "evaluation_results.json"
    if eval_path.exists():
        with open(eval_path, "r") as f:
            eval_results = json.load(f)

    model_name = config["model_name"]
    num_classes = config["num_classes"]

    if model_name == "resnet18":
        model = models.resnet18(weights=None)
        model.fc = nn.Sequential(nn.Dropout(0.3), nn.Linear(512, num_classes))
    elif model_name == "efficientnet_b0":
        model = models.efficientnet_b0(weights=None)
        model.classifier = nn.Sequential(nn.Dropout(0.3), nn.Linear(1280, num_classes))
    elif model_name == "vgg16":
        model = models.vgg16(weights=None)
        model.classifier[6] = nn.Sequential(nn.Dropout(0.3), nn.Linear(4096, num_classes))
    elif model_name in ("BaselineCNN", "baseline_cnn"):
        class BaselineCNN(nn.Module):
            def __init__(self, nc=4):
                super().__init__()
                self.block1 = nn.Sequential(nn.Conv2d(3,32,3,padding=1), nn.BatchNorm2d(32), nn.ReLU(True), nn.MaxPool2d(2,2))
                self.block2 = nn.Sequential(nn.Conv2d(32,64,3,padding=1), nn.BatchNorm2d(64), nn.ReLU(True), nn.MaxPool2d(2,2))
                self.block3 = nn.Sequential(nn.Conv2d(64,128,3,padding=1), nn.BatchNorm2d(128), nn.ReLU(True), nn.MaxPool2d(2,2))
                self.pool = nn.AdaptiveAvgPool2d(1)
                self.classifier = nn.Sequential(nn.Flatten(), nn.Linear(128,64), nn.ReLU(True), nn.Dropout(0.5), nn.Linear(64,nc))
            def forward(self, x):
                x = self.block1(x); x = self.block2(x); x = self.block3(x); x = self.pool(x)
                return self.classifier(x)
        model = BaselineCNN(num_classes)

    checkpoint = torch.load(deploy_dir / "best_model.pth", map_location="cpu", weights_only=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    return model, config, eval_results


def predict(image, model, config):
    """Run prediction on a PIL image."""
    img_size = config["img_size"]
    mean = config["imagenet_mean"]
    std = config["imagenet_std"]
    class_names = config["class_names"]

    transform = T.Compose([
        T.Resize((img_size, img_size)),
        T.ToTensor(),
        T.Normalize(mean=mean, std=std)
    ])

    input_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.softmax(outputs, dim=1)[0]
        pred_idx = probs.argmax().item()

    return {
        "predicted_class": class_names[pred_idx],
        "predicted_index": pred_idx,
        "confidence": float(probs[pred_idx]),
        "probabilities": {class_names[i]: float(probs[i]) for i in range(len(class_names))},
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


def create_probability_chart(probs, predicted_class):
    """Create a premium horizontal bar chart for class probabilities."""
    fig, ax = plt.subplots(figsize=(8, 3.5))
    fig.patch.set_facecolor('#0f172a')
    ax.set_facecolor('#0f172a')

    classes = list(probs.keys())
    values = list(probs.values())

    # Color scheme
    colors = []
    for c in classes:
        if c == predicted_class:
            colors.append('#a78bfa')  # Purple for predicted
        elif c == "Non Demented":
            colors.append('#34d399')  # Green for healthy
        else:
            colors.append('#475569')  # Muted for others

    bars = ax.barh(classes, values, color=colors, height=0.6, edgecolor='none')

    # Add value labels
    for bar, val in zip(bars, values):
        ax.text(bar.get_width() + 0.02, bar.get_y() + bar.get_height()/2,
                f'{val:.1%}', va='center', fontweight='600', fontsize=11, color='white')

    ax.set_xlim(0, 1.15)
    ax.set_xlabel('Probability', color='#94a3b8', fontsize=10)
    ax.tick_params(colors='#94a3b8', labelsize=10)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_color('#334155')
    ax.spines['left'].set_color('#334155')
    ax.xaxis.label.set_color('#94a3b8')

    plt.tight_layout()
    return fig


def generate_report_html(result, patient_name, patient_id, image_b64):
    """Generate a downloadable HTML report."""
    pred = result["predicted_class"]
    conf = result["confidence"]
    timestamp = result["timestamp"]
    probs = result["probabilities"]

    # Severity color
    if pred == "Non Demented":
        severity_color = "#059669"
        severity_text = "NORMAL"
        severity_desc = "No signs of dementia detected. The brain scan appears healthy."
    elif pred == "Very mild Dementia":
        severity_color = "#d97706"
        severity_text = "VERY MILD"
        severity_desc = "Very mild signs of cognitive decline detected. Early intervention recommended."
    elif pred == "Mild Dementia":
        severity_color = "#ea580c"
        severity_text = "MILD"
        severity_desc = "Mild dementia indicators detected. Clinical follow-up strongly recommended."
    else:
        severity_color = "#dc2626"
        severity_text = "MODERATE"
        severity_desc = "Moderate dementia indicators detected. Immediate clinical evaluation required."

    # Probability rows
    prob_rows = ""
    for cls, prob in probs.items():
        bar_width = int(prob * 100)
        highlight = "font-weight:700;color:#a78bfa;" if cls == pred else ""
        prob_rows += f"""
        <tr>
            <td style="{highlight}">{cls}</td>
            <td>
                <div style="background:#1e293b;border-radius:4px;height:20px;width:100%;">
                    <div style="background:{'#a78bfa' if cls == pred else '#475569'};border-radius:4px;height:20px;width:{bar_width}%;"></div>
                </div>
            </td>
            <td style="text-align:right;{highlight}">{prob:.2%}</td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>MRI Analysis Report - {patient_name}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            * {{ margin:0; padding:0; box-sizing:border-box; }}
            body {{ font-family:'Inter',sans-serif; background:#0f172a; color:#e2e8f0; padding:2rem; }}
            .container {{ max-width:800px; margin:0 auto; }}
            .header {{ text-align:center; padding:2rem; border-bottom:2px solid #334155; margin-bottom:2rem; }}
            .header h1 {{ font-size:1.8rem; color:#a78bfa; margin-bottom:0.3rem; }}
            .header p {{ color:#94a3b8; font-size:0.9rem; }}
            .section {{ margin-bottom:2rem; }}
            .section-title {{ font-size:1.1rem; font-weight:700; color:#a78bfa; margin-bottom:1rem;
                             border-left:4px solid #a78bfa; padding-left:0.8rem; }}
            .info-grid {{ display:grid; grid-template-columns:1fr 1fr; gap:1rem; }}
            .info-item {{ background:#1e293b; padding:1rem; border-radius:8px; }}
            .info-item .label {{ font-size:0.75rem; color:#64748b; text-transform:uppercase; letter-spacing:1px; }}
            .info-item .value {{ font-size:1rem; font-weight:600; margin-top:0.3rem; }}
            .result-box {{ background:linear-gradient(135deg,{severity_color}22,{severity_color}11);
                          border:2px solid {severity_color}; border-radius:12px; padding:1.5rem; text-align:center; }}
            .result-box .badge {{ display:inline-block; background:{severity_color}; color:white;
                                 padding:0.3rem 1rem; border-radius:20px; font-weight:700; font-size:0.85rem;
                                 letter-spacing:1px; margin-bottom:0.5rem; }}
            .result-box h2 {{ font-size:1.5rem; margin:0.5rem 0; }}
            .result-box p {{ color:#94a3b8; font-size:0.9rem; }}
            table {{ width:100%; border-collapse:collapse; }}
            table td {{ padding:0.6rem 0.5rem; }}
            .scan-img {{ max-width:250px; border-radius:8px; border:2px solid #334155; }}
            .footer {{ text-align:center; padding-top:2rem; border-top:1px solid #334155;
                       color:#64748b; font-size:0.8rem; margin-top:2rem; }}
            .disclaimer {{ background:#1c1917; border:1px solid #78350f; border-radius:8px;
                          padding:1rem; font-size:0.8rem; color:#fbbf24; }}
            @media print {{
                body {{ background:white; color:#1e293b; }}
                .info-item {{ border:1px solid #e2e8f0; }}
                .result-box {{ border-color:{severity_color}; }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>&#129504; Alzheimer's Disease Detection Report</h1>
                <p>AI-Powered MRI Brain Scan Analysis</p>
            </div>

            <div class="section">
                <div class="section-title">Patient Information</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">Patient Name</div>
                        <div class="value">{patient_name if patient_name else 'Not Provided'}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Patient ID</div>
                        <div class="value">{patient_id if patient_id else 'Not Provided'}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Analysis Date</div>
                        <div class="value">{timestamp}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Model Used</div>
                        <div class="value">ResNet-18 (Fine-tuned)</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Analysis Result</div>
                <div class="result-box">
                    <span class="badge">{severity_text}</span>
                    <h2>{pred}</h2>
                    <p>Confidence: {conf:.1%}</p>
                    <p style="margin-top:0.8rem;font-size:0.85rem;">{severity_desc}</p>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Class Probabilities</div>
                <table>
                    {prob_rows}
                </table>
            </div>

            <div class="section">
                <div class="section-title">MRI Scan</div>
                <div style="text-align:center;">
                    <img src="data:image/png;base64,{image_b64}" class="scan-img" alt="MRI Scan">
                </div>
            </div>

            <div class="section">
                <div class="disclaimer">
                    &#9888;&#65039; <strong>Disclaimer:</strong> This report is generated by an AI model for
                    <strong>research and educational purposes only</strong>. It is NOT a clinical diagnosis.
                    Always consult a qualified medical professional for proper evaluation and treatment.
                    The model was trained on the OASIS MRI Dataset and may not generalize to all populations.
                </div>
            </div>

            <div class="footer">
                <p>Data-Driven Framework for Early Detection of Alzheimer's Disease Using MRI Brain Images</p>
                <p>Final Year Project | OASIS MRI Dataset | PyTorch ResNet-18</p>
                <p style="margin-top:0.5rem;">Report generated on {timestamp}</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html


# ============================================================
# App Layout
# ============================================================

# --- Hero Header ---
st.markdown("""
<div class="hero-header">
    <h1>&#129504; Alzheimer's Disease Detection</h1>
    <p>Upload an MRI brain scan for AI-powered classification using deep learning</p>
</div>
""", unsafe_allow_html=True)

# --- Load Model ---
try:
    model, config, eval_results = load_model_cached()
    model_loaded = True
except Exception as e:
    st.error(f"Failed to load model: {e}")
    model_loaded = False

# --- Sidebar ---
with st.sidebar:
    st.markdown("### &#9881;&#65039; Settings")
    st.divider()

    # Patient info
    st.markdown("#### &#128100; Patient Information")
    patient_name = st.text_input("Patient Name", placeholder="Enter patient name...")
    patient_id = st.text_input("Patient ID", placeholder="Enter patient ID...")

    st.divider()

    # Model info
    if model_loaded:
        st.markdown("#### &#129302; Model Information")
        st.markdown(f"""
        <div class="info-card">
            <h4>Architecture</h4>
            <p>{config['model_name'].upper()}</p>
            <h4 style="margin-top:0.8rem;">Input Size</h4>
            <p>{config['img_size']} x {config['img_size']} pixels</p>
            <h4 style="margin-top:0.8rem;">Validation Accuracy</h4>
            <p>{config['best_val_acc']:.1%}</p>
        </div>
        """, unsafe_allow_html=True)

        if eval_results:
            st.markdown(f"""
            <div class="info-card">
                <h4>Test Performance</h4>
                <p>Accuracy: {eval_results['test_accuracy']:.1%}</p>
                <p>Macro F1: {eval_results['macro_f1']:.3f}</p>
                <p>Test Images: {eval_results['test_size']:,}</p>
            </div>
            """, unsafe_allow_html=True)

    st.divider()
    st.markdown("""
    <div style="background:#1c1917;border:1px solid #78350f;border-radius:8px;padding:1rem;font-size:0.8rem;color:#fbbf24;">
        &#9888;&#65039; <strong>Disclaimer:</strong> This is a research project, NOT a clinical diagnostic tool.
        Always consult a qualified medical professional.
    </div>
    """, unsafe_allow_html=True)


# --- Main Content ---
if model_loaded:
    tab1, tab2 = st.tabs(["&#128269; Analyze MRI", "&#128202; Model Performance"])

    # ==========================
    # TAB 1: Analysis
    # ==========================
    with tab1:
        col_upload, col_result = st.columns([1, 1], gap="large")

        with col_upload:
            st.markdown("### Upload MRI Scan")
            uploaded_file = st.file_uploader(
                "Choose an MRI brain scan image",
                type=["jpg", "jpeg", "png", "bmp", "tiff"],
                help="Upload a 2D axial MRI brain scan image for analysis"
            )

            if uploaded_file is not None:
                image = Image.open(uploaded_file).convert("RGB")
                st.image(image, caption="Uploaded MRI Scan", use_container_width=True)

        with col_result:
            st.markdown("### Analysis Results")

            if uploaded_file is not None:
                with st.spinner("Analyzing MRI scan..."):
                    result = predict(image, model, config)

                pred_class = result["predicted_class"]
                confidence = result["confidence"]
                probs = result["probabilities"]

                # Choose result styling
                if pred_class == "Non Demented":
                    card_class = "result-healthy"
                    emoji = "&#9989;"
                elif pred_class == "Very mild Dementia":
                    card_class = "result-warning"
                    emoji = "&#9888;&#65039;"
                elif pred_class == "Mild Dementia":
                    card_class = "result-warning"
                    emoji = "&#9888;&#65039;"
                else:
                    card_class = "result-danger"
                    emoji = "&#128680;"

                st.markdown(f"""
                <div class="result-card {card_class}">
                    <h2>{emoji} {pred_class}</h2>
                    <h3>Confidence: {confidence:.1%}</h3>
                </div>
                """, unsafe_allow_html=True)

                # Metrics row
                st.markdown(f"""
                <div class="metric-row">
                    <div class="metric-card">
                        <div class="metric-value">{confidence:.1%}</div>
                        <div class="metric-label">Confidence</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{len(config['class_names'])}</div>
                        <div class="metric-label">Classes</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{config['model_name'].upper()}</div>
                        <div class="metric-label">Model</div>
                    </div>
                </div>
                """, unsafe_allow_html=True)

                # Probability chart
                st.markdown("#### Class Probabilities")
                fig = create_probability_chart(probs, pred_class)
                st.pyplot(fig)
                plt.close(fig)

                # Probability table
                st.markdown("#### Detailed Probabilities")
                prob_data = {
                    "Class": list(probs.keys()),
                    "Probability": [f"{v:.2%}" for v in probs.values()],
                }
                st.dataframe(prob_data, use_container_width=True, hide_index=True)

                # --- Download Report ---
                st.divider()
                st.markdown("### &#128196; Download Report")

                # Convert image to base64 for embedding in report
                img_buffer = io.BytesIO()
                image.save(img_buffer, format="PNG")
                img_b64 = base64.b64encode(img_buffer.getvalue()).decode()

                report_html = generate_report_html(result, patient_name, patient_id, img_b64)

                # Create filename
                safe_name = (patient_name or "unknown").replace(" ", "_")
                report_filename = f"alzheimer_report_{safe_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"

                st.download_button(
                    label="&#128196; Download Full Report (HTML)",
                    data=report_html,
                    file_name=report_filename,
                    mime="text/html",
                    use_container_width=True,
                    type="primary"
                )
                st.caption("The report is a self-contained HTML file that can be opened in any browser or printed to PDF.")

            else:
                st.markdown("""
                <div class="info-card" style="text-align:center;padding:3rem;">
                    <h4 style="color:#94a3b8;">&#128247; Upload an MRI Image</h4>
                    <p style="color:#64748b;font-size:0.9rem;">
                        Upload a brain MRI scan on the left panel to get an AI-powered analysis.
                    </p>
                </div>
                """, unsafe_allow_html=True)

    # ==========================
    # TAB 2: Model Performance
    # ==========================
    with tab2:
        st.markdown("### Model Performance Summary")

        if eval_results:
            # Top metrics
            m1, m2, m3, m4 = st.columns(4)
            m1.metric("Test Accuracy", f"{eval_results['test_accuracy']:.2%}")
            m2.metric("Macro F1", f"{eval_results['macro_f1']:.3f}")
            m3.metric("Macro Precision", f"{eval_results['macro_precision']:.3f}")
            m4.metric("Macro Recall", f"{eval_results['macro_recall']:.3f}")

            st.divider()

            # Per-class metrics
            st.markdown("#### Per-Class Performance")

            perf_data = []
            for cls_name in config["class_names"]:
                cls_report = eval_results["per_class_report"].get(cls_name, {})
                perf_data.append({
                    "Class": cls_name,
                    "Precision": f"{cls_report.get('precision', 0):.2%}",
                    "Recall": f"{cls_report.get('recall', 0):.2%}",
                    "F1-Score": f"{cls_report.get('f1-score', 0):.3f}",
                    "Support": int(cls_report.get('support', 0))
                })

            st.dataframe(perf_data, use_container_width=True, hide_index=True)

            # Confusion matrix
            st.markdown("#### Confusion Matrix")

            cm = np.array(eval_results["confusion_matrix"])
            fig_cm, ax_cm = plt.subplots(figsize=(8, 6))
            fig_cm.patch.set_facecolor('#0f172a')
            ax_cm.set_facecolor('#0f172a')

            import matplotlib.colors as mcolors
            cmap = mcolors.LinearSegmentedColormap.from_list("custom", ["#0f172a", "#312e81", "#7c3aed", "#a78bfa"])

            im = ax_cm.imshow(cm, interpolation='nearest', cmap=cmap)
            class_names = config["class_names"]

            # Add text annotations
            for i in range(len(class_names)):
                for j in range(len(class_names)):
                    text_color = 'white' if cm[i][j] > cm.max()/2 else '#94a3b8'
                    ax_cm.text(j, i, str(cm[i][j]), ha='center', va='center',
                              fontsize=14, fontweight='bold', color=text_color)

            ax_cm.set_xticks(range(len(class_names)))
            ax_cm.set_yticks(range(len(class_names)))

            short_names = [n.replace(" Dementia", "").replace("Very mild", "V.Mild") for n in class_names]
            ax_cm.set_xticklabels(short_names, rotation=30, ha='right', color='#94a3b8', fontsize=10)
            ax_cm.set_yticklabels(short_names, color='#94a3b8', fontsize=10)
            ax_cm.set_xlabel('Predicted', color='#94a3b8', fontsize=12)
            ax_cm.set_ylabel('Actual', color='#94a3b8', fontsize=12)
            ax_cm.set_title('Test Set Confusion Matrix', color='white', fontsize=14, fontweight='bold', pad=15)

            plt.tight_layout()
            st.pyplot(fig_cm)
            plt.close(fig_cm)

        else:
            st.info("Run Notebook 06 to generate evaluation results for this tab.")


# --- Footer ---
st.markdown("""
<div class="footer">
    <p><strong>Data-Driven Framework for Early Detection of Alzheimer's Disease Using MRI Brain Images</strong></p>
    <p>Final Year Project | OASIS MRI Dataset | PyTorch</p>
    <p style="margin-top:0.5rem;">Built with Streamlit | Model: ResNet-18 (Fine-tuned on ImageNet)</p>
</div>
""", unsafe_allow_html=True)
