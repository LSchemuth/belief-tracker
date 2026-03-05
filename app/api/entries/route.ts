import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const topic = searchParams.get("topic");
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (topic) where.topics = { contains: topic };

  const entries = await prisma.entry.findMany({
    where,
    orderBy: { [sort]: order },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title, content, type, url, summary, notes,
    agreement, weight, aiSpeedSignal, econAdaptSignal, topics,
  } = body;

  if (!title || !content || !type) {
    return NextResponse.json(
      { error: "title, content, and type are required" },
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
      aiSpeedSignal: aiSpeedSignal ?? 0,
      econAdaptSignal: econAdaptSignal ?? 0,
      topics: topics || "",
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
