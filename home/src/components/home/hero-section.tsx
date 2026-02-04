import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { LearnMoreButton } from "./learn-more-button";

export function HeroSection() {
  return (
    <section className='relative min-h-screen flex flex-col items-center justify-center bg-foreground text-primary-foreground px-6 py-24'>
      <div className='max-w-4xl mx-auto text-center'>
        <p className='text-sm md:text-base tracking-widest uppercase text-primary-foreground/80 mb-6 font-medium'>
          User Experience Study
        </p>
        <h1 className='text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-tight text-balance mb-8'>
          Traditional Websites vs. AI Chat Assistants
        </h1>
        <p className='text-lg text-balance md:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed mb-12'>
          We&apos;re comparing two ways to interact with websites: clicking
          through pages and forms, versus simply chatting with an AI assistant.
          Which feels better to you?
        </p>
        <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
          <Link
            href='/survey'
            className='inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg animate-ring-pulse shadow-primary/20'
          >
            Start Survey
            <ArrowRight className='w-5 h-5' />
          </Link>
          <LearnMoreButton />
        </div>
      </div>

      {/* Decorative element: line grows from top to full, then shrinks back */}
      <div className='absolute bottom-12 left-1/2 -translate-x-1/2 h-16 w-px bg-primary-foreground/20 overflow-hidden'>
        <div className='w-full min-h-0 bg-primary-foreground/60 animate-scroll-line' />
      </div>
    </section>
  );
}
