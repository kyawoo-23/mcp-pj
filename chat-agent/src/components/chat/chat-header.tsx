import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatStatus } from "@/lib/types";
import { ModeToggle } from "@/components/mode-toggle";

interface ChatHeaderProps {
  title: string;
  status?: ChatStatus;
  onMobileMenuToggle: () => void;
}

export function ChatHeader({
  title,
  status = "ready",
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
          <span className='text-xs sm:text-sm font-medium hidden sm:inline'>
            Research Chat
          </span>
          <span className='hidden sm:inline'>/</span>
            <span className='text-xs sm:text-sm font-semibold text-muted-foreground truncate'>
            {title}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-1 sm:gap-2 shrink-0'>
        <div className='flex items-center gap-1 sm:gap-1.5 rounded-full md:bg-muted px-1.5 sm:px-2.5 py-0.5 text-xs font-medium'>
          {status === "submitted" || status === "streaming" ? (
            <div className='h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shrink-0' />
          ) : (
            <div className='h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0' />
          )}
          <span className='text-muted-foreground capitalize hidden sm:inline'>
            {status}
          </span>
        </div>

        <ModeToggle />
      </div>
    </header>
  );
}
