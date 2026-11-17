"use client";

import { useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site.config";

export function StoreUtilities() {
  const pathname = usePathname();
  const { scrollY, scrollYProgress } = useScroll();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const reducedMotion = useReducedMotion();
  const whatsappNumber = siteConfig.contact.whatsapp.replace(/\D/g, "");
  const hasWhatsappNumber = whatsappNumber.length > 6 && !/^91?0+$/.test(whatsappNumber);
  const isCheckout = pathname.startsWith("/checkout") || pathname.startsWith("/order/");

  useMotionValueEvent(scrollY, "change", (value) => setShowBackToTop(value > 400));

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent"
        style={{ scaleX: scrollYProgress }}
      />
      <div className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 flex flex-col items-end gap-3 md:bottom-6">
        {!isCheckout && hasWhatsappNumber ? (
          <motion.a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat with us on WhatsApp"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Chat with us
          </motion.a>
        ) : null}
        <AnimatePresence>
          {showBackToTop ? (
            <motion.button
              type="button"
              aria-label="Back to top"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={() =>
                window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })
              }
              className="grid size-11 place-items-center rounded-full border border-border bg-background text-foreground shadow-lg transition-colors hover:bg-secondary"
            >
              <ArrowUp className="size-4" aria-hidden="true" />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
