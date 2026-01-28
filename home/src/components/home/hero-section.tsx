"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const scrollToResearch = () => {
    document
      .getElementById("research-target")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className='relative min-h-screen flex flex-col items-center justify-center bg-foreground text-primary-foreground px-6 py-24'>
      <div className='max-w-4xl mx-auto text-center'>
        <p className='text-sm md:text-base tracking-widest uppercase text-primary-foreground/80 mb-6 font-medium'>
          User Experience Study
        </p>
        <h1 className='text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-tight text-balance mb-8'>
          Traditional Websites vs. AI Chat Assistants
        </h1>
        <p className='text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed mb-12'>
          We&apos;re comparing two ways to interact with websites: clicking
          through pages and forms, versus simply chatting with an AI assistant.
          Which feels better to you?
        </p>
        <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
          <Link
            href='/survey'
            className='inline-flex items-center gap-2 px-8 py-4 bg-primary-foreground text-foreground rounded-full text-lg font-semibold hover:bg-primary-foreground/90 transition-all hover:scale-105 shadow-lg'
          >
            Start Survey
            <ArrowRight className='w-5 h-5' />
          </Link>
          <button
            onClick={scrollToResearch}
            className='inline-flex items-center gap-2 px-8 py-4 border-2 border-primary-foreground/30 rounded-full text-lg font-medium hover:bg-primary-foreground/10 hover:border-primary-foreground/50 transition-all'
          >
            Learn More
            <ArrowDown className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* Decorative element */}
      <div className='absolute bottom-12 left-1/2 -translate-x-1/2'>
        <div className='w-px h-16 bg-primary-foreground/40' />
      </div>
    </section>
  );
}
