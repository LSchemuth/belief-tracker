import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const mapId = req.nextUrl.searchParams.get("mapId");

  if (!mapId) {
    return NextResponse.json({ position: { x: 0, y: 0 }, entries: [], entryCount: 0 });
  }

  const map = await prisma.beliefMap.findUnique({ where: { id: mapId } });
  if (!map) {
    return NextResponse.json({ error: "Map not found" }, { status: 404 });
  }

  const entries = await prisma.entry.findMany({ where: { mapId } });

  if (entries.length === 0) {
    return NextResponse.json({
      position: { x: 0, y: 0 },
      entries: [],
      entryCount: 0,
      map: {
        id: map.id,
        name: map.name,
        xAxisLabel: map.xAxisLabel,
        xAxisLow: map.xAxisLow,
        xAxisHigh: map.xAxisHigh,
        yAxisLabel: map.yAxisLabel,
        yAxisLow: map.yAxisLow,
        yAxisHigh: map.yAxisHigh,
      },
    });
  }

  let xWeightedSum = 0;
  let yWeightedSum = 0;
  let totalWeight = 0;

  const entryPositions = entries.map((entry) => {
    xWeightedSum += entry.xSignal * entry.agreement * entry.weight;
    yWeightedSum += entry.ySignal * entry.agreement * entry.weight;
    totalWeight += entry.weight;

    return {
      id: entry.id,
      title: entry.title,
      type: entry.type,
      x: entry.xSignal,
      y: entry.ySignal,
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
    map: {
      id: map.id,
      name: map.name,
      xAxisLabel: map.xAxisLabel,
      xAxisLow: map.xAxisLow,
      xAxisHigh: map.xAxisHigh,
      yAxisLabel: map.yAxisLabel,
      yAxisLow: map.yAxisLow,
      yAxisHigh: map.yAxisHigh,
    },
  });
}
