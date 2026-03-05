"use client";

import { useState } from "react";
import { BeliefMap } from "@/lib/types";

export default function CreateMapModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (map: BeliefMap) => void;
}) {
  const [name, setName] = useState("");
  const [xAxisLabel, setXAxisLabel] = useState("");
  const [xAxisLow, setXAxisLow] = useState("");
  const [xAxisHigh, setXAxisHigh] = useState("");
  const [yAxisLabel, setYAxisLabel] = useState("");
  const [yAxisLow, setYAxisLow] = useState("");
  const [yAxisHigh, setYAxisHigh] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSuggest = async () => {
    if (!name.trim()) return;
    setSuggesting(true);
    try {
      const res = await fetch("/api/maps/suggest-axes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.xAxisLabel) setXAxisLabel(data.xAxisLabel);
      if (data.xAxisLow) setXAxisLow(data.xAxisLow);
      if (data.xAxisHigh) setXAxisHigh(data.xAxisHigh);
      if (data.yAxisLabel) setYAxisLabel(data.yAxisLabel);
      if (data.yAxisLow) setYAxisLow(data.yAxisLow);
      if (data.yAxisHigh) setYAxisHigh(data.yAxisHigh);
    } catch (err) {
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !xAxisLabel.trim() || !yAxisLabel.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          xAxisLabel: xAxisLabel || "Dimension X",
          xAxisLow: xAxisLow || "Low",
          xAxisHigh: xAxisHigh || "High",
          yAxisLabel: yAxisLabel || "Dimension Y",
          yAxisLow: yAxisLow || "Low",
          yAxisHigh: yAxisHigh || "High",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || `Failed to create map (${res.status})`);
        return;
      }
      const map = await res.json();
      localStorage.setItem("selectedMapId", map.id);
      onCreate(map);
    } catch (err) {
      console.error(err);
      setError("Network error — could not create map");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 glass rounded-2xl p-6 space-y-5 animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white/90">
            New Belief Map
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-400 transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-2">
            Map Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. AI, Economy, Climate..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 text-sm bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 outline-none placeholder:text-zinc-700 text-zinc-300 focus:border-violet-500/30 transition-colors"
            />
            <button
              onClick={handleSuggest}
              disabled={!name.trim() || suggesting}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 disabled:opacity-30 transition-all shrink-0"
            >
              {suggesting ? "..." : "Suggest Axes"}
            </button>
          </div>
        </div>

        {/* X Axis */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-2">
            X Axis (horizontal)
          </label>
          <input
            type="text"
            placeholder="Axis label (e.g. AI Capability Speed)"
            value={xAxisLabel}
            onChange={(e) => setXAxisLabel(e.target.value)}
            className="w-full text-sm bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 outline-none placeholder:text-zinc-700 text-zinc-300 focus:border-violet-500/30 transition-colors mb-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Low end (e.g. Gradual)"
              value={xAxisLow}
              onChange={(e) => setXAxisLow(e.target.value)}
              className="text-sm bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 outline-none placeholder:text-zinc-700 text-zinc-300 focus:border-violet-500/30 transition-colors"
            />
            <input
              type="text"
              placeholder="High end (e.g. Fast)"
              value={xAxisHigh}
              onChange={(e) => setXAxisHigh(e.target.value)}
              className="text-sm bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 outline-none placeholder:text-zinc-700 text-zinc-300 focus:border-violet-500/30 transition-colors"
            />
          </div>
        </div>

        {/* Y Axis */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-2">
            Y Axis (vertical)
          </label>
          <input
            type="text"
            placeholder="Axis label (e.g. Economic Adaptability)"
            value={yAxisLabel}
            onChange={(e) => setYAxisLabel(e.target.value)}
            className="w-full text-sm bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 outline-none placeholder:text-zinc-700 text-zinc-300 focus:border-violet-500/30 transition-colors mb-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Low end (e.g. Low)"
              value={yAxisLow}
              onChange={(e) => setYAxisLow(e.target.value)}
              className="text-sm bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 outline-none placeholder:text-zinc-700 text-zinc-300 focus:border-violet-500/30 transition-colors"
            />
            <input
              type="text"
              placeholder="High end (e.g. High)"
              value={yAxisHigh}
              onChange={(e) => setYAxisHigh(e.target.value)}
              className="text-sm bg-transparent border border-white/[0.08] rounded-lg px-3 py-2 outline-none placeholder:text-zinc-700 text-zinc-300 focus:border-violet-500/30 transition-colors"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={
              creating ||
              !name.trim() ||
              !xAxisLabel.trim() ||
              !yAxisLabel.trim()
            }
            className="px-5 py-2 text-sm font-medium rounded-lg bg-violet-500/90 text-white hover:bg-violet-500 disabled:opacity-30 transition-all duration-200 shadow-lg shadow-violet-500/20"
          >
            {creating ? "Creating..." : "Create Map"}
          </button>
        </div>
      </div>
    </div>
  );
}
