"use client";

import { useEffect, useState, useRef } from "react";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
  delay?: number;
}

export function CountUp({
  to,
  from = 0,
  duration = 1000,
  className,
  delay = 0,
}: CountUpProps) {
  const [count, setCount] = useState(from);
  const [isVisible, setIsVisible] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const timeoutId = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);

        // easeOutExpo (smoother for numbers than Quart)
        const easeOutExpo = (x: number): number => {
          return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
        };

        const currentVal = from + (to - from) * easeOutExpo(percentage);
        setCount(Math.round(currentVal));

        if (progress < duration) {
          animationFrameId = requestAnimationFrame(animate);
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [to, from, duration, isVisible, delay]);

  return (
    <span ref={countRef} className={className}>
      {count.toLocaleString()}
    </span>
  );
}
