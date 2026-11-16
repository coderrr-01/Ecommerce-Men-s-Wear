"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";

import { siteConfig } from "@/config/site.config";

import "./intro-preloader.css";

const pendingClass = "ipl-pending";
const runningClass = "ipl-running";
const scrollLockClass = "ipl-scroll-locked";
const subscribers = new Set<() => void>();
let introIsActive = false;

type IntroPhase = "preparing" | "seed" | "build" | "exit" | "curtain" | "handoff" | "reduced";
type IntroStyle = CSSProperties & Record<`--${string}`, string | number>;
interface IntroSnapshot {
  active: boolean;
  phase: IntroPhase;
  counter: number;
}

const idleSnapshot: IntroSnapshot = { active: false, phase: "preparing", counter: 0 };
const pendingSnapshot: IntroSnapshot = { active: true, phase: "preparing", counter: 0 };
let introSnapshot = idleSnapshot;

const guardScript = `(()=>{if(!${siteConfig.intro.enabled}||location.pathname!=="/")return;var s=document.createElement("style");s.dataset.iplGuard="";s.textContent='html{overflow:hidden}html::before{position:fixed;z-index:2147483646;inset:0;background:var(--foreground);content:"";pointer-events:auto;touch-action:none;animation:ipl-pending-fade ${siteConfig.intro.durations.failsafeMs}ms ease-out forwards}';document.head.appendChild(s);setTimeout(function(){s.remove()},${siteConfig.intro.durations.failsafeMs});})();`;

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function getSnapshot() {
  if (introIsActive) return introSnapshot;
  if (
    typeof document !== "undefined" &&
    (document.documentElement.classList.contains(pendingClass) ||
      document.querySelector("style[data-ipl-guard]"))
  ) {
    return pendingSnapshot;
  }
  return introSnapshot;
}

function getServerSnapshot() {
  return idleSnapshot;
}

function notifyIntroSubscribers() {
  subscribers.forEach((callback) => callback());
}

function updateIntroSnapshot(update: Partial<IntroSnapshot>) {
  introSnapshot = { ...introSnapshot, ...update };
  introIsActive = introSnapshot.active;
  notifyIntroSubscribers();
}

function wait(milliseconds: number, signal: AbortSignal) {
  return new Promise<boolean>((resolve) => {
    if (signal.aborted) {
      resolve(false);
      return;
    }

    const finish = (completed: boolean) => {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      resolve(completed);
    };
    const onAbort = () => finish(false);
    const timer = window.setTimeout(() => finish(true), milliseconds);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function preloadImage(src: string, signal: AbortSignal) {
  return new Promise<boolean>((resolve) => {
    const image = new window.Image();
    let settled = false;
    const finish = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener("abort", onAbort);
      resolve(loaded);
    };
    const onAbort = () => {
      image.src = "";
      finish(false);
    };

    image.fetchPriority = "low";
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    signal.addEventListener("abort", onAbort, { once: true });
    image.src = src;
    if (image.complete) finish(image.naturalWidth > 0);
  });
}

function waitForAssets(signal: AbortSignal) {
  const images = siteConfig.intro.images.map((image) => preloadImage(image.src, signal));
  const fonts =
    document.fonts?.ready.then(
      () => true,
      () => false,
    ) ?? Promise.resolve(true);
  const assetsReady = Promise.all([fonts, ...images]).then((results) => results.every(Boolean));

  return new Promise<boolean>((resolve) => {
    const finish = (ready: boolean) => {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      resolve(ready);
    };
    const onAbort = () => finish(false);
    const timer = window.setTimeout(
      () => finish(false),
      siteConfig.intro.durations.preloadTimeoutMs,
    );
    signal.addEventListener("abort", onAbort, { once: true });
    void assetsReady.then(finish);
  });
}

function IntroGuardScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: guardScript }}
    />
  );
}

