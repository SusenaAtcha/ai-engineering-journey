import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response("Messages are required", {
                status: 400,
            });
        }

        const stream = await openai.responses.create({
            model: "gpt-5-mini",
            input: messages,
            stream: true,
        });

        const encoder = new TextEncoder();

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const event of stream) {
                        if (event.type === "response.output_text.delta") {
                            controller.enqueue(
                                encoder.encode(event.delta)
                            );
                        }
                    }

                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("AI API error:", error);

        return new Response("Failed to generate AI response", {
            status: 500,
        });
    }
}