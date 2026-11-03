
import { describe, expect, it } from "vitest";
import { executeTool } from "./executeTool";
import { toolDefinitions } from "./toolDefinitions"

describe("local tool-calling workflow", () => {
  it("executes a simulated AI tool request", () => {
    // Simulate the tool request returned by an AI model.
    const simulatedToolCall = {
      name:  toolDefinitions.convertTemperature.schema.name,
      arguments: JSON.stringify({ celsius: 25 }),
    };

    // Our application executes the requested tool.
    const output = executeTool(simulatedToolCall);
    const result = JSON.parse(output);

    expect(result).toEqual({
      celsius: 25,
      fahrenheit: 77,
    });
  });
});
