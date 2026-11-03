
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

    let args: unknown;

    try {
        args = JSON.parse(toolCall.arguments);
    } catch {
        throw new Error("Invalid JSON in tool arguments");
    }

    const tool =
        toolDefinitions[
        toolName as keyof typeof toolDefinitions
        ];

    const result = tool.execute(args);

    return JSON.stringify(result);
}
