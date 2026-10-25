
import OpenAI from "openai";
import { executeTool } from "../../../lib/executeTool";
import { convertTemperatureSchema } from "../../../lib/toolSchemas";
import type { Response as OpenAIResponse } from "openai/resources/responses/responses";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MAX_TOOL_ROUNDS = 5;
type FunctionCall = {
  type: "function_call";
  name: string;
  arguments: string;
  call_id: string;
};

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        if (
            !Array.isArray(messages) ||
            messages.length === 0
        ) {
            return new Response("Messages are required", {
                status: 400,
            });
        }

        const encoder = new TextEncoder();

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    let currentInput = messages;
                    let toolRounds = 0;

                    while (true) {
                        const stream = await openai.responses.create({
                            model: "gpt-5-mini",
                            input: currentInput,
                            tools: [convertTemperatureSchema],
                            stream: true,
                        });

                        let completedResponse: OpenAIResponse | null = null;

                        for await (const event of stream) {
                            if (
                                event.type === "response.output_text.delta"
                            ) {
                                controller.enqueue(
                                    encoder.encode(event.delta)
                                );
                            }

                            if (event.type === "response.completed") {
                                completedResponse = event.response;
                            }
                        }

                        if (!completedResponse) {
                            throw new Error(
                                "The model response did not complete."
                            );
                        }

                        const functionCalls =
                            completedResponse.output.filter(
                                (item): item is FunctionCall => item.type === "function_call"
                            );

                        if (functionCalls.length === 0) {
                            break;
                        }

                        if (toolRounds >= MAX_TOOL_ROUNDS) {
                            throw new Error("Maximum tool rounds exceeded.");
                        }

                        toolRounds++;

                        const toolOutputs = functionCalls.map(
                            (call: FunctionCall) => {
                                let output: string;

                                try {
                                    output = executeTool({
                                        name: call.name,
                                        arguments: call.arguments,
                                    });
                                } catch {
                                    output = JSON.stringify({
                                        error: "Tool execution failed.",
                                    });
                                }

                                return {
                                    type: "function_call_output" as const,
                                    call_id: call.call_id,
                                    output,
                                };
                            }
                        );

                        currentInput = [
                            ...currentInput,
                            ...completedResponse.output,
                            ...toolOutputs,
                        ];
                    }

                    controller.close();
                } catch (error) {
                    console.error("Streaming error:", error);
                    controller.error(error);
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
            },
        });
    } catch (error) {
        console.error("AI API error:", error);

        return Response.json(
            { error: "Failed to generate AI response" },
            { status: 500 }
        );
    }
}
