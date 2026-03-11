"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { JsonView, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { Braces, Copy, Check } from "lucide-react";
import type { AnalysisPayload } from "@/lib/types";

interface ResearchDataDialogProps {
  data: AnalysisPayload;
}

export function ResearchDataDialog({ data }: ResearchDataDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [data]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-1.5 border-muted-foreground/30 text-muted-foreground hover:bg-muted/50'
          aria-label='View raw research data'
        >
          <Braces className='h-3.5 w-3.5' />
          Raw data
        </Button>
      </DialogTrigger>
      {isOpen && (
        <DialogContent
          className='max-w-[90vw] sm:max-w-4xl max-h-[85vh] flex flex-col gap-4'
          showCloseButton={true}
        >
          <DialogHeader className='flex-row items-center justify-between gap-4'>
            <DialogTitle className='flex-1'>
              Research Study Raw Data (JSON)
            </DialogTitle>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='shrink-0 gap-1.5'
              onClick={handleCopy}
              aria-label='Copy JSON to clipboard'
            >
              {copied ? (
                <>
                  <Check className='h-3.5 w-3.5 text-green-600' />
                  <span className='text-green-600'>Copied</span>
                </>
              ) : (
                <>
                  <Copy className='h-3.5 w-3.5' />
                  Copy
                </>
              )}
            </Button>
          </DialogHeader>
          <div className='overflow-auto rounded-md border bg-muted/30 p-4 text-xs'>
            <JsonView
              data={data}
              shouldExpandNode={(level) => level < 1}
              style={defaultStyles}
            />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
