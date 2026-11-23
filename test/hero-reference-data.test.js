import assert from "node:assert/strict";
import test from "node:test";
import { heroCatalog } from "../server/hero-catalog.js";
import { heroProfiles } from "../server/hero-profiles.js";
import { HERO_REFERENCE_SOURCE, heroReferenceData } from "../server/hero-reference-data.js";

test("neutral reference dataset covers the full 133-hero working catalogue", () => {
  assert.equal(heroCatalog.length, 133);
  assert.equal(heroReferenceData.length, 133);
  assert.equal(new Set(heroCatalog.map(hero => hero.id)).size, 133);
  assert.equal(new Set(heroReferenceData.map(hero => hero.id)).size, 133);

  const referenceIds = new Set(heroReferenceData.map(hero => hero.id));
  for (const hero of heroCatalog) {
    assert.ok(referenceIds.has(hero.id), "missing reference data for " + hero.id);
  }
});

test("every hero reference has traceable identity, classification and base stats", () => {
  for (const hero of heroReferenceData) {
    assert.ok(hero.nameEn, hero.id + ": English name");
    assert.ok(hero.displayNameRu, hero.id + ": Russian display name");
    assert.ok(hero.titleEn, hero.id + ": title");
    assert.ok(hero.roles.length, hero.id + ": roles");
    assert.ok(hero.lanes.length, hero.id + ": lanes");
    assert.ok(hero.stats.hp1 !== undefined, hero.id + ": level-one HP");
    assert.ok(hero.stats.hp15 !== undefined, hero.id + ": level-fifteen HP");
    assert.ok(hero.stats.physical_def1 !== undefined, hero.id + ": physical defense");
    assert.ok(hero.stats.magic_def1 !== undefined, hero.id + ": magic defense");
    assert.ok(hero.stats.movement_spd !== undefined, hero.id + ": movement speed");
    for (const value of Object.values(hero.stats)) {
      assert.equal(typeof value, "number", hero.id + ": numeric stat values");
      assert.ok(Number.isFinite(value), hero.id + ": finite stat values");
    }
  }
});

test("reference dataset includes attribution and a dated source snapshot", () => {
  assert.equal(HERO_REFERENCE_SOURCE.name, "MLBBDex / Mobile Legends Wiki");
  assert.equal(HERO_REFERENCE_SOURCE.license, "CC BY-SA");
  assert.equal(HERO_REFERENCE_SOURCE.updatedAt, "2026-11-20");
  assert.match(HERO_REFERENCE_SOURCE.url, /^https:\/\/mlbbdex\.com\//);
});

test("legacy detailed profiles remain linked to known catalogue entries", () => {
  const catalogIds = new Set(heroCatalog.map(hero => hero.id));
  assert.equal(heroProfiles.length, 96);
  for (const profile of heroProfiles) {
    assert.ok(catalogIds.has(profile.id), "profile without catalogue entry: " + profile.id);
  }
});
