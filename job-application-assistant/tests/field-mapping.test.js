
import { describe, it, expect } from "vitest";
import { matchProfileField } from "../shared/field-mapping.js";

const profile = {
  firstName: "Susena",
  middleName: "R",
  lastName: "Kumari",
  email: "susena@example.com",
  phone: "9876543210",
    linkedin: "https://linkedin.com/in/susena",
    github: "https://github.com/susena",
    portfolio: "https://susena.dev",
    city: "Hyderabad",
};

describe("matchProfileField", () => {
  it("matches a first name", () => {
    expect(matchProfileField("First Name", profile)).toEqual({
      profileKey: "firstName",
      value: "Susena",
    });
  });

  it("matches alternative name labels", () => {
    expect(matchProfileField("Given Name", profile).value).toBe("Susena");
    expect(matchProfileField("Surname", profile).value).toBe("Kumari");
  });

  it("matches email and mobile labels", () => {
    expect(matchProfileField("Email Address", profile).value)
      .toBe("susena@example.com");

    expect(matchProfileField("Mobile Number", profile).value)
      .toBe("9876543210");
  });

  it("matches the middle name", () => {
    expect(matchProfileField("Middle Name", profile).value).toBe("R");
  });

  it("returns null for unknown fields", () => {
    expect(matchProfileField("Favorite Color", profile)).toBeNull();
  });

  it("does not fill missing profile values", () => {
    const incompleteProfile = {
      ...profile,
      middleName: "",
    };

    expect(
      matchProfileField("Middle Name", incompleteProfile)
    ).toBeNull();
  });

  it("handles different capitalization and separators", () => {
    expect(matchProfileField("EMAIL_ADDRESS", profile).value)
      .toBe("susena@example.com");
  });


  it("matches LinkedIn, GitHub, portfolio, and city", () => {
    expect(matchProfileField("LinkedIn URL", profile).value)
      .toBe("https://linkedin.com/in/susena");

    expect(matchProfileField("GitHub Profile", profile).value)
      .toBe("https://github.com/susena");

    expect(matchProfileField("Portfolio Website", profile).value)
      .toBe("https://susena.dev");

    expect(matchProfileField("City", profile).value)
      .toBe("Hyderabad");
  });

  it("matches fields using input type and autocomplete", () => {
    expect(matchProfileField("contact", profile, "email").value)
      .toBe("susena@example.com");

    expect(matchProfileField("contact", profile, "tel").value)
      .toBe("9876543210");

    expect(matchProfileField("contact", profile, "", "given-name").value)
      .toBe("Susena");

    expect(matchProfileField("contact", profile, "", "family-name").value)
      .toBe("Kumari");
  });

  it("does not match unrelated labels to personal fields", () => {
    expect(matchProfileField("Favorite Color", profile)).toBeNull();
    expect(matchProfileField("Expected Salary", profile)).toBeNull();
    expect(matchProfileField("Years of Experience", profile)).toBeNull();
  });

  it("does not match fields when profile values are missing", () => {
    const incompleteProfile = {
      ...profile,
      github: "",
      city: "",
    };

    expect(matchProfileField("GitHub URL", incompleteProfile)).toBeNull();
    expect(matchProfileField("City", incompleteProfile)).toBeNull();
  });

});
