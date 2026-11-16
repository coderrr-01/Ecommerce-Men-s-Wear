"use client";

import { motion } from "motion/react";

import { fadeUpVariants } from "@/lib/motion";

export function ScrollReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeUpVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