export function IntroPreloader() {
  const pathname = usePathname();
  const {
    active: introActive,
    phase,
    counter,
  } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const controllerRef = useRef<AbortController | null>(null);
  const scrollPositionRef = useRef<{ x: number; y: number } | null>(null);
  const failsafeTimerRef = useRef<number | null>(null);

  const finishIntro = useCallback(() => {
    const html = document.documentElement;
    const scrollPosition = scrollPositionRef.current;

    html.classList.remove(pendingClass, runningClass, scrollLockClass);
    document.body.classList.remove(scrollLockClass, runningClass);
    html.style.removeProperty("--ipl-failsafe-duration");
    if (failsafeTimerRef.current !== null) {
      window.clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
    scrollPositionRef.current = null;
    updateIntroSnapshot({ active: false, phase: "preparing", counter: 0 });
    if (scrollPosition) window.scrollTo(scrollPosition.x, scrollPosition.y);
  }, []);

  useLayoutEffect(() => {
    if (pathname !== "/") {
      finishIntro();
      return;
    }

    if (!siteConfig.intro.enabled) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    scrollPositionRef.current = { x: window.scrollX, y: window.scrollY };
    const html = document.documentElement;
    html.style.setProperty("--ipl-failsafe-duration", `${siteConfig.intro.durations.failsafeMs}ms`);
    html.classList.add(pendingClass, scrollLockClass);
    document.body.classList.add(scrollLockClass);
    document.querySelector("style[data-ipl-guard]")?.remove();
    const maxPlaybackMs =
      siteConfig.intro.durations.preloadTimeoutMs +
      siteConfig.intro.durations.seedMs +
      siteConfig.intro.durations.buildMs +
      siteConfig.intro.durations.exitMs +
      siteConfig.intro.durations.curtainMs +
      siteConfig.intro.durations.handoffMs +
      500;
    failsafeTimerRef.current = window.setTimeout(finishIntro, maxPlaybackMs);
    updateIntroSnapshot({ active: true, phase: "preparing", counter: 0 });

    return () => {
      controller.abort();
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        finishIntro();
      }
    };
  }, [finishIntro, pathname]);

  useEffect(() => {
    if (!introActive || pathname !== "/") return;

    const controller = controllerRef.current;
    if (!controller) return;
    const { signal } = controller;
    let frame = 0;

    const startCounter = () => {
      const start = performance.now();
      const duration = siteConfig.intro.durations.counterMs;
      const update = (now: number) => {
        if (signal.aborted) return;
        const progress = Math.min((now - start) / duration, 1);
        const value =
          progress < 0.7
            ? Math.round((progress / 0.7) * 90)
            : Math.round(90 + ((progress - 0.7) / 0.3) * 10);
        updateIntroSnapshot({ counter: value });
        if (progress < 1) frame = window.requestAnimationFrame(update);
      };
      frame = window.requestAnimationFrame(update);
    };

    const run = async () => {
      try {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reducedMotion) {
          const assetsReady = await waitForAssets(signal);
          if (!assetsReady || signal.aborted) {
            updateIntroSnapshot({ phase: "reduced" });
            await wait(siteConfig.intro.durations.reducedMotionMs, signal);
            return;
          }
        }

        const html = document.documentElement;
        html.classList.remove(pendingClass);
        html.classList.add(runningClass);
        document.body.classList.remove(scrollLockClass);
        document.body.classList.add(scrollLockClass, runningClass);

        if (reducedMotion) {
          updateIntroSnapshot({ phase: "reduced" });
          await wait(siteConfig.intro.durations.reducedMotionMs, signal);
          return;
        }

        updateIntroSnapshot({ phase: "seed" });
        startCounter();
        if (!(await wait(siteConfig.intro.durations.seedMs, signal))) return;
        updateIntroSnapshot({ phase: "build" });
        if (!(await wait(siteConfig.intro.durations.buildMs, signal))) return;
        updateIntroSnapshot({ phase: "exit" });
        if (!(await wait(siteConfig.intro.durations.exitMs, signal))) return;
        updateIntroSnapshot({ phase: "curtain" });
        if (!(await wait(siteConfig.intro.durations.curtainMs, signal))) return;
        updateIntroSnapshot({ phase: "handoff" });
        await wait(siteConfig.intro.durations.handoffMs, signal);
      } finally {
        if (frame) window.cancelAnimationFrame(frame);
        if (!signal.aborted) finishIntro();
      }
    };

    void run();
    return () => {
      controller.abort();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [finishIntro, introActive, pathname]);

  if (!introActive || pathname !== "/") return <IntroGuardScript />;

  const { durations, images, brandWord } = siteConfig.intro;
  const rootStyle: IntroStyle = {
    "--ipl-seed-ms": `${durations.seedMs}ms`,
    "--ipl-card-enter-ms": `${durations.cardEnterMs}ms`,
    "--ipl-card-stagger-ms": `${durations.cardStaggerMs}ms`,
    "--ipl-letter-enter-ms": `${durations.letterEnterMs}ms`,
    "--ipl-letter-stagger-ms": `${durations.letterStaggerMs}ms`,
    "--ipl-glitch-ms": `${durations.glitchMs}ms`,
    "--ipl-exit-ms": `${durations.exitMs}ms`,
    "--ipl-curtain-ms": `${durations.curtainMs}ms`,
    "--ipl-handoff-ms": `${durations.handoffMs}ms`,
    "--ipl-reduced-ms": `${durations.reducedMotionMs}ms`,
  };

  return (
    <>
      <IntroGuardScript />
      <div
        id="intro-preloader"
        className="ipl-root"
        data-phase={phase}
        role="status"
        aria-live="polite"
        aria-label="Loading collection"
        aria-hidden={phase === "handoff"}
        style={rootStyle}
      >
        <div className="ipl-backdrop" />
        <div className="ipl-stage">
          <div className="ipl-seed" aria-hidden="true">
            <span className="ipl-seed-line" />
            <span className="ipl-seed-diamond" />
          </div>
          <div className="ipl-card-stack" aria-hidden="true">
            {images.map((image, index) => {
              const range = siteConfig.intro.rotationRangeDeg;
              const rotation = ((index * 17 + 3) % (range * 2 + 1)) - range;
              const offsetX = ((index % 3) - 1) * 8 + (index % 2 ? 1 : -1);
              const offsetY = Math.floor(index / 3) * 5 + (index % 2 ? -2 : 2);
              const cardStyle: IntroStyle = {
                "--ipl-card-index": index,
                "--ipl-card-rotation": `${rotation}deg`,
                "--ipl-card-x": `${offsetX}vw`,
                "--ipl-card-y": `${offsetY}vh`,
                zIndex: index + 1,
              };

              return (
                <div key={image.src} className="ipl-card" style={cardStyle}>
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    unoptimized
                    loading="lazy"
                    fetchPriority="low"
                    sizes="(max-width: 640px) 18vw, 144px"
                    className="ipl-card-image"
                  />
                </div>
              );
            })}
          </div>
          <div className="ipl-word" aria-label={brandWord}>
            {brandWord.split(" ").map((word, wordIndex, words) => {
              const letterOffset = words
                .slice(0, wordIndex)
                .reduce((total, previousWord) => total + previousWord.length, 0);

              return (
                <span key={word} className="ipl-word-line" aria-hidden="true">
                  {Array.from(word).map((letter, index) => {
                    const letterIndex = letterOffset + index;

                    return (
                      <span
                        key={`${letter}-${letterIndex}`}
                        className="ipl-letter"
                        data-letter={letter}
                        style={{ "--ipl-letter-index": letterIndex } as IntroStyle}
                      >
                        {letter}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </div>
          {siteConfig.intro.counterEnabled ? (
            <p className="ipl-counter" aria-hidden="true">
              {String(counter).padStart(3, "0")}
            </p>
          ) : null}
        </div>
        <div className="ipl-curtain" aria-hidden="true" />
        <span className="ipl-sr-only">Loading collection</span>
      </div>
    </>
  );
}
