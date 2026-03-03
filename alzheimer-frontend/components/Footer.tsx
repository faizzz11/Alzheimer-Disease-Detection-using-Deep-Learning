import Link from "next/link"
import { Brain, Github, Linkedin, Twitter } from "lucide-react"

/**
 * Footer — mirrors dataweb's footer structure with diagonal stripe pattern.
 */
export default function Footer() {
    return (
        <footer
            style={{
                width: "100%",
                background: "#fff",
                borderTop: "1px solid rgba(15,23,42,0.08)",
                paddingTop: "48px",
            }}
        >
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr",
                        gap: "48px",
                        paddingBottom: "48px",
                    }}
                    className="grid-footer"
                >
                    {/* Brand */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "10px",
                                    background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Brain size={20} color="white" strokeWidth={1.8} />
                            </div>
                            <span
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontWeight: 700,
                                    fontSize: "18px",
                                    color: "#0A1628",
                                }}
                            >
                                NeuroScan <span style={{ color: "#0077B6" }}>AI</span>
                            </span>
                        </div>
                        <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", maxWidth: "280px" }}>
                            AI-powered Alzheimer's Disease Detection using MRI brain images. Final year BE Computer Engineering project.
                        </p>
                        <div style={{ display: "flex", gap: "12px" }}>
                            {[Github, Linkedin, Twitter].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "8px",
                                        border: "1px solid rgba(15,23,42,0.10)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#64748b",
                                        transition: "all 0.15s ease",
                                        textDecoration: "none",
                                    }}
                                >
                                    <Icon size={15} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Project */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Project
                        </div>
                        {["About", "Disease Info", "Analyze MRI", "Results"].map((item) => (
                            <Link
                                key={item}
                                href="/"
                                style={{ fontSize: "14px", color: "#475569", textDecoration: "none", transition: "color 0.15s ease" }}
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    {/* Stages */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Dementia Stages
                        </div>
                        {["Non Demented", "Very Mild", "Mild Dementia", "Moderate"].map((item) => (
                            <span key={item} style={{ fontSize: "14px", color: "#475569" }}>
                                {item}
                            </span>
                        ))}
                    </div>

                    {/* Team */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Tech Stack
                        </div>
                        {["Next.js", "PyTorch", "FastAPI", "ResNet-50"].map((item) => (
                            <span key={item} style={{ fontSize: "14px", color: "#475569" }}>
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom stripe (dataweb-style diagonal pattern) */}
            <div
                style={{
                    height: "44px",
                    position: "relative",
                    overflow: "hidden",
                    borderTop: "1px solid rgba(15,23,42,0.06)",
                    borderBottom: "1px solid rgba(15,23,42,0.06)",
                    background: "#f8fafc",
                }}
            >
                {/* diagonal stripes */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: "repeating-linear-gradient(-45deg, rgba(0,119,182,0.05) 0px, rgba(0,119,182,0.05) 1px, transparent 1px, transparent 18px)",
                    }}
                />
                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                        © {new Date().getFullYear()} NeuroScan AI — BE Final Year Project · Computer Engineering
                    </p>
                </div>
            </div>
        </footer>
    )
}
