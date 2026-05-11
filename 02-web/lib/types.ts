export interface LogEntry {
  id: string;
  date: string;
  time: string;
  timestamp: string;
  content: string;
}

export interface Summary {
  date: string;
  generatedAt: string;
  content: string;
}

export interface DateStats {
  date: string;
  entryCount: number;
  hasSummary: boolean;
}
