"use client";
import { Button } from "./button";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="w-full py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="rounded-[32px] bg-gradient-to-b from-[#FFA756] via-[#F68441] to-[#EE602C] p-px">
          <div className="rounded-[31px] bg-white px-8 py-16 md:px-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Start diagnosing faster with{" "}
              <span className="bg-gradient-to-b from-[#FFA756] to-[#EE602C] bg-clip-text text-transparent">
                NeuroScan AI
              </span>
            </h2>
            <p className="text-neutral-600 text-lg mb-10 max-w-2xl mx-auto">
              Upload your brain MRI and receive instant classification results with confidence scores across all stages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button as={Link} href="/upload" variant="orange" className="h-12 px-8 text-base">
                Start Analysis
              </Button>
              <Button as={Link} href="/#product" variant="secondary" className="h-12 px-8 text-base">
                See features
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
