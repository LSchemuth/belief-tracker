"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Entry, ENTRY_TYPES } from "@/lib/types";

function AgreementBar({ value }: { value: number }) {
  const pct = ((value + 1) / 2) * 100;
  const color =
    value > 0.3
      ? "from-emerald-500/80 to-emerald-400/60"
      : value < -0.3
      ? "from-rose-500/80 to-rose-400/60"
      : "from-amber-500/60 to-amber-400/40";

  return (
    <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function EntryCard({
  entry,
  onDelete,
}: {
  entry: Entry;
  onDelete?: (id: string) => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const typeLabel =
    ENTRY_TYPES.find((t) => t.value === entry.type)?.label || entry.type;
  const date = new Date(entry.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/entries/${entry.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete?.(entry.id);
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Link href={`/entry/${entry.id}`} className="block">
      <div className="group p-4 rounded-xl glass glass-hover transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-violet-400/60 font-medium">
                {typeLabel}
              </span>
              <span className="text-[10px] text-zinc-700">&middot;</span>
              <span className="text-[10px] text-zinc-600">{date}</span>
            </div>
            <h3 className="text-sm font-medium text-white/85 truncate group-hover:text-white transition-colors">
              {entry.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-[10px] text-zinc-600 font-medium">
              {(entry.weight * 100).toFixed(0)}% weight
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-rose-400 transition-all duration-200 p-1"
              title="Delete entry"
            >
              {deleting ? (
                <div className="w-3.5 h-3.5 border border-zinc-600 border-t-rose-400 rounded-full spinner" />
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {entry.summary && (
          <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
            {entry.summary}
          </p>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <AgreementBar value={entry.agreement} />
          </div>
          {entry.topics && (
            <div className="flex gap-1 shrink-0">
              {entry.topics
                .split(",")
                .slice(0, 3)
                .map((t) => (
                  <span
                    key={t.trim()}
                    className="px-1.5 py-0.5 text-[10px] rounded-md bg-white/[0.04] text-zinc-500 border border-white/[0.04]"
                  >
                    {t.trim()}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
