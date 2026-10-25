
import { describe, expect, it } from "vitest";
import { convertTemperature, analyzeText } from "./tools";

describe("convertTemperature", () => {
  it("converts 0 Celsius to 32 Fahrenheit", () => {
    const result = convertTemperature({ celsius: 0 });

    expect(result.fahrenheit).toBe(32);
  });

  it("converts 25 Celsius to 77 Fahrenheit", () => {
    const result = convertTemperature({ celsius: 25 });

    expect(result.fahrenheit).toBe(77);
  });

  it("rejects invalid temperature values", () => {
    expect(() =>
      convertTemperature({ celsius: Number.NaN })
    ).toThrow("Temperature must be a finite number");
  });
  it("counts words and characters in text", () => {
  const result = analyzeText({
    text: "React and Node.js",
  });

  expect(result).toEqual({
    wordCount: 3,
    characterCount: 17,
  });
});

it("returns zero words for empty text", () => {
  const result = analyzeText({
    text: "",
  });

  expect(result).toEqual({
    wordCount: 0,
    characterCount: 0,
  });
});

it("handles multiple spaces between words", () => {
  const result = analyzeText({
    text: "React   Node.js",
  });

  expect(result).toEqual({
    wordCount: 2,
    characterCount: 15,
  });
});
});
