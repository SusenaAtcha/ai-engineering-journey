
function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getFieldDescription(field) {
  const parts = [
    field.name,
    field.id,
    field.getAttribute("autocomplete"),
    field.getAttribute("placeholder"),
    field.getAttribute("aria-label")
  ];

  if (field.id) {
    const label = document.querySelector(
      `label[for="${CSS.escape(field.id)}"]`
    );
    if (label) parts.push(label.innerText);
  }

  const parentLabel = field.closest("label");
  if (parentLabel) parts.push(parentLabel.innerText);

  return normalize(parts.filter(Boolean).join(" "));
}

function matchProfileField(field, profile) {
  const d = getFieldDescription(field);

  if (
    field.disabled ||
    field.readOnly ||
    field.value ||
    field.type === "password" ||
    field.type === "hidden" ||
    field.type === "file" ||
    field.type === "checkbox" ||
    field.type === "radio" ||
    field.type === "submit" ||
    field.type === "button" ||
    field.type === "reset"
  ) {
    return null;
  }

  if (field.type === "email" || d.includes("email")) {
    return profile.email;
  }

  if (
    field.type === "tel" ||
    d.includes("phone") ||
    d.includes("mobile")
  ) {
    return profile.phone;
  }

  if (
    d.includes("middlename") ||
    d.includes("middleinitial")
  ) {
    return profile.middleName;
  }

  if (
    d.includes("firstname") ||
    d.includes("givenname") ||
    d.includes("forename") ||
    field.autocomplete === "given-name"
  ) {
    return profile.firstName;
  }

  if (
    d.includes("lastname") ||
    d.includes("familyname") ||
    d.includes("surname") ||
    field.autocomplete === "family-name"
  ) {
    return profile.lastName;
  }

  return null;
}

function setFieldValue(field, value) {
  if (!value) return false;

  const prototype =
    field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;

  const setter = Object.getOwnPropertyDescriptor(
    prototype,
    "value"
  )?.set;

  if (!setter) return false;

  setter.call(field, value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));

  return true;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "FILL_APPLICATION") return;

  chrome.storage.local.get("profile", ({ profile }) => {
    if (!profile) {
      sendResponse({ message: "Please save your profile first." });
      return;
    }

    const fields = Array.from(
      document.querySelectorAll("input, textarea")
    );

    let filled = 0;

    for (const field of fields) {
      const value = matchProfileField(field, profile);
      if (value && setFieldValue(field, value)) filled++;
    }

    sendResponse({
      message: `Filled ${filled} fields. Please review the form.`
    });
  });

  return true;
});
