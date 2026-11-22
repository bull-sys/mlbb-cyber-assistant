import assert from "node:assert/strict";
import test from "node:test";
import { heroes } from "../server/data.js";
import { heroCatalog } from "../server/hero-catalog.js";
import { validateHeroCatalog } from "../server/hero-catalog-validation.js";
import { heroLegacyBaseline } from "./fixtures/hero-legacy-baseline.js";

const legacyToCatalogName = name => name === "Эудора" ? "Эйдора" : name;

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

test("Helcurt has cross-checked role/lane data and a deliberately partial tactical profile", () => {
  const helcurt = heroCatalog.find(hero => hero.id === "helcurt");
  assert.ok(helcurt);
  assert.deepEqual(helcurt.role.values, ["Assassin"]);
  assert.equal(helcurt.role.status, "verified");
  assert.equal(helcurt.lanes.primary, "Jungle");
  assert.deepEqual(helcurt.lanes.flexible, ["Roam"]);
  assert.equal(helcurt.lanes.status, "verified");
  assert.equal(helcurt.tacticalProfile.status, "partial");
  assert.equal(helcurt.research.competitiveReviewStatus, "pending");
});

test("Suyou keeps the pending-review localization status", () => {
  const suyou = heroCatalog.find(hero => hero.id === "suyou");
  assert.ok(suyou);
  assert.equal(suyou.displayNameRu, "Су Ё");
  assert.equal(suyou.localization.status, "pending_review");
});

test("every legacy Russian name is represented, allowing approved localization corrections", () => {
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

test("Hanzo has cross-checked Assassin/Jungle data and a partial tactical profile", () => {
  const hanzo = heroCatalog.find(hero => hero.id === "hanzo");
  assert.ok(hanzo);
  assert.deepEqual(hanzo.role.values, ["Assassin"]);
  assert.equal(hanzo.role.status, "verified");
  assert.equal(hanzo.lanes.primary, "Jungle");
  assert.deepEqual(hanzo.lanes.flexible, []);
  assert.equal(hanzo.lanes.status, "verified");
  assert.equal(hanzo.tacticalProfile.status, "partial");
  assert.equal(hanzo.research.competitiveReviewStatus, "partial");
  assert.ok(hanzo.research.mechanicsSources.length >= 3);
});

test("Roger has verified Fighter/Marksman identity and Jungle lane with partial tactics", () => {
  const roger = heroCatalog.find(hero => hero.id === "roger");
  assert.ok(roger);
  assert.deepEqual(roger.role.values, ["Fighter", "Marksman"]);
  assert.equal(roger.role.status, "verified");
  assert.equal(roger.lanes.primary, "Jungle");
  assert.deepEqual(roger.lanes.flexible, []);
  assert.equal(roger.lanes.status, "verified");
  assert.equal(roger.tacticalProfile.status, "partial");
  assert.equal(roger.research.competitiveReviewStatus, "partial");
  assert.ok(roger.research.mechanicsSources.length >= 3);
  assert.ok(roger.research.rankedMetaSources.length >= 3);
});

test("Ling has verified Assassin/Jungle identity and partial tactical review", () => {
  const ling = heroCatalog.find(hero => hero.id === "ling");
  assert.ok(ling);
  assert.deepEqual(ling.role.values, ["Assassin"]);
  assert.equal(ling.role.status, "verified");
  assert.equal(ling.lanes.primary, "Jungle");
  assert.deepEqual(ling.lanes.flexible, []);
  assert.equal(ling.lanes.status, "verified");
  assert.equal(ling.tacticalProfile.status, "partial");
  assert.equal(ling.research.competitiveReviewStatus, "partial");
  assert.ok(ling.research.mechanicsSources.length >= 3);
  assert.ok(ling.research.rankedMetaSources.length >= 3);
});

test("Nolan has verified Assassin/Jungle identity and partial tactical review", () => {
  const nolan = heroCatalog.find(hero => hero.id === "nolan");
  assert.ok(nolan);
  assert.deepEqual(nolan.role.values, ["Assassin"]);
  assert.equal(nolan.role.status, "verified");
  assert.equal(nolan.lanes.primary, "Jungle");
  assert.deepEqual(nolan.lanes.flexible, []);
  assert.equal(nolan.lanes.status, "verified");
  assert.equal(nolan.tacticalProfile.status, "partial");
  assert.equal(nolan.research.competitiveReviewStatus, "partial");
  assert.ok(nolan.research.mechanicsSources.length >= 3);
  assert.ok(nolan.research.rankedMetaSources.length >= 3);
});

test("Fanny has verified Assassin/Jungle identity and partial tactical review", () => {
  const fanny = heroCatalog.find(hero => hero.id === "fanny");
  assert.ok(fanny);
  assert.deepEqual(fanny.role.values, ["Assassin"]);
  assert.equal(fanny.role.status, "verified");
  assert.equal(fanny.lanes.primary, "Jungle");
  assert.deepEqual(fanny.lanes.flexible, []);
  assert.equal(fanny.lanes.status, "verified");
  assert.equal(fanny.tacticalProfile.status, "partial");
  assert.equal(fanny.research.competitiveReviewStatus, "partial");
  assert.ok(fanny.research.mechanicsSources.length >= 3);
  assert.ok(fanny.research.rankedMetaSources.length >= 2);
});
