import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entry = await prisma.entry.findUnique({
    where: { id },
    include: { map: true },
  });
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(entry);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const entry = await prisma.entry.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(entry);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const entry = await prisma.entry.findUnique({ where: { id } });
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.entry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
