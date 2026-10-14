export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  ts: number;
  isEmergency?: boolean;
  isStreaming?: boolean;
};

export type Severity = 1 | 2 | 3 | 4 | 5;

export type JournalEntry = {
  id: string;
  ts: number;
  symptoms: string;
  severity: Severity;
  notes: string;
};
