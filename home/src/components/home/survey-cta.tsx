"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export function SurveyCTA() {
  return (
    <section className='py-24 px-6 bg-linear-to-b from-background to-muted/30'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-card rounded-2xl border border-border p-8 md:p-12 shadow-lg'>
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-6'>
              <CheckCircle className='w-10 h-10 text-accent-foreground' />
            </div>
            <h2 className='text-3xl md:text-4xl font-medium tracking-tight mb-4'>
              Participate in Our UX Study
            </h2>
            <p className='text-lg text-foreground/90 max-w-2xl mx-auto mb-8'>
              Try out both approaches and share your experience. Your feedback
              helps us understand which way of using websites works better for
              real people.
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-6 mb-8'>
            <div className='p-6 rounded-lg bg-muted/50 border-2 border-border'>
              <h3 className='font-semibold mb-3 text-base'>
                What You&apos;ll Do
              </h3>
              <ul className='space-y-2.5 text-base text-foreground/85'>
                <li className='flex items-start gap-3'>
                  <span className='text-accent-foreground font-bold text-lg leading-none w-4 shrink-0'>
                    •
                  </span>
                  <span>
                    Try both the traditional websites and AI chat assistant
                  </span>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='text-accent-foreground font-bold text-lg leading-none w-4 shrink-0'>
                    •
                  </span>
                  <span>Complete some simple tasks</span>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='text-accent-foreground font-bold text-lg leading-none w-4 shrink-0'>
                    •
                  </span>
                  <span>Share your thoughts and preferences</span>
                </li>
              </ul>
            </div>

            <div className='p-6 rounded-lg bg-muted/50 border-2 border-border'>
              <h3 className='font-semibold mb-3 text-base'>Why Participate</h3>
              <ul className='space-y-2.5 text-base text-foreground/85'>
                <li className='flex items-start gap-3'>
                  <span className='text-accent-foreground font-bold text-lg leading-none w-4 shrink-0'>
                    •
                  </span>
                  <span>Help shape the future of website design</span>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='text-accent-foreground font-bold text-lg leading-none w-4 shrink-0'>
                    •
                  </span>
                  <span>Try new AI technology firsthand</span>
                </li>
                <li className='flex items-start gap-3'>
                  <span className='text-accent-foreground font-bold text-lg leading-none w-4 shrink-0'>
                    •
                  </span>
                  <span>Your opinion matters and makes a difference</span>
                </li>
              </ul>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-6'>
            <Link
              href='/survey'
              className='inline-flex items-center gap-2 px-8 py-4 bg-foreground text-primary-foreground rounded-full text-base font-medium hover:bg-foreground/90 transition-colors shadow-md'
            >
              Start Participating
              <ArrowRight className='w-5 h-5' />
            </Link>
            <p className='text-sm text-foreground/80 font-medium'>
              Takes about 15-20 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
