import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "NeuroScan AI — Alzheimer's MRI Detection",
  description:
    "AI-powered Alzheimer's Disease Detection using MRI Brain Images. Upload a scan and get instant classification with confidence scores.",
  keywords: [
    "Alzheimer detection",
    "MRI brain scan",
    "deep learning",
    "medical AI",
    "dementia classification",
  ],
  authors: [{ name: "NeuroScan AI Team" }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
