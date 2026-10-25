
import { describe, expect, it } from "vitest";
import { executeTool } from "./executeTool";

describe("executeTool", () => {
  it("executes the temperature tool", () => {
    const result = executeTool({
      name: "convertTemperature",
      arguments: JSON.stringify({ celsius: 25 }),
    });

    expect(JSON.parse(result)).toEqual({
      celsius: 25,
      fahrenheit: 77,
    });
  });

  it("rejects invalid arguments", () => {
    expect(() =>
      executeTool({
        name: "convertTemperature",
        arguments: JSON.stringify({ celsius: "25" }),
      })
    ).toThrow("Invalid arguments for convertTemperature");
  });

  it("rejects unknown tools", () => {
    expect(() =>
      executeTool({
        name: "unknownTool",
        arguments: "{}",
      })
    ).toThrow("Unknown tool: unknownTool");
  });

  it("rejects malformed JSON", () => {
    expect(() =>
      executeTool({
        name: "convertTemperature",
        arguments: "{invalid json",
      })
    ).toThrow();
  });
});
