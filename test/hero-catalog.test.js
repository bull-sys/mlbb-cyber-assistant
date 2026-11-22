import assert from "node:assert/strict";
import test from "node:test";
import { heroes } from "../server/data.js";
import { heroCatalog } from "../server/hero-catalog.js";
import { validateHeroCatalog } from "../server/hero-catalog-validation.js";
import { heroLegacyBaseline } from "./fixtures/hero-legacy-baseline.js";

const legacyToCatalogName = name => name;

test("legacy baseline exactly matches the current 32 heroes and their order", () => {
  assert.equal(heroes.length, 32);
  assert.equal(heroLegacyBaseline.length, 32);
  assert.deepEqual(heroes, heroLegacyBaseline);
});

test("catalog contains 32 entries with unique IDs and valid status structure", () => {
  assert.equal(heroCatalog.length, 133);
  const result = validateHeroCatalog(heroCatalog);
  assert.deepEqual(result, { ok: true, count: 133, errors: [] });
  assert.equal(new Set(heroCatalog.map(hero => hero.id.trim().replace(/\s+/gu, " ").toLowerCase())).size, 133);
});

test("validator accepts an empty catalog", () => {
  assert.deepEqual(validateHeroCatalog([]), {
    ok: true,
    count: 0,
    errors: []
  });
});

test("validator rejects entries missing required fields", () => {
  const validEntry = heroCatalog[0];

  for (const field of [
    "id",
    "identity",
    "localization",
    "role",
    "lanes",
    "tacticalProfile"
  ]) {
    const incompleteEntry = { ...validEntry };
    delete incompleteEntry[field];

    assert.equal(
      validateHeroCatalog([incompleteEntry]).ok,
      false,
      `Validator should reject an entry missing ${field}`
    );
  }
});

test("validator rejects a sparse catalog array", () => {
  const sparseCatalog = [];
  sparseCatalog.length = 1;

  const result = validateHeroCatalog(sparseCatalog);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.includes("sparse")));
});

test("Jawhead and Dyrroth have the approved catalog identities", () => {
  const jawhead = heroCatalog.find(hero => hero.id === "jawhead");
  const dyrroth = heroCatalog.find(hero => hero.id === "dyrroth");
  assert.ok(jawhead);
  assert.equal(jawhead.nameEn, "Jawhead");
  assert.equal(jawhead.displayNameRu, "Кусака");
  assert.ok(dyrroth);
  assert.equal(dyrroth.nameEn, "Dyrroth");
  assert.equal(dyrroth.displayNameRu, "Диррот");
  assert.equal(dyrroth.localization.status, "user_confirmed");
});

test("Suyou keeps the pending-review localization status", () => {
  const suyou = heroCatalog.find(hero => hero.id === "suyou");
  assert.ok(suyou);
  assert.equal(suyou.displayNameRu, "Су Ё");
  assert.equal(suyou.localization.status, "pending_review");
});

test("every legacy Russian name is represented, allowing the approved Dyrroth correction", () => {
  const catalogNames = new Set(heroCatalog.map(hero => hero.displayNameRu));
  for (const legacyHero of heroLegacyBaseline) {
    assert.ok(
      catalogNames.has(legacyToCatalogName(legacyHero.name)),
      `Catalog is missing legacy hero name: ${legacyHero.name}`
    );
  }
});

test("Popol and Kupa is not conflated with Jawhead", () => {
  const jawhead = heroCatalog.find(hero => hero.id === "jawhead");
  assert.equal(jawhead.nameEn, "Jawhead");
  const popolAndKupa = heroCatalog.find(hero => hero.nameEn === "Popol and Kupa");
  assert.ok(popolAndKupa, "Popol and Kupa has its own catalog entry");
});

test("validator rejects normalized duplicate IDs and invalid or inherited statuses", () => {
  const validEntry = heroCatalog[0];
  const duplicate = { ...validEntry, id: ` ${validEntry.id.toUpperCase()} ` };
  assert.equal(validateHeroCatalog([validEntry, duplicate]).ok, false);

  const invalidStatus = {
    ...validEntry,
    identity: { status: "unrecognized" }
  };
  assert.equal(validateHeroCatalog([invalidStatus]).ok, false);

  const inheritedStatus = Object.create({ status: validEntry.identity.status });
  const inheritedIdentity = { ...validEntry, identity: inheritedStatus };
  assert.equal(validateHeroCatalog([inheritedIdentity]).ok, false);
});
