import { create } from "zustand";

interface TaskState {
  activeTask: {
    taskCode: string;
    title: string;
    sessionId: string;
    progressId: string;
    status: "in_progress" | "completed";
  } | null;
  setActiveTask: (
    task: {
      taskCode: string;
      title: string;
      sessionId: string;
      progressId: string;
      status: "in_progress" | "completed";
    } | null
  ) => void;
  completeTask: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  activeTask: null,
  setActiveTask: (activeTask) => set({ activeTask }),
  completeTask: () =>
    set((state) =>
      state.activeTask
        ? { activeTask: { ...state.activeTask, status: "completed" } }
        : {}
    ),
}));
