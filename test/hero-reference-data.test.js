import assert from "node:assert/strict";
import test from "node:test";
import { heroCatalog } from "../server/hero-catalog.js";
import { heroProfiles } from "../server/hero-profiles.js";
import { HERO_REFERENCE_SOURCE, heroReferenceData } from "../server/hero-reference-data.js";
import { HERO_LORE_SOURCE, heroLoreData } from "../server/hero-lore-data.js";
import { getHeroKnowledge } from "../server/mlbbdex-adapter.js";

test("31 previously missing heroes have sourced Russian lore summaries", () => {
  const expectedIds = [
    "mathilda", "melissa", "minsitthar", "moskov", "natalia", "natan", "novaria",
    "aamon", "alice", "angela", "odette", "phoveus", "popol-and-kupa", "ruby",
    "selena", "silvanna", "sora", "uranus", "vale", "valentina", "vexana",
    "wanwan", "x-borg", "yi-sun-shin", "yin", "yu-zhong", "yve", "zetian",
    "zhask", "zhuxin", "zilong"
  ];
  assert.equal(heroLoreData.length, 31);
  assert.deepEqual(heroLoreData.map(item => item.id).sort(), [...expectedIds].sort());
  assert.equal(HERO_LORE_SOURCE.license, "CC BY-SA");
  for (const entry of heroLoreData) {
    assert.ok(entry.summary.length >= 100, entry.id + ": summary is substantive");
    assert.ok(!/TODO|lorem ipsum|placeholder/iu.test(entry.summary), entry.id + ": no placeholder");
  }
});

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

test("verified catalog roles and lanes match the audited reference without duplicates", () => {
  const referenceById = new Map(heroReferenceData.map(hero => [hero.id, hero]));
  for (const hero of heroCatalog) {
    const reference = referenceById.get(hero.id);
    assert.equal(new Set(hero.role.values).size, hero.role.values.length, hero.id + ": unique roles");
    const lanes = [
      ...(hero.lanes.primary ? [hero.lanes.primary] : []),
      ...hero.lanes.flexible
    ];
    assert.equal(new Set(lanes).size, lanes.length, hero.id + ": unique lanes");
    if (hero.role.status === "verified") {
      assert.deepEqual([...hero.role.values].sort(), reference.roles.map(item => item.en).sort(), hero.id + ": verified roles");
    }
    if (hero.lanes.status === "verified") {
      assert.ok(hero.lanes.primary, hero.id + ": verified primary lane");
    }
  }
  assert.deepEqual(
    heroCatalog.filter(hero => hero.lanes.status === "pending_review").map(hero => hero.id),
    ["badang"]
  );
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
    for (const [key, value] of Object.entries(hero.stats)) {
      if (key === "basic_atk_range" && typeof value === "string") {
        assert.ok(value.trim(), hero.id + ": non-empty conditional attack range label");
        continue;
      }
      assert.equal(typeof value, "number", hero.id + ": numeric stat values");
      assert.ok(Number.isFinite(value), hero.id + ": finite stat values");
    }
  }
});

test("offline fallback includes sourced lore for heroes in the local lore dataset", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("offline test"); };
  try {
    const hero = heroCatalog.find(entry => entry.id === "mathilda");
    const result = await getHeroKnowledge(hero);
    assert.equal(result.ok, true);
    assert.equal(result.fallback, true);
    assert.match(result.profile.lore, /Матильда/);
    assert.equal(result.profile.loreSource.license, "CC BY-SA");
  } finally {
    globalThis.fetch = originalFetch;
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
  assert.equal(heroProfiles.length, 102);
  for (const profile of heroProfiles) {
    assert.ok(catalogIds.has(profile.id), "profile without catalogue entry: " + profile.id);
  }
});

test("encyclopedia returns dated local passport data when the live source is unavailable", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("offline test"); };
  try {
    const hero = heroCatalog.find(entry => entry.id === "chang-e");
    const result = await getHeroKnowledge(hero);
    assert.equal(result.ok, true);
    assert.equal(result.fallback, true);
    assert.equal(result.profile.name, "Chang'e");
    assert.equal(result.profile.roles[0], "Маг");
    assert.ok(result.profile.stats.hp1 > 0);
    assert.equal(result.source.license, "CC BY-SA");
    assert.equal(result.updatedAt, "2026-11-20");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
