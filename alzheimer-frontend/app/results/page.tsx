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

import { Footer } from "@/components/footer"
import { Button } from "@/components/button"
import { type PredictionResult, stageSeverity, classColors } from "@/lib/api"

const medicalAdvice: Record<string, { analysis: string, precautions: string[], diet: string[], recommendations: string[] }> = {
    "Non Demented": {
        analysis: "The MRI scan indicates normal brain volume and structure typical for the patient's age. No significant cortical atrophy or ventricular enlargement associated with Alzheimer's disease was detected.",
        precautions: [
            "Maintain regular physical exercise to promote cardiovascular and brain health.",
            "Engage in mentally stimulating activities (e.g., puzzles, reading, learning new skills).",
            "Ensure adequate sleep (7-8 hours per night) to support cognitive function."
        ],
        diet: [
            "Follow a Mediterranean or MIND diet rich in leafy greens, berries, nuts, and whole grains.",
            "Consume omega-3 fatty acids from fish (like salmon) or supplements.",
            "Limit intake of saturated fats, processed foods, and refined sugars."
        ],
        recommendations: [
            "Routine health check-ups and monitoring.",
            "Maintain active social engagement.",
            "Re-evaluate if any memory concerns arise."
        ]
    },
    "Very Mild Dementia": {
        analysis: "The MRI scan shows subtle signs of early cerebral changes, potentially including mild hippocampal atrophy. These findings may correlate with subjective memory complaints but do not severely impact daily functioning.",
        precautions: [
            "Consult a neurologist for a comprehensive cognitive assessment.",
            "Establish a consistent daily routine to minimize confusion.",
            "Organize important items (keys, wallet) in designated places."
        ],
        diet: [
            "Strict adherence to the MIND diet (Mediterranean-DASH Intervention for Neurodegenerative Delay).",
            "Increase intake of antioxidants (berries, dark chocolate, spinach).",
            "Stay hydrated and avoid excessive alcohol consumption."
        ],
        recommendations: [
            "Consider joining a support group for early-stage memory loss.",
            "Keep a diary to track memory lapses and share with healthcare providers.",
            "Schedule a follow-up MRI in 6-12 months as advised by a physician."
        ]
    },
    "Mild Dementia": {
        analysis: "The MRI scan reveals noticeable cortical atrophy and enlargement of the ventricles. There is evidence of volume loss in the hippocampus and temporal lobes, consistent with a clinical diagnosis of mild Alzheimer's disease.",
        precautions: [
            "Supervision may be needed for complex tasks like managing finances or medication.",
            "Ensure home safety by removing tripping hazards and improving lighting.",
            "Consider medical alert systems or GPS tracking devices if wandering is a concern."
        ],
        diet: [
            "Nutrient-dense meals divided into smaller, frequent portions if appetite decreases.",
            "Focus on foods high in Vitamin E and Omega-3s.",
            "Ensure adequate water intake, as the sensation of thirst may diminish."
        ],
        recommendations: [
            "Immediate consultation with a neurologist for potential pharmacological interventions.",
            "Engage in structured occupational therapy.",
            "Family members should begin planning for future care and legal/financial matters."
        ]
    },
    "Moderate Dementia": {
        analysis: "The MRI scan demonstrates significant global cerebral atrophy, severe hippocampal volume loss, and pronounced ventricular dilation. These structural changes are strongly indicative of moderate to advanced Alzheimer's disease.",
        precautions: [
            "Continuous supervision is required for daily activities and personal safety.",
            "Implement strict home safety measures, including locks on hazardous storage and preventing access to stoves.",
            "Establish a calm, quiet environment to reduce agitation and anxiety."
        ],
        diet: [
            "Provide soft, easy-to-swallow foods to prevent choking.",
            "Offer high-calorie, nutritious snacks and smoothies if weight loss is observed.",
            "Use adaptive eating utensils and contrast-colored plates to assist with meals."
        ],
        recommendations: [
            "Comprehensive care plan involving neurologists, geriatricians, and caregivers.",
            "Consider in-home nursing care or specialized memory care facilities.",
            "Focus on maximizing quality of life, comfort, and providing emotional support."
        ]
    }
}
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
            const [{ default: jsPDF }, htmlToImage] = await Promise.all([
                import("jspdf"),
                import("html-to-image"),
            ])

            const element = document.getElementById("pdf-report-content")
            if (!element) throw new Error("PDF content element not found")

            // Wait a moment to ensure images are loaded
            await new Promise(resolve => setTimeout(resolve, 500))

            const imgData = await htmlToImage.toJpeg(element, {
                quality: 0.95,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
                skipFonts: true,
                style: {
                    transform: "none",
                }
            })

            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth

            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight)
            pdf.save(`neuroscan-mri-report-${Date.now()}.pdf`)
        } catch (err) {
            console.error("PDF export failed:", err)
            alert(`PDF export failed: ${(err as Error).message || "Unknown error"}. Please try again.`)
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
        <div className="bg-gray-50 min-h-screen relative overflow-x-hidden">
            <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none opacity-0">
                <div id="pdf-report-content" className="w-[794px] h-[1123px] bg-white text-gray-900 flex flex-col box-border relative overflow-hidden font-sans">
                    {/* Header */}
                    <div className="bg-[#EE602C] text-white p-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-extrabold leading-none mb-2">NeuroScan AI</h1>
                            <p className="text-orange-100 text-base font-medium">Clinical MRI Analysis & Diagnostic Report</p>
                        </div>
                        <div className="text-right text-orange-100 text-sm font-medium">
                            <p>Generated on {new Date(result.timestamp).toLocaleString()}</p>
                            <p>Document ID: NS-{Date.now().toString().slice(-6)}</p>
                        </div>
                    </div>

                    {/* Main Content grid */}
                    <div className="flex-1 grid grid-cols-12 gap-8 p-10">
                        {/* Left Column (4/12) */}
                        <div className="col-span-4 flex flex-col gap-6">
                            {/* Image */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-3 border-b border-gray-200 bg-gray-100 text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                    <Brain size={14} className="text-[#EE602C]"/> Source MRI Scan
                                </div>
                                <div className="relative w-full aspect-square bg-black flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {imageUrl ? <img src={imageUrl} alt="MRI" className="object-contain w-full h-full" /> : <Brain size={48} className="text-white opacity-20" />}
                                </div>
                            </div>

                            {/* Scan Info */}
                            <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50 flex flex-col gap-4 shadow-sm">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Model Version</p>
                                    <p className="text-sm font-semibold text-gray-900">{result.modelVersion}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Inference Time</p>
                                    <p className="text-sm font-semibold text-gray-900">{result.inferenceTimeMs ? `${result.inferenceTimeMs} ms` : "< 100 ms"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Analysis Status</p>
                                    <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5"><CheckCircle2 size={14}/> Completed</p>
                                </div>
                            </div>

                            {/* Overall Confidence */}
                            <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-white shadow-sm mt-auto">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Overall Confidence</p>
                                <div className="text-5xl font-extrabold text-[#EE602C] mb-2">{Math.round(result.confidence * 100)}%</div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">AI Certainty Score</p>
                            </div>
                        </div>

                        {/* Right Column (8/12) */}
                        <div className="col-span-8 flex flex-col gap-6">
                            {/* Prediction */}
                            <div className="pb-5 border-b border-gray-100">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Primary AI Diagnosis</p>
                                <h2 className="text-4xl font-extrabold mb-3" style={{ color: severity?.color ?? "#0f172a" }}>
                                    {result.prediction}
                                </h2>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold"
                                     style={{ background: severity?.bg ?? "rgba(238,96,44,0.1)", color: severity?.color ?? "#EE602C" }}>
                                    <div className="w-2 h-2 rounded-full" style={{ background: severity?.color ?? "#EE602C" }} />
                                    {severity?.label ?? "Reviewed"}
                                </div>
                            </div>

                            {/* Probabilities */}
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Probability Distribution</p>
                                <div className="flex flex-col gap-3">
                                    {probEntries.sort((a, b) => b[1] - a[1]).map(([className, prob]) => {
                                        const pct = Math.round(prob * 100)
                                        const color = classColors[className] ?? "#EE602C"
                                        const isTop = result.prediction === className
                                        return (
                                            <div key={className} className="flex items-center gap-4">
                                                <div className={`w-36 text-xs ${isTop ? 'font-bold' : 'font-medium text-gray-600'} truncate`}>{className}</div>
                                                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                                                </div>
                                                <div className={`w-10 text-right text-xs ${isTop ? 'font-bold' : 'font-semibold text-gray-500'}`}>{pct}%</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Medical Advice */}
                            <div className="flex flex-col gap-5 mt-2 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                {(() => {
                                    const advice = medicalAdvice[result.prediction] || medicalAdvice["Non Demented"]
                                    return (
                                        <>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 mb-1.5 flex items-center gap-2">Detailed Analysis</h3>
                                                <p className="text-xs text-gray-600 leading-relaxed">{advice.analysis}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 mb-2">Precautions & Safety</h3>
                                                    <ul className="text-[11px] text-gray-600 space-y-2 list-disc pl-3">
                                                        {advice.precautions.map((p, i) => <li key={i}>{p}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 mb-2">Dietary Guidelines</h3>
                                                    <ul className="text-[11px] text-gray-600 space-y-2 list-disc pl-3">
                                                        {advice.diet.map((d, i) => <li key={i}>{d}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 mb-2">Clinical Recommendations</h3>
                                                <ul className="text-[11px] text-gray-600 space-y-2 list-disc pl-3">
                                                    {advice.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                                                </ul>
                                            </div>
                                        </>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto p-10 pt-0 flex flex-col gap-8">
                        {/* Disclaimer */}
                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3 items-start text-orange-800">
                            <AlertCircle size={18} className="shrink-0 mt-0.5 text-orange-600" />
                            <p className="text-[11px] leading-relaxed">
                                <strong>Clinical Disclaimer:</strong> This AI-generated analysis is intended strictly as a decision support tool and is NOT a definitive clinical diagnosis. Results must be independently verified by a qualified radiologist or neurologist before making any medical decisions or establishing care plans.
                            </p>
                        </div>

                        {/* Signature Block */}
                        <div className="flex justify-between items-end border-t border-gray-200 pt-6">
                            <div className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                Confidential Medical Document<br/>
                                NeuroScan AI Detection System
                            </div>
                            <div className="w-64 border-t border-gray-400 pt-2 text-center">
                                <p className="text-sm font-bold text-gray-900">Attending Physician / Neurologist</p>
                                <p className="text-xs text-gray-500 mt-0.5 font-medium">Signature & Date</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
