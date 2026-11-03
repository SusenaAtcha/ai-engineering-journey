
const firstName = document.getElementById("firstName");
const middleName = document.getElementById("middleName");
const lastName = document.getElementById("lastName");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const linkedin = document.getElementById("linkedin");
const github = document.getElementById("github");
const portfolio = document.getElementById("portfolio");
const city = document.getElementById("city");
const status = document.getElementById("status");

async function loadProfile() {
  const { profile } = await chrome.storage.local.get("profile");

  if (!profile) return;

  firstName.value = profile.firstName || "";
  middleName.value = profile.middleName || "";
  lastName.value = profile.lastName || "";
  email.value = profile.email || "";
  phone.value = profile.phone || "";
  linkedin.value = profile.linkedin || "";
  github.value = profile.github || "";
  portfolio.value = profile.portfolio || "";
  city.value = profile.city || "";
}

document.getElementById("save-button").addEventListener("click", async () => {
  const profile = {
    firstName: firstName.value.trim(),
    middleName: middleName.value.trim(),
    lastName: lastName.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    linkedin: linkedin.value.trim(),
    github: github.value.trim(),
    portfolio: portfolio.value.trim(),
    city: city.value.trim()
  };

  try {
    await chrome.storage.local.set({ profile });
    status.textContent = "Profile saved locally.";
  } catch (error) {
    console.error("Profile saving failed:", error);
    status.textContent = "Could not save profile.";
  }
});

document.getElementById("fill-button").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab?.id) {
    status.textContent = "No active tab found.";
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "FILL_APPLICATION"
    });

    status.textContent = response?.message || "Please review the form.";
  } catch (error) {
    console.error("Fill Application failed:", error);
    status.textContent =
      error.message || "Could not fill this page. Try reloading it.";
  }
});

loadProfile().catch((error) => {
  console.error("Profile loading failed:", error);
  status.textContent = "Could not load profile.";
});
