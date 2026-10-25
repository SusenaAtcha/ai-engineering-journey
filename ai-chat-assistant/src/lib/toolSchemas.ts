
export const convertTemperatureSchema = {
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
} as const;
