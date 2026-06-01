"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { X, Braces, Copy, Check } from "lucide-react";
import type { AnalysisPayload } from "@/lib/types";
import { buildMappedSurveyData } from "@/lib/build-mapped-survey-data";
import type { DemographicDimension } from "@/lib/analysis-calculations";
import {
  AGE_OPTIONS,
  GENDER_OPTIONS,
  PROGRAMMING_EXPERIENCE_OPTIONS,
  AI_TOOL_FREQUENCY_OPTIONS,
} from "@/utils/constants";

const DIMENSION_OPTIONS: Array<{
  value: DemographicDimension;
  label: string;
}> = [
  { value: "age_range", label: "Age range" },
  { value: "gender", label: "Gender" },
  { value: "programming_experience", label: "Programming experience" },
  { value: "ai_tool_frequency", label: "AI usage frequency" },
];

type OptionItem = { value: string; label: string };

function ValueMultiselect({
  dimension,
  selectedValues,
  onValuesChange,
}: {
  dimension: DemographicDimension;
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
}) {
  const options = VALUE_OPTIONS_MAP[dimension];
  const selectedItems = options.filter((o) => selectedValues.includes(o.value));

  const handleValueChange = (newVal: OptionItem | OptionItem[] | null) => {
    if (!newVal) {
      onValuesChange([]);
      return;
    }
    const arr = Array.isArray(newVal) ? newVal : [newVal];
    const vals = arr.map((o) => o.value);
    onValuesChange(vals);
  };

  return (
    <Combobox
      items={options}
      multiple
      value={selectedItems}
      onValueChange={handleValueChange}
      itemToStringValue={(item) => item.value}
      itemToStringLabel={(item) => item.label}
    >
      <ComboboxChips className='min-w-[130px] max-w-[200px] border-0 bg-transparent shadow-none focus-within:ring-0'>
        <ComboboxValue>
          {(val: OptionItem | OptionItem[] | null) =>
            Array.isArray(val)
              ? val.map((item) => (
                  <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
                ))
              : null
          }
        </ComboboxValue>
        <ComboboxChipsInput placeholder='Select…' className='min-w-12' />
      </ComboboxChips>
      <ComboboxContent className='min-w-[180px]'>
        <ComboboxEmpty>No matches.</ComboboxEmpty>
        <ComboboxList>
          {(item: OptionItem) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

const VALUE_OPTIONS_MAP: Record<
  DemographicDimension,
  Array<{ value: string; label: string }>
> = {
  age_range: AGE_OPTIONS.map((o) => ({
    value: String(o.value),
    label: o.label,
  })),
  gender: GENDER_OPTIONS.map((o) => ({
    value: String(o.value),
    label: o.label,
  })),
  programming_experience: PROGRAMMING_EXPERIENCE_OPTIONS.map((o) => ({
    value: String(o.value),
    label: o.label,
  })),
  ai_tool_frequency: AI_TOOL_FREQUENCY_OPTIONS.map((o) => ({
    value: String(o.value),
    label: o.label,
  })),
};

export interface DemographicFilterValue {
  dimension: DemographicDimension;
  values: string[];
}

function SurveyDataDialog({
  effectivePayload,
  activeTab,
  filters,
}: {
  effectivePayload: AnalysisPayload | null;
  activeTab: "all" | "completed";
  filters: DemographicFilterValue[];
}) {
  const [copied, setCopied] = useState(false);
  const mappedData = useMemo(
    () =>
      effectivePayload
        ? buildMappedSurveyData(
            effectivePayload,
            activeTab,
            filters.filter((f) => f.values?.length),
          )
        : null,
    [effectivePayload, activeTab, filters],
  );

  const handleCopy = useCallback(async () => {
    if (!mappedData) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(mappedData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [mappedData]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className='gap-1.5 border-muted-foreground/30 text-muted-foreground hover:bg-muted/50'
          aria-label='View mapped survey and interview data'
        >
          <Braces className='h-3.5 w-3.5' />
          Survey data
        </Button>
      </DialogTrigger>
      <DialogContent
        className='max-w-[90vw] sm:max-w-4xl max-h-[85vh] flex flex-col gap-4'
        showCloseButton={true}
      >
        <DialogHeader className='flex-row items-center justify-between gap-4'>
          <DialogTitle className='flex-1'>
            Survey & interview data (tab: {activeTab}
            {filters.some((f) => f.values?.length) ? ", filtered" : ""})
          </DialogTitle>
          {mappedData && (
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
          )}
        </DialogHeader>
        <div className='overflow-auto rounded-md border bg-muted/30 p-4 text-xs'>
          {effectivePayload !== null && mappedData ? (
            <JsonView
              data={mappedData}
              shouldExpandNode={allExpanded}
              style={defaultStyles}
            />
          ) : (
            <span className='text-muted-foreground'>No data available.</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DemographicFilterBarProps {
  filters: DemographicFilterValue[];
  onFiltersChange: (filters: DemographicFilterValue[]) => void;
  filteredCount?: number;
  /** Effective payload (respects tab + filters). Used for mapped survey data popup. */
  effectivePayload?: AnalysisPayload | null;
  /** Current tab: all | completed */
  activeTab?: "all" | "completed";
}

export function DemographicFilterBar({
  filters,
  onFiltersChange,
  filteredCount,
  effectivePayload,
  activeTab = "all",
}: DemographicFilterBarProps) {
  const usedDimensions = useMemo(
    () => new Set(filters.map((f) => f.dimension)),
    [filters],
  );
  const availableDimensions = useMemo(
    () => DIMENSION_OPTIONS.filter((d) => !usedDimensions.has(d.value)),
    [usedDimensions],
  );
  const canAddMore = availableDimensions.length > 0 && filters.length < 4;

  const addFilter = () => {
    const nextDimension = availableDimensions[0];
    if (!nextDimension) return;
    onFiltersChange([
      ...filters,
      { dimension: nextDimension.value, values: [] },
    ]);
  };

  const updateFilter = (
    index: number,
    updates: Partial<DemographicFilterValue>,
  ) => {
    const next = [...filters];
    next[index] = { ...next[index], ...updates };
    onFiltersChange(next);
  };

  const removeFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <Label className='text-sm text-muted-foreground'>
          Filter by demographic:
        </Label>
        {filters.length === 0 && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='border-primary/50 text-primary hover:bg-primary/10 hover:border-primary/70'
            onClick={addFilter}
          >
            Add filter
          </Button>
        )}
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        {filters.map((filter, index) => (
          <div
            key={`${filter.dimension}-${index}`}
            className='flex items-center gap-2 rounded-md border border-primary/25 bg-white px-2 py-1.5'
          >
            <Select
              value={filter.dimension}
              onValueChange={(v) => {
                updateFilter(index, {
                  dimension: v as DemographicDimension,
                  values: [],
                });
              }}
            >
              <SelectTrigger className='h-8 w-[140px] border-0 bg-transparent font-semibold text-muted-foreground shadow-none focus:ring-0'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIMENSION_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    disabled={filters.some(
                      (f, j) => j !== index && f.dimension === opt.value,
                    )}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className='text-muted-foreground'>:</span>
            <ValueMultiselect
              dimension={filter.dimension}
              selectedValues={filter.values}
              onValuesChange={(values) => updateFilter(index, { values })}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-6 w-6 shrink-0'
              onClick={() => removeFilter(index)}
              aria-label='Remove filter'
            >
              <X className='h-3.5 w-3.5' />
            </Button>
          </div>
        ))}
        {filters.length > 0 && canAddMore && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='border-primary/50 text-primary hover:bg-primary/10 hover:border-primary/70'
            onClick={addFilter}
          >
            + Add filter
          </Button>
        )}
        {filters.length > 0 && filteredCount !== undefined && (
          <span className='text-sm text-muted-foreground'>
            (n={filteredCount})
          </span>
        )}
      </div>
      {effectivePayload !== undefined && (
        <SurveyDataDialog
          effectivePayload={effectivePayload}
          activeTab={activeTab}
          filters={filters}
        />
      )}
    </div>
  );
}
