"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Brain, Scan, BarChart3, Shield, Activity, ChevronRight, Check } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

// ─── Data ──────────────────────────────────────────────────────────────────
const stats = [
  { value: "96.8%", label: "Detection Accuracy" },
  { value: "4", label: "Dementia Stages" },
  { value: "<3s", label: "Analysis Time" },
  { value: "5,121", label: "Training Images" },
]

const diseaseStages = [
  {
    stage: "Non Demented",
    color: "#16a34a",
    bg: "rgba(22,163,74,0.07)",
    border: "rgba(22,163,74,0.20)",
    description:
      "No visible brain atrophy. Normal hippocampal volume. Cognitive function within normal range for age.",
    indicators: ["Normal hippocampal volume", "No cortical thinning", "Intact memory function"],
  },
  {
    stage: "Very Mild Dementia",
    color: "#d97706",
    bg: "rgba(217,119,6,0.07)",
    border: "rgba(217,119,6,0.20)",
    description:
      "Slight brain shrinkage detectable on MRI. Minimal cognitive decline. Early biomarkers present in temporal lobe.",
    indicators: ["Slight hippocampal atrophy", "Minimal cortical changes", "Occasional memory slips"],
  },
  {
    stage: "Mild Dementia",
    color: "#ea580c",
    bg: "rgba(234,88,12,0.07)",
    border: "rgba(234,88,12,0.20)",
    description:
      "Noticeable atrophy in hippocampus and entorhinal cortex. Significant cognitive impairment affecting daily tasks.",
    indicators: ["Measurable hippocampal loss", "Temporal lobe thinning", "Memory & reasoning affected"],
  },
  {
    stage: "Moderate Dementia",
    color: "#dc2626",
    bg: "rgba(220,38,38,0.07)",
    border: "rgba(220,38,38,0.20)",
    description:
      "Widespread cortical atrophy. Enlarged ventricles. Severe decline in memory, language, and executive function.",
    indicators: ["Widespread cortical atrophy", "Enlarged ventricles", "Severe cognitive decline"],
  },
]

const features = [
  {
    icon: Scan,
    title: "MRI Upload & Analysis",
    desc: "Drag-and-drop any standard brain MRI scan. Instant image preview with AI analysis in seconds.",
  },
  {
    icon: Brain,
    title: "Deep Learning Model",
    desc: "ResNet-50 trained on 5,000+ OASIS/ADNI images across all four dementia stages.",
  },
  {
    icon: BarChart3,
    title: "Probability Breakdown",
    desc: "Full confidence distribution across all classes — not just a single label.",
  },
  {
    icon: Shield,
    title: "Medical-Grade UI",
    desc: "Clean, structured interface designed for clinical readability and academic presentation.",
  },
]

