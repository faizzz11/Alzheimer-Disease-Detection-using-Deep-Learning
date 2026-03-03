/**
 * lib/api.ts
 * ─────────────────────────────────────────────────────────────────
 * Real API client for the FastAPI backend.
 *
 * Replaces getMockPrediction() with a proper multipart/form-data
 * POST request to http://localhost:8000/predict.
 *
 * The PredictionResult interface is kept compatible with the old
 * mock shape so the Results page needs zero changes to its data
 * access patterns.
 * ─────────────────────────────────────────────────────────────────
 */

export interface PredictionResult {
    prediction: string
    confidence: number
    probabilities: {
        "Non Demented": number
        "Very Mild Dementia": number
        "Mild Dementia": number
        "Moderate Dementia": number
    }
    timestamp: string
    modelVersion: string
    inferenceTimeMs?: number
}

// Backend base URL — update this if deploying remotely
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

/**
 * Send the MRI image file to the FastAPI backend and return the
 * classification result.
 *
 * Throws an Error with a user-friendly message if:
 *   - The network is unreachable (backend not running)
 *   - The backend returns a validation error (non-MRI image, wrong format)
 *   - Any other HTTP error
 */
export async function getPrediction(file: File): Promise<PredictionResult> {
    const formData = new FormData()
    formData.append("file", file)

    let response: Response
    try {
        response = await fetch(`${API_BASE}/predict`, {
            method: "POST",
            body: formData,
            // No Content-Type header — browser sets multipart/form-data boundary automatically
        })
    } catch (networkError) {
        // fetch() itself threw — backend probably not running
        throw new Error(
            "Cannot connect to the analysis server. " +
            "Please make sure the backend is running on http://localhost:8000"
        )
    }

    const data = await response.json()

    if (!response.ok) {
        // Backend returned an error (400, 422, etc.)
        const message =
            data?.detail?.error ??
            data?.detail ??
            data?.error ??
            `Server error (${response.status})`
        throw new Error(message)
    }

    // ── Normalise backend response → PredictionResult ────────────────────────
    // Backend keys use underscore_case; we map them to the frontend shape.
    return {
        prediction: data.prediction,
        confidence: data.confidence,
        probabilities: {
            "Non Demented":       data.probabilities["Non Demented"]       ?? 0,
            "Very Mild Dementia": data.probabilities["Very Mild Dementia"] ?? 0,
            "Mild Dementia":      data.probabilities["Mild Dementia"]      ?? 0,
            "Moderate Dementia":  data.probabilities["Moderate Dementia"]  ?? 0,
        },
        timestamp: data.timestamp,
        modelVersion: data.model_version ?? "v1.0.0-ResNet18",
        inferenceTimeMs: data.inference_time_ms,
    }
}

/**
 * Severity color map — used on the Results page for visual classification.
 */
export const stageSeverity: Record<string, { color: string; label: string; bg: string }> = {
    "Non Demented": {
        color: "#16a34a",
        label: "Normal",
        bg: "rgba(22,163,74,0.08)",
    },
    "Very Mild Dementia": {
        color: "#d97706",
        label: "Early Stage",
        bg: "rgba(217,119,6,0.08)",
    },
    "Mild Dementia": {
        color: "#ea580c",
        label: "Moderate Risk",
        bg: "rgba(234,88,12,0.08)",
    },
    "Moderate Dementia": {
        color: "#dc2626",
        label: "High Risk",
        bg: "rgba(220,38,38,0.08)",
    },
}

/**
 * Class probability bar colors.
 */
export const classColors: Record<string, string> = {
    "Non Demented":       "#16a34a",
    "Very Mild Dementia": "#d97706",
    "Mild Dementia":      "#ea580c",
    "Moderate Dementia":  "#dc2626",
}
