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
    count: 133,
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


test("hero catalog contains the 133-name roster without duplicate IDs", () => {
  assert.equal(heroCatalog.length, 133);
  assert.equal(new Set(heroCatalog.map(hero => hero.id)).size, 133);
  assert.equal(heroCatalog.find(hero => hero.id === "hirara")?.nameEn, "Hirara");
  assert.equal(heroCatalog.find(hero => hero.id === "marcel")?.nameEn, "Marcel");
  assert.equal(heroCatalog.find(hero => hero.id === "popol-and-kupa")?.nameEn, "Popol and Kupa");
  assert.equal(heroCatalog.find(hero => hero.id === "hirara")?.tacticalProfile.status, "missing");
});

test("first 20 researched heroes include cross-source role and lane evidence", () => {
  const researchedIds = [
    "aamon", "akai", "aldous", "alpha", "alucard", "argus", "arlott",
    "aulus", "aurora", "badang", "balmond", "bane", "barats", "baxia",
    "beatrix", "belerick", "benedetta", "brody", "carmilla", "cecilion"
  ];

  for (const id of researchedIds) {
    const hero = heroCatalog.find(entry => entry.id === id);
    assert.ok(hero, id);
    assert.equal(hero.role.status, "verified", id);
    assert.equal(hero.research.checkedAt, "2026-11-22", id);
    assert.equal(hero.research.roleAndLaneSources.length, 3, id);
    assert.equal(
      hero.research.competitiveReviewStatus,
      id === "fanny" ? "partial" : "pending",
      id
    );
  }

  assert.equal(
    heroCatalog.find(entry => entry.id === "barats").lanes.status,
    "pending_review"
  );
  assert.equal(
    heroCatalog.find(entry => entry.id === "badang").lanes.primary,
    "EXP Lane"
  );
});


test("next ten researched heroes include cross-source role and lane evidence", () => {
  const expected = {
    "chang-e": ["Mage", "Mid Lane"],
    chip: ["Support", "Roam"],
    cici: ["Fighter", "EXP Lane"],
    claude: ["Marksman", "Gold Lane"],
    clint: ["Marksman", "Gold Lane"],
    edith: ["Tank", "EXP Lane"],
    esmeralda: ["Tank", "EXP Lane"],
    fanny: ["Assassin", "Jungle"],
    faramis: ["Support", "Mid Lane"],
    floryn: ["Support", "Roam"]
  };

  for (const [id, [role, lane]] of Object.entries(expected)) {
    const hero = heroCatalog.find(entry => entry.id === id);
    assert.ok(hero, id);
    assert.ok(hero.role.values.includes(role), id);
    assert.equal(hero.role.status, "verified", id);
    assert.equal(hero.lanes.primary, lane, id);
    assert.equal(hero.lanes.status, "verified", id);
    assert.equal(hero.research.checkedAt, "2026-11-22", id);
    assert.equal(hero.research.roleAndLaneSources.length, 3, id);
    assert.equal(
      hero.research.competitiveReviewStatus,
      id === "fanny" ? "partial" : "pending",
      id
    );
  }

  assert.deepEqual(
    heroCatalog.find(entry => entry.id === "edith").lanes.flexible,
    ["Roam"]
  );
  assert.deepEqual(
    heroCatalog.find(entry => entry.id === "faramis").lanes.flexible,
    ["Roam"]
  );
});

test("Badang's EXP/Roam split remains flagged instead of claiming a single settled primary lane", () => {
  const badang = heroCatalog.find(entry => entry.id === "badang");
  assert.equal(badang.lanes.primary, "EXP Lane");
  assert.deepEqual(badang.lanes.flexible, ["Roam"]);
  assert.equal(badang.lanes.status, "pending_review");
});


test("third researched batch includes cross-source role and lane evidence", () => {
  const expected = {
    franco: ["Tank", "Roam"],
    fredrinn: ["Fighter", "Jungle"],
    freya: ["Fighter", "EXP Lane"],
    gatotkaca: ["Tank", "Roam"],
    gloo: ["Tank", "Roam"],
    gord: ["Mage", "Mid Lane"],
    grock: ["Tank", "Roam"],
    guinevere: ["Fighter", "EXP Lane"],
    gusion: ["Assassin", "Jungle"],
    hanabi: ["Marksman", "Gold Lane"]
  };

  for (const [id, [role, lane]] of Object.entries(expected)) {
    const hero = heroCatalog.find(entry => entry.id === id);
    assert.ok(hero, id);
    assert.ok(hero.role.values.includes(role), id);
    assert.equal(hero.role.status, "verified", id);
    assert.equal(hero.lanes.primary, lane, id);
    assert.equal(hero.lanes.status, "verified", id);
    assert.equal(hero.research.checkedAt, "2026-11-22", id);
    assert.equal(hero.research.roleAndLaneSources.length, 3, id);
    assert.equal(
      hero.research.competitiveReviewStatus,
      id === "fanny" ? "partial" : "pending",
      id
    );
  }

  assert.deepEqual(heroCatalog.find(entry => entry.id === "freya").lanes.flexible, ["Jungle"]);
  assert.deepEqual(heroCatalog.find(entry => entry.id === "gatotkaca").lanes.flexible, ["EXP Lane"]);
  assert.deepEqual(heroCatalog.find(entry => entry.id === "gusion").lanes.flexible, ["Mid Lane"]);
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
    /app\.post\("\/api\/ai\/draft"[\s\S]*?isValidDraftRequest\(b,roles,isLegacyHeroName,isCatalogHeroId\)/
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
