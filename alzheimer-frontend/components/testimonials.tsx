import { Check } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import Link from "next/link";

const features = [
  "Generate diagnostic reports from MRI scans",
  "Classify dementia stages with high precision",
  "Secure and private clinical workflow",
];

const avatarColors = [
  "from-orange-300 to-orange-500",
  "from-blue-300 to-blue-500",
  "from-purple-300 to-purple-500",
  "from-green-300 to-green-500",
  "from-pink-300 to-pink-500",
  "from-yellow-300 to-yellow-500",
  "from-red-300 to-red-500",
  "from-teal-300 to-teal-500",
];

export function Testimonials() {
  return (
    <section className="relative w-full py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-0 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 px-4">
            <h2 className="text-4xl font-semibold">
              <span className="text-[#FF6B2B]">What</span> clinicians say
            </h2>
            <p className="text-neutral-600 text-lg max-w-md">
              Medical professionals use NeuroScan AI to accelerate MRI analysis and improve patient care pathways.
            </p>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FF6B2B]/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#FF6B2B]" />
                  </div>
                  <span className="text-neutral-700">{feature}</span>
                </div>
              ))}
            </div>
            <Button as={Link} href="/upload" variant="orange" className="px-6 py-2.5 rounded-full">
              Start Free Analysis
            </Button>
          </div>

          <div className="relative h-[600px] overflow-hidden">
            <OrbitingAvatars />
            <div className="absolute inset-0 z-10 w-full h-full bg-gradient-to-l from-white via-white/50 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

const LightningIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6 text-[#FF6B2B]", className)} viewBox="0 0 49 67" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_di_neuroscan_testimonial)">
      <motion.path
        d="M37.6792 21.5018H29.1957C28.5839 21.5018 28.1155 20.9573 28.2069 20.3523L29.8985 9.16102C29.954 8.79514 29.9365 8.4203 29.8473 8.06263C29.758 7.70496 29.5991 7.37304 29.3817 7.08999C29.1643 6.80694 28.8935 6.57957 28.5883 6.42371C28.283 6.26785 27.9507 6.18724 27.6143 6.1875H15.6911C15.1436 6.18768 14.6139 6.4019 14.1961 6.7921C13.7783 7.18231 13.4995 7.72322 13.4092 8.31874L9.55125 33.8425C9.49578 34.2082 9.51322 34.5828 9.60233 34.9403C9.69145 35.2978 9.85012 35.6296 10.0673 35.9126C10.2845 36.1956 10.5549 36.423 10.8599 36.5791C11.1649 36.7351 11.497 36.816 11.8331 36.8161H20.0903C20.6426 36.8161 21.0903 37.2638 21.0903 37.8161V53.534C21.0903 54.5549 22.4401 54.9196 22.9542 54.0376L39.6278 25.435C39.8528 25.0493 39.9794 24.6038 39.9942 24.1455C40.0091 23.6871 39.9117 23.2328 39.7123 22.8303C39.5129 22.4278 39.2189 22.092 38.8611 21.8583C38.5033 21.6245 38.095 21.5013 37.6792 21.5018Z"
        fill="#D4611E"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
      />
    </g>
    <defs>
      <filter id="filter0_di_neuroscan_testimonial" x="0.519531" y="0.1875" width="48.4766" height="66.3482" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dy="3" />
        <feGaussianBlur stdDeviation="4.5" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
    </defs>
  </svg>
);

const OrbitingAvatars = () => {
  const orbitData = React.useMemo(() => {
    const radius = 180;
    const speed = 25;
    const iconCount = avatarColors.length;
    const angleStep = 360 / iconCount;
    const angles = Array.from({ length: iconCount }, (_, i) => angleStep * i);
    return angles.map((angle) => ({
      angle,
      animation: {
        initial: { rotate: angle, scale: 1, opacity: 1 },
        animate: { rotate: [angle, angle + 360], scale: 1, opacity: 1 },
        transition: { rotate: { duration: speed, repeat: Infinity, ease: "linear" as const } },
        counterRotation: {
          initial: { rotate: -angle },
          animate: { rotate: [-angle, -angle - 360] },
          transition: { duration: speed, repeat: Infinity, ease: "linear" as const },
        },
      },
    }));
  }, []);

  return (
    <div className="relative w-full h-full ml-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="p-4 overflow-hidden z-20 flex items-center justify-center rounded-[15px] border-[1.5px] border-[#F3F3F3] bg-gradient-to-br from-[#FBFBFB] via-[#FBFBFB] to-[#E8E8E8] shadow-[0px_20px_20px_0px_rgba(0,0,0,0.09)]">
          <LightningIcon className="w-12 h-12" />
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: 360, height: 360 }} />
        {orbitData.map((icon, iconIndex) => (
          <motion.div
            key={iconIndex}
            className="absolute"
            style={{ width: "40px", height: "40px", left: "calc(50% - 20px)", top: "calc(50% - 20px)", transformOrigin: "center center" }}
            initial={icon.animation.initial}
            animate={icon.animation.animate}
            transition={icon.animation.transition}
          >
            <div style={{ position: "absolute", left: `${180}px`, transformOrigin: "center center" }}>
              <motion.div
                initial={icon.animation.counterRotation.initial}
                animate={icon.animation.counterRotation.animate}
                transition={icon.animation.counterRotation.transition}
              >
                <div className={`w-[120px] h-[120px] overflow-hidden rounded-[133px] bg-gradient-to-br ${avatarColors[iconIndex]} shadow-[0px_7px_7px_0px_rgba(0,0,0,0.19)]`} />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
