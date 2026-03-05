"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface EntryDot {
  id: string;
  title: string;
  type: string;
  x: number;
  y: number;
  agreement: number;
  weight: number;
}

interface BeliefData {
  position: { x: number; y: number };
  entries: EntryDot[];
  entryCount: number;
}

export default function BeliefMatrix({ refreshKey }: { refreshKey?: number }) {
  const router = useRouter();
  const [data, setData] = useState<BeliefData | null>(null);
  const [hoveredEntry, setHoveredEntry] = useState<EntryDot | null>(null);

  useEffect(() => {
    fetch("/api/beliefs")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [refreshKey]);

  const toPercent = (v: number) => ((v + 1) / 2) * 90 + 5;

  const getDotStyle = (entry: EntryDot) => {
    const a = entry.agreement;
    if (a > 0.3)
      return { bg: "bg-emerald-400", glow: "rgba(52, 211, 153, 0.5)" };
    if (a < -0.3)
      return { bg: "bg-rose-400", glow: "rgba(251, 113, 133, 0.5)" };
    return { bg: "bg-zinc-500", glow: "rgba(161, 161, 170, 0.3)" };
  };

  const position = data?.position ?? { x: 0, y: 0 };
  const entries = data?.entries ?? [];

  return (
    <div className="w-full animate-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/90 tracking-tight">
          Belief Map
        </h2>
        <span className="text-[11px] text-zinc-600">
          {data?.entryCount ?? 0} piece{data?.entryCount !== 1 ? "s" : ""}{" "}
          informing
        </span>
      </div>

      <div className="relative">
        {/* X-axis label top */}
        <div className="flex justify-between text-[11px] text-zinc-600 mb-2 px-1">
          <span>Gradual</span>
          <span className="text-zinc-700 text-[10px] uppercase tracking-widest">
            AI Capability Speed
          </span>
          <span>Fast</span>
        </div>

        <div className="flex gap-2">
          {/* Y-axis label left */}
          <div className="flex flex-col justify-between text-[11px] text-zinc-600 py-1 w-5 shrink-0">
            <span className="writing-vertical-rl self-center">High</span>
            <span className="text-zinc-700 text-[10px] rotate-270 uppercase tracking-widest">
              ECONOMIC ADAPTABILITY
            </span>
            <span className="writing-vertical-rl self-center">Low</span>
          </div>

          {/* Matrix container */}
          <div className="relative aspect-square flex-1 glass rounded-xl overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.04]" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.04]" />
            </div>

            {/* Quadrant labels */}
            <div className="absolute top-3 left-3 text-[9px] text-zinc-800 uppercase tracking-wider leading-tight">
              Slow AI
              <br />
              High Adapt
            </div>
            <div className="absolute top-3 right-3 text-[9px] text-zinc-800 uppercase tracking-wider text-right leading-tight">
              Fast AI
              <br />
              High Adapt
            </div>
            <div className="absolute bottom-3 left-3 text-[9px] text-zinc-800 uppercase tracking-wider leading-tight">
              Slow AI
              <br />
              Low Adapt
            </div>
            <div className="absolute bottom-3 right-3 text-[9px] text-zinc-800 uppercase tracking-wider text-right leading-tight">
              Fast AI
              <br />
              Low Adapt
            </div>

            {/* Individual entry dots (raw evidence positions) */}
            {entries.map((entry) => {
              const style = getDotStyle(entry);

              return (
                <div
                  key={entry.id}
                  className="absolute z-10"
                  style={{
                    left: `${toPercent(entry.x)}%`,
                    top: `${toPercent(-entry.y)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onMouseEnter={() => setHoveredEntry(entry)}
                  onMouseLeave={() => setHoveredEntry(null)}
                  onClick={() => router.push(`/entry/${entry.id}`)}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${style.bg} transition-all duration-200 hover:scale-[2.5] cursor-pointer`}
                    style={{
                      opacity:
                        0.3 +
                        Math.abs(entry.agreement) * entry.weight * 0.7,
                      boxShadow: `0 0 8px ${style.glow}`,
                    }}
                  />
                </div>
              );
            })}

            {/* Aggregate position crosshair */}
            {entries.length > 0 && (
              <div
                className="absolute z-20"
                style={{
                  left: `${toPercent(position.x)}%`,
                  top: `${toPercent(-position.y)}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-violet-400/80 bg-violet-400/10 flex items-center justify-center"
                  style={{
                    boxShadow:
                      "0 0 20px rgba(167, 139, 250, 0.3), 0 0 6px rgba(167, 139, 250, 0.15)",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                </div>
              </div>
            )}

            {/* Empty state */}
            {entries.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-zinc-700">
                  Add entries to see your priors mapped
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredEntry && (
        <div className="mt-3 p-3 glass rounded-lg animate-in">
          <p className="text-sm font-medium text-white/90 truncate">
            {hoveredEntry.title}
          </p>
          <div className="mt-1.5 flex gap-4 text-xs text-zinc-500">
            <span>
              Agreement:{" "}
              <strong className="text-zinc-300">
                {hoveredEntry.agreement > 0 ? "+" : ""}
                {(hoveredEntry.agreement * 100).toFixed(0)}%
              </strong>
            </span>
            <span>
              Weight:{" "}
              <strong className="text-zinc-300">
                {(hoveredEntry.weight * 100).toFixed(0)}%
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      {entries.length > 0 && (
        <div className="mt-3 flex items-center gap-5 text-[11px] text-zinc-600">
          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full border-2 border-violet-400/60 bg-violet-400/10 flex items-center justify-center"
              style={{ boxShadow: "0 0 8px rgba(167, 139, 250, 0.2)" }}
            >
              <div className="w-1 h-1 rounded-full bg-violet-400" />
            </div>
            Your aggregate prior
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full bg-emerald-400"
              style={{ boxShadow: "0 0 6px rgba(52, 211, 153, 0.4)" }}
            />
            Agree
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full bg-rose-400"
              style={{ boxShadow: "0 0 6px rgba(251, 113, 133, 0.4)" }}
            />
            Disagree
          </div>
        </div>
      )}
    </div>
  );
}
