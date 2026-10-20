const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const code = fs.readFileSync(
  require("node:path").join(__dirname, "../index.js"),
  "utf8",
);
function popup(saved) {
  const storage = new Map([
    ["myLeads", saved],
    ["unrelated", "keep"],
  ]);
  const node = () => ({
    children: [],
    handlers: {},
    value: "",
    addEventListener(event, handler) {
      this.handlers[event] = handler;
    },
    append(child) {
      this.children.push(child);
    },
    replaceChildren() {
      this.children = [];
    },
    setCustomValidity(message) {
      this.validity = message;
    },
    reportValidity() {},
  });
  const elements = Object.fromEntries(
    ["input-el", "input-btn", "ul-el", "delete-btn", "tab-btn"].map((id) => [
      id,
      node(),
    ]),
  );
  const context = {
    URL,
    document: { getElementById: (id) => elements[id], createElement: node },
    localStorage: {
      getItem: (key) => storage.get(key),
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
  };
  vm.runInNewContext(code, context);
  return { elements, storage };
}
test("malformed storage and normal browser preview do not crash", () => {
  const { elements } = popup("{broken");
  assert.equal(elements["tab-btn"].disabled, true);
  assert.equal(elements["ul-el"].children.length, 0);
});
test("unsafe schemes are rejected and markup renders as text", () => {
  const { elements } = popup(
    JSON.stringify(["javascript:alert(1)", "https://example.com/?q=<img>"]),
  );
  const links = elements["ul-el"].children;
  assert.equal(links.length, 1);
  assert.equal(links[0].children[0].rel, "noopener noreferrer");
  elements["input-el"].value = "javascript:alert(1)";
  elements["input-btn"].handlers.click();
  assert.equal(elements["ul-el"].children.length, 1);
});
test("saving de-duplicates URLs and deletion preserves other storage", () => {
  const { elements, storage } = popup("[]");
  for (let i = 0; i < 2; i++) {
    elements["input-el"].value = "https://example.com";
    elements["input-btn"].handlers.click();
  }
  assert.equal(elements["ul-el"].children.length, 1);
  elements["delete-btn"].handlers.dblclick();
  assert.equal(storage.get("unrelated"), "keep");
  assert.equal(storage.has("myLeads"), false);
});
