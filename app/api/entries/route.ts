import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function sanitizeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim();
}

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
  const title = sanitizeString(body.title);
  const content = sanitizeString(body.content);
  const type = sanitizeString(body.type);
  const url = sanitizeString(body.url);
  const summary = sanitizeString(body.summary);
  const notes = sanitizeString(body.notes);
  const topics = sanitizeString(body.topics);
  const mapId = sanitizeString(body.mapId);
  const agreement = body.agreement;
  const weight = body.weight;
  const xSignal = body.xSignal;
  const ySignal = body.ySignal;

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
