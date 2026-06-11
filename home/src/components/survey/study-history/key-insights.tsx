"use client";

import { ArrowDown, ArrowUp, CheckCircle2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getBiggestChangeInsightParts,
  getSusChangeInsightParts,
  type CompareRow,
  type InsightContentPart,
  type InsightTrend,
} from "@/lib/study-history";
import { COMPARE_THEME } from "@/lib/study-protocol-labels";
import { cn } from "@/lib/utils";

interface KeyInsightsProps {
  rows: CompareRow[];
}

type InsightCard = {
  text: string;
  icon: "check" | "arrow" | "plus";
  content?: InsightContentPart[];
  trend?: InsightTrend;
};

function buildInsights(rows: CompareRow[]): InsightCard[] {
  const insights: InsightCard[] = [];
  const comparable = rows.filter(
    (r) => r.delta.direction === "better" || r.delta.direction === "worse",
  );
  const betterCount = rows.filter((r) => r.delta.direction === "better").length;

  if (
    betterCount >= Math.ceil(comparable.length * 0.6) &&
    comparable.length >= 3
  ) {
    insights.push({
      text: "Criteria Task outperforms Simple Task in most key metrics.",
      icon: "check",
    });
  }

  const biggestChange = [...rows]
    .filter(
      (r) =>
        (r.delta.direction === "better" || r.delta.direction === "worse") &&
        r.simpleValue !== null &&
        r.criteriaValue !== null,
    )
    .sort((a, b) => {
      const aDiff = Math.abs((a.criteriaValue ?? 0) - (a.simpleValue ?? 0));
      const bDiff = Math.abs((b.criteriaValue ?? 0) - (b.simpleValue ?? 0));
      return bDiff - aDiff;
    })[0];

  if (biggestChange) {
    const parts = getBiggestChangeInsightParts(biggestChange);
    if (parts) {
      insights.push({
        text: parts.text,
        content: parts.content,
        trend: parts.trend,
        icon: "arrow",
      });
    }
  }

  const competence = rows.find((r) => r.id === "confidence");
  if (
    competence?.criteriaValue !== null &&
    competence?.criteriaValue !== undefined &&
    competence?.simpleValue !== null &&
    competence?.simpleValue !== undefined &&
    competence.criteriaValue > competence.simpleValue
  ) {
    insights.push({
      text: "Users report higher competence with Criteria Task.",
      icon: "plus",
    });
  }

  const sus = rows.find((r) => r.id === "sus");
  if (sus) {
    const parts = getSusChangeInsightParts(sus);
    if (parts) {
      insights.push({
        text: parts.text,
        content: parts.content,
        trend: parts.trend,
        icon: "arrow",
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      text: "No strong performance gap is detected across the selected metrics.",
      icon: "check",
    });
  }

  return insights.slice(0, 3);
}

const insightIconClass = cn(
  "h-5 w-5 mt-0.5 shrink-0",
  COMPARE_THEME.criteria.accentClass,
);

const insightEmphasisClass = cn(
  "font-semibold",
  COMPARE_THEME.criteria.strongClass,
);

function InsightBody({ insight }: { insight: InsightCard }) {
  if (insight.content) {
    return (
      <p className='text-sm leading-relaxed'>
        {insight.content.map((part, index) =>
          typeof part === "string" ? (
            part
          ) : (
            <span key={index} className={insightEmphasisClass}>
              {part.text}
            </span>
          ),
        )}
      </p>
    );
  }

  return <p className='text-sm leading-relaxed'>{insight.text}</p>;
}

function InsightIcon({
  type,
  trend = "better",
}: {
  type: InsightCard["icon"];
  trend?: InsightTrend;
}) {
  switch (type) {
    case "arrow": {
      const Arrow = trend === "worse" ? ArrowDown : ArrowUp;
      return (
        <Arrow
          className={cn(
            "h-5 w-5 mt-0.5 shrink-0",
            trend === "worse"
              ? "text-red-600 dark:text-red-400"
              : COMPARE_THEME.criteria.accentClass,
          )}
          aria-hidden
        />
      );
    }
    case "plus":
      return <Plus className={insightIconClass} aria-hidden />;
    default:
      return <CheckCircle2 className={insightIconClass} aria-hidden />;
  }
}

export function KeyInsights({ rows }: KeyInsightsProps) {
  const insights = buildInsights(rows);

  return (
    <section aria-labelledby='key-insights-heading' className='space-y-3'>
      <h2
        id='key-insights-heading'
        className='text-sm font-semibold tracking-tight'
      >
        Key insights
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
        {insights.map((insight) => (
          <Card key={insight.text} className='shadow-xs border-border/80'>
            <CardContent className='p-4 flex items-start gap-2.5'>
              <InsightIcon type={insight.icon} trend={insight.trend} />
              <InsightBody insight={insight} />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
