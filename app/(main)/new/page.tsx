"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EntryForm from "@/components/EntryForm";
import MapSelector from "@/components/MapSelector";
import CreateMapModal from "@/components/CreateMapModal";
import { BeliefMap } from "@/lib/types";

export default function NewEntryPage() {
  const [maps, setMaps] = useState<BeliefMap[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedMap = maps.find((m) => m.id === selectedMapId);

  const handleMapCreated = (map: BeliefMap) => {
    setMaps((prev) => [...prev, map]);
    setSelectedMapId(map.id);
    setShowCreateModal(false);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-5 h-5 border-2 border-zinc-800 border-t-violet-400 rounded-full spinner" />
      </div>
    );
  }

  return (
    <div className="py-10 px-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white/90">New Entry</h1>
            <p className="text-sm text-zinc-600 mt-0.5">
              Drop a URL, screenshot, PDF, or just write
            </p>
          </div>
          {maps.length > 0 && (
            <MapSelector
              maps={maps}
              selectedMapId={selectedMapId}
              onSelect={(id) => {
                setSelectedMapId(id);
                localStorage.setItem("selectedMapId", id);
              }}
              onCreateNew={() => setShowCreateModal(true)}
            />
          )}
        </div>
      </div>

      {selectedMap ? (
        <EntryForm
          key={selectedMapId}
          mapId={selectedMapId}
          xAxisLabel={selectedMap.xAxisLabel}
          xAxisLow={selectedMap.xAxisLow}
          xAxisHigh={selectedMap.xAxisHigh}
          yAxisLabel={selectedMap.yAxisLabel}
          yAxisLow={selectedMap.yAxisLow}
          yAxisHigh={selectedMap.yAxisHigh}
        />
      ) : (
        <div className="py-16 text-center glass rounded-xl">
          <p className="text-sm text-zinc-600">
            Create a belief map first to start adding entries
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-3 text-sm text-violet-400/80 hover:text-violet-400 transition-colors"
          >
            + Create your first map
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateMapModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleMapCreated}
        />
      )}
    </div>
  );
}
