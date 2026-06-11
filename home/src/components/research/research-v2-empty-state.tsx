import { FileJson } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PROTOCOL_COLORS } from "@/lib/study-protocol-labels";
import { cn } from "@/lib/utils";

const v2 = PROTOCOL_COLORS.v2_criteria;

export function ResearchV2EmptyState() {
  return (
    <Card className={cn("border-dashed", v2.borderClass, "bg-amber-500/5")}>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <FileJson className={cn("h-5 w-5", v2.accentClass)} />
          <CardTitle>Criteria tasks snapshot not available</CardTitle>
        </div>
        <CardDescription>
          The v2 criteria protocol data has not been exported yet. Add{" "}
          <code className='text-xs bg-muted px-1 py-0.5 rounded'>
            home/src/data/research-v2.json
          </code>{" "}
          using the same <code className='text-xs bg-muted px-1 py-0.5 rounded'>json_build_object</code>{" "}
          wrapper shape as <code className='text-xs bg-muted px-1 py-0.5 rounded'>research.json</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className='text-sm text-muted-foreground'>
        For live v2 data, use the authenticated{" "}
        <a
          href='/analysis/v2'
          className={cn(v2.accentClass, "underline underline-offset-4")}
        >
          Analysis dashboard (v2)
        </a>
        .
      </CardContent>
    </Card>
  );
}
