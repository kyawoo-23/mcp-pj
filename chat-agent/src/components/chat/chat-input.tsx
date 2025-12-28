import * as React from "react";
import { ArrowUp, Square, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AVAILABLE_TOOLS } from "@/lib/tool-definitions";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  conversationId?: string | null;
}

export function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
  conversationId,
}: ChatInputProps) {
  const [input, setInput] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [conversationId]);

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
          {/* Left side actions */}
          <div className='flex items-center gap-1'>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8 rounded-full group'>
                  <Wrench className='h-4 w-4 opacity-50 group-hover:opacity-100 transition-all' />
                  <span className='sr-only'>Available tools</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-80 p-0' align='start'>
                <div className='p-4 border-b'>
                  <h4 className='font-medium leading-none'>Available Tools</h4>
                  <p className='text-sm text-muted-foreground mt-1'>
                    The agent can use these tools to help you.
                  </p>
                </div>
                <div className='h-[300px] overflow-y-auto px-2 py-2'>
                  <div className='grid gap-1'>
                    {AVAILABLE_TOOLS.map((tool) => (
                      <div
                        key={tool.name}
                        className='flex items-start gap-3 rounded-lg p-2 text-sm hover:bg-muted/50'
                      >
                        <div className='mt-0.5 rounded-md bg-muted p-1.5 text-foreground'>
                          {tool.icon ? <tool.icon className='h-3.5 w-3.5' /> : <Square className='h-3.5 w-3.5' />}
                        </div>
                        <div className='grid gap-0.5'>
                          <div className='font-medium text-foreground leading-none'>
                            {tool.name.replace(/_/g, " ")}
                          </div>
                          <div className='text-xs text-muted-foreground leading-snug'>
                            {tool.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
