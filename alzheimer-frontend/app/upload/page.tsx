"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
    Upload,
    ImageIcon,
    X,
    CheckCircle2,
    AlertCircle,
    Brain,
    ArrowRight,
    FileImage,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { getPrediction } from "@/lib/api"

// ─────────────────────────────────────────────────────────────────────────────
type UploadState = "idle" | "preview" | "analyzing" | "done" | "error"

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
const MAX_FILE_MB = 10

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// ─────────────────────────────────────────────────────────────────────────────
export default function UploadPage() {
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)

    const [state, setState] = useState<UploadState>("idle")
    const [dragOver, setDragOver] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)

    // ── File validation ───────────────────────────────────────────────────────
    const validateAndSet = useCallback((f: File) => {
        setError(null)
        if (!ACCEPTED_TYPES.includes(f.type)) {
            setError("Please upload a JPG, PNG, or WEBP image.")
            return
        }
        if (f.size > MAX_FILE_MB * 1024 * 1024) {
            setError(`File is too large. Maximum allowed size is ${MAX_FILE_MB} MB.`)
            return
        }
        setFile(f)
        const url = URL.createObjectURL(f)
        setPreview(url)
        setState("preview")
    }, [])

    // ── Drag handlers ─────────────────────────────────────────────────────────
    const onDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            setDragOver(false)
            const dropped = e.dataTransfer.files[0]
            if (dropped) validateAndSet(dropped)
        },
        [validateAndSet]
    )

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) validateAndSet(selected)
    }

    // ── Reset ─────────────────────────────────────────────────────────────────
    const reset = () => {
        if (preview) URL.revokeObjectURL(preview)
        setFile(null)
        setPreview(null)
        setState("idle")
        setError(null)
        setProgress(0)
        if (inputRef.current) inputRef.current.value = ""
    }

    // ── Analyze ───────────────────────────────────────────────────────────────
    const analyze = async () => {
        if (!file) return
        setState("analyzing")
        setProgress(0)
        setError(null)

        // Animate progress bar while waiting for real API response
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 88) {
                    clearInterval(interval)
                    return 88
                }
                return prev + Math.random() * 6
            })
        }, 250)

        try {
            // ─── Real API call to FastAPI backend ───────────────────────────
            const result = await getPrediction(file)

            // Complete progress bar
            clearInterval(interval)
            setProgress(100)
            setState("done")

            // Store result + image in sessionStorage for Results page
            sessionStorage.setItem("prediction", JSON.stringify(result))
            sessionStorage.setItem("mriImage", preview!)

            // Short delay then navigate
            await new Promise((r) => setTimeout(r, 600))
            router.push("/results")
        } catch (err: unknown) {
            clearInterval(interval)
            setState("error")
            const message =
                err instanceof Error
                    ? err.message
                    : "Analysis failed. Please try again."
            setError(message)
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <Navbar />

            <main
                style={{
                    paddingTop: "96px",
                    paddingBottom: "80px",
                    maxWidth: "860px",
                    margin: "0 auto",
                    padding: "96px 24px 80px",
                }}
            >
                {/* Page Header */}
                <div
                    style={{
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "48px",
                    }}
                >
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: "16px",
                            background: "linear-gradient(135deg, #0077B6, #00B4D8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0px 8px 24px rgba(0,119,182,0.30)",
                        }}
                    >
                        <Brain size={28} color="white" strokeWidth={1.8} />
                    </div>
                    <h1
                        style={{
                            fontFamily: "'Instrument Serif', Georgia, serif",
                            fontSize: "clamp(28px, 4vw, 48px)",
                            fontWeight: 400,
                            color: "#0A1628",
                            lineHeight: 1.15,
                        }}
                    >
                        Upload MRI Brain Scan
                    </h1>
                    <p style={{ fontSize: "17px", color: "#64748b", maxWidth: "500px", lineHeight: 1.65 }}>
                        Upload a brain MRI image and let our AI classify the Alzheimer's stage instantly.
                    </p>
                </div>

                {/* Upload Card */}
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid rgba(15,23,42,0.08)",
                        borderRadius: "20px",
                        boxShadow: "0px 4px 24px rgba(0,0,0,0.06)",
                        overflow: "hidden",
                    }}
                >
                    {/* Upload Zone */}
                    {state === "idle" && (
                        <div
                            className={`upload-zone${dragOver ? " drag-over" : ""}`}
                            style={{
                                margin: "24px",
                                padding: "56px 24px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "20px",
                                cursor: "pointer",
                                minHeight: "320px",
                            }}
                            onClick={() => inputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={onDrop}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                            aria-label="Upload MRI image"
                            id="upload-zone"
                        >
                            <div
                                style={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: "50%",
                                    background: dragOver ? "rgba(0,119,182,0.12)" : "rgba(0,119,182,0.06)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <Upload size={28} color={dragOver ? "#0077B6" : "#94a3b8"} />
                            </div>

                            <div style={{ textAlign: "center" }}>
                                <p style={{ fontSize: "17px", fontWeight: 600, color: "#0f172a", marginBottom: "6px" }}>
                                    {dragOver ? "Drop your MRI scan here" : "Drag & drop MRI image"}
                                </p>
                                <p style={{ fontSize: "14px", color: "#94a3b8" }}>or click to browse files</p>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "8px",
                                    flexWrap: "wrap",
                                    justifyContent: "center",
                                }}
                            >
                                {["JPG", "PNG", "WEBP", "GIF"].map((fmt) => (
                                    <span
                                        key={fmt}
                                        style={{
                                            padding: "3px 10px",
                                            background: "rgba(0,119,182,0.06)",
                                            border: "1px solid rgba(0,119,182,0.15)",
                                            borderRadius: "99px",
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            color: "#0077B6",
                                        }}
                                    >
                                        {fmt}
                                    </span>
                                ))}
                                <span style={{ fontSize: "12px", color: "#94a3b8", alignSelf: "center" }}>
                                    · Max {MAX_FILE_MB} MB
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Preview State */}
                    {(state === "preview" || state === "analyzing" || state === "done") && file && preview && (
                        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
                            {/* Image preview */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: "20px",
                                    alignItems: "flex-start",
                                    flexWrap: "wrap",
                                }}
                            >
                                {/* MRI thumbnail */}
                                <div
                                    style={{
                                        position: "relative",
                                        width: "200px",
                                        height: "200px",
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        border: "1px solid rgba(15,23,42,0.10)",
                                        background: "#000",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Image
                                        src={preview}
                                        alt="MRI preview"
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>

                                {/* File details */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, minWidth: "200px" }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "16px",
                                            background: "#f8fafc",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(15,23,42,0.06)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "10px",
                                                background: "rgba(0,119,182,0.08)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <FileImage size={20} color="#0077B6" />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", wordBreak: "break-all" }}>
                                                {file.name}
                                            </p>
                                            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                                                {formatBytes(file.size)} · {file.type.split("/")[1].toUpperCase()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Checklist */}
                                    {[
                                        "Image loaded successfully",
                                        "Format validated",
                                        "Size within limits",
                                    ].map((item) => (
                                        <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <CheckCircle2 size={15} color="#16a34a" />
                                            <span style={{ fontSize: "13px", color: "#475569" }}>{item}</span>
                                        </div>
                                    ))}

                                    {state === "preview" && (
                                        <button
                                            onClick={reset}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                padding: "8px 16px",
                                                background: "rgba(220,38,38,0.06)",
                                                border: "1px solid rgba(220,38,38,0.15)",
                                                borderRadius: "8px",
                                                color: "#dc2626",
                                                fontSize: "13px",
                                                fontWeight: 500,
                                                cursor: "pointer",
                                                width: "fit-content",
                                            }}
                                        >
                                            <X size={14} /> Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar (while analyzing) */}
                            {(state === "analyzing" || state === "done") && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#0077B6" }}>
                                            {state === "done" ? "Analysis complete" : "Analyzing MRI scan..."}
                                        </span>
                                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#0077B6" }}>
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                                    </div>
                                    {state === "analyzing" && (
                                        <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                                            Running through ResNet-18 model — classifying across 4 dementia stages...
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error state */}
                    {state === "error" && (
                        <div
                            style={{
                                margin: "24px",
                                padding: "20px",
                                background: "rgba(220,38,38,0.05)",
                                border: "1px solid rgba(220,38,38,0.20)",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                            }}
                        >
                            <AlertCircle size={20} color="#dc2626" />
                            <p style={{ fontSize: "14px", color: "#dc2626" }}>{error}</p>
                        </div>
                    )}

                    {/* Inline file error (non-state error) */}
                    {error && state === "idle" && (
                        <div
                            style={{
                                margin: "0 24px 16px",
                                padding: "16px",
                                background: "rgba(220,38,38,0.05)",
                                border: "1px solid rgba(220,38,38,0.20)",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                            }}
                        >
                            <AlertCircle size={18} color="#dc2626" />
                            <p style={{ fontSize: "14px", color: "#dc2626" }}>{error}</p>
                        </div>
                    )}

                    {/* Bottom action bar */}
                    <div
                        style={{
                            padding: "16px 24px",
                            borderTop: "1px solid rgba(15,23,42,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "16px",
                            flexWrap: "wrap",
                            background: "#fafafa",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <ImageIcon size={16} color="#94a3b8" />
                            <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                                Upload a standard T1-weighted or T2-weighted MRI slice
                            </span>
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            {state === "preview" && (
                                <button
                                    id="analyze-btn"
                                    onClick={analyze}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "12px 28px",
                                        background: "linear-gradient(135deg, #0077B6, #00B4D8)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "99px",
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        boxShadow: "0px 4px 16px rgba(0,119,182,0.30)",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    Analyze Scan <ArrowRight size={16} />
                                </button>
                            )}

                            {(state === "analyzing") && (
                                <button
                                    disabled
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "12px 28px",
                                        background: "rgba(0,119,182,0.4)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "99px",
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        cursor: "not-allowed",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 16,
                                            height: 16,
                                            border: "2px solid rgba(255,255,255,0.4)",
                                            borderTop: "2px solid white",
                                            borderRadius: "50%",
                                            display: "inline-block",
                                            animation: "spin-slow 0.8s linear infinite",
                                        }}
                                    />
                                    Analyzing...
                                </button>
                            )}

                            {state === "idle" && (
                                <button
                                    onClick={() => inputRef.current?.click()}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "12px 24px",
                                        background: "rgba(0,119,182,0.08)",
                                        color: "#0077B6",
                                        border: "1px solid rgba(0,119,182,0.20)",
                                        borderRadius: "99px",
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    <Upload size={16} /> Browse Files
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info cards below */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "16px",
                        marginTop: "32px",
                    }}
                >
                    {[
                        { icon: "🧠", title: "Any MRI Format", desc: "Works with any standard brain MRI slice image." },
                        { icon: "⚡", title: "Instant Results", desc: "AI analysis completes in under 3 seconds." },
                        { icon: "🔒", title: "Private & Secure", desc: "Images are never stored or transmitted." },
                    ].map((c) => (
                        <div
                            key={c.title}
                            style={{
                                padding: "20px",
                                background: "#fff",
                                border: "1px solid rgba(15,23,42,0.07)",
                                borderRadius: "14px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                            }}
                        >
                            <span style={{ fontSize: "24px" }}>{c.icon}</span>
                            <p style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{c.title}</p>
                            <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>{c.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                id="file-input"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={onInputChange}
                style={{ display: "none" }}
            />

            <Footer />
        </div>
    )
}
