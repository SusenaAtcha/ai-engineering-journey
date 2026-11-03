
import { matchProfileField } from "../shared/field-mapping.js";

const UNSUPPORTED_TYPES = new Set([
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
        field.getAttribute("aria-label"),
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

    return (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement
    );
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
            (option) =>
                option.value.trim().toLowerCase() === value.trim().toLowerCase() ||
                option.textContent.trim().toLowerCase() === value.trim().toLowerCase()
        );

        if (!matchingOption || matchingOption.disabled) {
            return false;
        }

        field.value = matchingOption.value;
    } else {
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

        if (
            field instanceof HTMLSelectElement
                ? field.selectedIndex > 0 && field.value.trim() !== ""
                : field.value.trim() !== ""
        ) {
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
        message:
            `Filled ${filled} fields. ` +
            `Already filled: ${alreadyFilled}. ` +
            `Unmatched empty fields: ${unmatched}. ` +
            "Please review the form before submitting."
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
