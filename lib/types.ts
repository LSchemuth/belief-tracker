export type EntryType = "article" | "post" | "statistic" | "image" | "hot_take" | "pdf";

export interface Entry {
  id: string;
  title: string;
  content: string;
  type: EntryType;
  url?: string | null;
  summary?: string | null;
  notes?: string | null;
  agreement: number;
  weight: number;
  aiSpeedSignal: number;
  econAdaptSignal: number;
  topics: string;
  createdAt: string;
  updatedAt: string;
}

export interface MapPosition {
  x: number; // AI capability speed: -1 (gradual) to 1 (fast)
  y: number; // Economic adaptation capacity: -1 (low) to 1 (high)
}

export const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: "article", label: "Article" },
  { value: "post", label: "Post" },
  { value: "statistic", label: "Statistic" },
  { value: "image", label: "Image" },
  { value: "hot_take", label: "Hot Take" },
  { value: "pdf", label: "PDF" },
];
