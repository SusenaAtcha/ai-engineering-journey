
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


export type AnalyzeTextArgs = {
  text: string;
};

export function analyzeText({
  text,
}: AnalyzeTextArgs): {
  wordCount: number;
  characterCount: number;
} {
  if (typeof text !== "string") {
    throw new Error("Text must be a string");
  }

  const trimmedText = text.trim();

  const wordCount =
    trimmedText.length === 0
      ? 0
      : trimmedText.split(/\s+/).length;

  return {
    wordCount,
    characterCount: text.length,
  };
}

