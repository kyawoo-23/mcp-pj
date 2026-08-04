"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Calendar } from "lucide-react";
import { ThinkingOrb } from "thinking-orbs";

export function ResearchAnalysis() {
  return (
    <>
      {/* v2 — Criteria tasks (ongoing) */}
      <section
        className='relative py-16 md:py-20 px-6 overflow-hidden'
        style={{
          backgroundImage: `
            radial-gradient(circle at 70% 40%, oklch(0.75 0.14 75 / 0.22) 0%, transparent 55%),
            radial-gradient(circle at 20% 80%, oklch(0.7 0.12 55 / 0.16) 0%, transparent 50%),
            linear-gradient(to bottom right, var(--muted), var(--background), color-mix(in oklch, var(--muted) 50%, transparent))
          `,
        }}
      >
        <div className='relative z-10 max-w-6xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-8 md:gap-16 items-center'>
            <div>
              <div className='flex items-center gap-3 mb-4'>
                <ThinkingOrb
                  state='breathing'
                  size={64}
                  speed={0.85}
                  aria-label='Study is ongoing'
                  className='shrink-0'
                />
                <p className='text-xs tracking-[0.2em] uppercase text-foreground/50 font-bold'>
                  Study Ongoing · Criteria Tasks (v2)
                </p>
              </div>

              <h2 className='text-4xl md:text-5xl lg:text-6xl font-medium italic text-foreground leading-[1.1]'>
                Now open
              </h2>

              <p className='mt-6 text-foreground/60 text-base leading-relaxed max-w-md'>
                Take the same course and booking tasks with both the traditional
                interface and the chat agent. This round uses specific targets
                you must match.
              </p>
            </div>

            <div className='space-y-5'>
              <div className='flex flex-wrap gap-2'>
                <div className='inline-flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-sm border border-border rounded-full text-sm text-foreground/80'>
                  <Calendar className='w-4 h-4 text-amber-600 dark:text-amber-400' />
                  <span>Ongoing · from Aug 2026</span>
                </div>
              </div>

              <p className='text-foreground/50 text-sm leading-relaxed max-w-sm'>
                Demographics, four tasks on both systems, short surveys, then a
                brief preference interview — about 15–20 minutes.
              </p>

              <Link
                href='/survey'
                className='group inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-primary-foreground rounded-full text-sm font-medium hover:bg-foreground/90 transition-all'
              >
                Start Survey
                <ArrowRight className='w-4 h-4 transition-transform group-hover:translate-x-0.5' />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* v1 — Simple tasks (complete) */}
      <section
        className='relative py-8 md:py-10 px-6 overflow-hidden border-t border-border/40'
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 50%, oklch(0.6 0.18 350 / 0.12) 0%, transparent 55%),
            linear-gradient(to bottom right, var(--muted), var(--background))
          `,
        }}
      >
        <div className='relative z-10 max-w-6xl mx-auto'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8'>
            <div className='min-w-0'>
              <p className='text-[10px] tracking-[0.2em] uppercase text-foreground/45 mb-1.5 font-bold'>
                Study Complete · Simple Tasks (v1)
              </p>
              <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
                <h2 className='text-xl md:text-2xl font-medium italic text-foreground leading-tight'>
                  Thank you
                </h2>
                <span className='inline-flex items-center gap-1.5 text-xs text-foreground/55'>
                  <Calendar className='w-3 h-3 text-primary' />
                  February 5–18, 2026
                </span>
              </div>
              <p className='mt-1.5 text-foreground/50 text-sm leading-relaxed max-w-xl'>
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
            </div>

            <Link
              href='/research?protocol=v1'
              className='group shrink-0 inline-flex items-center gap-1.5 px-4 py-2 border border-border bg-card/70 backdrop-blur-sm rounded-full text-xs font-medium text-foreground/80 hover:bg-card hover:text-foreground transition-all'
            >
              View{" "}
              <span className='font-semibold text-indigo-700 dark:text-indigo-400'>
                v1
              </span>{" "}
              Analysis
              <ArrowUpRight className='w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
