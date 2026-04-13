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
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/button"
import { type PredictionResult, stageSeverity, classColors } from "@/lib/api"

function ConfidenceRing({ value }: { value: number }) {
    const pct = Math.round(value * 100)
    const r = 52
    const circ = 2 * Math.PI * r
    const dash = (pct / 100) * circ

    return (
        <div className="relative w-[140px] h-[140px]">
            <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(0,119,182,0.08)" strokeWidth="12" />
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
                        <stop offset="0%" stopColor="#FFA756" />
                        <stop offset="100%" stopColor="#EE602C" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#EE602C] leading-none">{pct}%</span>
                <span className="text-xs text-gray-500 mt-1">confidence</span>
            </div>
        </div>
    )
}

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
            setTimeout(() => setBarsVisible(true), 400)
        } catch {
            router.push("/upload")
        }
    }, [router])

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
            const margin = 20
            const usableW = pageW - margin * 2

            // Header Banner
            pdf.setFillColor(238, 96, 44) // #EE602C (NeuroScan Orange)
            pdf.rect(0, 0, pageW, 30, "F")
            
            // Header Content
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(22)
            pdf.setFont("helvetica", "bold")
            pdf.text("NeuroScan AI", margin, 20)
            
            pdf.setFontSize(10)
            pdf.setFont("helvetica", "normal")
            pdf.text("Clinical MRI Analysis Report", margin + 65, 19)

            pdf.setFontSize(8)
            pdf.text(`Generated: ${new Date(result.timestamp).toLocaleString()}`, pageW - margin, 19, { align: "right" })

            let y = 42

            // Patient / Scan Details Box
            pdf.setFillColor(248, 250, 252)
            pdf.roundedRect(margin, y, usableW, 24, 3, 3, "F")
            pdf.setDrawColor(226, 232, 240)
            pdf.setLineWidth(0.5)
            pdf.roundedRect(margin, y, usableW, 24, 3, 3, "S")

            pdf.setTextColor(100, 116, 139)
            pdf.setFontSize(8)
            pdf.text("MODEL VERSION", margin + 6, y + 8)
            pdf.text("INFERENCE TIME", margin + 70, y + 8)
            pdf.text("STATUS", margin + 135, y + 8)

            pdf.setTextColor(15, 23, 42)
            pdf.setFontSize(11)
            pdf.setFont("helvetica", "bold")
            pdf.text(result.modelVersion, margin + 6, y + 16)
            pdf.text(result.inferenceTimeMs ? `${result.inferenceTimeMs} ms` : "< 100 ms", margin + 70, y + 16)
            pdf.setTextColor(16, 185, 129) // Emerald-500
            pdf.text("Completed", margin + 135, y + 16)

            y += 34

            // Layout split: Left for Results, Right for Image
            const imgW = 65
            const imgH = 65
            const imgX = pageW - margin - imgW
            const leftPanelW = imgX - margin - 15

            if (imageUrl) {
                try {
                    const img = new window.Image()
                    img.crossOrigin = "anonymous"
                    await new Promise<void>((resolve, reject) => {
                        img.onload = () => resolve()
                        img.onerror = reject
                        img.src = imageUrl
                    })
                    const canvas = document.createElement("canvas")
                    canvas.width = img.naturalWidth || 256
                    canvas.height = img.naturalHeight || 256
                    const ctx = canvas.getContext("2d")!
                    ctx.drawImage(img, 0, 0)
                    const dataUrl = canvas.toDataURL("image/jpeg", 1.0) // high quality

                    pdf.setDrawColor(203, 213, 225)
                    pdf.setLineWidth(0.5)
                    pdf.rect(imgX, y, imgW, imgH, "S")
                    pdf.addImage(dataUrl, "JPEG", imgX, y, imgW, imgH)

                    pdf.setTextColor(100, 116, 139)
                    pdf.setFontSize(7)
                    pdf.setFont("helvetica", "normal")
                    pdf.text("SOURCE MRI SCAN", imgX + imgW / 2, y + imgH + 5, { align: "center" })
                } catch {
                    // ignore image load error
                }
            }

            // Primary Prediction Section
            const stageColor = stageSeverity[result.prediction]
            const hexToRgb = (hex: string) => {
                const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i)
                return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [100, 100, 100]
            }
            const [r, g, b] = hexToRgb(stageColor?.color ?? "#64748b")

            pdf.setFontSize(9)
            pdf.setTextColor(100, 116, 139)
            pdf.setFont("helvetica", "bold")
            pdf.text("PRIMARY PREDICTION", margin, y + 4)

            y += 14
            pdf.setFontSize(22)
            pdf.setTextColor(r, g, b)
            const lines = pdf.splitTextToSize(result.prediction, leftPanelW)
            pdf.text(lines, margin, y)

            const textHeight = lines.length * 9
            y += textHeight + 2

            // Severity Badge
            pdf.setFillColor(r, g, b)
            pdf.roundedRect(margin, y, 32, 7, 1.5, 1.5, "F")
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(8)
            pdf.text(stageColor?.label ?? "Reviewed", margin + 16, y + 5, { align: "center" })

            y += 18
            
            // Confidence Score
            pdf.setTextColor(100, 116, 139)
            pdf.setFontSize(9)
            pdf.setFont("helvetica", "normal")
            pdf.text("OVERALL CONFIDENCE", margin, y)
            
            y += 8
            pdf.setFontSize(26)
            pdf.setFont("helvetica", "bold")
            pdf.setTextColor(238, 96, 44)
            pdf.text(`${Math.round(result.confidence * 100)}%`, margin, y)

            // Adjust y below the image/prediction block
            y = Math.max(y + 15, imgX ? 42 + 34 + imgH + 15 : y + 15)

            // Probability Distribution section
            pdf.setDrawColor(226, 232, 240)
            pdf.line(margin, y, pageW - margin, y)
            y += 12

            pdf.setFontSize(12)
            pdf.setFont("helvetica", "bold")
            pdf.setTextColor(15, 23, 42)
            pdf.text("Probability Distribution", margin, y)
            
            y += 5
            pdf.setFontSize(8)
            pdf.setFont("helvetica", "normal")
            pdf.setTextColor(100, 116, 139)
            pdf.text("Comprehensive confidence metrics across all defined classification stages.", margin, y)
            
            y += 12

            const probEntries = Object.entries(result.probabilities).sort((a, b) => b[1] - a[1])
            for (const [cls, prob] of probEntries) {
                const pct = Math.round(prob * 100)
                const color = classColors[cls] ?? "#EE602C"
                const [cr, cg, cb] = hexToRgb(color)
                const isTop = cls === result.prediction

                pdf.setFontSize(9)
                pdf.setFont("helvetica", isTop ? "bold" : "normal")
                pdf.setTextColor(isTop ? 15 : 71, isTop ? 23 : 85, isTop ? 42 : 105)
                pdf.text(cls, margin, y)

                pdf.setFont("helvetica", "bold")
                pdf.setTextColor(cr, cg, cb)
                pdf.text(`${pct}%`, pageW - margin, y, { align: "right" })

                y += 3
                const barH = 5
                pdf.setFillColor(241, 245, 249)
                pdf.roundedRect(margin, y, usableW, barH, 2.5, 2.5, "F")

                if (pct > 0) {
                    pdf.setFillColor(cr, cg, cb)
                    pdf.roundedRect(margin, y, (usableW * pct) / 100, barH, 2.5, 2.5, "F")
                }
                y += 14
            }

            y += 8

            // Disclaimer Box
            pdf.setFillColor(255, 247, 237)
            pdf.setDrawColor(253, 186, 116)
            pdf.setLineWidth(0.5)
            pdf.roundedRect(margin, y, usableW, 20, 3, 3, "FD")
            
            pdf.setTextColor(194, 65, 12)
            pdf.setFontSize(9)
            pdf.setFont("helvetica", "bold")
            pdf.text("Clinical Disclaimer", margin + 4, y + 7)
            
            pdf.setFontSize(8)
            pdf.setFont("helvetica", "normal")
            const disclaimer = "This AI-generated analysis is intended strictly as a decision support tool. It is NOT a definitive clinical diagnosis. Results must be independently verified by a qualified radiologist or neurologist."
            const dLines = pdf.splitTextToSize(disclaimer, usableW - 8)
            pdf.text(dLines, margin + 4, y + 12)

            // Footer
            pdf.setFontSize(7)
            pdf.setTextColor(148, 163, 184)
            pdf.text("NeuroScan AI Detection System  •  Confidential Medical Document", pageW / 2, pageH - 10, { align: "center" })

            pdf.save(`neuroscan-mri-report-${Date.now()}.pdf`)
        } catch (err) {
            console.error("PDF export failed:", err)
            alert("PDF export failed. Please try again.")
        } finally {
            setPdfLoading(false)
        }
    }

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
            </div>
        )
    }

    const severity = stageSeverity[result.prediction]
    const probEntries = Object.entries(result.probabilities) as [string, number][]

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />

            <main className="pt-32 pb-20 max-w-6xl mx-auto px-6">
                <div className="mb-8">
                    <Link href="/upload" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={16} /> Back to Upload
                    </Link>
                </div>

                <div className="flex flex-col gap-2 mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                        Analysis Results
                    </h1>
                    <p className="text-gray-500">
                        AI classification complete · Model: {result.modelVersion} · {new Date(result.timestamp).toLocaleString()}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="md:col-span-4 lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                                <Brain size={18} className="text-[#EE602C]" />
                                <span className="text-sm font-semibold text-gray-900">MRI Scan</span>
                            </div>
                            <div className="relative w-full aspect-square bg-black flex items-center justify-center">
                                {imageUrl ? (
                                    <Image src={imageUrl} alt="Uploaded MRI Scan" fill className="object-contain" />
                                ) : (
                                    <Brain size={64} className="text-white opacity-20" />
                                )}
                            </div>
                            <div className="p-4 bg-gray-50">
                                <p className="text-xs text-gray-500">
                                    Analysed by ResNet-50 · {result.modelVersion}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                            {[
                                { icon: <Clock size={16} />, label: "Inference Time", value: result.inferenceTimeMs ? `${result.inferenceTimeMs} ms` : "< 100 ms" },
                                { icon: <CheckCircle2 size={16} />, label: "Model Version", value: result.modelVersion },
                                { icon: <AlertCircle size={16} />, label: "Status", value: "Completed" },
                            ].map((m) => (
                                <div key={m.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        {m.icon}
                                        <span className="text-sm">{m.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{m.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="md:col-span-8 lg:col-span-7 flex flex-col gap-6">
                        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col gap-8">
                            <div className="flex items-center gap-8 flex-wrap">
                                <ConfidenceRing value={result.confidence} />
                                <div className="flex flex-col gap-3 flex-1">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Predicted Stage</p>
                                        <h2 className="text-3xl lg:text-4xl font-bold leading-tight" style={{ color: severity?.color ?? "#0f172a" }}>
                                            {result.prediction}
                                        </h2>
                                    </div>
                                    <div
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-max"
                                        style={{ background: severity?.bg ?? "rgba(238,96,44,0.1)", border: `1px solid ${severity?.color ?? "#EE602C"}30` }}
                                    >
                                        <div className="w-2 h-2 rounded-full" style={{ background: severity?.color ?? "#EE602C" }} />
                                        <span className="text-sm font-semibold" style={{ color: severity?.color ?? "#EE602C" }}>
                                            {severity?.label ?? "Unknown"}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2 mt-2">
                                        <AlertCircle size={16} className="text-orange-600 mt-0.5 shrink-0" />
                                        <p className="text-xs text-orange-800 leading-relaxed">
                                            <strong>Note:</strong> This AI result is for decision support only. Always consult a qualified neurologist for clinical diagnosis.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Probability Distribution</h3>
                                <p className="text-sm text-gray-500">Confidence across all four classification stages</p>
                            </div>
                            <div className="flex flex-col gap-4">
                                {probEntries
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([className, prob]) => {
                                        const pct = Math.round(prob * 100)
                                        const color = classColors[className] ?? "#EE602C"
                                        const isTop = result.prediction === className

                                        return (
                                            <div
                                                key={className}
                                                className={`flex flex-col gap-2 rounded-xl transition-all ${isTop ? "p-4" : ""}`}
                                                style={{
                                                    background: isTop ? `${color}15` : "transparent",
                                                }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        {isTop && <CheckCircle2 size={16} color={color} />}
                                                        <span className={`text-sm ${isTop ? "font-bold" : "font-medium"}`} style={{ color: isTop ? color : "#4b5563" }}>
                                                            {className}
                                                        </span>
                                                    </div>
                                                    <span className={`text-sm font-bold min-w-[3rem] text-right`} style={{ color: isTop ? color : "#6b7280" }}>
                                                        {pct}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000 ease-out"
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

                        <div className="flex gap-4 flex-wrap mt-2">
                            <Button as={Link} href="/upload" variant="primary" className="py-4">
                                <RefreshCw size={18} className="mr-2" /> Analyze Another
                            </Button>
                            <Button onClick={exportPDF} disabled={pdfLoading} variant="secondary" className="py-4 bg-white border border-gray-200">
                                {pdfLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                                        Generating...
                                    </>
                                ) : (
                                    <><Download size={18} className="mr-2" /> Export PDF Report</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 p-8 bg-white border border-gray-200 rounded-3xl shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Understanding This Result</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: "High Confidence", desc: "Above 85% — Strong model certainty. The top label is very likely correct.", icon: "✅" },
                            { title: "Moderate Confidence", desc: "60–85% — Some ambiguity between stages. Further clinical eval recommended.", icon: "⚠️" },
                            { title: "Low Confidence", desc: "Below 60% — Inconclusive. Image quality or atypical features may be the cause.", icon: "❓" },
                            { title: "Next Steps", desc: "Share results with a neurologist or radiologist for clinical interpretation.", icon: "🏥" },
                        ].map((tip) => (
                            <div key={tip.title} className="p-5 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-2">
                                <span className="text-2xl mb-1">{tip.icon}</span>
                                <h4 className="text-sm font-semibold text-gray-900">{tip.title}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
