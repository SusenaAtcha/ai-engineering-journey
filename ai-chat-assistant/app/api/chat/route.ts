import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: message,
    });

    return NextResponse.json({
      response: response.output_text,
    });
  } catch (error) {
    console.error("AI API error:", error);

    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}