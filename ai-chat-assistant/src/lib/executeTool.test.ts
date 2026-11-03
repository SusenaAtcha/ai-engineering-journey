
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

    it("executes the analyzeText tool", () => {
        const output = executeTool({
            name: "analyzeText",
            arguments: JSON.stringify({
                text: "React and Node.js",
            }),
        });

        expect(JSON.parse(output)).toEqual({
            wordCount: 3,
            characterCount: 17,
        });
    });

    it("rejects invalid analyzeText arguments", () => {
        expect(() =>
            executeTool({
                name: "analyzeText",
                arguments: JSON.stringify({
                    text: 123,
                }),
            })
        ).toThrow("Invalid arguments for analyzeText");
    });

    it("rejects extra properties for convertTemperature", () => {
        expect(() =>
            executeTool({
                name: "convertTemperature",
                arguments: JSON.stringify({
                    celsius: 25,
                    admin: true,
                }),
            })
        ).toThrow("Invalid arguments for convertTemperature");
    });

    it("rejects extra properties for analyzeText", () => {
        expect(() =>
            executeTool({
                name: "analyzeText",
                arguments: JSON.stringify({
                    text: "React and Node.js",
                    admin: true,
                }),
            })
        ).toThrow("Invalid arguments for analyzeText");
    });

    it("returns a clear error for malformed JSON", () => {
        expect(() =>
            executeTool({
                name: "analyzeText",
                arguments: '{"text":',
            })
        ).toThrow("Invalid JSON in tool arguments");
    });



});
