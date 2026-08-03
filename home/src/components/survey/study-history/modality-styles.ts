import type { HistoryModalityFilter } from "@/lib/study-history";

type Modality = Exclude<HistoryModalityFilter, "all">;

export const MODALITY_LABEL_CLASS: Record<Modality, string> = {
  traditional: "text-traditional",
  chat_agent: "text-chat",
};
