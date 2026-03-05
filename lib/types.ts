export type EntryType = "article" | "post" | "statistic" | "image" | "hot_take" | "pdf";

export interface BeliefMap {
  id: string;
  name: string;
  xAxisLabel: string;
  xAxisLow: string;
  xAxisHigh: string;
  yAxisLabel: string;
  yAxisLow: string;
  yAxisHigh: string;
  createdAt: string;
  updatedAt: string;
}

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
  xSignal: number;
  ySignal: number;
  topics: string;
  mapId: string;
  map?: BeliefMap;
  createdAt: string;
  updatedAt: string;
}

export interface MapPosition {
  x: number;
  y: number;
}

export const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: "article", label: "Article" },
  { value: "post", label: "Post" },
  { value: "statistic", label: "Statistic" },
  { value: "image", label: "Image" },
  { value: "hot_take", label: "Hot Take" },
  { value: "pdf", label: "PDF" },
];
