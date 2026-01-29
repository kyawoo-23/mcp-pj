"use client";

import { ArrowDown } from "lucide-react";

export function LearnMoreButton() {
  const scrollToResearch = () => {
    document
      .getElementById("research-target")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToResearch}
      className='inline-flex items-center gap-2 px-8 py-4 border-2 border-primary-foreground/30 rounded-full text-lg font-medium hover:bg-primary-foreground/10 hover:border-primary-foreground/50 transition-all cursor-pointer'
    >
      Learn More
      <ArrowDown className='w-5 h-5' />
    </button>
  );
}
