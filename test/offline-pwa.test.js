import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const serviceWorker = await readFile(
  new URL("../public/sw.js", import.meta.url),
  "utf8"
);
const app = await readFile(
  new URL("../public/app.js", import.meta.url),
  "utf8"
);

test("service worker keeps the game catalog available offline after a successful load", () => {
  assert.match(serviceWorker, /const DATA_CACHE="mlbb-cyber-data-v1"/);
  assert.match(serviceWorker, /url\.pathname==="\/api\/data"/);
  assert.match(serviceWorker, /cache\.put\(request,copy\)/);
  assert.match(serviceWorker, /caches\.match\(request\)/);
  assert.match(serviceWorker, /status:503/);
});

test("draft state is saved locally and restored only after the catalog is loaded", () => {
  assert.match(app, /const DRAFT_STORAGE_KEY="mlbb_draft_state_v1"/);
  assert.match(app, /localStorage\.setItem\(DRAFT_STORAGE_KEY/);
  assert.match(app, /localStorage\.getItem\(DRAFT_STORAGE_KEY/);
  assert.match(app, /restoreDraft\(\);drawTeams\(\);renderEncy\(\)/);
  assert.match(app, /enemies,allies,lane:/);
  assert.match(app, /threats:\[\.\.\.threats\]/);
});
