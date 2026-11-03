
const FIELD_RULES = [
  { profileKey: "email", patterns: [/\be-?mail\b/] },
  {
    profileKey: "phone",
    patterns: [/\bphone\b/, /\bmobile\b/, /\btelephone\b/, /\bcell\b/],
  },
  {
    profileKey: "middleName",
    patterns: [/\bmiddle name\b/, /\bmiddle initial\b/],
  },
  {
    profileKey: "firstName",
    patterns: [/\bfirst name\b/, /\bgiven name\b/, /\bforename\b/],
  },
  {
    profileKey: "lastName",
    patterns: [/\blast name\b/, /\bfamily name\b/, /\bsurname\b/],
  },
  {
    profileKey: "linkedin",
    patterns: [/\blinkedin\b/],
  },
  {
    profileKey: "github",
    patterns: [/\bgithub\b/],
  },
  {
    profileKey: "portfolio",
    patterns: [/\bportfolio\b/, /\bpersonal website\b/, /\bwebsite\b/],
  },
  {
    profileKey: "city",
    patterns: [/\bcity\b/, /\btown\b/],
  },
];

export function matchProfileField(
  description,
  profile,
  fieldType = "",
  autocomplete = ""
) {
  const text = String(description ?? "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const type = String(fieldType).toLowerCase();
  const auto = String(autocomplete).toLowerCase();

  // Prefer browser-provided field types and autocomplete hints.
  let rule = null;

  if (type === "email" || auto === "email") {
    rule = FIELD_RULES.find((item) => item.profileKey === "email");
  } else if (type === "tel" || auto === "tel") {
    rule = FIELD_RULES.find((item) => item.profileKey === "phone");
  } else if (auto === "given-name") {
    rule = FIELD_RULES.find((item) => item.profileKey === "firstName");
  } else if (auto === "family-name") {
    rule = FIELD_RULES.find((item) => item.profileKey === "lastName");
  } else {
    rule = FIELD_RULES.find((item) =>
      item.patterns.some((pattern) => pattern.test(text))
    );
  }

  if (!rule) return null;

  const value = profile?.[rule.profileKey];

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return {
    profileKey: rule.profileKey,
    value: value.trim(),
  };
}
