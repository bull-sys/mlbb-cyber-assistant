import assert from "node:assert/strict";
import test from "node:test";
import {
  getDraftHeroOptions,
  isCatalogHeroId,
  resolveDraftHeroSelection
} from "../server/draft-hero-selection.js";

test("draft options expose the complete catalog with explicit analysis readiness", () => {
  const options = getDraftHeroOptions();
  assert.equal(options.length, 133);
  assert.equal(new Set(options.map(hero => hero.id)).size, 133);
  assert.ok(options.every(hero => hero.id && hero.name && hero.nameEn));
  assert.equal(options.find(hero => hero.id === "jawhead").analysisSupported, true);
  assert.equal(options.find(hero => hero.id === "dyrroth").analysisSupported, true);
  assert.equal(options.find(hero => hero.id === "helcurt").analysisSupported, false);
});

test("legacy draft names remain fully compatible", () => {
  assert.deepEqual(resolveDraftHeroSelection("Хелкарт"), {
    id: null,
    name: "Хелкарт",
    legacyName: "Хелкарт",
    analysisSupported: true
  });
});

test("only explicitly verified catalog mappings resolve to legacy analysis names", () => {
  assert.deepEqual(resolveDraftHeroSelection("jawhead"), {
    id: "jawhead",
    name: "Кусака",
    legacyName: "Кусака",
    analysisSupported: true
  });
  assert.deepEqual(resolveDraftHeroSelection("dyrroth"), {
    id: "dyrroth",
    name: "Дариус",
    legacyName: "Диррот",
    analysisSupported: true
  });
  assert.equal(resolveDraftHeroSelection("helcurt").analysisSupported, false);
  assert.equal(resolveDraftHeroSelection("helcurt").legacyName, null);
});

test("catalog ID validation rejects unknown values", () => {
  assert.equal(isCatalogHeroId("helcurt"), true);
  assert.equal(isCatalogHeroId("not-a-hero"), false);
  assert.equal(isCatalogHeroId(undefined), false);
  assert.equal(resolveDraftHeroSelection("not-a-hero"), null);
});
