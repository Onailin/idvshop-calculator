"use client";

import { useEffect, useState } from "react";

/** Eases toward the real target — never runs ahead of actual progress. */
export function useSmoothProgress(target: number, active: boolean): number {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) {
      setDisplay(0);
      return;
    }

    if (target >= 100) {
      setDisplay(100);
      return;
    }

    let frame = 0;

    const tick = () => {
      setDisplay((prev) => {
        if (target >= 100) {
          return 100;
        }

        if (prev >= target) {
          return target;
        }

        const step = Math.max(0.5, (target - prev) * 0.22);
        return Math.min(target, prev + step);
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  if (!active) {
    return 0;
  }

  if (target >= 100) {
    return 100;
  }

  return Math.round(display);
}
