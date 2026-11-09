"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Fades/lifts children in once as they scroll into view. Respects
 * prefers-reduced-motion by skipping the transform/opacity animation
 * entirely (renders already-settled) instead of just speeding it up.
 */
export function Reveal({
  children,
  index = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: "div" | "li" | "tr";
}) {
  const reduceMotion = useReducedMotion();
  const distance = Tag === "tr" ? 6 : 14;

  if (reduceMotion) {
    const Plain = Tag;
    return <Plain className={className}>{children}</Plain>;
  }

  const MotionTag = motion[Tag];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}
