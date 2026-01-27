import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ChevronDown, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SurveySectionProps {
  title: string;
  description?: string;
  isOpen: boolean;
  isLocked: boolean;
  isCompleted: boolean;
  children: React.ReactNode;
  onOpen?: () => void;
  className?: string;
}

export function SurveySection({
  title,
  description,
  isOpen,
  isLocked,
  isCompleted,
  children,
  onOpen,
  className,
}: SurveySectionProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isLocked ? "opacity-60 bg-muted/30" : "bg-card",
        isOpen ? "ring-2 ring-primary/5" : "",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between p-6 cursor-pointer",
          isLocked && "cursor-not-allowed",
        )}
        onClick={() => !isLocked && onOpen?.()}
      >
        <div className='flex items-center gap-4'>
          <div className='shrink-0'>
            {isCompleted ? (
              <CheckCircle2 className='h-6 w-6 text-green-500' />
            ) : isLocked ? (
              <Lock className='h-6 w-6 text-muted-foreground' />
            ) : (
              <Circle className='h-6 w-6 text-primary' />
            )}
          </div>
          <div className='space-y-1'>
            <h3 className='font-semibold leading-none tracking-tight flex items-center gap-2'>
              {title}
              {isCompleted && (
                <Badge variant='success' className='ml-2'>
                  Completed
                </Badge>
              )}
              {isOpen && !isCompleted && (
                <Badge variant='secondary' className='ml-2'>
                  In Progress
                </Badge>
              )}
            </h3>
            {description && (
              <p className='text-sm text-muted-foreground'>{description}</p>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2 bg-transparent'>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </div>

      <Collapsible open={isOpen}>
        <CollapsibleContent className='data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden'>
          <div className='px-6 pb-6 pt-0'>{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
