import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const { text, totalPages } = await extractText(new Uint8Array(arrayBuffer));

    return NextResponse.json({
      text: text.join("\n\n"),
      pages: totalPages,
      title: file.name.replace(/\.pdf$/i, ""),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("PDF parse error:", message);
    return NextResponse.json(
      { error: `Failed to parse PDF: ${message}` },
      { status: 500 }
    );
  }
}
