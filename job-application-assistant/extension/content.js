"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // shared/field-mapping.js
  function matchProfileField(description, profile, fieldType = "", autocomplete = "") {
    const text = String(description ?? "").toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    const type = String(fieldType).toLowerCase();
    const auto = String(autocomplete).toLowerCase();
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
      rule = FIELD_RULES.find(
        (item) => item.patterns.some((pattern) => pattern.test(text))
      );
    }
    if (!rule) return null;
    const value = profile?.[rule.profileKey];
    if (typeof value !== "string" || !value.trim()) {
      return null;
    }
    return {
      profileKey: rule.profileKey,
      value: value.trim()
    };
  }
  var FIELD_RULES;
  var init_field_mapping = __esm({
    "shared/field-mapping.js"() {
      "use strict";
      FIELD_RULES = [
        { profileKey: "email", patterns: [/\be-?mail\b/] },
        {
          profileKey: "phone",
          patterns: [/\bphone\b/, /\bmobile\b/, /\btelephone\b/, /\bcell\b/]
        },
        {
          profileKey: "middleName",
          patterns: [/\bmiddle name\b/, /\bmiddle initial\b/]
        },
        {
          profileKey: "firstName",
          patterns: [/\bfirst name\b/, /\bgiven name\b/, /\bforename\b/]
        },
        {
          profileKey: "lastName",
          patterns: [/\blast name\b/, /\bfamily name\b/, /\bsurname\b/]
        },
        {
          profileKey: "linkedin",
          patterns: [/\blinkedin\b/]
        },
        {
          profileKey: "github",
          patterns: [/\bgithub\b/]
        },
        {
          profileKey: "portfolio",
          patterns: [/\bportfolio\b/, /\bpersonal website\b/, /\bwebsite\b/]
        },
        {
          profileKey: "city",
          patterns: [/\bcity\b/, /\btown\b/]
        }
      ];
    }
  });

  // src/content.js
  var require_content = __commonJS({
    "src/content.js"() {
      init_field_mapping();
      var UNSUPPORTED_TYPES = /* @__PURE__ */ new Set([
        "password",
        "hidden",
        "file",
        "checkbox",
        "radio",
        "submit",
        "button",
        "reset",
        "image"
      ]);
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
        return parts.filter(Boolean).join(" ");
      }
      function isEligibleField(field) {
        if (field.disabled || field.readOnly) return false;
        if (field instanceof HTMLSelectElement) {
          return true;
        }
        if (UNSUPPORTED_TYPES.has(field.type)) return false;
        return field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement;
      }
      function getMatchingValue(field, profile) {
        if (!isEligibleField(field) || field.value.trim()) {
          return null;
        }
        const match = matchProfileField(
          getFieldDescription(field),
          profile,
          field.type,
          field.getAttribute("autocomplete")
        );
        return match?.value ?? null;
      }
      function setFieldValue(field, value) {
        if (!value) return false;
        if (field instanceof HTMLSelectElement) {
          const matchingOption = Array.from(field.options).find(
            (option) => option.value.trim().toLowerCase() === value.trim().toLowerCase() || option.textContent.trim().toLowerCase() === value.trim().toLowerCase()
          );
          if (!matchingOption || matchingOption.disabled) {
            return false;
          }
          field.value = matchingOption.value;
        } else {
          const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(
            prototype,
            "value"
          )?.set;
          if (!setter) return false;
          setter.call(field, value);
        }
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
      function fillApplication(profile) {
        const fields = Array.from(
          document.querySelectorAll("input, textarea, select")
        );
        let filled = 0;
        let alreadyFilled = 0;
        let unmatched = 0;
        for (const field of fields) {
          if (!isEligibleField(field)) continue;
          if (field instanceof HTMLSelectElement ? field.selectedIndex > 0 && field.value.trim() !== "" : field.value.trim() !== "") {
            alreadyFilled++;
            continue;
          }
          const value = getMatchingValue(field, profile);
          if (!value) {
            unmatched++;
            continue;
          }
          if (setFieldValue(field, value)) {
            filled++;
          }
        }
        return {
          message: `Filled ${filled} fields. Already filled: ${alreadyFilled}. Unmatched empty fields: ${unmatched}. Please review the form before submitting.`
        };
      }
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type !== "FILL_APPLICATION") return;
        chrome.storage.local.get("profile", ({ profile }) => {
          if (!profile) {
            sendResponse({ message: "Please save your profile first." });
            return;
          }
          sendResponse(fillApplication(profile));
        });
        return true;
      });
    }
  });
  require_content();
})();
