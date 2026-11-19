"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}

/**
 * Content rises 12px and fades in once, as it enters the viewport.
 * Short distance + editorial easing so it reads as "settling", not "flying".
 * Disabled automatically for users who prefer reduced motion (MotionConfig).
 */
export default function ScrollReveal({ children, delay = 0, className, as = "div" }: ScrollRevealProps) {
  const Component = motion[as];
  return (
    <Component
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
}
