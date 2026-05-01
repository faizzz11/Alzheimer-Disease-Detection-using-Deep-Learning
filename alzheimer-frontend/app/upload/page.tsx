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
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/button"
import { getPrediction } from "@/lib/api"

type UploadState = "idle" | "preview" | "analyzing" | "done" | "error"

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
const MAX_FILE_MB = 10

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function UploadPage() {
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)

    const [state, setState] = useState<UploadState>("idle")
    const [dragOver, setDragOver] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)

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

    const reset = () => {
        if (preview) URL.revokeObjectURL(preview)
        setFile(null)
        setPreview(null)
        setState("idle")
        setError(null)
        setProgress(0)
        if (inputRef.current) inputRef.current.value = ""
    }

    const analyze = async () => {
        if (!file) return
        setState("analyzing")
        setProgress(0)
        setError(null)

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
            const result = await getPrediction(file)
            clearInterval(interval)
            setProgress(100)
            setState("done")
            sessionStorage.setItem("prediction", JSON.stringify(result))
            sessionStorage.setItem("mriImage", preview!)
            await new Promise((r) => setTimeout(r, 600))
            router.push("/results")
        } catch (err: unknown) {
            clearInterval(interval)
            setState("error")
            const message = err instanceof Error ? err.message : "Analysis failed. Please try again."
            setError(message)
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />

            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <div className="flex flex-col items-center gap-4 text-center mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFA756] to-[#EE602C] flex items-center justify-center shadow-lg">
                        <Brain size={32} color="white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4">
                        Upload MRI Brain Scan
                    </h1>
                    <p className="text-lg text-gray-500 max-w-xl">
                        Upload a brain MRI image and let our AI classify the Alzheimer&apos;s stage instantly.
                    </p>
                </div>

                <div className="bg-white border text-center border-gray-200 rounded-3xl shadow-sm overflow-hidden mb-12">
                    {state === "idle" && (
                        <div
                            className={`m-6 p-14 flex flex-col items-center justify-center gap-5 cursor-pointer rounded-2xl border-2 border-dashed transition-all ${dragOver ? "border-[#EE602C] bg-orange-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                            onClick={() => inputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={onDrop}
                            role="button"
                            tabIndex={0}
                        >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${dragOver ? "bg-orange-100" : "bg-gray-100"}`}>
                                <Upload size={32} className={dragOver ? "text-[#EE602C]" : "text-gray-400"} />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-900 mb-1">
                                    {dragOver ? "Drop your MRI scan here" : "Drag & drop MRI image"}
                                </p>
                                <p className="text-sm text-gray-500">or click to browse files</p>
                            </div>
                            <div className="flex gap-2 flex-wrap justify-center mt-2">
                                {["JPG", "PNG", "WEBP", "GIF"].map((fmt) => (
                                    <span key={fmt} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                        {fmt}
                                    </span>
                                ))}
                                <span className="text-xs text-gray-400 self-center ml-2">· Max {MAX_FILE_MB} MB</span>
                            </div>
                        </div>
                    )}

                    {(state === "preview" || state === "analyzing" || state === "done") && file && preview && (
                        <div className="p-8 flex flex-col gap-8">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="relative w-full md:w-56 h-56 rounded-2xl overflow-hidden border border-gray-200 bg-black shrink-0">
                                    <Image src={preview} alt="MRI preview" fill className="object-cover" />
                                </div>
                                <div className="flex flex-col gap-4 flex-1 w-full text-left">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                                            <FileImage size={24} className="text-[#EE602C]" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatBytes(file.size)} · {file.type.split("/")[1].toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {["Image loaded successfully", "Format validated", "Size within limits"].map((item) => (
                                            <div key={item} className="flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-green-500" />
                                                <span className="text-sm text-gray-600">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {state === "preview" && (
                                        <button onClick={reset} className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 w-max mt-2 transition-colors">
                                            <X size={16} /> Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            {(state === "analyzing" || state === "done") && (
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-[#EE602C]">
                                            {state === "done" ? "Analysis complete" : "Analyzing MRI scan..."}
                                        </span>
                                        <span className="text-sm font-bold text-[#EE602C]">
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div className="bg-gradient-to-r from-[#FFA756] to-[#EE602C] h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                                    </div>
                                    {state === "analyzing" && (
                                        <p className="text-sm text-gray-500 text-left">
                                            Running through ResNet-50 model — classifying across 4 dementia stages...
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {state === "error" && (
                        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                            <AlertCircle size={20} className="text-red-600" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {error && state === "idle" && (
                        <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                            <AlertCircle size={18} className="text-red-600" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="p-4 px-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <ImageIcon size={18} className="text-gray-400" />
                            <span className="text-sm text-gray-500">Upload a standard T1-weighted or T2-weighted MRI slice</span>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            {state === "preview" && (
                                <Button onClick={analyze} variant="primary" className="w-full sm:w-auto">
                                    Analyze Scan <ArrowRight size={16} className="ml-2" />
                                </Button>
                            )}
                            {state === "analyzing" && (
                                <Button disabled variant="primary" className="w-full sm:w-auto opacity-70 cursor-not-allowed">
                                    Analyzing...
                                </Button>
                            )}
                            {state === "idle" && (
                                <Button onClick={() => inputRef.current?.click()} variant="secondary" className="w-full sm:w-auto">
                                    <Upload size={16} className="mr-2" /> Browse Files
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { icon: "🧠", title: "Any MRI Format", desc: "Works with any standard brain MRI slice image." },
                        { icon: "⚡", title: "Instant Results", desc: "AI analysis completes in under 3 seconds." },
                        { icon: "🔒", title: "Private & Secure", desc: "Images are never stored or transmitted." },
                    ].map((c) => (
                        <div key={c.title} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm text-center sm:text-left">
                            <span className="text-3xl mb-4 block">{c.icon}</span>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{c.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <input
                ref={inputRef}
                type="file"
                id="file-input"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={onInputChange}
                className="hidden"
            />
            <Footer />
        </div>
    )
}
