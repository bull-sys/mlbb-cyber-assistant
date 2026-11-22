import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { heroes } from "../server/data.js";
import {
  getHeroCatalogApiFields,
  getVerifiedHeroCatalogLegacyMappings,
  isLegacyHeroName
} from "../server/hero-catalog-adapter.js";
import { heroCatalog } from "../server/hero-catalog.js";
import { heroLegacyBaseline } from "./fixtures/hero-legacy-baseline.js";

test("catalog API fields are additive and leave legacy heroes as the legacy list", () => {
  const fields = getHeroCatalogApiFields();

  assert.equal(fields.heroCatalog, heroCatalog);
  assert.equal(fields.heroCatalogRosterStatus, "incomplete");
  assert.deepEqual(fields.heroCatalogValidation, {
    ok: true,
    count: 32,
    errors: []
  });
  assert.deepEqual(
    Object.keys(fields).sort(),
    [
      "heroCatalog",
      "heroCatalogLegacyMappings",
      "heroCatalogRosterStatus",
      "heroCatalogValidation"
    ]
  );
  assert.deepEqual(fields.heroCatalogLegacyMappings, [
    { id: "jawhead", legacyName: "Кусака" },
    { id: "dyrroth", legacyName: "Диррот" }
  ]);
  assert.deepEqual(heroes, heroLegacyBaseline);
  assert.equal(Object.hasOwn(fields, "heroes"), false);
});

test("API and validation routes are wired to additive catalog fields and legacy names", async () => {
  const serverSource = await readFile(new URL("../server/index.js", import.meta.url), "utf8");

  assert.match(
    serverSource,
    /app\.get\("\/api\/data"[\s\S]*?heroes,\s*\.\.\.getHeroCatalogApiFields\(\)/
  );
  assert.match(
    serverSource,
    /app\.put\("\/api\/profile"[\s\S]*?isLegacyHeroName\(hero\)/
  );
  assert.match(
    serverSource,
    /app\.post\("\/api\/ai\/draft"[\s\S]*?isValidDraftRequest\(b,roles,isLegacyHeroName\)/
  );
});

test("legacy-name validation preserves names used by profiles and draft requests", () => {
  for (const hero of heroLegacyBaseline) {
    assert.equal(isLegacyHeroName(hero.name), true, hero.name);
  }

  assert.equal(isLegacyHeroName("Jawhead"), false);
  assert.equal(isLegacyHeroName("Dyrroth"), false);
  assert.equal(isLegacyHeroName("Дариус"), false);
  assert.equal(isLegacyHeroName(undefined), false);
});

test("catalog-to-legacy mappings require an explicit ID, unique records, and verified identity", () => {
  const unverifiedCatalog = heroCatalog.map(hero =>
    hero.id === "jawhead"
      ? { ...hero, identity: { status: "pending_review" } }
      : hero
  );
  assert.deepEqual(
    getVerifiedHeroCatalogLegacyMappings(unverifiedCatalog),
    [{ id: "dyrroth", legacyName: "Диррот" }]
  );

  const duplicateCatalog = [...heroCatalog, heroCatalog.find(hero => hero.id === "jawhead")];
  assert.deepEqual(
    getVerifiedHeroCatalogLegacyMappings(duplicateCatalog),
    [{ id: "dyrroth", legacyName: "Диррот" }]
  );
});

test("duplicate, ambiguous, malformed, and nonexistent mappings are rejected", () => {
  const jawheadMapping = { id: "jawhead", legacyName: "Кусака" };
  assert.deepEqual(
    getVerifiedHeroCatalogLegacyMappings(heroCatalog, heroes, [
      jawheadMapping,
      jawheadMapping
    ]),
    []
  );
  assert.deepEqual(
    getVerifiedHeroCatalogLegacyMappings(heroCatalog, heroes, [
      { id: "jawhead", legacyName: "Кусака" },
      { id: "another-id", legacyName: "Кусака" }
    ]),
    []
  );
  assert.deepEqual(
    getVerifiedHeroCatalogLegacyMappings(heroCatalog, heroes, [
      { id: "missing-id", legacyName: "Кусака" },
      { id: "jawhead", legacyName: "Missing legacy hero" },
      { id: "", legacyName: "Кусака" },
      null
    ]),
    []
  );
  assert.deepEqual(
    getVerifiedHeroCatalogLegacyMappings(heroCatalog, [
      ...heroes,
      { ...heroes.find(hero => hero.name === "Кусака") }
    ], [jawheadMapping]),
    []
  );
  assert.deepEqual(
    getVerifiedHeroCatalogLegacyMappings(null, heroes, [jawheadMapping]),
    []
  );
});

test("browser OCR continues to read the legacy name field", async () => {
  const appSource = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  assert.match(appSource, /data\.heroes\.map\(h\s*=>\s*h\.name\)/);
  assert.deepEqual(
    heroes.map(hero => hero.name),
    heroLegacyBaseline.map(hero => hero.name)
  );
});
