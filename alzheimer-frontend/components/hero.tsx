"use client";
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Balancer from "react-wrap-balancer";
import Link from "next/link";
import { Button } from "./button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { IphoneMockup } from "./iphone-mockup";

export function Hero() {
  const parentRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  return (
    <div
      ref={parentRef}
      className="relative flex max-w-7xl rounded-b-3xl my-2 md:my-20 mx-auto flex-col items-center justify-center pt-32 overflow-hidden px-4 md:px-8 bg-gradient-to-t from-[rgba(247,135,67,1)] via-[rgba(255,244,239,1)] to-[rgba(255,255,255,1)]"
    >
      <div className="text-balance relative z-20 mx-auto mb-4 max-w-6xl text-center text-4xl font-semibold tracking-tight text-gray-700 md:text-7xl">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cn(
            "inline-block bg-gradient-to-b from-[rgba(94,94,94,1)] to-[rgba(0,0,0,1)]",
            "bg-clip-text text-transparent"
          )}
        >
          <Balancer>
            AI-Powered{" "}
            <span className="bg-gradient-to-b from-[rgba(255,167,86,1)] to-[rgba(238,96,44,1)] bg-clip-text text-transparent">
              Alzheimer&apos;s
            </span>
          </Balancer>
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cn(
            "inline-block bg-gradient-to-b from-[rgba(94,94,94,1)] to-[rgba(0,0,0,1)]",
            "bg-clip-text text-transparent py-2"
          )}
        >
          <Balancer>
            Disease{" "}
            <span className="bg-gradient-to-b from-[rgba(255,167,86,1)] to-[rgba(238,96,44,1)] bg-clip-text text-transparent">
              Detection
            </span>
          </Balancer>
        </motion.h2>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.5 }}
        className="relative z-20 mx-auto mt-4 max-w-2xl px-4 text-center text-base/6 text-gray-600 sm:text-base"
      >
        NeuroScan AI provides early detection of Alzheimer&apos;s through advanced deep learning and rapid MRI analysis, offering high accuracy and clinical-grade results.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.7 }}
        className="mb-8 mt-6 z-10 sm:mb-10 sm:mt-8 flex w-full flex-col items-center justify-center gap-4 px-4 sm:px-8 sm:flex-row md:mb-20"
      >
        <Button
          as={Link}
          href="/upload"
          variant="primary"
          className="w-full sm:w-48 h-12 flex items-center justify-center"
        >
          Start Analysis
        </Button>
        <Button
          as={Link}
          href="#features"
          variant="outline"
          className="w-full sm:w-48 h-12 flex items-center justify-center"
        >
          Learn More
        </Button>
      </motion.div>

      <div className="pt-8 w-full min-h-84 relative">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute top-0 left-0 right-0 z-10"
        >
          <IphoneMockup>
            <MockScreen />
          </IphoneMockup>
        </motion.div>
        <BackgroundShape />
      </div>
    </div>
  );
}

function BackgroundShape() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const sizes = isMobile
    ? { outer: 800, middle: 600, inner: 400 }
    : { outer: 1400, middle: 1100, inner: 800 };

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center">
      <div
        className="absolute z-0 rounded-full border border-white/30"
        style={{ width: sizes.outer, height: sizes.outer }}
      />
      <motion.div
        className="absolute z-0 rounded-full border border-white"
        style={{
          width: sizes.middle,
          height: sizes.middle,
          background: `radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 20%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0) 60%)`,
        }}
        animate={{ scale: [1, 1.02, 1], y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={cn("absolute z-[2] rounded-full border border-[rgba(255,255,255,0.1)] bg-white/5", "shadow-[0_0_200px_80px_rgba(255,255,255,0.1)]")}
        style={{ width: sizes.inner, height: sizes.inner }}
        animate={{ scale: [1, 1.03, 1], y: [0, -7, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

const MockScreen = () => (
  <div className="flex w-full flex-col items-center">
    <div className="flex justify-between w-full p-2 gap-2">
      <div className="flex gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Analysis History</span>
      </div>
    </div>

    <div className="w-full px-2 py-3">
      <div className="bg-[#FAF0E6] rounded-xl p-2 w-full">
        <div className="flex justify-between items-start">
          <h3 className="text-[#5D4037] text-md font-medium">Patient MRI - #0012</h3>
        </div>
        <p className="text-[#7B6B63] text-xs mt-1">Today, 10:42 AM</p>
        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs font-semibold text-[#5D4037]">Non Demented</span>
            <span className="text-xs text-[#7B6B63]">Confidence: 98%</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#E6D5CC] text-sm text-[#7B6B63]">Verified</span>
        </div>
      </div>
    </div>

    <div className="w-full px-2 py-3">
      <div className="bg-[#D3E7FF] rounded-xl p-2 w-full">
        <div className="flex justify-between items-start">
          <h3 className="text-[#5D4037] text-md font-medium">Patient MRI - #0011</h3>
        </div>
        <p className="text-[#7B6B63] text-xs mt-1">Yesterday, 3:15 PM</p>
        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs font-semibold text-[#5D4037]">Mild Dementia</span>
            <span className="text-xs text-[#7B6B63]">Confidence: 92%</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#E6D5CC] text-sm text-[#7B6B63]">Flagged</span>
        </div>
      </div>
    </div>
  </div>
);
