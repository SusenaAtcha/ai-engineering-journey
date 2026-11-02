
// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

function selectMatchingOption(select, value) {
  if (!value || select.disabled) return false;

  const normalizedValue = value.trim().toLowerCase();

  const matchingOption = Array.from(select.options).find(
    (option) =>
      !option.disabled &&
      option.value.trim().toLowerCase() === normalizedValue ||
      !option.disabled &&
      option.textContent.trim().toLowerCase() === normalizedValue
  );

  if (!matchingOption) return false;

  select.value = matchingOption.value;
  select.dispatchEvent(new Event("input", { bubbles: true }));
  select.dispatchEvent(new Event("change", { bubbles: true }));

  return true;
}

describe("dropdown autofill", () => {
  it("selects an exact matching option", () => {
    const select = document.createElement("select");
    select.innerHTML = `
      <option value="">Select a city</option>
      <option value="Hyderabad">Hyderabad</option>
      <option value="Bengaluru">Bengaluru</option>
    `;

    expect(selectMatchingOption(select, "Hyderabad")).toBe(true);
    expect(select.value).toBe("Hyderabad");
  });

  it("does not select an option that is unavailable", () => {
    const select = document.createElement("select");
    select.innerHTML = `
      <option value="">Select a city</option>
      <option value="Bengaluru">Bengaluru</option>
    `;

    expect(selectMatchingOption(select, "Hyderabad")).toBe(false);
    expect(select.value).toBe("");
  });

  it("does not modify a disabled dropdown", () => {
    const select = document.createElement("select");
    select.disabled = true;
    select.innerHTML = `
      <option value="">Select a city</option>
      <option value="Hyderabad">Hyderabad</option>
    `;

    expect(selectMatchingOption(select, "Hyderabad")).toBe(false);
    expect(select.value).toBe("");
  });

  it("supports case-insensitive matching", () => {
    const select = document.createElement("select");
    select.innerHTML = `
      <option value="">Select a city</option>
      <option value="Hyderabad">Hyderabad</option>
    `;

    expect(selectMatchingOption(select, "hyderabad")).toBe(true);
    expect(select.value).toBe("Hyderabad");
  });
});
