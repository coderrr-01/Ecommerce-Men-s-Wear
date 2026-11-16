"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";

import type { NavGroup } from "@/config/navigation";
import { motionDuration, motionEasing, staggerVariants } from "@/lib/motion";

export function CategoryNavigation({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative hidden lg:block"
      onMouseLeave={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="store-category-menu"
        onClick={() => setOpen((current) => !current)}
        onMouseEnter={() => setOpen(true)}
        className="flex min-h-11 items-center gap-2 text-xs tracking-[0.12em] uppercase"
      >
        Shop
        <ChevronDown className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id="store-category-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: motionDuration.fast, ease: motionEasing.enter }}
            className="absolute top-full left-0 z-50 w-[min(52rem,90vw)] border border-border bg-background p-6 text-foreground shadow-xl"
          >
            <motion.div
              variants={staggerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-4 gap-8"
            >
              {groups.map((group) => (
                <motion.div key={group.title} variants={staggerVariants} className="space-y-3">
                  <h2 className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    {group.title}
                  </h2>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="nav-underline py-1 text-sm hover:text-accent"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
