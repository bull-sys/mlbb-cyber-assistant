import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");

test("encyclopedia exposes the complete hero catalog as a separate filter", () => {
  assert.match(html, /data-filter="hero">Герои/);
  assert.match(app, /const heroEntries=\(data\.heroCatalog\|\|\[\]\)\.map\(hero=>/);
  assert.match(app, /type:"hero"/);
  assert.match(app, /hero\.tacticalProfile\?\.status/);
});

test("hero catalog cards expose verification states instead of implying complete tactical data", () => {
  assert.match(app, /hero\.localization\?\.status/);
  assert.match(app, /hero\.role\?\.status/);
  assert.match(app, /hero\.lanes\?\.status/);
  assert.match(app, /esc\(x\.status\)/);
  assert.match(html, /не означает, что его контрпики и тактика уже поддерживаются анализатором драфта/);
});

test("encyclopedia search includes hero names, roles, lanes, and verification labels", () => {
  assert.match(app, /x\.name\+" "\+x\.category\+" "\+x\.description\+" "\+\(x\.status\|\|""\)/);
  assert.match(app, /\[\.\.\.items,\.\.\.talents,\.\.\.emblems,\.\.\.heroEntries\]/);
});
