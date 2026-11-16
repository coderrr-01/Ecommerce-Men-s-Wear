"use client";

import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

interface HomeHeroControlsProps {
  slideCount: number;
  activeIndex: number;
  paused: boolean;
  onSelect: (index: number) => void;
  onTogglePause: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function HomeHeroControls({
  slideCount,
  activeIndex,
  paused,
  onSelect,
  onTogglePause,
  onPrevious,
  onNext,
}: HomeHeroControlsProps) {
  return (
    <div className="absolute right-5 bottom-7 left-5 flex items-center justify-between sm:right-8 sm:left-8 lg:right-12 lg:left-12">
      <div className="flex items-center gap-2">
        {Array.from({ length: slideCount }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            aria-current={activeIndex === index}
            onClick={() => onSelect(index)}
            className="grid min-h-11 min-w-11 place-items-center"
          >
            <span
              className={`h-1 rounded-full transition-[width,background-color] duration-300 ${
                index === activeIndex ? "w-10 bg-background" : "w-5 bg-background/45"
              }`}
            />
          </button>
        ))}
        <button
          type="button"
          aria-label={paused ? "Play slides" : "Pause slides"}
          onClick={onTogglePause}
          className="grid size-11 place-items-center text-background"
        >
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
        </button>
      </div>
      <div className="hidden items-center gap-2 text-[10px] tracking-[0.16em] text-background/80 uppercase lg:flex">
        <ArrowDown className="size-4" aria-hidden="true" />
        Discover
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={onPrevious}
          className="grid size-11 place-items-center text-background"
        >
          <ArrowLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={onNext}
          className="grid size-11 place-items-center text-background"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
