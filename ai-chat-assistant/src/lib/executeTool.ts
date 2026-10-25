
import { convertTemperature } from "./tools";

type ToolCall = {
  name: string;
  arguments: string;
};

export function executeTool(toolCall: ToolCall): string {
  if (toolCall.name === "convertTemperature") {
    const args: unknown = JSON.parse(toolCall.arguments);

    if (
      typeof args !== "object" ||
      args === null ||
      !("celsius" in args) ||
      typeof args.celsius !== "number" ||
      !Number.isFinite(args.celsius)
    ) {
      throw new Error("Invalid arguments for convertTemperature");
    }

    const result = convertTemperature({
      celsius: args.celsius,
    });

    return JSON.stringify(result);
  }

  throw new Error(`Unknown tool: ${toolCall.name}`);
}
