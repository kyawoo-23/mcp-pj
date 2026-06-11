"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardList, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type {
  StudyHistoryInterview,
  StudyHistorySurveyResponse,
  StudyHistoryTask,
} from "@/lib/study-history";
import {
  groupHistoryByProtocol,
  protocolSectionHasData,
} from "@/lib/study-history";
import { SurveyNavbar } from "@/components/survey/survey-navbar";
import { StudyHistoryCompareView } from "@/components/survey/study-history/study-history-compare-view";

interface StudyHistoryClientProps {
  tasks: StudyHistoryTask[];
  surveyResponses: StudyHistorySurveyResponse[];
  interviewResponses: StudyHistoryInterview[];
}

function hasAnyParticipationData(
  tasks: StudyHistoryTask[],
  surveyResponses: StudyHistorySurveyResponse[],
  interviewResponses: StudyHistoryInterview[],
): boolean {
  const grouped = groupHistoryByProtocol(
    tasks,
    surveyResponses,
    interviewResponses,
  );
  for (const data of grouped.values()) {
    if (
      protocolSectionHasData(
        data.tasks,
        data.surveyResponses,
        data.interviewResponses,
      )
    ) {
      return true;
    }
  }
  return false;
}

export function StudyHistoryClient({
  tasks,
  surveyResponses,
  interviewResponses,
}: StudyHistoryClientProps) {
  const hasData = hasAnyParticipationData(
    tasks,
    surveyResponses,
    interviewResponses,
  );

  return (
    <div className='min-h-screen bg-muted/20'>
      <SurveyNavbar hasStudyHistory />

      <div className='container mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6'>
        <header className='space-y-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button variant='link' size='icon' className='shrink-0' asChild>
              <Link href='/survey' aria-label='Back to survey'>
                <ArrowLeft className='h-5 w-5' />
              </Link>
            </Button>
            <h1 className='text-2xl font-bold tracking-tight'>
              My study results
            </h1>
          </div>
          <p className='text-sm text-muted-foreground max-w-2xl'>
            Compare Simple Task and Criteria Task performance side-by-side across
            tasks, surveys, and interview responses.
          </p>
        </header>

        <Alert>
          <Info className='h-4 w-4' aria-hidden />
          <AlertTitle>Read-only review</AlertTitle>
          <AlertDescription>
            <p>
              This page shows your recorded responses. To continue or update
              your active study, return to the{" "}
              <Link
                href='/survey'
                className='font-medium text-primary underline underline-offset-2'
              >
                survey dashboard
              </Link>
              .
            </p>
          </AlertDescription>
        </Alert>

        {!hasData ? (
          <Card className='py-10'>
            <CardContent className='flex flex-col items-center gap-4 text-center'>
              <ClipboardList
                className='h-12 w-12 text-muted-foreground/30'
                aria-hidden
              />
              <div className='space-y-1'>
                <p className='font-semibold'>Nothing on file yet</p>
                <p className='text-sm text-muted-foreground'>
                  No study results are associated with your account yet.
                </p>
              </div>
              <div className='pt-4 flex justify-center'>
                <Button
                  asChild
                  variant='default'
                  size='lg'
                  className='px-6 font-semibold shadow-md border-2 border-primary/80'
                >
                  <Link href='/survey'>
                    <ArrowLeft className='h-4 w-4 mr-2' />
                    Back to survey
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <StudyHistoryCompareView
              tasks={tasks}
              surveyResponses={surveyResponses}
              interviewResponses={interviewResponses}
            />

            <div className='pt-4 flex justify-center'>
              <Button
                asChild
                variant='default'
                size='lg'
                className='px-6 font-semibold shadow-md border-2 border-primary/80'
              >
                <Link href='/survey'>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back to survey
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
