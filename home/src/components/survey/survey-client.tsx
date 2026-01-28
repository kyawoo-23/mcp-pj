"use client";

import { useEffect, useState } from "react";
import type {
  InterviewQuestionRow,
  ProfileRow,
  SurveyQuestionRow,
  SurveyResponseRow,
  SurveyRow,
  TaskDefinitionRow,
  TaskProgressRow,
  TaskSessionRow,
  UserInterviewResponseRow,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/survey/task-list";
import { ChatAgentSurvey } from "@/components/survey/chat-agent-survey";
import { TraditionalSurvey } from "@/components/survey/traditional-survey";
import { InterviewForm } from "@/components/survey/interview-form";
import { SurveySection } from "@/components/survey/survey-section";
import { DemographicsForm } from "@/components/survey/demographics-form";
import { useSurveyData } from "@/hooks/use-survey-data";
import { SurveyNavbar } from "@/components/survey/survey-navbar";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SurveyPageClientProps {
  profile: Pick<ProfileRow, "id" | "age_range" | "gender"> | null;
  sessions: TaskSessionRow[];
  taskDefinitions: TaskDefinitionRow[];
  taskProgress: TaskProgressRow[];
  surveys: SurveyRow[];
  surveyQuestions: SurveyQuestionRow[];
  surveyResponses: SurveyResponseRow[];
  interviewQuestions: InterviewQuestionRow[];
  interviewResponses: UserInterviewResponseRow[];
}

type SectionKey =
  | "intro"
  | "traditional_tasks"
  | "traditional_survey"
  | "chat_tasks"
  | "chat_survey"
  | "interview";

export function SurveyPageClient({
  profile,
  sessions,
  taskDefinitions,
  taskProgress,
  surveys,
  surveyQuestions,
  surveyResponses,
  interviewQuestions,
  interviewResponses,
}: SurveyPageClientProps) {
  const [activeSection, setActiveSection] = useState<SectionKey | null>(
    "intro",
  );

  const {
    // State
    profileState,
    surveyResponsesState,
    interviewResponsesState,
    savingDemographics,
    startingSurvey,
    requiresDemographics,

    // Derived data
    tasksBySystem,
    progressByTaskId,
    activeTask,
    chatSession,
    traditionalSession,

    // Completion status
    chatTasksCompleted,
    traditionalTasksCompleted,
    chatSurveyCompleted,
    traditionalSurveyCompleted,
    interviewCompleted,

    // Availability status
    chatSurveyAvailable,
    traditionalSurveyAvailable,
    interviewAvailable,

    // Locking status
    isStarted,
    isChatTasksLocked,
    isChatSurveyLocked,
    isTraditionalTasksLocked,
    isTraditionalSurveyLocked,
    isInterviewLocked,

    // Actions
    saveDemographics,
    startSurvey,
    openTask,
    resetTask,
    refreshTaskData,
  } = useSurveyData({
    profile,
    sessions,
    taskDefinitions,
    taskProgress,
    surveyResponses,
    interviewQuestions,
    interviewResponses,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTaskData();
      toast.success("Status refreshed");
    } catch {
      toast.error("Failed to refresh status");
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Minimum spin time for better UX
    }
  };

  // Auto-expand logic - follows UI order: traditional first, then chat
  useEffect(() => {
    if (requiresDemographics) return;

    if (!isStarted) {
      setActiveSection("intro");
    } else if (!traditionalTasksCompleted) {
      setActiveSection("traditional_tasks");
    } else if (!traditionalSurveyCompleted) {
      setActiveSection("traditional_survey");
    } else if (!chatTasksCompleted) {
      setActiveSection("chat_tasks");
    } else if (!chatSurveyCompleted) {
      setActiveSection("chat_survey");
    } else if (!interviewCompleted) {
      setActiveSection("interview");
    }
  }, [
    requiresDemographics,
    isStarted,
    traditionalTasksCompleted,
    traditionalSurveyCompleted,
    chatTasksCompleted,
    chatSurveyCompleted,
    interviewCompleted,
  ]);

  const handleStartSurvey = async () => {
    const success = await startSurvey();
    if (success) {
      setActiveSection("traditional_tasks");
    }
  };

  const handleResetTask = async (
    task: TaskDefinitionRow,
    session: TaskSessionRow,
  ) => {
    const progress = progressByTaskId.get(task.id);
    if (progress?.status === "completed") {
      return;
    }
    await resetTask(task, session);
  };

  const getNextSectionMessage = (): string => {
    if (!traditionalTasksCompleted) {
      return "Session started. Please proceed to Part 1: Traditional Portal Tasks below.";
    }
    if (!traditionalSurveyCompleted) {
      return "Traditional tasks completed. Please proceed to Part 2: Traditional Portal Experience below.";
    }
    if (!chatTasksCompleted) {
      return "Traditional survey completed. Please proceed to Part 3: Chat Agent Tasks below.";
    }
    if (!chatSurveyCompleted) {
      return "Chat agent tasks completed. Please proceed to Part 4: Chat Agent Experience below.";
    }
    if (!interviewCompleted) {
      return "Chat agent survey completed. Please proceed to Part 5: Final Thoughts below.";
    }
    return "All sections completed. Thank you for participating!";
  };

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingSection, setPendingSection] = useState<SectionKey | null>(null);

  const handleSectionChange = (section: SectionKey | null) => {
    if (activeSection === section) {
      setActiveSection(null);
      return;
    }

    if (hasUnsavedChanges) {
      setPendingSection(section);
      return;
    }

    setActiveSection(section);
  };

  const confirmSectionChange = () => {
    setHasUnsavedChanges(false);
    setActiveSection(pendingSection);
    setPendingSection(null);
  };

  if (requiresDemographics) {
    return (
      <div className='min-h-screen bg-background'>
        <SurveyNavbar onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        <div className='p-6'>
          <div className='mx-auto w-full max-w-5xl'>
            <DemographicsForm
              initialAgeRange={profileState?.age_range ?? null}
              initialGender={profileState?.gender ?? null}
              saving={savingDemographics}
              onSave={saveDemographics}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <SurveyNavbar onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      <div className='p-6'>
        <div className='mx-auto flex w-full max-w-5xl flex-col gap-6'>
          {/* Intro Section */}
          <SurveySection
            title='Getting Started'
            description='Instructions and survey initialization'
            isOpen={activeSection === "intro"}
            isLocked={false}
            isCompleted={isStarted}
            onOpen={() => handleSectionChange("intro")}
          >
            <div className='space-y-4 pt-2'>
              <p className='text-sm text-muted-foreground'>
                This research compares traditional university portals with a
                chat agent interface. Please follow the task prompts and answer
                the surveys honestly.
              </p>
              {!isStarted && (
                <div className='flex flex-col gap-3'>
                  <p className='text-sm font-medium'>
                    Click start to begin the session.
                  </p>
                  <Button
                    disabled={startingSurvey}
                    onClick={handleStartSurvey}
                    className='w-full sm:w-fit'
                  >
                    {startingSurvey ? "Starting..." : "Start survey session"}
                  </Button>
                </div>
              )}
              {isStarted && (
                <div className='flex items-center gap-2 text-green-600'>
                  <span className='text-sm font-medium'>
                    {getNextSectionMessage()}
                  </span>
                </div>
              )}
            </div>
          </SurveySection>

          {/* Traditional Tasks */}
          <SurveySection
            title='Part 1: Traditional Portal Tasks'
            description='Complete the tasks using the standard university portal'
            isOpen={activeSection === "traditional_tasks"}
            isLocked={isTraditionalTasksLocked}
            isCompleted={traditionalTasksCompleted}
            onOpen={() => handleSectionChange("traditional_tasks")}
          >
            <TaskList
              systemType='traditional'
              session={traditionalSession}
              tasks={tasksBySystem.traditional || []}
              progressByTaskId={progressByTaskId}
              activeTaskId={activeTask?.task_definition_id}
              onOpenTask={openTask}
              onResetTask={handleResetTask}
            />
          </SurveySection>

          {/* Traditional Survey */}
          <SurveySection
            title='Part 2: Traditional Portal Experience'
            description='Rate your experience with the traditional portal'
            isOpen={activeSection === "traditional_survey"}
            isLocked={isTraditionalSurveyLocked}
            isCompleted={traditionalSurveyCompleted}
            onOpen={() => handleSectionChange("traditional_survey")}
          >
            <TraditionalSurvey
              session={traditionalSession}
              surveys={surveys}
              surveyQuestions={surveyQuestions}
              surveyResponses={surveyResponsesState}
              enabled={
                traditionalSurveyAvailable && !traditionalSurveyCompleted
              }
              onSubmitted={refreshTaskData}
              onDirtyStateChange={setHasUnsavedChanges}
            />
          </SurveySection>

          {/* Chat Agent Tasks */}
          <SurveySection
            title='Part 3: Chat Agent Tasks'
            description='Complete the tasks using the AI chat assistant'
            isOpen={activeSection === "chat_tasks"}
            isLocked={isChatTasksLocked}
            isCompleted={chatTasksCompleted}
            onOpen={() => handleSectionChange("chat_tasks")}
          >
            <TaskList
              systemType='chat_agent'
              session={chatSession}
              tasks={tasksBySystem.chat_agent || []}
              progressByTaskId={progressByTaskId}
              activeTaskId={activeTask?.task_definition_id}
              onOpenTask={openTask}
              onResetTask={handleResetTask}
            />
          </SurveySection>

          {/* Chat Agent Survey */}
          <SurveySection
            title='Part 4: Chat Agent Experience'
            description='Rate your experience with the chat agent'
            isOpen={activeSection === "chat_survey"}
            isLocked={isChatSurveyLocked}
            isCompleted={chatSurveyCompleted}
            onOpen={() => handleSectionChange("chat_survey")}
          >
            <ChatAgentSurvey
              session={chatSession}
              surveys={surveys}
              surveyQuestions={surveyQuestions}
              surveyResponses={surveyResponsesState}
              enabled={chatSurveyAvailable && !chatSurveyCompleted}
              onSubmitted={refreshTaskData}
              onDirtyStateChange={setHasUnsavedChanges}
            />
          </SurveySection>

          {/* Final Interview */}
          <SurveySection
            title='Part 5: Final Thoughts'
            description='A few final open-ended questions'
            isOpen={activeSection === "interview"}
            isLocked={isInterviewLocked}
            isCompleted={interviewCompleted}
            onOpen={() => handleSectionChange("interview")}
          >
            <InterviewForm
              interviewQuestions={interviewQuestions}
              interviewResponses={interviewResponsesState}
              enabled={interviewAvailable && !interviewCompleted}
              onSubmitted={refreshTaskData}
              onDirtyStateChange={setHasUnsavedChanges}
            />
          </SurveySection>
        </div>
      </div>

      <AlertDialog
        open={pendingSection !== null}
        onOpenChange={(open) => !open && setPendingSection(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in the current section. If you switch
              now, your progress in this section will be lost. Do you want to
              proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay Here</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSectionChange}>
              Proceed & Lose Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
