
import { toolDefinitions } from "./toolDefinitions";

type ToolCall = {
  name: string;
  arguments: string;
};

export function executeTool(toolCall: ToolCall): string {
  const toolName = toolCall.name;

  if (
    !Object.prototype.hasOwnProperty.call(
      toolDefinitions,
      toolName
    )
  ) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  const args: unknown = JSON.parse(toolCall.arguments);

  const tool =
    toolDefinitions[
      toolName as keyof typeof toolDefinitions
    ];

  const result = tool.execute(args);

  return JSON.stringify(result);
}
