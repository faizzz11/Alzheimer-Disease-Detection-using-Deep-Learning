import type { Metadata } from "next";
import CTA from "@/components/cta";
import { FAQ } from "@/components/faq";
import { Features } from "@/components/features";
import { Features2 } from "@/components/features2";
import Features3 from "@/components/features3";
import { Hero } from "@/components/hero";
import { LogoCloud } from "@/components/logos-cloud";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "NeuroScan AI — Alzheimer's MRI Detection",
  description:
    "AI-powered Alzheimer's Disease Detection using MRI Brain Images. Upload a scan and get instant classification with confidence scores.",
};

export default function Home() {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
      <LogoCloud />
      <Features />
      <Features2 />
      <Features3 />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
