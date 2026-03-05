"use client";

import { BeliefMap } from "@/lib/types";

export default function MapSelector({
  maps,
  selectedMapId,
  onSelect,
  onCreateNew,
}: {
  maps: BeliefMap[];
  selectedMapId: string;
  onSelect: (mapId: string) => void;
  onCreateNew: () => void;
}) {
  return (
    <select
      value={selectedMapId}
      onChange={(e) => {
        if (e.target.value === "__new__") {
          onCreateNew();
        } else {
          onSelect(e.target.value);
        }
      }}
      className="text-sm font-semibold bg-transparent border border-white/[0.08] rounded-lg px-3 py-1.5 text-white/90 outline-none focus:border-violet-500/30 transition-colors cursor-pointer"
    >
      {maps.map((m) => (
        <option key={m.id} value={m.id} className="bg-zinc-900">
          {m.name}
        </option>
      ))}
      <option value="__new__" className="bg-zinc-900">
        + New Map
      </option>
    </select>
  );
}
