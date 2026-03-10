import { ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { LearnMoreButton } from "./learn-more-button";

export function HeroSection() {
  return (
    <section className='relative min-h-screen flex flex-col items-center justify-center bg-foreground text-primary-foreground px-6 py-24'>
      {/* GitHub corner link */}
      <a
        href='https://github.com/kyawoo-23/mcp-pj'
        target='_blank'
        rel='noopener noreferrer'
        aria-label='View source on GitHub'
        className='absolute top-6 right-6 inline-flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-primary-foreground/90 transition-colors'
      >
        <Github className='w-4 h-4' />
        <span className='hidden sm:inline'>GitHub</span>
      </a>

      <div className='max-w-5xl mx-auto text-center'>
        <p className='text-sm md:text-base tracking-widest uppercase text-primary-foreground/80 mb-6 font-medium'>
          Empirical Study
        </p>
        <h1 className='text-4xl text-balance md:text-6xl lg:text-7xl font-medium tracking-tight leading-tight mb-6'>
          Traditional Interfaces vs. Conversational AI
        </h1>
        <p className='text-sm md:text-base text-balance text-primary-foreground/80 max-w-2xl mx-auto mb-4 italic'>
          Comparing Intent-Driven and Interface-Driven Interaction: An Empirical
          Study of Traditional UI and Conversational AI Using the Model Context
          Protocol (MCP)
        </p>
        <p className='text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed mb-12'>
          Two ways to complete the same tasks: click through menus and forms, or
          tell an AI what you need in plain language. We&apos;re studying which
          approach works better—and for whom.
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
