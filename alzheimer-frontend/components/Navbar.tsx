"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Brain } from "lucide-react"

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#about", label: "About" },
    { href: "/#disease", label: "Disease Info" },
    { href: "/upload", label: "Analyze MRI" },
]

/**
 * Navbar — sticky translucent nav following the dataweb pill-navbar pattern.
 */
export default function Navbar() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <nav className="navbar">
            {/* Inner layout: logo + links */}
            <div
                style={{
                    width: "100%",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 24px",
                }}
            >
                {/* Logo */}
                <Link
                    href="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        textDecoration: "none",
                    }}
                >
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
                            letterSpacing: "-0.02em",
                        }}
                    >
                        NeuroScan <span style={{ color: "#0077B6" }}>AI</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}
                    className="hidden md:flex"
                >
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: isActive ? "#0077B6" : "#334155",
                                    textDecoration: "none",
                                    borderRadius: "8px",
                                    background: isActive ? "rgba(0,119,182,0.07)" : "transparent",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {link.label}
                            </Link>
                        )
                    })}

                    <Link href="/upload" className="btn-primary" style={{ marginLeft: "12px", padding: "10px 22px", fontSize: "14px" }}>
                        Start Analysis
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        color: "#334155",
                    }}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "64px",
                        left: "16px",
                        right: "16px",
                        background: "white",
                        borderRadius: "16px",
                        border: "1px solid rgba(15,23,42,0.10)",
                        boxShadow: "0px 8px 24px rgba(0,0,0,0.10)",
                        padding: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        zIndex: 200,
                    }}
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            style={{
                                padding: "12px 16px",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#334155",
                                textDecoration: "none",
                                borderRadius: "10px",
                                transition: "background 0.15s ease",
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="/upload"
                        onClick={() => setMobileOpen(false)}
                        style={{
                            marginTop: "8px",
                            padding: "12px 16px",
                            background: "#0077B6",
                            color: "white",
                            borderRadius: "10px",
                            fontSize: "14px",
                            fontWeight: 600,
                            textAlign: "center",
                            textDecoration: "none",
                        }}
                    >
                        Start Analysis
                    </Link>
                </div>
            )}
        </nav>
    )
}
