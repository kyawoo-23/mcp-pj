import * as React from "react";
import { ArrowUp, Square, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading || disabled) return;
    onSend(input);
    setInput("");

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-grow
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className='relative flex w-full flex-col items-center bg-background p-4'>
      <div className='relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-input bg-background shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring'>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder='Send a message...'
          className='min-h-[60px] w-full resize-none border-0 bg-transparent px-4 py-4 pr-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0'
          disabled={disabled}
        />

        <div className='flex items-center justify-between px-3 py-2'>
          {/* Left side actions (placeholder) */}
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-muted-foreground'
              disabled
            >
              <Paperclip className='h-5 w-5' />
              <span className='sr-only'>Attach file</span>
            </Button>
          </div>

          {/* Right side actions */}
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || disabled}
            size='icon'
            className={cn(
              "h-8 w-8 rounded-full transition-all",
              input.trim()
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isLoading ? (
              <Square className='h-4 w-4 fill-current' />
            ) : (
              <ArrowUp className='h-5 w-5' />
            )}
            <span className='sr-only'>Send message</span>
          </Button>
        </div>
      </div>
      <div className='mt-2 text-center text-xs text-muted-foreground'>
        Research Chat can make mistakes. Check important info.
      </div>
    </div>
  );
}
