"use client";

import { MessageSquare, Calendar, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeMessageProps {
  onPromptSelect: (prompt: string) => void;
}

export function WelcomeMessage({ onPromptSelect }: WelcomeMessageProps) {
  const chips = [
    {
      label: "Find a course",
      icon: Search,
      prompt: "Find a course about machine learning",
    },
    {
      label: "Check my schedule",
      icon: Calendar,
      prompt: "What is my class schedule for today?",
    },
    {
      label: "Book a facility",
      icon: BookOpen,
      prompt: "I want to book a study room",
    },
    {
      label: "My Bookings",
      icon: BookOpen,
      prompt: "Show my upcoming facility bookings",
    },
  ];

  return (
    <div className='flex h-full w-full flex-col items-center justify-center p-8 text-center'>
      <div className='mb-8 flex flex-col items-center gap-4'>
        <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10'>
          <MessageSquare className='h-8 w-8 text-primary' />
        </div>
        <div className='max-w-md space-y-2'>
          <h2 className='text-2xl font-semibold tracking-tight'>
            Welcome to Chat Agent
          </h2>
          <p className='text-muted-foreground text-sm'>
            I can help you with course registration, facility booking, and
            checking your schedule.
          </p>
        </div>
      </div>

      <div className='grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2'>
        {chips.map((chip) => (
          <Button
            key={chip.label}
            variant='outline'
            className='flex h-auto items-center justify-start gap-4 p-4 hover:bg-accent/50 hover:border-primary/50 transition-all'
            onClick={() => onPromptSelect(chip.prompt)}
          >
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors'>
              <chip.icon className='h-5 w-5' />
            </div>
            <div className='flex flex-col items-start gap-1 text-left'>
              <span className='font-medium'>{chip.label}</span>
              <span className='text-xs text-muted-foreground font-normal line-clamp-1'>
                &quot;{chip.prompt}&quot;
              </span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
