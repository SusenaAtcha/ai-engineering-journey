
export type ConvertTemperatureArgs = {
  celsius: number;
};

export function convertTemperature({
  celsius,
}: ConvertTemperatureArgs): {
  celsius: number;
  fahrenheit: number;
} {
  if (!Number.isFinite(celsius)) {
    throw new Error("Temperature must be a finite number");
  }

  const fahrenheit = (celsius * 9) / 5 + 32;

  return {
    celsius,
    fahrenheit,
  };
}
