
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
});