// ─── Component ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Navbar />

      {/* ─ HERO ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#0A1628",
          paddingTop: "80px",
        }}
      >
        {/* Hero background image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          <Image
            src="/mri-hero.png"
            alt="MRI Brain Scan Background"
            fill
            style={{
              objectFit: "cover",
              objectPosition: "center",
              opacity: 0.25,
            }}
            priority
          />
          {/* Radial vignette overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(10,22,40,0.6) 70%, rgba(10,22,40,0.95) 100%)",
            }}
          />
        </div>

        {/* Diagonal stripe overlay (dataweb style) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(-45deg, rgba(0,180,216,0.03) 0px, rgba(0,180,216,0.03) 1px, transparent 1px, transparent 20px)",
            pointerEvents: "none",
          }}
        />

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            maxWidth: "900px",
            padding: "0 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "28px",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              background: "rgba(0,180,216,0.12)",
              border: "1px solid rgba(0,180,216,0.25)",
              borderRadius: "99px",
              color: "#90E0EF",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <Activity size={13} />
            Developed by Creative Nexus, Led by Faiz Moulavi
          </div>

          {/* Main heading */}
          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "clamp(40px, 7vw, 88px)",
              fontWeight: 400,
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Alzheimer's Disease{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #00B4D8, #90E0EF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Detection
            </span>
            <br />
            using MRI Brain Images
          </h1>

          {/* Sub-heading */}
          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.65,
              maxWidth: "600px",
              fontWeight: 400,
            }}
          >
            Upload an MRI scan and receive an instant AI-powered classification across
            four dementia stages — powered by a deep learning model trained on 5,000+ images.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            <Link
              href="/upload"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "16px 32px",
                background: "linear-gradient(135deg, #0077B6, #00B4D8)",
                color: "white",
                borderRadius: "99px",
                fontSize: "16px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0px 4px 24px rgba(0,180,216,0.35)",
                transition: "all 0.2s ease",
              }}
            >
              Start Analysis <ArrowRight size={18} />
            </Link>
            <a
              href="#about"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "16px 32px",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "99px",
                fontSize: "16px",
                fontWeight: 600,
                textDecoration: "none",
                backdropFilter: "blur(8px)",
                transition: "all 0.2s ease",
              }}
            >
              Learn More
            </a>
          </div>

          {/* Stat badges */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "16px",
            }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 18px",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "99px",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#00B4D8" }}>{s.value}</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            color: "rgba(255,255,255,0.35)",
            fontSize: "12px",
          }}
        >
          <ChevronRight size={16} style={{ transform: "rotate(90deg)" }} />
        </div>
      </section>

      {/* ─ ABOUT ──────────────────────────────────────────────────────────── */}
      <section
        id="about"
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "96px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "64px",
        }}
      >
        {/* Section header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 12px",
              background: "rgba(0,119,182,0.07)",
              border: "1px solid rgba(0,119,182,0.15)",
              borderRadius: "99px",
              color: "#0077B6",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              width: "fit-content",
            }}
          >
            About the Project
          </div>
          <h2
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 400,
              color: "#0A1628",
              lineHeight: 1.15,
            }}
          >
            AI-Powered Early Detection
          </h2>
          <p style={{ fontSize: "17px", color: "#475569", lineHeight: 1.7 }}>
            Alzheimer's disease affects over 50 million people worldwide. Early detection through MRI analysis
            can significantly improve patient outcomes. Our deep learning model classifies brain scans
            across four stages with clinical-level accuracy.
          </p>
        </div>

        {/* Feature grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                style={{
                  padding: "28px",
                  background: "#fff",
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: "16px",
                  boxShadow: "0px 1px 4px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  transition: "all 0.2s ease",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: "rgba(0,119,182,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0077B6",
                  }}
                >
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#0f172a",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─ Divider stripe ─────────────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          height: "40px",
          position: "relative",
          overflow: "hidden",
          borderTop: "1px solid rgba(15,23,42,0.06)",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(-45deg, rgba(0,119,182,0.04) 0px, rgba(0,119,182,0.04) 1px, transparent 1px, transparent 16px)",
          }}
        />
      </div>

      {/* ─ DISEASE STAGES ─────────────────────────────────────────────────── */}
      <section
        id="disease"
        style={{
          background: "#f8fafc",
          padding: "96px 24px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "48px" }}>
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                background: "rgba(0,119,182,0.07)",
                border: "1px solid rgba(0,119,182,0.15)",
                borderRadius: "99px",
                color: "#0077B6",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Disease Information
            </div>
            <h2
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 400,
                color: "#0A1628",
                lineHeight: 1.15,
              }}
            >
              Understanding Dementia Stages
            </h2>
            <p style={{ fontSize: "17px", color: "#475569", lineHeight: 1.7, maxWidth: "560px" }}>
              Our model classifies MRI scans into four clinically distinct stages. Here's what each stage means.
            </p>
          </div>

          {/* Stage cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
            }}
          >
            {diseaseStages.map((stage) => (
              <div
                key={stage.stage}
                style={{
                  padding: "28px",
                  background: "#fff",
                  border: `1px solid ${stage.border}`,
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 14px",
                    background: stage.bg,
                    borderRadius: "99px",
                    width: "fit-content",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: stage.color,
                    }}
                  />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: stage.color }}>
                    {stage.stage}
                  </span>
                </div>

                <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.65 }}>
                  {stage.description}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {stage.indicators.map((ind) => (
                    <div key={ind} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Check size={13} style={{ color: stage.color, flexShrink: 0 }} strokeWidth={2.5} />
                      <span style={{ fontSize: "13px", color: "#64748b" }}>{ind}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─ CTA ────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#0A1628",
          padding: "96px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(-45deg, rgba(0,180,216,0.04) 0px, rgba(0,180,216,0.04) 1px, transparent 1px, transparent 20px)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "700px",
            margin: "0 auto",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "28px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "clamp(32px, 5vw, 64px)",
              fontWeight: 400,
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            Ready to Analyze Your
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #00B4D8, #90E0EF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              MRI Scan?
            </span>
          </h2>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.60)", lineHeight: 1.65 }}>
            Upload your brain MRI and receive instant classification results with confidence scores across all stages.
          </p>
          <Link
            href="/upload"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "18px 40px",
              background: "linear-gradient(135deg, #0077B6, #00B4D8)",
              color: "white",
              borderRadius: "99px",
              fontSize: "17px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0px 4px 32px rgba(0,180,216,0.40)",
              transition: "all 0.2s ease",
            }}
          >
            Start Analysis <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
