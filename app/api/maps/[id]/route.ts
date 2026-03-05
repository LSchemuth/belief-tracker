import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const map = await prisma.beliefMap.findUnique({
    where: { id },
    include: { _count: { select: { entries: true } } },
  });
  if (!map) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(map);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entryCount = await prisma.entry.count({ where: { mapId: id } });
  if (entryCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete map with ${entryCount} entries. Delete entries first.` },
      { status: 400 }
    );
  }
  await prisma.beliefMap.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
