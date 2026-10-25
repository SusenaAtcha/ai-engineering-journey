
import {
  analyzeText,
  convertTemperature,
} from "./tools";

export const toolDefinitions = {
  convertTemperature: {
    schema: {
      type: "function",
      name: "convertTemperature",
      description:
        "Convert a temperature from Celsius to Fahrenheit.",
      parameters: {
        type: "object",
        properties: {
          celsius: {
            type: "number",
            description: "Temperature in degrees Celsius.",
          },
        },
        required: ["celsius"],
        additionalProperties: false,
      },
      strict: true,
    },

    execute: (args: unknown) => {
      if (
        typeof args !== "object" ||
        args === null ||
        !("celsius" in args) ||
        typeof args.celsius !== "number" ||
        !Number.isFinite(args.celsius)
      ) {
        throw new Error(
          "Invalid arguments for convertTemperature"
        );
      }

      return convertTemperature({
        celsius: args.celsius,
      });
    },
  },

  analyzeText: {
    schema: {
      type: "function",
      name: "analyzeText",
      description:
        "Count the words and characters in a piece of text.",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The text to analyze.",
          },
        },
        required: ["text"],
        additionalProperties: false,
      },
      strict: true,
    },

    execute: (args: unknown) => {
      if (
        typeof args !== "object" ||
        args === null ||
        !("text" in args) ||
        typeof args.text !== "string"
      ) {
        throw new Error(
          "Invalid arguments for analyzeText"
        );
      }

      return analyzeText({
        text: args.text,
      });
    },
  },
} as const;
