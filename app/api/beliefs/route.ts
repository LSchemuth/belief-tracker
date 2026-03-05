import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Computes the aggregate belief position from all entries.
// Formula: prior_axis = Σ(signal_i × agreement_i × weight_i) / Σ(weight_i)
// - agreement flips direction: disagree with "AI is fast" → pushes toward gradual
// - weight scales influence: high weight entries pull more
// Dots show raw evidence positions; the crosshair shows the aggregate prior.
export async function GET() {
  const entries = await prisma.entry.findMany();

  if (entries.length === 0) {
    return NextResponse.json({
      position: { x: 0, y: 0 },
      entries: [],
      entryCount: 0,
    });
  }

  let xWeightedSum = 0;
  let yWeightedSum = 0;
  let totalWeight = 0;

  const entryPositions = entries.map((entry) => {
    xWeightedSum += entry.aiSpeedSignal * entry.agreement * entry.weight;
    yWeightedSum += entry.econAdaptSignal * entry.agreement * entry.weight;
    totalWeight += entry.weight;

    // Return raw evidence positions for dots on the map
    return {
      id: entry.id,
      title: entry.title,
      type: entry.type,
      x: entry.aiSpeedSignal,
      y: entry.econAdaptSignal,
      agreement: entry.agreement,
      weight: entry.weight,
    };
  });

  const position = {
    x: totalWeight > 0 ? Math.max(-1, Math.min(1, xWeightedSum / totalWeight)) : 0,
    y: totalWeight > 0 ? Math.max(-1, Math.min(1, yWeightedSum / totalWeight)) : 0,
  };

  return NextResponse.json({
    position,
    entries: entryPositions,
    entryCount: entries.length,
  });
}
