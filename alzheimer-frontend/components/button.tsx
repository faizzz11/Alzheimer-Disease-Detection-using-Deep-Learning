"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const Button = <T extends React.ElementType = "a">({
  href,
  as,
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: T;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient" | "orange";
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "href" | "children" | "className" | "variant">) => {
  const Tag = (as || "a") as React.ElementType;

  const baseStyles = cn(
    "px-4 py-2 flex rounded-[6px] text-sm font-bold relative",
    "cursor-pointer hover:-translate-y-0.5 transition duration-200",
    "inline-flex items-center justify-center",
    "text-black"
  );

  const variantStyles = {
    primary: cn(
      "rounded-[6px]",
      "bg-[linear-gradient(181deg,_#5E5E5E_18.12%,_#000_99.57%)]",
      "shadow-[0px_4px_8px_0px_rgba(3,_7,_18,_0.06),_0px_2px_4px_0px_rgba(3,_7,_18,_0.06),",
      "0px_0px_0px_1px_rgba(3,_7,_18,_0.08),_0px_1px_1px_2px_rgba(255,_255,_255,_0.40)_inset,",
      "0px_-1px_5px_2px_rgba(255,_255,_255,_0.40)_inset]",
      "text-white"
    ),
    secondary: cn("bg-white rounded-[6px] border border-[#E5E5E5]"),
    dark: cn("bg-gray-800 text-white rounded-[6px]"),
    gradient: cn(
      "bg-gradient-to-b from-blue-500 to-blue-700 text-white",
      "shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]"
    ),
    orange: cn(
      "rounded-[6px] text-white",
      "bg-[linear-gradient(195deg,_#FFA756_17.78%,_#EE602C_75.71%)]",
      "hover:opacity-90 transition-opacity",
      "shadow-[0px_4px_12px_rgba(238,96,44,0.35)]"
    ),
  };

  return React.createElement(
    Tag,
    {
      ...(href !== undefined && { href }),
      className: cn(baseStyles, variantStyles[variant], className),
      ...props,
    },
    children
  );
};
