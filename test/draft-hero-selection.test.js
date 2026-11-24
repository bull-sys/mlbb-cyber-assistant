import assert from "node:assert/strict";
import test from "node:test";
import {
  getDraftHeroAnalysisProfiles,
  getDraftHeroOptions,
  isCatalogHeroId,
  resolveDraftHeroSelection
} from "../server/draft-hero-selection.js";

test("all 133 catalog heroes are accepted with detailed or baseline analysis", () => {
  const options = getDraftHeroOptions();
  assert.equal(options.length, 133);
  assert.equal(new Set(options.map(hero => hero.id)).size, 133);
  assert.ok(options.every(hero => hero.id && hero.name && hero.nameEn));
  assert.ok(options.every(hero => hero.analysisSupported));
  assert.ok(options.every(hero => ["detailed", "baseline"].includes(hero.analysisDepth)));
  assert.equal(options.find(hero => hero.id === "jawhead").analysisDepth, "detailed");
  assert.equal(options.find(hero => hero.id === "helcurt").analysisDepth, "detailed");
  assert.ok(options.some(hero => hero.analysisDepth === "baseline"));
  const profiles = getDraftHeroAnalysisProfiles();
  assert.equal(profiles.length, 133);
  assert.equal(new Set(profiles.map(profile => profile.id)).size, 133);
  assert.ok(profiles.every(profile => profile.names?.ru && profile.lanes.length > 0));
  const baseline = profiles.find(profile => profile.analysisDepth === "baseline");
  assert.equal(baseline.confidence, "unverified");
  assert.deepEqual(baseline.matchups, { strongAgainst: [], weakAgainst: [] });
  assert.equal(baseline.combat.damage, "unknown");
});

test("legacy draft names remain compatible and resolve to canonical tactical profile names", () => {
  assert.deepEqual(resolveDraftHeroSelection("Хелкарт"), {
    id: "helcurt",
    name: "Хелкарт",
    legacyName: "Хелкарт",
    analysisSupported: true,
    analysisDepth: "detailed"
  });
  const dyrroth = resolveDraftHeroSelection("dyrroth");
  assert.equal(dyrroth.id, "dyrroth");
  assert.equal(dyrroth.legacyName, "Дариус");
  assert.equal(resolveDraftHeroSelection("Диррот").legacyName, "Дариус");
});

test("every catalog hero resolves to an analysis name and explicit data depth", () => {
  const options = getDraftHeroOptions();
  for (const hero of options) {
    const resolved = resolveDraftHeroSelection(hero.id);
    assert.ok(resolved, hero.id);
    assert.equal(resolved.id, hero.id);
    assert.ok(resolved.legacyName, hero.id);
    assert.equal(resolved.analysisSupported, true, hero.id);
    assert.equal(resolved.analysisDepth, hero.analysisDepth, hero.id);
  }
});


test("catalog ID validation rejects unknown values", () => {
  assert.equal(isCatalogHeroId("helcurt"), true);
  assert.equal(isCatalogHeroId("not-a-hero"), false);
  assert.equal(isCatalogHeroId(undefined), false);
  assert.equal(resolveDraftHeroSelection("not-a-hero"), null);
});
