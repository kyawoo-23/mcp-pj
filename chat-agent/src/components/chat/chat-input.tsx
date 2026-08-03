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

const PLACEHOLDER_TIPS = [
  "Which course would you like to join?",
  "Tell me which class you want to drop",
  "Need a room or facility? Say when and where",
  "Want to cancel a booking? Just name it",
  "Ask what's on your schedule this week",
  "Type in any language you're comfortable with",
] as const;

const TIP_CYCLE_MS = 4000;
const TIP_FADE_MS = 300;

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  conversationId?: string | null;
}

export interface ChatInputHandle {
  setInput: (value: string) => void;
  focus: () => void;
}

export const ChatInput = React.forwardRef<ChatInputHandle, ChatInputProps>(
  ({ onSend, isLoading = false, disabled = false, conversationId }, ref) => {
    const [input, setInput] = React.useState("");
    const [tipIndex, setTipIndex] = React.useState(0);
    const [tipVisible, setTipVisible] = React.useState(true);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const showPlaceholderTip = !input.trim() && !disabled;

    React.useEffect(() => {
      if (!showPlaceholderTip) return;

      let fadeTimeout: ReturnType<typeof setTimeout>;

      const cycle = setInterval(() => {
        setTipVisible(false);
        fadeTimeout = setTimeout(() => {
          setTipIndex((i) => (i + 1) % PLACEHOLDER_TIPS.length);
          setTipVisible(true);
        }, TIP_FADE_MS);
      }, TIP_CYCLE_MS);

      return () => {
        clearInterval(cycle);
        clearTimeout(fadeTimeout);
      };
    }, [showPlaceholderTip]);

    React.useEffect(() => {
      if (showPlaceholderTip) {
        setTipVisible(true);
      }
    }, [showPlaceholderTip]);

    React.useImperativeHandle(ref, () => ({
      setInput: (value: string) => {
        setInput(value);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(
              textareaRef.current.scrollHeight,
              200
            )}px`;
          }
        }, 0);
      },
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

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

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    };

    return (
      <div className='relative flex w-full flex-col items-center bg-background p-4'>
        <div className='relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-input bg-background shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring'>
          <div className='relative'>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder=' '
              aria-label={PLACEHOLDER_TIPS[tipIndex]}
              className='min-h-[60px] w-full resize-none border-0 bg-transparent px-4 py-4 pr-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0'
              disabled={disabled}
            />
            {showPlaceholderTip ? (
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute top-4 left-4 pr-14 text-base text-muted-foreground transition-opacity duration-300 md:text-sm",
                  tipVisible ? "opacity-100" : "opacity-0"
                )}
              >
                {PLACEHOLDER_TIPS[tipIndex]}
              </span>
            ) : null}
          </div>

          <div className='flex items-center justify-between px-3 py-2'>
            <div className='flex items-center gap-1'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='group h-8 w-8 rounded-full'
                  >
                    <Wrench className='h-4 w-4 opacity-50 transition-all group-hover:opacity-100' />
                    <span className='sr-only'>Available tools</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-80 p-0' align='start'>
                  <div className='border-b p-4'>
                    <h4 className='font-medium leading-none'>Available Tools</h4>
                    <p className='mt-1 text-sm text-muted-foreground'>
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
                            {tool.icon ? (
                              <tool.icon className='h-3.5 w-3.5' />
                            ) : (
                              <Square className='h-3.5 w-3.5' />
                            )}
                          </div>
                          <div className='grid gap-0.5'>
                            <div className='font-medium leading-none text-foreground'>
                              {tool.name.replace(/_/g, " ")}
                            </div>
                            <div className='text-xs leading-snug text-muted-foreground'>
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
          Chat Agent can make mistakes. Check important info.
        </div>
      </div>
    );
  }
);
ChatInput.displayName = "ChatInput";
