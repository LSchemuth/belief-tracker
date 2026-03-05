"use client";

import { useEffect, useState } from "react";
import { Entry, EntryType, ENTRY_TYPES } from "@/lib/types";
import EntryCard from "@/components/EntryCard";

export default function LibraryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EntryType | "all">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "agreement" | "weight">(
    "createdAt"
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("type", filter);
    params.set("sort", sortBy);
    params.set("order", "desc");

    fetch(`/api/entries?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter, sortBy]);

  return (
    <div className="py-10 px-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold text-white/90">Library</h1>
          <p className="text-sm text-zinc-600 mt-0.5">
            {entries.length} piece{entries.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.04]">
        <div className="flex gap-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all duration-200 ${
              filter === "all"
                ? "bg-white/[0.08] text-white"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            All
          </button>
          {ENTRY_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all duration-200 ${
                filter === t.value
                  ? "bg-white/[0.08] text-white"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "createdAt" | "agreement" | "weight")
          }
          className="text-xs text-zinc-500 bg-transparent border-none outline-none cursor-pointer"
        >
          <option value="createdAt">Recent</option>
          <option value="agreement">Agreement</option>
          <option value="weight">Weight</option>
        </select>
      </div>

      {/* Entries */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-5 h-5 border-2 border-zinc-800 border-t-violet-400 rounded-full spinner" />
        </div>
      ) : entries.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-zinc-600">No entries yet</p>
          <p className="text-xs text-zinc-700 mt-1">
            Add your first piece to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={(id) =>
                setEntries((prev) => prev.filter((e) => e.id !== id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
