
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMock } = vi.hoisted(() => ({
    createMock: vi.fn(),
}));

vi.mock("openai", () => ({
    default: class OpenAI {
        responses = {
            create: createMock,
        };
    },
}));

const { executeToolMock } = vi.hoisted(() => ({
    executeToolMock: vi.fn(),
}));

vi.mock("../../../lib/executeTool", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../../lib/executeTool")>();

    return {
        ...actual,
        executeTool: (...args: Parameters<typeof actual.executeTool>) => {
            const implementation =
                executeToolMock.getMockImplementation();

            if (implementation) {
                return implementation(...args);
            }

            return actual.executeTool(...args);
        },
    };
});;

import { POST } from "./route";

function mockStream(events: unknown[]) {
    return {
        async *[Symbol.asyncIterator]() {
            for (const event of events) {
                yield event;
            }
        },
    };
}

describe("POST /api/chat tool calling", () => {
    beforeEach(() => {
        createMock.mockReset();
        executeToolMock.mockReset();
    });

    it("executes a tool call and streams the final answer", async () => {
        createMock
            .mockResolvedValueOnce(
                mockStream([
                    {
                        type: "response.completed",
                        response: {
                            output: [
                                {
                                    type: "function_call",
                                    name: "convertTemperature",
                                    arguments: JSON.stringify({ celsius: 25 }),
                                    call_id: "call_temperature_1",
                                },
                            ],
                        },
                    },
                ])
            )
            .mockResolvedValueOnce(
                mockStream([
                    {
                        type: "response.output_text.delta",
                        delta: "25°C is 77°F.",
                    },
                    {
                        type: "response.completed",
                        response: { output: [] },
                    },
                ])
            );

        const request = new Request("http://localhost/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{ role: "user", content: "Convert 25°C to Fahrenheit." }],
            }),
        });

        const response = await POST(request);
        const body = await response.text();

        expect(response.status).toBe(200);
        expect(body).toBe("25°C is 77°F.");
        expect(createMock).toHaveBeenCalledTimes(2);

        const secondCall = createMock.mock.calls[1][0];
        expect(secondCall.input).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: "function_call_output",
                    call_id: "call_temperature_1",
                    output: JSON.stringify({
                        celsius: 25,
                        fahrenheit: 77,
                    }),
                }),
            ])
        );
    });

    it("executes analyzeText and streams the final answer", async () => {
        createMock
            .mockResolvedValueOnce(
                mockStream([
                    {
                        type: "response.completed",
                        response: {
                            output: [
                                {
                                    type: "function_call",
                                    name: "analyzeText",
                                    arguments: JSON.stringify({
                                        text: "React and Node.js",
                                    }),
                                    call_id: "call_analyze_text_1",
                                },
                            ],
                        },
                    },
                ])
            )
            .mockResolvedValueOnce(
                mockStream([
                    {
                        type: "response.output_text.delta",
                        delta: "The text contains 3 words and 17 characters.",
                    },
                    {
                        type: "response.completed",
                        response: { output: [] },
                    },
                ])
            );

        const request = new Request(
            "http://localhost/api/chat",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "user",
                            content: "Count the words in React and Node.js",
                        },
                    ],
                }),
            }
        );

        const response = await POST(request);
        const body = await response.text();

        expect(response.status).toBe(200);
        expect(body).toBe(
            "The text contains 3 words and 17 characters."
        );
        expect(createMock).toHaveBeenCalledTimes(2);

        const secondCall = createMock.mock.calls[1][0];

        expect(secondCall.input).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: "function_call_output",
                    call_id: "call_analyze_text_1",
                    output: JSON.stringify({
                        wordCount: 3,
                        characterCount: 17,
                    }),
                }),
            ])
        );
    });

    it("returns 400 when messages are missing", async () => {
        const request = new Request(
            "http://localhost/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            }
        );

        const response = await POST(request);
        const body = await response.text();

        expect(response.status).toBe(400);
        expect(body).toBe("Messages are required");
        expect(createMock).not.toHaveBeenCalled();
    });

    it("returns 400 when messages is an empty array", async () => {
        const request = new Request(
            "http://localhost/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: [] }),
            }
        );

        const response = await POST(request);

        expect(response.status).toBe(400);
        expect(createMock).not.toHaveBeenCalled();
    });

    it("returns a tool error when tool execution fails", async () => {
        executeToolMock.mockImplementation(() => {
            throw new Error("Unexpected tool failure");
        });

        createMock.mockResolvedValueOnce(
            mockStream([
                {
                    type: "response.completed",
                    response: {
                        output: [
                            {
                                type: "function_call",
                                name: "convertTemperature",
                                arguments: JSON.stringify({ celsius: 25 }),
                                call_id: "call_temperature_error",
                            },
                        ],
                    },
                },
            ])
        ).mockResolvedValueOnce(
            mockStream([
                {
                    type: "response.output_text.delta",
                    delta: "I could not convert the temperature.",
                },
                {
                    type: "response.completed",
                    response: { output: [] },
                },
            ])
        );

        const request = new Request(
            "http://localhost/api/chat",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "user",
                            content: "Convert 25°C to Fahrenheit.",
                        },
                    ],
                }),
            }
        );

        const response = await POST(request);
        const body = await response.text();

        expect(response.status).toBe(200);
        expect(body).toBe(
            "I could not convert the temperature."
        );

        const secondCall = createMock.mock.calls[1][0];

        expect(secondCall.input).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: "function_call_output",
                    call_id: "call_temperature_error",
                    output: JSON.stringify({
                        error: "Tool execution failed.",
                    }),
                }),
            ])
        );
    });

it("returns 500 when the AI API fails before streaming starts", async () => {
    createMock.mockRejectedValueOnce(
        new Error("Simulated AI API failure")
    );

    const request = new Request(
        "http://localhost/api/chat",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: "Hello",
                    },
                ],
            }),
        }
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
        error: "Failed to generate AI response",
    });
});


it("handles an error when the stream fails after the response starts", async () => {
    createMock.mockImplementationOnce(() => ({
        async *[Symbol.asyncIterator]() {
            throw new Error("Simulated streaming failure");
        },
    }));

    const request = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messages: [
                {
                    role: "user",
                    content: "Hello",
                },
            ],
        }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    await expect(response.text()).rejects.toThrow(
        "Simulated streaming failure"
    );
});



});
