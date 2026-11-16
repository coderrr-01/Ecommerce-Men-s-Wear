"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

import { fadeVariants, motionDuration, motionEasing } from "@/lib/motion";

export function StoreRouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [progress, setProgress] = useState(false);
  const previousPath = useRef(pathname);
  const progressTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const destination = new URL(link.href, window.location.href);

      if (
        destination.origin === window.location.origin &&
        destination.pathname !== window.location.pathname
      ) {
        setProgress(true);
        if (progressTimer.current !== null) window.clearTimeout(progressTimer.current);
        progressTimer.current = window.setTimeout(() => setProgress(false), 8000);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      if (progressTimer.current !== null) window.clearTimeout(progressTimer.current);
    };
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (progressTimer.current !== null) window.clearTimeout(progressTimer.current);
    progressTimer.current = window.setTimeout(() => setProgress(false), 220);
    return () => {
      if (progressTimer.current !== null) window.clearTimeout(progressTimer.current);
    };
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {progress ? (
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionDuration.slow, ease: motionEasing.enter }}
            className="fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-accent"
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: motionDuration.standard, ease: motionEasing.enter }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
