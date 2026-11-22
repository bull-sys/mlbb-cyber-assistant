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
  assert.match(serviceWorker, /const CACHE="mlbb-cyber-v4"/);
  assert.match(serviceWorker, /const DATA_CACHE="mlbb-cyber-data-v1"/);
  assert.match(serviceWorker, /url\.pathname==="\/api\/data"/);
  assert.match(serviceWorker, /cache\.put\(request,copy\)/);
  assert.match(serviceWorker, /caches\.match\(request\)/);
  assert.match(serviceWorker, /status:503/);
});

test("draft state is saved locally and restored only after the catalog is loaded", () => {
  assert.match(app, /const LEGACY_DRAFT_STORAGE_KEY="mlbb_draft_state_v1"/);
  assert.match(app, /const GUEST_DRAFT_STORAGE_KEY="mlbb_draft_state_v1_guest"/);
  assert.match(app, /function accountDraftKey\(userId\)/);
  assert.match(app, /mlbb_draft_state_v1_user_/);
  assert.match(app, /selectDraftStorage\(u\.id\)/);
  assert.match(app, /localStorage\.setItem\(draftStorageKey/);
  assert.match(app, /localStorage\.getItem\(draftStorageKey/);
  assert.doesNotMatch(app, /localStorage\.(?:setItem|removeItem)\(DRAFT_STORAGE_KEY/);
  assert.match(app, /restoreDraft\(\);drawTeams\(\);renderEncy\(\)/);
  assert.match(app, /enemies:\[\.\.\.enemies\],allies:\[\.\.\.allies\],lane:/);
  assert.match(app, /threats:\[\.\.\.threats\]/);
});

test("auth sessions are validated and expired tokens return the UI to guest mode", () => {
  assert.match(app, /if\(r\.status===401&&token&&!path\.startsWith\("\/auth\/"\)\)logout\(\)/);
  assert.match(app, /activeUserId=u\.id;selectDraftStorage\(u\.id\)/);
  assert.match(app, /if\(!token\|\|activeUserId===null\)return/);
  assert.match(app, /catch\{logout\(\);return false\}/);
});

test("AI-generated draft explanation is escaped before HTML rendering", () => {
  assert.match(app, /esc\(d\.aiExplanation\|\|d\.note\)/);
  assert.doesNotMatch(app, /\$\{d\.aiExplanation\|\|d\.note\}/);
});


test("authenticated draft sync keeps local saves and retries when the tab becomes active or online", () => {
  assert.match(app, /async function syncDraftState\(\)/);
  assert.match(app, /\$api\("\/draft-state"\)/);
  assert.match(app, /method:"PUT",body:JSON\.stringify\(\{state:local\}\)/);
  assert.match(app, /document\.addEventListener\("visibilitychange"/);
  assert.match(app, /window\.addEventListener\("online",syncDraftState\)/);
  assert.match(app, /Серверная синхронизация отложена; локальная копия сохранена/);
});

test("server stores draft snapshots per authenticated user and validates their contents", async () => {
  const server = await readFile(new URL("../server/index.js", import.meta.url), "utf8");
  assert.match(server, /CREATE TABLE IF NOT EXISTS draft_states\(user_id INTEGER PRIMARY KEY/);
  assert.match(server, /app\.get\("\/api\/draft-state",auth/);
  assert.match(server, /app\.put\("\/api\/draft-state",auth/);
  assert.match(server, /normalizeDraftState\(req\.body\?\.state/);
});

test("mobile controls preserve touch target size and iPhone safe-area insets", async () => {
  const css = await readFile(new URL("../public/style.css", import.meta.url), "utf8");
  assert.match(css, /button,\.chip,select,\.btn\{min-height:44px\}/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /-webkit-overflow-scrolling:touch/);
});

test("draft hero selection uses a searchable one-tap grid instead of native long selects", async () => {
 const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
 const css = await readFile(new URL("../public/style.css", import.meta.url), "utf8");
 assert.match(html, /id="openEnemyPicker"/);
 assert.match(html, /id="openAllyPicker"/);
 assert.match(html, /id="heroPickerSearch"/);
 assert.match(html, /id="heroPickerGrid"/);
 assert.match(app, /function openHeroPicker\(target\)/);
 assert.match(app, /function choosePickerHero\(value\)/);
 assert.match(app, /mlbb_recent_draft_heroes/);
 assert.match(css, /\.hero-picker-grid\{display:grid/);
 assert.match(css, /max-height:min\(88dvh,820px\)/);
});

test("draft picker renders hero portraits with readable names and fallback", async () => {
 const css = await readFile(new URL("../public/style.css", import.meta.url), "utf8");
 assert.match(app, /function heroPortraitUrl/);
 assert.match(app, /class="hero-portrait"/);
 assert.match(app, /portrait-missing/);
 assert.match(app, /images-hero/);
 assert.match(css, /hero-portrait-wrap/);
 assert.match(css, /object-fit:cover/);
});
