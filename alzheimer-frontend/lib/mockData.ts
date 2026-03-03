/**
 * lib/mockData.ts
 * ─────────────────────────────────────────────────────────────────
 * Mock prediction data used during frontend-only development.
 *
 * 🔌 FUTURE INTEGRATION:
 *   - Replace `getMockPrediction()` with a real `fetch('/api/predict', ...)`
 *   - The `PredictionResult` interface is designed to match the FastAPI response shape
 *   - Session storage is already wired; just swap the data source
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
}

/**
 * Simulates an async API call with a delay.
 * Randomly selects from a set of realistic mock responses.
 */
export async function getMockPrediction(): Promise<PredictionResult> {
    // Simulate network + model inference latency
    await new Promise((resolve) => setTimeout(resolve, 2400))

    const scenarios: PredictionResult[] = [
        {
            prediction: "Mild Dementia",
            confidence: 0.87,
            probabilities: {
                "Non Demented": 0.05,
                "Very Mild Dementia": 0.08,
                "Mild Dementia": 0.87,
                "Moderate Dementia": 0.00,
            },
            timestamp: new Date().toISOString(),
            modelVersion: "v2.1.0-ResNet50",
        },
        {
            prediction: "Very Mild Dementia",
            confidence: 0.79,
            probabilities: {
                "Non Demented": 0.10,
                "Very Mild Dementia": 0.79,
                "Mild Dementia": 0.09,
                "Moderate Dementia": 0.02,
            },
            timestamp: new Date().toISOString(),
            modelVersion: "v2.1.0-ResNet50",
        },
        {
            prediction: "Non Demented",
            confidence: 0.94,
            probabilities: {
                "Non Demented": 0.94,
                "Very Mild Dementia": 0.04,
                "Mild Dementia": 0.01,
                "Moderate Dementia": 0.01,
            },
            timestamp: new Date().toISOString(),
            modelVersion: "v2.1.0-ResNet50",
        },
        {
            prediction: "Moderate Dementia",
            confidence: 0.81,
            probabilities: {
                "Non Demented": 0.02,
                "Very Mild Dementia": 0.08,
                "Mild Dementia": 0.09,
                "Moderate Dementia": 0.81,
            },
            timestamp: new Date().toISOString(),
            modelVersion: "v2.1.0-ResNet50",
        },
    ]

    return scenarios[Math.floor(Math.random() * scenarios.length)]
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
    "Non Demented": "#16a34a",
    "Very Mild Dementia": "#d97706",
    "Mild Dementia": "#ea580c",
    "Moderate Dementia": "#dc2626",
}
