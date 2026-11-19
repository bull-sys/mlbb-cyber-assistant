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
  assert.deepEqual(fields.heroCatalogLegacyMappings, [
    { id: "jawhead", legacyName: "Кусака" },
    { id: "dyrroth", legacyName: "Диррот" }
  ]);
  assert.deepEqual(heroes, heroLegacyBaseline);
  assert.equal(Object.hasOwn(fields, "heroes"), false);
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

test("browser OCR continues to read the legacy name field", async () => {
  const appSource = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  assert.match(appSource, /data\.heroes\.map\(h\s*=>\s*h\.name\)/);
});
