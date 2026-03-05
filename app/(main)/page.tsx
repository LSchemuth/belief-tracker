"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BeliefMatrix from "@/components/BeliefMatrix";
import EntryCard from "@/components/EntryCard";
import MapSelector from "@/components/MapSelector";
import CreateMapModal from "@/components/CreateMapModal";
import { Entry, BeliefMap } from "@/lib/types";

export default function Home() {
  const [maps, setMaps] = useState<BeliefMap[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string>("");
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [mapKey, setMapKey] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetch("/api/maps")
      .then((res) => res.json())
      .then((data) => {
        setMaps(data);
        if (data.length > 0) {
          const saved = localStorage.getItem("selectedMapId");
          const validSaved =
            saved && data.some((m: BeliefMap) => m.id === saved);
          setSelectedMapId(validSaved ? saved : data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedMapId) return;
    localStorage.setItem("selectedMapId", selectedMapId);
    fetch(`/api/entries?mapId=${selectedMapId}&sort=createdAt&order=desc`)
      .then((res) => res.json())
      .then((data) => setRecentEntries(data.slice(0, 5)))
      .catch(console.error);
  }, [selectedMapId]);

  const handleMapCreated = (map: BeliefMap) => {
    setMaps((prev) => [...prev, map]);
    setSelectedMapId(map.id);
    setShowCreateModal(false);
  };

  return (
    <div className="py-10 px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-lg font-semibold text-white/90">Priors</h1>
            <p className="text-sm text-zinc-600 mt-0.5">
              Your beliefs, shaped by evidence
            </p>
          </div>
          <Link
            href="/new"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-violet-500/90 text-white hover:bg-violet-500 transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
          >
            + New Entry
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Matrix */}
          <div>
            <BeliefMatrix
              mapId={selectedMapId}
              refreshKey={mapKey}
              headerExtra={
                maps.length > 0 ? (
                  <MapSelector
                    maps={maps}
                    selectedMapId={selectedMapId}
                    onSelect={setSelectedMapId}
                    onCreateNew={() => setShowCreateModal(true)}
                  />
                ) : undefined
              }
            />
          </div>

          {/* Recent entries */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white/90 tracking-tight">
                Recent
              </h2>
              <Link
                href="/library"
                className="text-xs text-zinc-600 hover:text-violet-400 transition-colors"
              >
                View all &rarr;
              </Link>
            </div>

            {recentEntries.length === 0 ? (
              <div className="py-16 text-center glass rounded-xl">
                <p className="text-sm text-zinc-600">No entries yet</p>
                <Link
                  href="/new"
                  className="text-sm text-violet-400/80 hover:text-violet-400 mt-1 inline-block transition-colors"
                >
                  Add your first piece
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={(id) => {
                      setRecentEntries((prev) =>
                        prev.filter((e) => e.id !== id)
                      );
                      setMapKey((k) => k + 1);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateMapModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleMapCreated}
        />
      )}
    </div>
  );
}
