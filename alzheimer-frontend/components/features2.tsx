"use client";

import { cn } from "@/lib/utils";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";
import {
  Brain,
  Scan,
  Activity,
  FileText,
  Database,
  Microscope,
  Cpu,
  ArrowLeftCircle
} from "lucide-react";
import { Logo, LogoIcon } from "./logo";

export function Features2() {
  return (
    <div id="product" className="w-full max-w-7xl mx-auto py-4 px-4 md:px-8 md:my-20 md:py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-bold mb-4">
          AI-Powered <span className="text-[#FF7757]">Medical Analysis</span>
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          A focused suite designed for clinical research and early detection.
        </p>
      </div>
      <div className="mt-20 grid cols-1 lg:grid-cols-5 gap-4 auto-rows-[25rem] max-w-3xl mx-auto lg:max-w-none">
        <Card className="flex relative flex-col justify-between lg:col-span-3">
          <div className="absolute inset-0"><MapView /></div>
          <div className="absolute z-10 inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-white via-white to-transparent" />
          <CardContent className="absolute z-10 bottom-0">
            <CardTitle>Accessible Anywhere</CardTitle>
            <CardDescription>Access our platform on any device, anywhere in the world.</CardDescription>
          </CardContent>
        </Card>
        <Card className="flex flex-col relative justify-between lg:col-span-2">
          <Chart />
          <div className="absolute z-10 inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-white via-white to-transparent" />
          <CardContent className="absolute z-10 bottom-0">
            <CardTitle>Detailed Reports</CardTitle>
            <CardDescription>Get detailed confidence breakdowns for all 4 dementia stages.</CardDescription>
          </CardContent>
        </Card>
        <Card className="flex flex-col relative justify-between lg:col-span-2 bg-transparent">
          <div className="absolute inset-0 flex items-center justify-center"><LogoOrbit /></div>
          <div className="absolute z-10 inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-white via-white to-transparent" />
          <CardContent className="absolute z-10 bottom-0">
            <CardTitle>Advanced ResNet-50 </CardTitle>
            <CardDescription>A robust architecture trained specifically on multi-planar MRI imaging.</CardDescription>
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-between lg:col-span-3">
          <CardSkeletonBody>
            <div className="w-full h-full p-4 rounded-lg px-2 md:px-10 mt-6">
              <DashboardCard />
            </div>
          </CardSkeletonBody>
          <CardContent className="h-40">
            <CardTitle>Medical-grade UI</CardTitle>
            <CardDescription>Clean, structured interface designed for clinical readability.</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const CardSkeletonBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("overflow-hidden relative w-full h-full", className)}>{children}</div>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("p-6", className)}>{children}</div>
);

const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn("inline-block text-[22px] font-[500] leading-[31px] text-black", className)}>{children}</h3>
);

const CardDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("font-sans max-w-sm text-sm font-normal tracking-tight mt-2 text-neutral-400", className)}>{children}</p>
);

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    whileHover="animate"
    className={cn("group relative isolate flex flex-col rounded-2xl !bg-[#F9FAFB] shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)] overflow-hidden", className)}
  >
    {children}
  </motion.div>
);

