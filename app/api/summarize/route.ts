import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { content, type, title, notes, imageBase64, imageMimeType } =
    await req.json();

  if (!content && !imageBase64) {
    return NextResponse.json(
      { error: "Content or image is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      title: title || "Untitled",
      summary: `Add your ANTHROPIC_API_KEY to .env to enable AI analysis.`,
      topics: [],
      aiSpeedSignal: 0,
      econAdaptSignal: 0,
    });
  }

  const notesContext = notes
    ? `\n\nThe user has added these personal notes about what to focus on:\n${notes}`
    : "";

  const titleContext = title ? ` titled "${title}"` : "";

  const prompt = `You are analyzing content for a personal belief-tracking system focused on two key dimensions:

1. **Speed of AI capability advancement**: Does this piece suggest AI capabilities will advance rapidly/fast, or gradually/slowly?
2. **Economic adaptation capacity**: Does this piece suggest economies/societies have high or low capacity to adapt to AI-driven changes?

The user submitted a ${type || "piece"}${titleContext}.${notesContext}

${content ? `Content:\n${content}` : "The content is in the attached image."}

Analyze this and respond in JSON:
{
  "title": "A concise, descriptive title for this piece (extract from the content if possible, or generate one)",
  "summary": "An elaborate 2-3 paragraph summary capturing key arguments, claims, evidence, and implications. Be thorough — this serves as the user's reference for what the piece argues.",
  "topics": ["topic1", "topic2", "topic3"],
  "aiSpeedSignal": <float from -1 to 1, where -1 = argues AI progress will be very gradual/slow, 0 = neutral/not relevant, 1 = argues AI progress will be very fast/rapid>,
  "econAdaptSignal": <float from -1 to 1, where -1 = argues economies have very low adaptation capacity, 0 = neutral/not relevant, 1 = argues economies have very high adaptation capacity>,
  "signalReasoning": "Brief 1-2 sentence explanation of why you scored the signals this way",
  "type": "article|post|statistic|image|hot_take|pdf"
}

For the "type" field, infer the best content type from: article, post, statistic, image, hot_take, pdf. Choose what fits best.`;

  // Build message content — text or text+image
  const messageContent: Array<Record<string, unknown>> = [];

  if (imageBase64) {
    messageContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: imageMimeType || "image/png",
        data: imageBase64,
      },
    });
  }

  messageContent.push({
    type: "text",
    text: prompt,
  });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: messageContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({
        title: title || "Untitled",
        summary: "Summary generation failed. Please check your API key.",
        topics: [],
        aiSpeedSignal: 0,
        econAdaptSignal: 0,
      });
    }

    const data = await response.json();
    const text = data.content[0]?.text || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        title: parsed.title || title || "Untitled",
        summary: parsed.summary || text,
        topics: parsed.topics || [],
        aiSpeedSignal: Math.max(-1, Math.min(1, parsed.aiSpeedSignal || 0)),
        econAdaptSignal: Math.max(
          -1,
          Math.min(1, parsed.econAdaptSignal || 0)
        ),
        signalReasoning: parsed.signalReasoning || "",
        type: parsed.type || type || "article",
      });
    }

    return NextResponse.json({
      title: title || "Untitled",
      summary: text,
      topics: [],
      aiSpeedSignal: 0,
      econAdaptSignal: 0,
    });
  } catch (error) {
    console.error("Summarize error:", error);
    return NextResponse.json({
      title: title || "Untitled",
      summary: "Failed to generate summary. Please try again.",
      topics: [],
      aiSpeedSignal: 0,
      econAdaptSignal: 0,
    });
  }
}
