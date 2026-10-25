
import { describe, expect, it } from "vitest";
import { convertTemperature } from "./tools";

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
});
