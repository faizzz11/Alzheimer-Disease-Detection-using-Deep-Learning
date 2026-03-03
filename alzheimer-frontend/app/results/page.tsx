"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
    ArrowLeft,
    Brain,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    Download,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { type PredictionResult, stageSeverity, classColors } from "@/lib/api"

// ─────────────────────────────────────────────────────────────────────────────
/**
 * Confidence Ring SVG component
 */
function ConfidenceRing({ value }: { value: number }) {
    const pct = Math.round(value * 100)
    const r = 52
    const circ = 2 * Math.PI * r
    const dash = (pct / 100) * circ

    return (
        <div style={{ position: "relative", width: 140, height: 140 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
                {/* Track */}
                <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(0,119,182,0.08)" strokeWidth="12" />
                {/* Progress */}
                <circle
                    cx="70"
                    cy="70"
                    r={r}
                    fill="none"
                    stroke="url(#confGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ}`}
                    transform="rotate(-90 70 70)"
                    style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
                <defs>
                    <linearGradient id="confGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0077B6" />
                        <stop offset="100%" stopColor="#00B4D8" />
                    </linearGradient>
                </defs>
            </svg>
            {/* Center text */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span style={{ fontSize: "26px", fontWeight: 700, color: "#0077B6", lineHeight: 1 }}>{pct}%</span>
                <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>confidence</span>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ResultsPage() {
    const router = useRouter()
    const [result, setResult] = useState<PredictionResult | null>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [barsVisible, setBarsVisible] = useState(false)
    const [pdfLoading, setPdfLoading] = useState(false)

    useEffect(() => {
        const raw = sessionStorage.getItem("prediction")
        const img = sessionStorage.getItem("mriImage")

        if (!raw) {
            router.push("/upload")
            return
        }
        try {
            setResult(JSON.parse(raw))
            setImageUrl(img)
            // Animate bars after short delay
            setTimeout(() => setBarsVisible(true), 400)
        } catch {
            router.push("/upload")
        }
    }, [router])

    // ── PDF Export ────────────────────────────────────────────────────────────
    const exportPDF = async () => {
        if (!result || pdfLoading) return
        setPdfLoading(true)
        try {
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import("jspdf"),
                import("html2canvas"),
            ])

            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
            const pageW = pdf.internal.pageSize.getWidth()
            const pageH = pdf.internal.pageSize.getHeight()
            const margin = 18
            const usableW = pageW - margin * 2

            // ── Header bar ───────────────────────────────────────────────────
            pdf.setFillColor(0, 119, 182)
            pdf.rect(0, 0, pageW, 28, "F")
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(16)
            pdf.setFont("helvetica", "bold")
            pdf.text("Alzheimer's MRI Analysis Report", margin, 18)

            pdf.setFontSize(8)
            pdf.setFont("helvetica", "normal")
            pdf.text(`Generated: ${new Date(result.timestamp).toLocaleString()}`, pageW - margin, 18, { align: "right" })

            let y = 38

            // ── Patient/Scan info block ───────────────────────────────────────
            pdf.setFillColor(248, 250, 252)
            pdf.roundedRect(margin, y, usableW, 22, 3, 3, "F")
            pdf.setDrawColor(220, 220, 230)
            pdf.roundedRect(margin, y, usableW, 22, 3, 3, "S")

            pdf.setTextColor(100, 116, 139)
            pdf.setFontSize(8)
            pdf.setFont("helvetica", "normal")
            pdf.text("MODEL VERSION", margin + 4, y + 6)
            pdf.text("INFERENCE TIME", margin + 65, y + 6)
            pdf.text("STATUS", margin + 130, y + 6)

            pdf.setTextColor(15, 23, 42)
            pdf.setFontSize(10)
            pdf.setFont("helvetica", "bold")
            pdf.text(result.modelVersion, margin + 4, y + 16)
            pdf.text(
                result.inferenceTimeMs ? `${result.inferenceTimeMs} ms` : "< 100 ms",
                margin + 65, y + 16
            )
            pdf.text("Completed", margin + 130, y + 16)

            y += 30

            // ── MRI scan image ────────────────────────────────────────────────
            if (imageUrl) {
                try {
                    const img = new window.Image()
                    img.crossOrigin = "anonymous"
                    await new Promise<void>((resolve, reject) => {
                        img.onload = () => resolve()
                        img.onerror = reject
                        img.src = imageUrl
                    })
                    const imgW = 60
                    const imgH = 60
                    // Draw image on right side
                    const canvas = document.createElement("canvas")
                    canvas.width = img.naturalWidth || 256
                    canvas.height = img.naturalHeight || 256
                    const ctx = canvas.getContext("2d")!
                    ctx.drawImage(img, 0, 0)
                    const dataUrl = canvas.toDataURL("image/jpeg", 0.85)

                    // Draw image box on right
                    const imgX = pageW - margin - imgW
                    pdf.setDrawColor(200, 200, 210)
                    pdf.rect(imgX, y, imgW, imgH, "S")
                    pdf.addImage(dataUrl, "JPEG", imgX, y, imgW, imgH)

                    pdf.setTextColor(100, 116, 139)
                    pdf.setFontSize(7)
                    pdf.setFont("helvetica", "normal")
                    pdf.text("MRI SCAN", imgX + imgW / 2, y + imgH + 5, { align: "center" })

                    // ── Prediction on left side ────────────────────────────────
                    const leftW = imgX - margin - 6

                    // Stage badge
                    const stageColor = stageSeverity[result.prediction]
                    const hexToRgb = (hex: string) => {
                        const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i)
                        return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [100, 100, 100]
                    }
                    const [r, g, b] = hexToRgb(stageColor?.color ?? "#64748b")

                    pdf.setFontSize(8)
                    pdf.setTextColor(100, 116, 139)
                    pdf.text("PREDICTED STAGE", margin, y + 8)

                    pdf.setFontSize(20)
                    pdf.setFont("helvetica", "bold")
                    pdf.setTextColor(r, g, b)
                    const prediction = result.prediction
                    // Wrap long text
                    const lines = pdf.splitTextToSize(prediction, leftW)
                    pdf.text(lines, margin, y + 18)

                    const labelY = y + 18 + lines.length * 8

                    // Severity pill
                    pdf.setFillColor(r, g, b)
                    pdf.roundedRect(margin, labelY, 40, 8, 2, 2, "F")
                    pdf.setTextColor(255, 255, 255)
                    pdf.setFontSize(8)
                    pdf.setFont("helvetica", "bold")
                    pdf.text(stageColor?.label ?? "Unknown", margin + 20, labelY + 5.5, { align: "center" })

                    // Confidence
                    const confY = labelY + 14
                    pdf.setTextColor(100, 116, 139)
                    pdf.setFontSize(8)
                    pdf.setFont("helvetica", "normal")
                    pdf.text("CONFIDENCE", margin, confY)
                    pdf.setFontSize(28)
                    pdf.setFont("helvetica", "bold")
                    pdf.setTextColor(0, 119, 182)
                    pdf.text(`${Math.round(result.confidence * 100)}%`, margin, confY + 14)

                    y = Math.max(y + imgH + 14, confY + 20)
                } catch {
                    // If image fails, skip it and move on
                    y += 10
                }
            }

            y += 6

            // ── Divider ──────────────────────────────────────────────────────
            pdf.setDrawColor(220, 220, 230)
            pdf.line(margin, y, pageW - margin, y)
            y += 8

            // ── Probability distribution ──────────────────────────────────────
            pdf.setFontSize(11)
            pdf.setFont("helvetica", "bold")
            pdf.setTextColor(15, 23, 42)
            pdf.text("Probability Distribution", margin, y)
            y += 3
            pdf.setFontSize(8)
            pdf.setFont("helvetica", "normal")
            pdf.setTextColor(148, 163, 184)
            pdf.text("Confidence across all four classification stages", margin, y + 4)
            y += 10

            const probEntries = Object.entries(result.probabilities).sort((a, b) => b[1] - a[1])
            const hexToRgb2 = (hex: string) => {
                const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i)
                return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [100, 100, 100]
            }

            for (const [cls, prob] of probEntries) {
                const pct = Math.round(prob * 100)
                const color = classColors[cls] ?? "#0077B6"
                const [cr, cg, cb] = hexToRgb2(color)
                const isTop = cls === result.prediction

                if (isTop) {
                    pdf.setFillColor(cr, cg, cb, 0.06 as unknown as string)
                    pdf.roundedRect(margin - 2, y - 3, usableW + 4, 16, 2, 2, "F")
                }

                // Label
                pdf.setFontSize(9)
                pdf.setFont("helvetica", isTop ? "bold" : "normal")
                pdf.setTextColor(isTop ? cr : 71, isTop ? cg : 85, isTop ? cb : 105)
                pdf.text(cls, margin + 2, y + 5)

                // Percentage
                pdf.setFont("helvetica", "bold")
                pdf.setTextColor(isTop ? cr : 100, isTop ? cg : 116, isTop ? cb : 139)
                pdf.text(`${pct}%`, pageW - margin - 2, y + 5, { align: "right" })

                // Bar track
                const barY = y + 8
                const barH = 4
                const barW = usableW
                pdf.setFillColor(230, 235, 240)
                pdf.roundedRect(margin, barY, barW, barH, 1, 1, "F")

                // Bar fill
                if (pct > 0) {
                    pdf.setFillColor(cr, cg, cb)
                    pdf.roundedRect(margin, barY, (barW * pct) / 100, barH, 1, 1, "F")
                }

                y += 18
            }

            y += 4

            // ── Disclaimer box ────────────────────────────────────────────────
            pdf.setFillColor(255, 247, 237)
            pdf.roundedRect(margin, y, usableW, 22, 3, 3, "F")
            pdf.setDrawColor(251, 146, 60)
            pdf.roundedRect(margin, y, usableW, 22, 3, 3, "S")
            pdf.setTextColor(154, 52, 18)
            pdf.setFontSize(9)
            pdf.setFont("helvetica", "bold")
            pdf.text("⚠  Medical Disclaimer", margin + 4, y + 7)
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(8)
            const disclaimer =
                "This AI analysis is intended as a decision support tool only. " +
                "It is NOT a clinical diagnosis. Always consult a qualified neurologist or radiologist."
            const dLines = pdf.splitTextToSize(disclaimer, usableW - 8)
            pdf.text(dLines, margin + 4, y + 14)

            // ── Footer ────────────────────────────────────────────────────────
            pdf.setFontSize(7)
            pdf.setTextColor(148, 163, 184)
            pdf.setFont("helvetica", "normal")
            pdf.text(
                "Alzheimer's AI Detection System  •  Confidential Medical Document",
                pageW / 2,
                pageH - 8,
                { align: "center" }
            )

            pdf.save(`alzheimer-mri-report-${Date.now()}.pdf`)
        } catch (err) {
            console.error("PDF export failed:", err)
            alert("PDF export failed. Please try again.")
        } finally {
            setPdfLoading(false)
        }
    }

    if (!result) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div
                    style={{
                        width: 40,
                        height: 40,
                        border: "3px solid rgba(0,119,182,0.2)",
                        borderTop: "3px solid #0077B6",
                        borderRadius: "50%",
                        animation: "spin-slow 0.8s linear infinite",
                    }}
                />
            </div>
        )
    }

    const severity = stageSeverity[result.prediction]
    const probEntries = Object.entries(result.probabilities) as [string, number][]

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <Navbar />

            <main
                style={{
                    paddingTop: "96px",
                    paddingBottom: "80px",
                    maxWidth: "1100px",
                    margin: "0 auto",
                    padding: "96px 24px 80px",
                }}
            >
                {/* Back navigation */}
                <div style={{ marginBottom: "32px" }}>
                    <Link
                        href="/upload"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#64748b",
                            textDecoration: "none",
                            transition: "color 0.15s ease",
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Upload
                    </Link>
                </div>

                {/* Page header */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        marginBottom: "36px",
                    }}
                >
                    <h1
                        style={{
                            fontFamily: "'Instrument Serif', Georgia, serif",
                            fontSize: "clamp(28px, 4vw, 44px)",
                            fontWeight: 400,
                            color: "#0A1628",
                            lineHeight: 1.15,
                        }}
                    >
                        Analysis Results
                    </h1>
                    <p style={{ fontSize: "15px", color: "#64748b" }}>
                        AI classification complete · Model: {result.modelVersion} ·{" "}
                        {new Date(result.timestamp).toLocaleString()}
                    </p>
                </div>

                {/* ── Main grid ── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(280px, 380px) 1fr",
                        gap: "24px",
                        alignItems: "start",
                    }}
                    className="results-grid"
                >
                    {/* ── LEFT: MRI Image + Severity ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* MRI Image card */}
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid rgba(15,23,42,0.08)",
                                borderRadius: "20px",
                                overflow: "hidden",
                                boxShadow: "0px 4px 16px rgba(0,0,0,0.06)",
                            }}
                        >
                            <div
                                style={{
                                    padding: "16px 20px",
                                    borderBottom: "1px solid rgba(15,23,42,0.06)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                }}
                            >
                                <Brain size={16} color="#0077B6" />
                                <span style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>MRI Scan</span>
                            </div>
                            <div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    aspectRatio: "1 / 1",
                                    background: "#000",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt="Uploaded MRI Scan"
                                        fill
                                        style={{ objectFit: "contain" }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Brain size={64} color="rgba(255,255,255,0.2)" />
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: "12px 20px", background: "#f8fafc" }}>
                                <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                                    Analysed by ResNet-18 · {result.modelVersion}
                                </p>
                            </div>
                        </div>

                        {/* Quick meta */}
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid rgba(15,23,42,0.08)",
                                borderRadius: "16px",
                                padding: "20px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                                boxShadow: "0px 2px 8px rgba(0,0,0,0.04)",
                            }}
                        >
                            {[
                                {
                                    icon: <Clock size={14} />,
                                    label: "Inference Time",
                                    value: result.inferenceTimeMs ? `${result.inferenceTimeMs} ms` : "< 100 ms"
                                },
                                { icon: <CheckCircle2 size={14} />, label: "Model Version", value: result.modelVersion },
                                { icon: <AlertCircle size={14} />, label: "Status", value: "Completed" },
                            ].map((m) => (
                                <div
                                    key={m.label}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "10px 0",
                                        borderBottom: "1px solid rgba(15,23,42,0.04)",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8" }}>
                                        {m.icon}
                                        <span style={{ fontSize: "13px", color: "#64748b" }}>{m.label}</span>
                                    </div>
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{m.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: Prediction + Bars ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Prediction card */}
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid rgba(15,23,42,0.08)",
                                borderRadius: "20px",
                                padding: "32px",
                                boxShadow: "0px 4px 16px rgba(0,0,0,0.06)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "28px",
                            }}
                        >
                            {/* Prediction badge + ring */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "32px",
                                    flexWrap: "wrap",
                                }}
                            >
                                <ConfidenceRing value={result.confidence} />

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                                    <div>
                                        <p style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                                            Predicted Stage
                                        </p>
                                        <h2
                                            style={{
                                                fontSize: "clamp(22px, 3vw, 32px)",
                                                fontWeight: 700,
                                                color: severity?.color ?? "#0f172a",
                                                lineHeight: 1.15,
                                            }}
                                        >
                                            {result.prediction}
                                        </h2>
                                    </div>

                                    {/* Severity pill */}
                                    <div
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            padding: "8px 16px",
                                            background: severity?.bg ?? "rgba(0,119,182,0.07)",
                                            border: `1px solid ${severity?.color ?? "#0077B6"}30`,
                                            borderRadius: "99px",
                                            width: "fit-content",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                background: severity?.color ?? "#0077B6",
                                                flexShrink: 0,
                                            }}
                                        />
                                        <span
                                            style={{
                                                fontSize: "13px",
                                                fontWeight: 600,
                                                color: severity?.color ?? "#0077B6",
                                            }}
                                        >
                                            {severity?.label ?? "Unknown"}
                                        </span>
                                    </div>

                                    {/* Disclaimer banner */}
                                    <div
                                        style={{
                                            padding: "12px 16px",
                                            background: "rgba(234,88,12,0.06)",
                                            border: "1px solid rgba(234,88,12,0.20)",
                                            borderRadius: "10px",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "10px",
                                        }}
                                    >
                                        <AlertCircle size={15} color="#ea580c" style={{ flexShrink: 0, marginTop: "1px" }} />
                                        <p style={{ fontSize: "12px", color: "#9a3412", lineHeight: 1.5 }}>
                                            <strong>Note:</strong> This AI result is for decision support only.
                                            Always consult a qualified neurologist for clinical diagnosis.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Probability bars card */}
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid rgba(15,23,42,0.08)",
                                borderRadius: "20px",
                                padding: "28px",
                                boxShadow: "0px 4px 16px rgba(0,0,0,0.06)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "24px",
                            }}
                        >
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                                    Probability Distribution
                                </h3>
                                <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                                    Confidence across all four classification stages
                                </p>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                {probEntries
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([className, prob]) => {
                                        const pct = Math.round(prob * 100)
                                        const color = classColors[className] ?? "#0077B6"
                                        const isTop = result.prediction === className

                                        return (
                                            <div
                                                key={className}
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "8px",
                                                    padding: isTop ? "14px" : "0",
                                                    background: isTop ? `${color}08` : "transparent",
                                                    border: isTop ? `1px solid ${color}25` : "none",
                                                    borderRadius: isTop ? "12px" : "0",
                                                    transition: "all 0.2s ease",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        {isTop && (
                                                            <CheckCircle2 size={14} color={color} />
                                                        )}
                                                        <span
                                                            style={{
                                                                fontSize: "14px",
                                                                fontWeight: isTop ? 700 : 500,
                                                                color: isTop ? color : "#475569",
                                                            }}
                                                        >
                                                            {className}
                                                        </span>
                                                    </div>
                                                    <span
                                                        style={{
                                                            fontSize: "15px",
                                                            fontWeight: 700,
                                                            color: isTop ? color : "#64748b",
                                                            minWidth: "48px",
                                                            textAlign: "right",
                                                        }}
                                                    >
                                                        {pct}%
                                                    </span>
                                                </div>

                                                <div className="prob-bar-track">
                                                    <div
                                                        className="prob-bar-fill"
                                                        style={{
                                                            width: barsVisible ? `${pct}%` : "0%",
                                                            background: `linear-gradient(90deg, ${color}cc, ${color})`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>

                        {/* Action buttons — excluded from PDF via CSS */}
                        <div
                            className="no-print"
                            style={{
                                display: "flex",
                                gap: "12px",
                                flexWrap: "wrap",
                            }}
                        >
                            <Link
                                href="/upload"
                                id="analyze-another-btn"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "14px 28px",
                                    background: "linear-gradient(135deg, #0077B6, #00B4D8)",
                                    color: "white",
                                    borderRadius: "99px",
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    boxShadow: "0px 4px 16px rgba(0,119,182,0.30)",
                                }}
                            >
                                <RefreshCw size={16} /> Analyze Another Scan
                            </Link>

                            <button
                                onClick={exportPDF}
                                disabled={pdfLoading}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "14px 24px",
                                    background: pdfLoading ? "rgba(0,119,182,0.04)" : "rgba(0,119,182,0.06)",
                                    color: "#0077B6",
                                    border: "1px solid rgba(0,119,182,0.20)",
                                    borderRadius: "99px",
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    cursor: pdfLoading ? "not-allowed" : "pointer",
                                    opacity: pdfLoading ? 0.6 : 1,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {pdfLoading ? (
                                    <>
                                        <span
                                            style={{
                                                width: 16,
                                                height: 16,
                                                border: "2px solid rgba(0,119,182,0.3)",
                                                borderTop: "2px solid #0077B6",
                                                borderRadius: "50%",
                                                display: "inline-block",
                                                animation: "spin-slow 0.8s linear infinite",
                                            }}
                                        />
                                        Generating PDF...
                                    </>
                                ) : (
                                    <><Download size={16} /> Export PDF Report</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Interpretation guide ── */}
                <div
                    style={{
                        marginTop: "32px",
                        padding: "28px",
                        background: "#fff",
                        border: "1px solid rgba(15,23,42,0.08)",
                        borderRadius: "20px",
                        boxShadow: "0px 4px 16px rgba(0,0,0,0.04)",
                    }}
                >
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>
                        Understanding This Result
                    </h3>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "16px",
                        }}
                    >
                        {[
                            { title: "High Confidence", desc: "Above 85% — Strong model certainty. The top label is very likely correct.", icon: "✅" },
                            { title: "Moderate Confidence", desc: "60–85% — Some ambiguity between stages. Further clinical eval recommended.", icon: "⚠️" },
                            { title: "Low Confidence", desc: "Below 60% — Inconclusive. Image quality or atypical features may be the cause.", icon: "❓" },
                            { title: "Next Steps", desc: "Share results with a neurologist or radiologist for clinical interpretation.", icon: "🏥" },
                        ].map((tip) => (
                            <div
                                key={tip.title}
                                style={{
                                    padding: "16px",
                                    background: "#f8fafc",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(15,23,42,0.06)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                <span style={{ fontSize: "20px" }}>{tip.icon}</span>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{tip.title}</p>
                                <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.55 }}>{tip.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Responsive grid fix */}
            <style>{`
        @media (max-width: 768px) {
          .results-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

            <Footer />
        </div>
    )
}
