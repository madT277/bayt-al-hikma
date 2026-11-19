"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Route change: a quick opacity fade only — no sliding, so text never jumps. */
export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
