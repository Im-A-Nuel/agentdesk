"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  className?: string;
};

export function CountUp({ value, format, duration = 1100, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [shown, setShown] = useState(false);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "-8% 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shown) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, value, duration]);

  const fmt = format ?? ((n: number) => n.toLocaleString("en-US"));
  return (
    <span ref={ref} className={className}>
      {fmt(display)}
    </span>
  );
}