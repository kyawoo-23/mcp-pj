"use client";

import { ArrowRight, Github, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { label: "Analysis", href: "/research" },
  { label: "Research", href: "#research-target" },
  { label: "Survey", href: "/survey" },
  { label: "Resources", href: "#footer" },
];

export function HeroSection() {
  const scrollToResearch = () => {
    document
      .getElementById("research-target")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className='relative min-h-screen hero-stripe-bg text-primary-foreground flex flex-col'>
      {/* Header bar */}
      <header className='relative z-10 w-full px-6 py-6 md:py-8'>
        <div className='max-w-6xl mx-auto flex items-center justify-between'>
          {/* Logo / Brand - using geometric icon, NOT logo.svg */}
          <Link href='/' className='flex items-center gap-2 group'>
            <Sparkles className='w-5 h-5 text-primary-foreground transition-transform group-hover:rotate-12' />
            <span className='font-semibold text-sm md:text-base tracking-tight'>
              MCP Research Project
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav className='hidden md:flex items-center gap-8'>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className='text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors'
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* GitHub link - styled as Contact Us with arrow */}
          <a
            href='https://github.com/kyawoo-23/mcp-pj'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='View source on GitHub'
            className='flex items-center gap-1.5 text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors group'
          >
            <span className='hidden sm:inline'>GitHub</span>
            <Github className='w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
          </a>
        </div>
      </header>

      {/* Main hero content */}
      <div className='relative z-10 flex-1 flex flex-col justify-center px-6 pt-4 md:pt-12 pb-24'>
        <div className='max-w-6xl mx-auto w-full'>
          {/* Left-aligned content */}
          <div className='max-w-4xl'>
            {/* Eyebrow */}
            <p className='text-xs md:text-sm tracking-[0.2em] uppercase text-primary-foreground/70 mb-4 font-bold'>
              Empirical Study
            </p>

            {/* Headline with bold/italic hierarchy */}
            <h1 className='text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-8 text-balance'>
              <span className='block'>Traditional Interfaces</span>
              <span className='block italic font-light tracking-tight'>
                vs.
              </span>
              <span className='block'>Conversational AI</span>
            </h1>

            {/* Description - bottom left, smaller text */}
            <p className='text-sm md:text-base lg:text-lg text-primary-foreground/80 max-w-md leading-relaxed text-justify mb-10'>
              Two ways to complete the same tasks: click through menus and
              forms, or tell an AI what you need in plain language. We&apos;re
              studying which approach works better—and for whom.
            </p>

            {/* Subtitle (italic, smaller) */}
            <p className='text-xs md:text-sm text-primary-foreground/60 text-balance max-w-xl mb-12 italic'>
              Comparing Intent-Driven and Interface-Driven Interaction: An
              Empirical Study of Traditional UI and Conversational AI Using the
              Model Context Protocol (MCP)
            </p>

            {/* CTAs */}
            <div className='flex flex-col sm:flex-row items-start gap-4'>
              <Link
                href='/survey'
                className='inline-flex items-center gap-2 px-6 py-3 bg-primary-foreground text-foreground rounded-full text-sm font-semibold hover:bg-primary-foreground/90 transition-all hover:scale-105 shadow-lg shadow-foreground/10'
              >
                Start Survey
                <ArrowRight className='w-4 h-4' />
              </Link>
              <button
                onClick={scrollToResearch}
                className='inline-flex items-center gap-2 px-6 py-3 border border-primary-foreground/30 rounded-full text-sm font-medium hover:bg-primary-foreground/10 hover:border-primary-foreground/50 transition-all cursor-pointer text-primary-foreground'
              >
                Learn More
                <ChevronDown className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Double chevrons scroll indicator */}
      <button
        onClick={scrollToResearch}
        className='absolute cursor-pointer bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 z-10'
      >
        <ChevronDown className='w-5 h-5 text-primary-foreground/50 animate-chevron-bounce' />
        <ChevronDown className='w-5 h-5 text-primary-foreground/50 -mt-2 animate-chevron-bounce-delayed' />
      </button>
    </section>
  );
}
