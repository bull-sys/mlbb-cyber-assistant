import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");

test("encyclopedia exposes the complete hero catalog as a separate filter", () => {
  assert.match(html, /data-filter="hero">Герои/);
  assert.match(app, /const heroEntries=\(data\.heroCatalog\|\|\[\]\)\.filter\(hero=>hero&&typeof hero==="object"\)\.map\(hero=>/);
  assert.match(app, /type:"hero"/);
  assert.match(app, /hero\.role\?\.values/);
  assert.match(app, /hero\.lanes\?\.primary/);
});

test("hero catalog cards show names, role, lane and profile verification", () => {
  assert.match(app, /hero\.displayNameRu\|\|hero\.nameEn\|\|hero\.id/);
  assert.match(app, /hero\.role\?\.values/);
  assert.match(app, /hero\.lanes\?\.flexible/);
  assert.match(app, /Профиль частичный/);
  assert.match(app, /Профиль в работе/);
  assert.match(html, /не означает, что его контрпики и тактика уже поддерживаются анализатором драфта/);
});

test("encyclopedia search includes hero names, roles and lanes", () => {
  assert.match(app, /x\.name\+" "\+x\.category\+" "\+\(x\.secondaryCategory\|\|""\)\+" "\+\(x\.description\|\|""\)/);
  assert.match(app, /entries:heroEntries/);
});
