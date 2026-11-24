import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("draft UI exposes both the legacy analyzer roster and canonical catalog IDs", async () => {
  const source = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  assert.match(source, /function draftOptions\(el\)/);
  assert.match(source, /data\.draftHeroOptions/);
  assert.match(source, /Старая база · анализ доступен/);
  assert.match(source, /Каталог героев · проверка продолжается/);
  assert.match(source, /analysisSupported/);
  assert.match(source, /filter\(hero=>!hero\.analysisSupported\)/);
});

test("draft UI restores catalog IDs and renders their visible names", async () => {
  const source = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  assert.match(source, /data\.draftHeroOptions\|\|\[\]\)\.map\(h=>h\.id\)/);
  assert.match(source, /function draftHeroLabel\(value\)/);
  assert.match(source, /esc\(draftHeroLabel\(x\)\)/);
});

test("limited analysis never renders empty or fabricated counter recommendations", async () => {
  const source = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  const limited = source.indexOf('if(d.analysisStatus==="limited")');
  assert.ok(limited >= 0);
  const limitedEnd = source.indexOf("return;", limited);
  assert.ok(limitedEnd > limited);
  const limitedBranch = source.slice(limited, limitedEnd);
  assert.match(limitedBranch, /ОГРАНИЧЕННЫЙ АНАЛИЗ/);
  assert.match(limitedBranch, /d\.unsupportedHeroes/);
  assert.match(limitedBranch, /esc\(d\.note\)/);
  assert.doesNotMatch(limitedBranch, /d\.counters\.map/);
});

test("server blocks full analysis when any selected catalog hero lacks verified mapping", async () => {
  const source = await readFile(new URL("../server/index.js", import.meta.url), "utf8");
  const limited = source.indexOf('if(unsupported.length)');
  const analyze = source.indexOf("const result=analyze(resolvedDraft)", limited);
  assert.ok(limited >= 0);
  assert.ok(analyze > limited);
  assert.match(source.slice(limited, analyze), /analysisStatus:"limited"/);
  assert.match(source.slice(limited, analyze), /return res\.json/);
});

test("draft picker renders a live selected-hero strip with portraits and team capacity", async () => {
  const source = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  assert.match(source, /const selectedValues=pickerTarget==="myHero"/);
  assert.match(source, /picker-selection-slots/);
  assert.match(source, /heroPortraitUrl\(hero\)/);
  assert.match(source, /current\.length\+" \/ 5"/);
  assert.match(source, /Добавь героев в состав/);
});

test("draft picker uses a circular neon selection grid and respects reduced motion", async () => {
  const css = await readFile(new URL("../public/style.css", import.meta.url), "utf8");
  assert.match(css, /CYBER ARENA · draft selection stage polish/);
  assert.match(css, /\.hero-tile\.selected\s*\{/);
  assert.match(css, /border-radius:50%/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /\.picker-selection-slots/);
});
