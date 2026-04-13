"use client";
import { cn } from "@/lib/utils";
import { Menu as IconMenu2, X as IconX } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./button";
import { Logo } from "./logo";

interface NavbarProps {
  navItems: { name: string; link: string }[];
  visible: boolean;
}

export const Navbar = () => {
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Upload MRI", link: "/upload" },
    { name: "Results", link: "/results" },
  ];

  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full mt-4 fixed top-2 inset-x-0 z-50"
    >
      <DesktopNav visible={visible} navItems={navItems} />
      <MobileNav visible={visible} navItems={navItems} />
    </motion.div>
  );
};

const DesktopNav = ({ navItems, visible }: NavbarProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHoveredIndex(null)}
      animate={{
        width: visible ? "50%" : "80%",
        backgroundColor: visible ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
        backdropFilter: visible ? "blur(10px)" : "blur(5px)",
        y: visible ? 4 : 0,
        boxShadow: visible ? "0 10px 30px -10px rgba(0,0,0,0.1)" : "0 0 0 transparent",
      }}
      initial={{ width: "80%", scale: 0.95, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn("hidden lg:flex flex-row self-center items-center justify-between py-3 mx-auto px-8 rounded-full relative z-[100]")}
    >
      <Logo />
      <motion.div
        className="lg:flex flex-row flex-1 items-center justify-center space-x-2 text-sm"
        animate={{ scale: 1, justifyContent: visible ? "flex-end" : "center" }}
      >
        {navItems.map((navItem, idx) => (
          <motion.div key={`nav-item-${idx}`} onHoverStart={() => setHoveredIndex(idx)} className="relative">
            <Link className="text-black/90 relative px-3 py-1.5 transition-colors" href={navItem.link}>
              <span className="relative z-10">{navItem.name}</span>
              {hoveredIndex === idx && (
                <motion.div
                  layoutId="menu-hover"
                  className="absolute inset-0 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, background: "linear-gradient(145deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.05 }}
                />
              )}
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence mode="popLayout" initial={false}>
        {!visible && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
            className="flex items-center gap-2"
          >
            <Button as={Link} href="/upload" variant="primary">Start Analysis</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MobileNav = ({ navItems, visible }: NavbarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        animate={{
          backdropFilter: "blur(16px)",
          background: visible ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.8)",
          width: visible ? "85%" : "90%",
          y: visible ? 4 : 0,
          borderRadius: open ? 24 : 9999,
          padding: "12px 20px",
          boxShadow: visible ? "0 10px 30px -10px rgba(0,0,0,0.1)" : "0 0 0 transparent",
        }}
        initial={{ width: "85%", scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn("flex relative flex-col lg:hidden w-full justify-between items-center max-w-[calc(100vw-2rem)] mx-auto z-50")}
      >
        <div className="flex flex-row justify-between items-center w-full">
          <Logo />
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            {open ? (
              <IconX className="text-black/90" onClick={() => setOpen(!open)} />
            ) : (
              <IconMenu2 className="text-black/90" onClick={() => setOpen(!open)} />
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex rounded-2xl absolute top-16 backdrop-blur-xl bg-white/95 inset-x-0 z-50 flex-col items-start justify-start gap-4 w-full px-6 py-6 shadow-lg"
            >
              {navItems.map((navItem, idx) => (
                <motion.div
                  key={`link=${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                  whileHover={{ x: 5 }}
                >
                  <Link href={navItem.link} onClick={() => setOpen(false)} className="relative text-black/90 hover:text-black transition-colors">
                    <motion.span className="block">{navItem.name}</motion.span>
                  </Link>
                </motion.div>
              ))}
              <div className="mt-2 flex w-full flex-col gap-2 border-t border-neutral-200 pt-3">
                <Button as={Link} href="/upload" variant="primary" className="w-full justify-center">Start Analysis</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
