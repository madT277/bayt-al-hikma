"use client";

import ScrollReveal from "@/components/ScrollReveal";
import type { ReactNode } from "react";

export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return <ScrollReveal delay={delay}>{children}</ScrollReveal>;
}
