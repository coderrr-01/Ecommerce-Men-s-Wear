import type { Variants } from "motion/react";

export const motionDuration = {
  fast: 0.18,
  standard: 0.32,
  slow: 0.52,
} as const;

export const motionEasing = {
  enter: [0.22, 1, 0.36, 1],
  exit: [0.4, 0, 1, 1],
} as const;

export const motionSpring = {
  soft: { type: "spring", stiffness: 280, damping: 30 },
  snappy: { type: "spring", stiffness: 460, damping: 34 },
} as const;

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionDuration.standard, ease: motionEasing.enter },
  },
  exit: { opacity: 0, transition: { duration: motionDuration.fast, ease: motionEasing.exit } },
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDuration.slow, ease: motionEasing.enter },
  },
  exit: { opacity: 0, y: 6, transition: { duration: motionDuration.fast } },
};

export const staggerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};
