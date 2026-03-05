import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const maps = await prisma.beliefMap.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { entries: true } } },
    });
    return NextResponse.json(maps);
  } catch (err) {
    console.error("GET /api/maps error:", err);
    return NextResponse.json({ error: "Failed to fetch maps" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, xAxisLabel, xAxisLow, xAxisHigh, yAxisLabel, yAxisLow, yAxisHigh } = body;

    if (!name || !xAxisLabel || !xAxisLow || !xAxisHigh || !yAxisLabel || !yAxisLow || !yAxisHigh) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const map = await prisma.beliefMap.create({
      data: { name, xAxisLabel, xAxisLow, xAxisHigh, yAxisLabel, yAxisLow, yAxisHigh },
    });

    return NextResponse.json(map, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/maps error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