const MapView = () => {
  const svgMap = useMemo(() => {
    const map = new DottedMap({ height: 40, grid: "diagonal" });
    return map.getSVG({ radius: 0.15, color: "#000000", shape: "circle" });
  }, []);

  const people = [
    { name: "Alex", x: "10%", y: "4%" },
    { name: "John", x: "65%", y: "35%" },
    { name: "Mia", x: "50%", y: "20%" },
    { name: "James", x: "80%", y: "25%" },
    { name: "Emily", x: "30%", y: "45%" },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 transition-opacity duration-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          className={cn("pointer-events-none absolute top-0 -right-2 -mt-14 h-full w-full select-none object-cover opacity-50", "[mask-image:linear-gradient(to_bottom,transparent,white_15%,white_85%,transparent)]")}
          alt="World map"
          draggable={false}
        />
      </div>
      <div className="absolute inset-0">
        {people.map((person, index) => (
          <div key={index} className="absolute" style={{ left: person.x, top: person.y }}>
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-lg bg-gradient-to-br from-orange-300 to-orange-500" />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white rounded-lg border-[1.5px] border-white/40 bg-[#103685] mix-blend-luminosity shadow-[0px_10px_15px_-6px_#000] backdrop-blur-[6px]">
              {person.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Chart = () => (
  <div className="bg-white mx-auto m-4 rounded-[18px_18px_0px_0px] border border-[#E1E1E1] p-2 max-w-[290px] w-full shadow-[0px_37px_10px_0px_rgba(0,0,0,0.00),0px_24px_10px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.02),0px_6px_6px_0px_rgba(0,0,0,0.03),0px_1px_3px_0px_rgba(0,0,0,0.04)]">
    <div className="flex gap-2 mb-8">
      <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
      <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
      <div className="w-3 h-3 rounded-full bg-[#28C840]" />
    </div>
    <div className="relative mx-auto h-[200px] w-[260px]">
      <div className="absolute bottom-16 top-0 left-0 right-0 flex items-end justify-between gap-4 h-[190px]">
        {[30, 70, 40, 80, 50, 100].map((h, i) => (
          <div key={i} className={`w-full rounded-t-[15px] ${i === 5 ? "bg-[linear-gradient(180deg,#FEA353_0%,#FFF_100%)]" : "bg-[linear-gradient(180deg,#BFBFBF_0%,#FFF_100%)]"}`} style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="absolute p-1 justify-between bg-white border border-neutral-200 -bottom-4 -left-10 -right-10 flex rounded-full items-center gap-4">
        <div />
        <button className="text-white text-right px-6 py-2 rounded-[37px] bg-[linear-gradient(181deg,#5E5E5E_18.12%,#000_99.57%)] shadow-[0px_1px_1px_2px_rgba(255,255,255,0.40)_inset] cursor-pointer">
          Share
        </button>
      </div>
    </div>
  </div>
);

const OrbitingIcons = ({
  centerIcon,
  orbits,
  className,
}: {
  centerIcon?: React.ReactNode;
  orbits: Array<{
    icons: React.ReactNode[];
    radius?: number;
    speed?: number;
    rotationDirection?: "clockwise" | "anticlockwise";
    className?: string;
  }>;
  className?: string;
}) => {
  const orbitData = React.useMemo(() => {
    return orbits.map((orbit, orbitIndex) => {
      const radius = orbit.radius || 100 + orbitIndex * 80;
      const speed = orbit.speed || 1;
      const iconCount = orbit.icons.length;
      const angleStep = 360 / iconCount;
      const angles = Array.from({ length: iconCount }, (_, i) => angleStep * i);
      const iconData = angles.map((angle) => {
        const rotationAngle = orbit.rotationDirection === "clockwise" ? [angle, angle - 360] : [angle, angle + 360];
        return {
          angle,
          animation: {
            initial: { rotate: angle, scale: 1, opacity: 1 },
            animate: { rotate: rotationAngle, scale: 1, opacity: 1 },
            transition: { rotate: { duration: speed, repeat: Infinity, ease: "linear" as const } },
            counterRotation: {
              initial: { rotate: -angle },
              animate: { rotate: orbit.rotationDirection === "clockwise" ? [-angle, -angle + 360] : [-angle, -angle - 360] },
              transition: { duration: speed, repeat: Infinity, ease: "linear" as const },
            },
          },
        };
      });
      return { radius, speed, iconData, rotationDirection: orbit.rotationDirection, className: orbit.className };
    });
  }, [orbits]);

  return (
    <div className={cn("relative w-[200px] h-[200px]", className)}>
      {centerIcon && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">{centerIcon}</div>}
      {orbitData.map((orbit, orbitIndex) => (
        <div key={orbitIndex} className="absolute top-0 left-0 w-full h-full" style={{ zIndex: orbits.length - orbitIndex }}>
          <div
            className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full", orbit.className)}
            style={{ width: orbit.radius * 2 + "px", height: orbit.radius * 2 + "px" }}
          />
          {orbit.iconData.map((icon, iconIndex) => (
            <motion.div
              key={iconIndex}
              className="absolute"
              style={{ width: "40px", height: "40px", left: "calc(50% - 20px)", top: "calc(50% - 20px)", transformOrigin: "center center" }}
              initial={icon.animation.initial}
              animate={icon.animation.animate}
              transition={icon.animation.transition}
            >
              <div style={{ position: "absolute", left: `${orbit.radius}px`, transformOrigin: "center center" }}>
                <motion.div
                  initial={icon.animation.counterRotation.initial}
                  animate={icon.animation.counterRotation.animate}
                  transition={icon.animation.counterRotation.transition}
                  className="w-8 h-8 rounded-full bg-gray-700 p-2 flex items-center justify-center border-[0.7px] border-[#E4E4E4] bg-gradient-to-b mix-blend-luminosity shadow-[inset_0px_0px_8px_0px_rgba(248,248,248,0.25)] will-change-transform"
                >
                  {orbits[orbitIndex].icons[iconIndex]}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

const LogoOrbit = () => {
  const orbit1Icons = [
    <Brain key="brain" className="w-8 h-8 text-white" />,
    <Scan key="scan" className="w-8 h-8 text-white" />,
    <Activity key="activity" className="w-8 h-8 text-white" />,
  ];
  const orbit2Icons = [
    <Database key="db" className="w-6 h-6 text-white" />,
    <Microscope key="microscope" className="w-6 h-6 text-white" />,
    <FileText key="report" className="w-6 h-6 text-white" />,
    <Cpu key="cpu" className="w-6 h-6 text-white" />,
  ];

  return (
    <OrbitingIcons
      centerIcon={<LogoIcon className="h-10 w-10" />}
      orbits={[
        { icons: orbit1Icons, rotationDirection: "anticlockwise", radius: 50, speed: 9, className: "bg-white" },
        { icons: orbit2Icons, rotationDirection: "anticlockwise", radius: 90, speed: 15, className: "bg-[radial-gradient(circle,rgba(249,250,251,1)_0%,rgba(255,187,128,1)_50%,rgba(254,166,89,1)_100%)]" },
        { icons: orbit1Icons, rotationDirection: "clockwise", radius: 140, speed: 7, className: "bg-white" },
        { icons: orbit2Icons, rotationDirection: "anticlockwise", radius: 180, speed: 15, className: "bg-[radial-gradient(circle,rgba(249,250,251,1)_0%,rgba(255,187,128,1)_50%,rgba(254,166,89,1)_100%)]" },
      ]}
    />
  );
};

const DashboardCard = () => (
  <div className="w-full h-full p-4 bg-white border border-gray-200 rounded-xl">
    <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="flex items-center gap-2 mb-6">
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <div className="w-3 h-3 rounded-full bg-[#28C840]" />
      </div>
    </motion.div>
    <div className="flex flex-col md:flex-row h-full gap-4">
      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} whileHover={{ scale: 1.02 }} className="flex-shrink-0 bg-[#F9FAFB] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="rounded-full bg-gradient-to-br from-orange-300 to-orange-500 w-14 h-14 ring-2 ring-white" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="space-y-1">
            <div className="text-[10px] md:text-xs font-medium text-gray-400 tracking-wider">CLINICIAN</div>
            <div className="text-xs md:text-lg font-semibold text-gray-800">Dr. Smith</div>
          </div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} whileHover={{ scale: 1.02 }} className="flex-1 bg-[#F9FAFB] relative p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <motion.div whileHover={{ x: -5 }} className="flex items-center text-gray-300 mx-2 absolute top-4 left-0">
          <ArrowLeftCircle className="w-6 h-6 hover:text-gray-600 transition-colors cursor-pointer" />
        </motion.div>
        <div className="flex flex-col h-full justify-center items-center text-gray-400">
          <Logo />
          <div className="text-sm">Select an MRI scan to begin analysis</div>
        </div>
      </motion.div>
    </div>
  </div>
);
