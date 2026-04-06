/**
 * API Route: POST /api/predict
 * ─────────────────────────────────────────────────────────────────
 * Server-side proxy that forwards the MRI image to the FastAPI
 * backend. This solves the HTTPS → HTTP mixed-content issue when
 * the frontend is hosted on Vercel (HTTPS) but the backend runs
 * on a plain HTTP DigitalOcean droplet.
 *
 * Browser → Vercel (HTTPS) → DigitalOcean (HTTP) → Response
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()

        // Forward the request to the FastAPI backend
        const backendResponse = await fetch(`${BACKEND_URL}/predict`, {
            method: "POST",
            body: formData,
        })

        const data = await backendResponse.json()

        return NextResponse.json(data, { status: backendResponse.status })
    } catch (error) {
        console.error("[API Proxy] Error forwarding to backend:", error)
        return NextResponse.json(
            { detail: { error: "Cannot connect to the analysis server." } },
            { status: 502 }
        )
    }
}
