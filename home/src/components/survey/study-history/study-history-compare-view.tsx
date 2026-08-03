"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { StudyProtocolVersion } from "@/lib/analysis-calculations";
import {
  buildProtocolMetrics,
  buildUnifiedCompareQuestions,
  buildUnifiedTaskCompareRows,
  compareProtocols,
  CONSTRUCT_GROUPS,
  countCompletedTasks,
  filterDisplayCompareRows,
  filterHistoryByModality,
  groupHistoryByProtocol,
  modalityHasMeaningfulCompareData,
  SECTION_COMPARE_GROUPS,
  SUMMARY_CARD_METRIC_IDS,
  type HistoryModalityFilter,
  type ProtocolParticipationData,
  type StudyHistoryInterview,
  type StudyHistorySurveyResponse,
  type StudyHistoryTask,
} from "@/lib/study-history";
import { cn } from "@/lib/utils";
import { TASK_ORDER } from "@/utils/constants";
import { CompareLegend } from "./compare-legend";
import { CompareSummaryCards } from "./compare-summary-cards";
import { ComparisonMatrix } from "./comparison-matrix";
import { ConstructCompareSection } from "./construct-compare-section";
import { InterviewSection } from "./interview-section";
import { KeyInsights } from "./key-insights";
import { ModalityFilter } from "./modality-filter";
import { QuestionCompareTable } from "./question-compare-table";
import { SectionCompareList } from "./section-compare-list";
import { TaskCompareSection } from "./task-compare-section";

type ViewMode = "compare" | "v1_detailed" | "v2_detailed";

const EMPTY_PROTOCOL_DATA: ProtocolParticipationData = {
  tasks: [],
  surveyResponses: [],
  interviewResponses: [],
};

function getDefaultViewMode(
  availableProtocols: StudyProtocolVersion[],
): ViewMode {
  const hasV1 = availableProtocols.includes("v1_simple");
  const hasV2 = availableProtocols.includes("v2_criteria");
  if (hasV1 && hasV2) return "compare";
  if (hasV1) return "v1_detailed";
  return "v2_detailed";
}

function resolveViewMode(
  value: string | null,
  availableProtocols: StudyProtocolVersion[],
): ViewMode {
  const hasV1 = availableProtocols.includes("v1_simple");
  const hasV2 = availableProtocols.includes("v2_criteria");
  const hasBoth = hasV1 && hasV2;
  const defaultMode = getDefaultViewMode(availableProtocols);

  if (value === "compare" && hasBoth) return "compare";
  if (value === "v1_detailed" && hasV1) return "v1_detailed";
  if (value === "v2_detailed" && hasV2) return "v2_detailed";
  if (value === "detailed") {
    return defaultMode === "compare" ? "v1_detailed" : defaultMode;
  }

  return defaultMode;
}

function getCompareViewDescription(viewMode: ViewMode): string {
  if (viewMode === "compare") {
    return "Compare Simple Task and Criteria Task performance side-by-side.";
  }
  if (viewMode === "v1_detailed") {
    return "Detailed Simple Task results across tasks, surveys, and interview responses.";
  }
  return "Detailed Criteria Task results across tasks, surveys, and interview responses.";
}

interface StudyHistoryCompareViewProps {
  tasks: StudyHistoryTask[];
  surveyResponses: StudyHistorySurveyResponse[];
  interviewResponses: StudyHistoryInterview[];
  availableProtocols: StudyProtocolVersion[];
}

export function StudyHistoryCompareView(props: StudyHistoryCompareViewProps) {
  return (
    <Suspense fallback={<StudyHistoryCompareViewFallback />}>
      <StudyHistoryCompareViewContent {...props} />
    </Suspense>
  );
}

function StudyHistoryCompareViewFallback() {
  return (
    <div
      className='space-y-8'
      aria-busy='true'
      aria-label='Loading study results'
    >
      <div className='space-y-3'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='h-5 w-full max-w-xl animate-pulse rounded bg-muted' />
          <div className='h-9 w-52 animate-pulse rounded-lg bg-muted' />
        </div>
        <div className='flex flex-wrap gap-2'>
          <div className='h-9 w-32 animate-pulse rounded-lg bg-muted' />
          <div className='h-9 w-28 animate-pulse rounded-lg bg-muted' />
          <div className='h-9 w-28 animate-pulse rounded-lg bg-muted' />
        </div>
      </div>
    </div>
  );
}

