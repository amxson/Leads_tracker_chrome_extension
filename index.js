const inputEl = document.getElementById("input-el");
const ulEl = document.getElementById("ul-el");
const tabBtn = document.getElementById("tab-btn");
let myLeads = [];

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

try {
  const saved = JSON.parse(localStorage.getItem("myLeads"));
  if (Array.isArray(saved))
    myLeads = [
      ...new Set(
        saved
          .filter((item) => typeof item === "string")
          .map(safeUrl)
          .filter(Boolean),
      ),
    ].slice(0, 500);
} catch {
  /* An invalid saved value should not prevent opening the popup. */
}

function render(leads) {
  ulEl.replaceChildren();
  for (const value of leads) {
    const url = safeUrl(value);
    if (!url) continue;
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = url;
    item.append(link);
    ulEl.append(item);
  }
}

function saveLead(value) {
  const url = safeUrl(value);
  if (!url) {
    inputEl.setCustomValidity("Enter a full http:// or https:// address.");
    inputEl.reportValidity();
    return;
  }
  inputEl.setCustomValidity("");
  if (!myLeads.includes(url) && myLeads.length < 500) myLeads.push(url);
  try {
    localStorage.setItem("myLeads", JSON.stringify(myLeads));
  } catch {
    /* Keep the current session usable if storage is full. */
  }
  render(myLeads);
}

inputEl.addEventListener("input", () => inputEl.setCustomValidity(""));
document.getElementById("input-btn").addEventListener("click", () => {
  saveLead(inputEl.value.trim());
  inputEl.value = "";
});
document.getElementById("delete-btn").addEventListener("dblclick", () => {
  localStorage.removeItem("myLeads");
  myLeads = [];
  render(myLeads);
});
if (typeof chrome !== "undefined" && chrome.tabs?.query) {
  tabBtn.addEventListener("click", () =>
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!chrome.runtime?.lastError && tabs[0]?.url) saveLead(tabs[0].url);
    }),
  );
} else {
  tabBtn.disabled = true;
  tabBtn.title = "Save Tab is available in the installed Chrome extension.";
}
render(myLeads);
