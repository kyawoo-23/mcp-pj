import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TasksPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_TASK !== "true") {
    notFound();
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-6'>
      <Card className='w-full max-w-xl shadow-lg'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <ClipboardCheck className='size-5 text-primary' />
            Task-Based Completion Event
          </CardTitle>
          <CardDescription>
            Enter a focused task session to complete research steps in a
            structured, checklist-driven flow.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 text-sm text-muted-foreground'>
          <p>
            This area is designed for task execution during your research
            conduct. You can sequence tasks, mark progress, and track completion
            without leaving the chat experience.
          </p>
          <p>
            Use the button below to begin when you are ready to start a task
            session.
          </p>
        </CardContent>
        <CardFooter className='flex items-center justify-between'>
          <Button asChild variant='outline'>
            <Link href='/courses'>Return to Courses</Link>
          </Button>
          <Button
            asChild
            className='transition-all duration-300 ease-out hover:-translate-y-0.5'
          >
            <Link href='/tasks/session'>
              Start Task Session
              <ArrowRight className='size-4' />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
