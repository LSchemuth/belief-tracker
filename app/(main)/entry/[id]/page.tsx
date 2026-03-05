"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Entry, ENTRY_TYPES } from "@/lib/types";

export default function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreement, setAgreement] = useState(0);
  const [weight, setWeight] = useState(0.5);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/entries/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEntry(data);
        setAgreement(data.agreement);
        setWeight(data.weight);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agreement, weight }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEntry(updated);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/entries/${id}`, { method: "DELETE" });
      router.push("/library");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  const agreementLabel = (v: number) => {
    if (v <= -0.7) return "Strongly disagree";
    if (v <= -0.3) return "Disagree";
    if (v < 0.3) return "Neutral";
    if (v < 0.7) return "Agree";
    return "Strongly agree";
  };

  const weightLabel = (v: number) => {
    if (v <= 0.2) return "Negligible";
    if (v <= 0.4) return "Low";
    if (v < 0.6) return "Moderate";
    if (v < 0.8) return "High";
    return "Critical";
  };

  const signalLabel = (v: number, negative: string, positive: string) => {
    if (Math.abs(v) < 0.15) return "Neutral";
    const strength = Math.abs(v) > 0.6 ? "Strongly " : "";
    return v < 0 ? `${strength}${negative}` : `${strength}${positive}`;
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-5 h-5 border-2 border-zinc-800 border-t-violet-400 rounded-full spinner" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="py-20 text-center text-sm text-zinc-600">
        Entry not found
      </div>
    );
  }

  const typeLabel =
    ENTRY_TYPES.find((t) => t.value === entry.type)?.label || entry.type;
  const date = new Date(entry.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const hasChanges = agreement !== entry.agreement || weight !== entry.weight;

  return (
    <div className="py-10 px-8 max-w-2xl mx-auto animate-in">
      <button
        onClick={() => router.back()}
        className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors mb-8"
      >
        &larr; Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-widest text-violet-400/60 font-medium">
            {typeLabel}
          </span>
          <span className="text-[10px] text-zinc-700">&middot;</span>
          <span className="text-[10px] text-zinc-600">{date}</span>
        </div>
        <h1 className="text-2xl font-semibold text-white/90">{entry.title}</h1>
        {entry.url && (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-600 hover:text-violet-400 transition-colors mt-1 inline-block"
          >
            {entry.url}
          </a>
        )}
      </div>

      {/* Topics */}
      {entry.topics && (
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {entry.topics.split(",").map((t) => (
            <span
              key={t.trim()}
              className="px-2 py-0.5 text-xs rounded-md bg-white/[0.04] text-zinc-500 border border-white/[0.04]"
            >
              {t.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Summary */}
      {entry.summary && (
        <div className="mb-6 p-5 glass rounded-xl">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-violet-400/60 mb-3">
            Summary
          </h3>
          <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
            {entry.summary}
          </p>
        </div>
      )}

      {/* Position signals */}
      <div className="mb-6 p-5 glass rounded-xl">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-violet-400/60 mb-3">
          Position Signals
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500 block text-xs mb-0.5">
              AI Capability Speed
            </span>
            <span className="font-medium text-white/80">
              {signalLabel(entry.aiSpeedSignal, "Gradual", "Fast")}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-xs mb-0.5">
              Economic Adaptation
            </span>
            <span className="font-medium text-white/80">
              {signalLabel(
                entry.econAdaptSignal,
                "Low Capacity",
                "High Capacity"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* User notes */}
      {entry.notes && (
        <div className="mb-6 p-5 rounded-xl bg-violet-500/[0.04] border border-violet-500/10">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-violet-400/60 mb-3">
            Your Notes
          </h3>
          <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
            {entry.notes}
          </p>
        </div>
      )}

      {/* Original content */}
      <details className="mb-8 group">
        <summary className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors mb-3">
          Original Content
        </summary>
        <p className="text-sm leading-relaxed text-zinc-500 whitespace-pre-wrap max-h-96 overflow-y-auto">
          {entry.content}
        </p>
      </details>

      {/* Rating section */}
      <div className="pt-6 border-t border-white/[0.04] space-y-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Your Assessment
        </h3>

        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm text-zinc-500">Agreement</span>
            <span className="text-xs font-medium text-zinc-300">
              {agreementLabel(agreement)}
            </span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={agreement}
            onChange={(e) => setAgreement(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-zinc-700 mt-1">
            <span>Strongly disagree</span>
            <span>Strongly agree</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm text-zinc-500">Weight</span>
            <span className="text-xs font-medium text-zinc-300">
              {weightLabel(weight)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-zinc-700 mt-1">
            <span>Negligible</span>
            <span>Critical</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-zinc-600 hover:text-rose-400 transition-colors"
          >
            {deleting ? "Deleting..." : "Delete entry"}
          </button>
          {hasChanges && (
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-violet-500/90 text-white hover:bg-violet-500 disabled:opacity-30 transition-all duration-200 shadow-lg shadow-violet-500/20"
            >
              {saving ? "Updating..." : "Update Priors"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
