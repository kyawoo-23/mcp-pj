"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, CheckCircle } from "lucide-react";

export function ResearchAnalysis() {
  return (
    <section
      className='relative py-16 md:py-20 px-6 overflow-hidden'
      style={{
        backgroundImage: `
          radial-gradient(circle at 70% 40%, oklch(0.75 0.14 75 / 0.18) 0%, transparent 55%),
          radial-gradient(circle at 20% 80%, oklch(0.6 0.18 350 / 0.12) 0%, transparent 50%),
          linear-gradient(to bottom right, var(--muted), var(--background), color-mix(in oklch, var(--muted) 50%, transparent))
        `,
      }}
    >
      <div className='relative z-10 max-w-6xl mx-auto'>
        <div className='mb-10 md:mb-12 text-center max-w-xl mx-auto'>
          <h2 className='text-4xl md:text-5xl font-medium italic text-foreground leading-tight'>
            Thank you
          </h2>
          <p className='mt-4 text-foreground/60 text-base leading-relaxed'>
            To all participants in both study rounds — your valuable time and
            thoughtful feedback made this research possible.
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6 md:gap-8'>
          {/* v1 — Simple tasks (complete) */}
          <div className='flex flex-col gap-5 p-6 md:p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm'>
            <div className='flex items-center gap-3'>
              <CheckCircle
                className='w-8 h-8 text-indigo-600 dark:text-indigo-400 shrink-0'
                aria-hidden='true'
              />
              <p className='text-[10px] tracking-[0.2em] uppercase text-foreground/50 font-bold'>
                Study Complete · Simple Tasks (v1)
              </p>
            </div>

            <span className='inline-flex items-center gap-1.5 text-xs text-foreground/55'>
              <Calendar className='w-3 h-3 text-indigo-600 dark:text-indigo-400' />
              February 5–18, 2026
            </span>

            <p className='text-foreground/60 text-sm leading-relaxed'>
              The conference paper from this study is published. Read it on{" "}
              <Link
                href='https://ieeexplore.ieee.org/abstract/document/11597085/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-indigo-700 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-300'
              >
                IEEE Xplore
              </Link>{" "}
              or{" "}
              <Link
                href='https://www.researchgate.net/publication/408867009_Comparing_Intent-Driven_and_Interface-Driven_Interaction_An_Empirical_Study_of_Traditional_UI_and_Conversational_AI_Using_the_Model_Context_Protocol'
                target='_blank'
                rel='noopener noreferrer'
                className='text-indigo-700 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-300'
              >
                ResearchGate
              </Link>
              . Full analysis for the simple-task round is also available.
            </p>

            <div className='mt-auto'>
              <Link
                href='/research?protocol=v1'
                className='group inline-flex items-center gap-2 px-4 py-2 bg-primary text-white/90 dark:text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-all'
              >
                View{" "}
                <span className='font-semibold text-primary-foreground'>
                  v1
                </span>{" "}
                Analysis
                <ArrowUpRight className='w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
              </Link>
            </div>
          </div>

          {/* v2 — Criteria tasks (complete) */}
          <div className='flex flex-col gap-5 p-6 md:p-8 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm'>
            <div className='flex items-center gap-3'>
              <CheckCircle
                className='w-8 h-8 text-amber-600 dark:text-amber-400 shrink-0'
                aria-hidden='true'
              />
              <p className='text-[10px] tracking-[0.2em] uppercase text-foreground/50 font-bold'>
                Study Complete · Criteria Tasks (v2)
              </p>
            </div>

            <span className='inline-flex items-center gap-1.5 text-xs text-foreground/55'>
              <Calendar className='w-3 h-3 text-amber-600 dark:text-amber-400' />
              August 6–September 12, 2026
            </span>

            <p className='text-foreground/60 text-sm leading-relaxed'>
              Data analysis for the criteria-task round is now complete.
            </p>

            <div className='mt-auto'>
              <Link
                href='/research?protocol=v2'
                className='group inline-flex items-center gap-2 px-4 py-2 bg-foreground text-primary-foreground rounded-full text-sm font-medium hover:bg-foreground/90 transition-all'
              >
                View{" "}
                <span className='font-semibold text-primary-foreground'>
                  v2
                </span>{" "}
                Analysis
                <ArrowUpRight className='w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
              </Link>
            </div>
          </div>
        </div>

        <p className='mt-8 text-center text-sm text-foreground/55'>
          Took part in the study?{" "}
          <Link
            href='/survey/history'
            className='text-foreground/80 underline underline-offset-4 hover:text-foreground transition-colors'
          >
            View your personal results
          </Link>
        </p>
      </div>
    </section>
  );
}
