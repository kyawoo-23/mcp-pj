import Image from "next/image";
import { Menu, Info, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChatStatus } from "@/lib/types";
import { THINKING_LABEL } from "@/lib/chat-activity";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  title: string;
  status?: ChatStatus;
  /** While submitted/streaming: tool-aware text when tools run, else short defaults */
  busyCaption?: string;
  onMobileMenuToggle: () => void;
}

export function ChatHeader({
  title,
  status = "ready",
  busyCaption,
  onMobileMenuToggle,
}: ChatHeaderProps) {
  return (
    <header className='sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-3 sm:px-4 backdrop-blur supports-backdrop-filter:bg-background/60'>
      <div className='flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1'>
        <Button
          variant='ghost'
          size='icon'
          className='md:hidden shrink-0'
          onClick={onMobileMenuToggle}
        >
          <Menu className='h-5 w-5' />
          <span className='sr-only'>Open sidebar</span>
        </Button>

        <div className='flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden group'>
          <Image
            src='/logo.svg'
            alt='Chat Agent'
            width={20}
            height={20}
            className='h-5 w-5'
          />
          <span className='text-xs sm:text-sm font-medium hidden sm:inline'>
            Chat Agent
          </span>
          <span className='hidden sm:inline'>/</span>
          <span className='text-xs sm:text-sm font-semibold text-muted-foreground truncate'>
            {title}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-1 sm:gap-2 shrink-0'>
        <div
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 rounded-full px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold transition-all duration-300 border shadow-sm",
            {
              "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 ring-1 ring-emerald-500/10":
                status === "ready",
              "bg-amber-500/10 text-amber-600 border-amber-500/20 ring-1 ring-amber-500/10 animate-pulse ring-offset-2 ring-offset-background":
                status === "submitted" || status === "streaming",
              "bg-red-500/10 text-red-600 border-red-500/20 ring-1 ring-red-500/10":
                status === "error",
            },
          )}
        >
          {status === "ready" && (
            <div className='flex items-center gap-1.5'>
              <div className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
              <span>Ready</span>
            </div>
          )}
          {(status === "submitted" || status === "streaming") && (
            <div
              className='flex min-w-0 max-w-[min(52vw,13rem)] sm:max-w-[16rem] items-center gap-1.5'
              role='status'
              aria-live='polite'
              aria-busy='true'
              title={busyCaption}
            >
              <Loader2 className='h-3 w-3 shrink-0 animate-spin' aria-hidden />
              <span className='truncate'>{busyCaption ?? THINKING_LABEL}</span>
            </div>
          )}
          {status === "error" && (
            <div className='flex items-center gap-1.5'>
              <AlertCircle className='h-3 w-3' />
              <span>Error</span>
            </div>
          )}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant='ghost' size='icon'>
              <Info className='h-5 w-5' />
              <span className='sr-only'>Info</span>
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[480px]'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Info className='h-5 w-5 text-primary' />
                Project Information
              </DialogTitle>
              <DialogDescription className='text-left space-y-4 pt-4'>
                <p>
                  Since this is a <strong>testing/research project</strong>, the
                  server for MCP isn&apos;t running on expensive infrastructure.
                </p>
                <p>
                  A{" "}
                  <strong>
                    limited{" "}
                    {process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_MODEL_ID ||
                      "gemini-2.5-flash"}{" "}
                    model
                  </strong>{" "}
                  is used, so you may face{" "}
                  <strong>errors or long waiting times</strong>.
                </p>
                <div className='bg-primary/5 p-3 rounded-md text-primary font-medium'>
                  In those cases, please <strong>refresh the website</strong>{" "}
                  and <strong>open a new chat</strong> if necessary.
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <ModeToggle />
      </div>
    </header>
  );
}
