"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const minYToShow = 400;
    const minDelta = 2;

    const toggleVisibility = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      const scrollingUp = delta < -minDelta;
      const scrollingDown = delta > minDelta;

      if (y < minYToShow) {
        setIsVisible(false);
      } else if (scrollingUp) {
        setIsVisible(true);
      } else if (scrollingDown || delta > 0) {
        setIsVisible(false);
      }

      lastY = y;
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label='Scroll to top'
      className={`
        fixed cursor-pointer bottom-6 right-6 z-50
        flex items-center justify-center
        w-12 h-12 rounded-full
        bg-primary text-primary-foreground
        shadow-lg shadow-primary/30
        transition-all duration-300 ease-out
        hover:scale-110 hover:shadow-xl hover:shadow-primary/40
        focus:outline-none focus:ring-2 focus:ring-primary/50
        ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }
      `}
    >
      <ArrowUp className='w-5 h-5' strokeWidth={2.5} />
    </button>
  );
}
