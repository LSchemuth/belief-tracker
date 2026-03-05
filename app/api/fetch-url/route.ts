import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BeliefTracker/1.0; +https://github.com)",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 400 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const html = await response.text();

    // Extract text content from HTML
    // Remove scripts, styles, and HTML tags
    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const ogTitleMatch = html.match(
      /<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i
    );
    const extractedTitle = ogTitleMatch?.[1] || titleMatch?.[1]?.trim() || "";

    // Truncate to ~15k chars to stay within reasonable token limits
    if (text.length > 15000) {
      text = text.slice(0, 15000) + "...";
    }

    return NextResponse.json({
      text,
      title: extractedTitle,
      contentType,
      url,
    });
  } catch (error) {
    console.error("URL fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch URL content" },
      { status: 500 }
    );
  }
}
