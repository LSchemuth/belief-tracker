import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const topic = searchParams.get("topic");
  const mapId = searchParams.get("mapId");
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (topic) where.topics = { contains: topic };
  if (mapId) where.mapId = mapId;

  const entries = await prisma.entry.findMany({
    where,
    orderBy: { [sort]: order },
    include: { map: true },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title, content, type, url, summary, notes,
    agreement, weight, xSignal, ySignal, topics, mapId,
  } = body;

  if (!title || !content || !type || !mapId) {
    return NextResponse.json(
      { error: "title, content, type, and mapId are required" },
      { status: 400 }
    );
  }

  const entry = await prisma.entry.create({
    data: {
      title,
      content,
      type,
      url: url || null,
      summary: summary || null,
      notes: notes || null,
      agreement: agreement ?? 0,
      weight: weight ?? 0.5,
      xSignal: xSignal ?? 0,
      ySignal: ySignal ?? 0,
      topics: topics || "",
      mapId,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
