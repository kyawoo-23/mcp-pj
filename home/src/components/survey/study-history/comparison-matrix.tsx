"use client";

import type { CompareRow } from "@/lib/study-history";
import { DeltaBadge } from "./delta-badge";
import type { HistoryModalityFilter } from "@/lib/study-history";
import { HISTORY_SYSTEM_LABELS } from "@/lib/study-history";
import { MetricBar } from "./metric-bar";
import {
  CompareTableColGroup,
  CompareTableHeader,
} from "./compare-table-header";

interface ComparisonMatrixProps {
  rows: CompareRow[];
  modality: HistoryModalityFilter;
  simpleHasData: boolean;
  criteriaHasData: boolean;
  title?: string;
}

function modalitySubtitle(modality: HistoryModalityFilter): string {
  if (modality === "all") return "All modalities";
  return HISTORY_SYSTEM_LABELS[modality];
}

export function ComparisonMatrix({
  rows,
  modality,
  simpleHasData,
  criteriaHasData,
  title = "Performance comparison by metric",
}: ComparisonMatrixProps) {
  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <h3 className='text-sm font-semibold tracking-tight text-pretty'>
          {title}
        </h3>
        <p className='text-xs text-muted-foreground whitespace-nowrap'>
          {modalitySubtitle(modality)}
        </p>
      </div>
      <div className='rounded-xl border border-border/80 bg-card shadow-xs'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[640px] table-fixed border-collapse text-sm'>
            <CompareTableColGroup />
            <CompareTableHeader />
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className='border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors'
                >
                  <th
                    scope='row'
                    className='text-left px-4 py-3 font-medium text-foreground align-top'
                  >
                    <p className='text-pretty'>{row.label}</p>
                    <p className='text-xs font-normal text-muted-foreground mt-0.5 leading-relaxed'>
                      {row.description}
                    </p>
                  </th>
                  <td className='text-right px-4 py-3 tabular-nums font-semibold align-top'>
                    {simpleHasData ? (
                      row.simpleDisplay
                    ) : (
                      <span className='text-muted-foreground/60 text-xs font-normal italic'>
                        No data
                      </span>
                    )}
                    <MetricBar
                      percent={row.simpleBarPercent}
                      variant='simple'
                      className='mt-1.5'
                    />
                  </td>
                  <td className='text-right px-4 py-3 tabular-nums font-semibold align-top'>
                    {criteriaHasData ? (
                      row.criteriaDisplay
                    ) : (
                      <span className='text-muted-foreground/60 text-xs font-normal italic'>
                        No data
                      </span>
                    )}
                    <MetricBar
                      percent={row.criteriaBarPercent}
                      variant='criteria'
                      className='mt-1.5'
                    />
                  </td>
                  <td className='text-right px-4 py-3 align-top'>
                    <DeltaBadge delta={row.delta} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
