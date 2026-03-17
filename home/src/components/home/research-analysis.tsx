"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";

export function ResearchAnalysis() {
  return (
    <section
      className='relative py-16 md:py-20 px-6 overflow-hidden'
      style={{
        backgroundImage: `
          radial-gradient(circle at 30% 50%, oklch(0.6 0.18 350 / 0.2) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, oklch(0.6 0.18 350 / 0.15) 0%, transparent 55%),
          linear-gradient(to bottom right, var(--muted), var(--background), color-mix(in oklch, var(--muted) 50%, transparent))
        `,
      }}
    >
      <div className='relative z-10 max-w-6xl mx-auto'>
        <div className='grid md:grid-cols-2 gap-8 md:gap-16 items-center'>
          {/* Left side - Large italic heading */}
          <div>
            <p className='text-xs tracking-[0.2em] uppercase text-foreground/50 mb-4 font-bold'>
              Study Complete
            </p>

            <h2 className='text-4xl md:text-5xl lg:text-6xl font-medium italic text-foreground leading-[1.1]'>
              Thank you
            </h2>

            <p className='mt-6 text-foreground/60 text-base leading-relaxed max-w-md'>
              To everyone who participated in our research comparing traditional
              interfaces with conversational AI.
            </p>
          </div>

          {/* Right side - Details and CTA */}
          <div className='space-y-5'>
            {/* Study period pills */}
            <div className='flex flex-wrap gap-2'>
              <div className='inline-flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-sm border border-border rounded-full text-sm text-foreground/80'>
                <Calendar className='w-4 h-4 text-primary' />
                <span>February 5–18, 2026</span>
              </div>
            </div>

            {/* Description */}
            <p className='text-foreground/50 text-sm leading-relaxed max-w-sm'>
              Full analysis including usability metrics and user preference data
              is now available.
            </p>

            {/* CTA */}
            <Link
              href='/research'
              className='group inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-primary-foreground rounded-full text-sm font-medium hover:bg-foreground/90 transition-all'
            >
              View Analysis
              <ArrowUpRight className='w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
