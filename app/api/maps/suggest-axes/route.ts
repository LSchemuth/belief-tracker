import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      xAxisLabel: "Dimension A",
      xAxisLow: "Low",
      xAxisHigh: "High",
      yAxisLabel: "Dimension B",
      yAxisLow: "Low",
      yAxisHigh: "High",
    });
  }

  const prompt = `The user is creating a belief tracking map called "${name}". This map will track their evolving beliefs on this topic based on evidence they collect.

Suggest two orthogonal analytical dimensions as x and y axes that would be most useful for mapping beliefs about "${name}". The dimensions should represent genuinely different aspects that create meaningful quadrants.

Respond in JSON only:
{
  "xAxisLabel": "Name of the x-axis dimension",
  "xAxisLow": "Short label for the -1 end (1-2 words)",
  "xAxisHigh": "Short label for the +1 end (1-2 words)",
  "yAxisLabel": "Name of the y-axis dimension",
  "yAxisLow": "Short label for the -1 end (1-2 words)",
  "yAxisHigh": "Short label for the +1 end (1-2 words)"
}`;

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
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error("API call failed");
    }

    const data = await response.json();
    const text = data.content[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }
  } catch (error) {
    console.error("Suggest axes error:", error);
  }

  return NextResponse.json({
    xAxisLabel: "Dimension A",
    xAxisLow: "Low",
    xAxisHigh: "High",
    yAxisLabel: "Dimension B",
    yAxisLow: "Low",
    yAxisHigh: "High",
  });
}
