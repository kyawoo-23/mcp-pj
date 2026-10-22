"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const VIDEO_ID = "D1r2y6SI_N0";
const VIDEO_TITLE =
  "Traditional Interfaces vs Conversational AI — project presentation";

export function ProjectVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section
      className='py-16 md:py-24 px-6 bg-background'
      aria-labelledby='project-video-heading'
    >
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8 text-center max-w-xl mx-auto'>
          <p className='text-[10px] tracking-[0.2em] uppercase text-foreground/50 font-bold mb-3'>
            Project presentation
          </p>
          <h2
            id='project-video-heading'
            className='text-3xl md:text-4xl font-medium tracking-tight text-foreground text-balance'
          >
            Traditional interfaces and conversational AI
          </h2>
          <p className='mt-4 text-foreground/60 text-base leading-relaxed'>
            A short walkthrough of the study: the same university tasks, done
            through a traditional interface and through conversation.
          </p>
        </div>

        <div className='relative aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-muted'>
          {playing ? (
            <iframe
              className='absolute inset-0 h-full w-full'
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
              title={VIDEO_TITLE}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              referrerPolicy='strict-origin-when-cross-origin'
              allowFullScreen
            />
          ) : (
            <button
              type='button'
              onClick={() => setPlaying(true)}
              className='group absolute inset-0 cursor-pointer'
              aria-label={`Play video: ${VIDEO_TITLE}`}
            >
              <Image
                src={`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                alt=''
                fill
                sizes='(min-width: 56rem) 56rem, 100vw'
                className='object-cover'
              />
              <span className='absolute inset-0 bg-foreground/25 transition-colors group-hover:bg-foreground/35' />
              <span className='absolute inset-0 flex items-center justify-center'>
                <span className='flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-105'>
                  <Play
                    className='ml-1 h-7 w-7 fill-current'
                    aria-hidden='true'
                  />
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