function StudyHistoryCompareViewContent({
  tasks,
  surveyResponses,
  interviewResponses,
  availableProtocols,
}: StudyHistoryCompareViewProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const viewFromUrl = useMemo(
    () => resolveViewMode(viewParam, availableProtocols),
    [viewParam, availableProtocols],
  );

  const hasV1 = availableProtocols.includes("v1_simple");
  const hasV2 = availableProtocols.includes("v2_criteria");
  const hasBoth = hasV1 && hasV2;

  const [modality, setModality] = useState<HistoryModalityFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>(viewFromUrl);

  useEffect(() => {
    setViewMode(viewFromUrl);
  }, [viewFromUrl]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
  };

  const grouped = useMemo(
    () => groupHistoryByProtocol(tasks, surveyResponses, interviewResponses),
    [tasks, surveyResponses, interviewResponses],
  );

  const simpleData = useMemo<ProtocolParticipationData>(
    () =>
      grouped.get("v1_simple") ?? {
        tasks: [],
        surveyResponses: [],
        interviewResponses: [],
      },
    [grouped],
  );
  const criteriaData = useMemo<ProtocolParticipationData>(
    () =>
      grouped.get("v2_criteria") ?? {
        tasks: [],
        surveyResponses: [],
        interviewResponses: [],
      },
    [grouped],
  );

  const displaySimpleData = useMemo(
    () => (viewMode === "v2_detailed" ? EMPTY_PROTOCOL_DATA : simpleData),
    [viewMode, simpleData],
  );
  const displayCriteriaData = useMemo(
    () => (viewMode === "v1_detailed" ? EMPTY_PROTOCOL_DATA : criteriaData),
    [viewMode, criteriaData],
  );

  const simpleMetrics = useMemo(
    () =>
      buildProtocolMetrics(
        displaySimpleData.tasks,
        displaySimpleData.surveyResponses,
        displaySimpleData.interviewResponses,
        modality,
      ),
    [displaySimpleData, modality],
  );

  const criteriaMetrics = useMemo(
    () =>
      buildProtocolMetrics(
        displayCriteriaData.tasks,
        displayCriteriaData.surveyResponses,
        displayCriteriaData.interviewResponses,
        modality,
      ),
    [displayCriteriaData, modality],
  );

  const compareRows = useMemo(
    () =>
      filterDisplayCompareRows(
        compareProtocols(simpleMetrics, criteriaMetrics),
      ),
    [simpleMetrics, criteriaMetrics],
  );

  const summaryRows = useMemo(
    () =>
      compareRows.filter((row) =>
        (SUMMARY_CARD_METRIC_IDS as readonly string[]).includes(row.id),
      ),
    [compareRows],
  );

  const recommendation = useMemo(() => {
    const better = summaryRows.filter(
      (r) => r.delta.direction === "better",
    ).length;
    const worse = summaryRows.filter(
      (r) => r.delta.direction === "worse",
    ).length;
    if (better > worse) return "Criteria Task recommended";
    if (worse > better) return "Simple Task recommended";
    return "No clear winner";
  }, [summaryRows]);

  const unifiedQuestions = useMemo(
    () =>
      buildUnifiedCompareQuestions(
        displaySimpleData.surveyResponses,
        displayCriteriaData.surveyResponses,
        modality,
      ),
    [
      displaySimpleData.surveyResponses,
      displayCriteriaData.surveyResponses,
      modality,
    ],
  );

  const taskRows = useMemo(() => {
    const rows = buildUnifiedTaskCompareRows(
      displaySimpleData.tasks,
      displayCriteriaData.tasks,
    );
    return rows.sort(
      (a, b) =>
        (TASK_ORDER[a.task_code] ?? 999) - (TASK_ORDER[b.task_code] ?? 999),
    );
  }, [displaySimpleData.tasks, displayCriteriaData.tasks]);

  const simpleTaskStats = useMemo(() => {
    const filtered = filterHistoryByModality(displaySimpleData.tasks, modality);
    return countCompletedTasks(filtered);
  }, [displaySimpleData.tasks, modality]);

  const criteriaTaskStats = useMemo(() => {
    const filtered = filterHistoryByModality(
      displayCriteriaData.tasks,
      modality,
    );
    return countCompletedTasks(filtered);
  }, [displayCriteriaData.tasks, modality]);

  const displayInterviews = useMemo(() => {
    const source =
      viewMode === "v2_detailed"
        ? criteriaData.interviewResponses
        : simpleData.interviewResponses;
    return [...source].sort(
      (a, b) =>
        a.task_interview_questions.order_index -
        b.task_interview_questions.order_index,
    );
  }, [
    viewMode,
    simpleData.interviewResponses,
    criteriaData.interviewResponses,
  ]);

  const modalityHasMeaningfulData = useMemo(() => {
    if (viewMode === "v1_detailed") {
      return modalityHasMeaningfulCompareData(
        displaySimpleData.tasks,
        displaySimpleData.surveyResponses,
        modality,
      );
    }
    if (viewMode === "v2_detailed") {
      return modalityHasMeaningfulCompareData(
        displayCriteriaData.tasks,
        displayCriteriaData.surveyResponses,
        modality,
      );
    }
    return (
      modalityHasMeaningfulCompareData(
        displaySimpleData.tasks,
        displaySimpleData.surveyResponses,
        modality,
      ) ||
      modalityHasMeaningfulCompareData(
        displayCriteriaData.tasks,
        displayCriteriaData.surveyResponses,
        modality,
      )
    );
  }, [
    viewMode,
    displaySimpleData.tasks,
    displaySimpleData.surveyResponses,
    displayCriteriaData.tasks,
    displayCriteriaData.surveyResponses,
    modality,
  ]);

  const compareViewDescription = getCompareViewDescription(viewMode);

  const detailedMatrixTitle =
    viewMode === "v1_detailed"
      ? "Simple Task metrics"
      : viewMode === "v2_detailed"
        ? "Criteria Task metrics"
        : "All metrics";

  const showSimpleColumn = viewMode !== "v2_detailed";
  const showCriteriaColumn = viewMode !== "v1_detailed";

  const emptyModalityMessage =
    modality !== "all" && !modalityHasMeaningfulData
      ? `No results for this interface in your study records. Try "Traditional + Chat".`
      : null;

  return (
    <div className='space-y-8'>
      <div className='space-y-3'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <p className='text-sm text-muted-foreground max-w-xl'>
            {compareViewDescription}
          </p>
          <div
            className='inline-flex rounded-lg border border-border/80 p-1'
            role='group'
            aria-label='Switch results view mode'
          >
            {hasBoth ? (
              <button
                type='button'
                aria-pressed={viewMode === "compare"}
                onClick={() => handleViewModeChange("compare")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  viewMode === "compare"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Compare view
              </button>
            ) : null}
            {hasV1 ? (
              <button
                type='button'
                aria-pressed={viewMode === "v1_detailed"}
                onClick={() => handleViewModeChange("v1_detailed")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  viewMode === "v1_detailed"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Simple Task
              </button>
            ) : null}
            {hasV2 ? (
              <button
                type='button'
                aria-pressed={viewMode === "v2_detailed"}
                onClick={() => handleViewModeChange("v2_detailed")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  viewMode === "v2_detailed"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Criteria Task
              </button>
            ) : null}
          </div>
        </div>
        <ModalityFilter value={modality} onChange={setModality} />
      </div>

      {emptyModalityMessage ? (
        <p
          className='rounded-lg border border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground'
          role='status'
        >
          {emptyModalityMessage}
        </p>
      ) : viewMode === "compare" ? (
        <>
          <section aria-labelledby='summary-heading' className='space-y-3'>
            <h2 id='summary-heading' className='sr-only'>
              Summary comparison
            </h2>
            <CompareSummaryCards
              rows={summaryRows}
              recommendation={recommendation}
            />
          </section>

          <CompareLegend />

          <ComparisonMatrix
            rows={compareRows}
            modality={modality}
            simpleHasData={simpleMetrics.hasData}
            criteriaHasData={criteriaMetrics.hasData}
          />

          <section aria-labelledby='sections-heading' className='space-y-3'>
            <h2
              id='sections-heading'
              className='text-sm font-semibold tracking-tight'
            >
              Detailed comparison by section
            </h2>
            <SectionCompareList
              sections={SECTION_COMPARE_GROUPS}
              compareRows={compareRows}
              questions={unifiedQuestions}
              simpleHasData={simpleMetrics.hasData}
              criteriaHasData={criteriaMetrics.hasData}
            />
          </section>

          <section aria-labelledby='questions-heading' className='space-y-3'>
            <h2
              id='questions-heading'
              className='text-sm font-semibold tracking-tight'
            >
              Question-level comparison
            </h2>
            <QuestionCompareTable questions={unifiedQuestions} />
          </section>

          <KeyInsights rows={compareRows} />
        </>
      ) : (
        <>
          <TaskCompareSection
            rows={taskRows}
            simpleCompleted={simpleTaskStats.completed}
            simpleTotal={simpleTaskStats.total}
            criteriaCompleted={criteriaTaskStats.completed}
            criteriaTotal={criteriaTaskStats.total}
            modality={modality}
            showSimple={showSimpleColumn}
            showCriteria={showCriteriaColumn}
          />

          <ComparisonMatrix
            rows={compareRows}
            modality={modality}
            simpleHasData={simpleMetrics.hasData}
            criteriaHasData={criteriaMetrics.hasData}
            title={detailedMatrixTitle}
            showSimple={showSimpleColumn}
            showCriteria={showCriteriaColumn}
          />

          <section aria-labelledby='constructs-heading' className='space-y-3'>
            <h2
              id='constructs-heading'
              className='text-sm font-semibold tracking-tight'
            >
              Breakdown by construct
            </h2>
            <div className='space-y-3'>
              {CONSTRUCT_GROUPS.map((group, index) => (
                <ConstructCompareSection
                  key={group.id}
                  group={group}
                  simpleMetrics={simpleMetrics}
                  criteriaMetrics={criteriaMetrics}
                  questions={unifiedQuestions}
                  modality={modality}
                  defaultOpen={index === 0}
                  showSimple={showSimpleColumn}
                  showCriteria={showCriteriaColumn}
                />
              ))}
            </div>
          </section>

          <section
            aria-labelledby='all-questions-heading'
            className='space-y-3'
          >
            <h2
              id='all-questions-heading'
              className='text-sm font-semibold tracking-tight'
            >
              All survey questions
            </h2>
            <QuestionCompareTable
              questions={unifiedQuestions}
              showSimple={showSimpleColumn}
              showCriteria={showCriteriaColumn}
            />
          </section>

          <InterviewSection interviews={displayInterviews} />
        </>
      )}
    </div>
  );
}
