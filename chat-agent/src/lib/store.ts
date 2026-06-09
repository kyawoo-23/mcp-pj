import { create } from "zustand";

interface TaskState {
  activeTask: {
    taskCode: string;
    title: string;
    sessionId: string;
    progressId: string;
    status: "in_progress" | "completed";
  } | null;
  taskRefreshNonce: number;
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
  requestTaskRefresh: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  activeTask: null,
  taskRefreshNonce: 0,
  setActiveTask: (activeTask) => set({ activeTask }),
  completeTask: () =>
    set((state) =>
      state.activeTask
        ? { activeTask: { ...state.activeTask, status: "completed" } }
        : {}
    ),
  requestTaskRefresh: () =>
    set((state) => ({ taskRefreshNonce: state.taskRefreshNonce + 1 })),
}));
