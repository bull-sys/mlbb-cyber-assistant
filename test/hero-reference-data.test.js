import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { heroCatalog } from "../server/hero-catalog.js";
import { heroProfiles } from "../server/hero-profiles.js";
import { HERO_REFERENCE_SOURCE, heroReferenceData } from "../server/hero-reference-data.js";
import { HERO_LORE_SOURCE, heroLoreData } from "../server/hero-lore-data.js";
import { getHeroKnowledge } from "../server/mlbbdex-adapter.js";
import { russianizeSkillDescription } from "../server/hero-skill-assets.js";

test("Helcurt state keeps the verified Prowler term instead of the mistranslation", () => {
  const value = russianizeSkillDescription("Helcurt remains in the state of Бродяги.", "Helcurt", "Хелкарт");
  assert.equal(value, "Хелкарт remains in the state of Prowler.");
  const moskov = russianizeSkillDescription("Скиталец Бездны", "Moskov", "Москов");
  assert.equal(moskov, "Скиталец Бездны");
});

test("all 133 heroes have sourced Russian lore summaries", () => {
  assert.equal(heroLoreData.length, 133);
  assert.equal(new Set(heroLoreData.map(item => item.id)).size, 133);
  assert.deepEqual(
    heroLoreData.map(item => item.id).sort(),
    heroCatalog.map(item => item.id).sort()
  );
  assert.equal(HERO_LORE_SOURCE.license, "CC BY-SA");
  assert.equal(HERO_LORE_SOURCE.revision, "92f0fe94e4226ab6057db25711c4d65b3ca12130");
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
      if (hero.id === "badang") {
        assert.equal(hero.lanes.primary, null, "Badang: no forced primary lane");
        assert.deepEqual(hero.lanes.flexible, ["EXP Lane", "Roam"], "Badang: verified flexible lanes");
      } else {
        assert.ok(hero.lanes.primary, hero.id + ": verified primary lane");
      }
    }
  }
  assert.deepEqual(
    heroCatalog.filter(hero => hero.lanes.status === "pending_review").map(hero => hero.id),
    []
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

test("offline fallback provides lore for every hero in the catalogue", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("offline test"); };
  try {
    for (const hero of heroCatalog) {
      const result = await getHeroKnowledge(hero);
      assert.equal(result.ok, true, hero.id + ": offline profile");
      assert.equal(result.fallback, true, hero.id + ": fallback flag");
      assert.ok(result.profile.lore?.length >= 100, hero.id + ": offline lore");
      assert.equal(result.profile.loreSource.revision, HERO_LORE_SOURCE.revision, hero.id + ": lore attribution");
    }
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
  assert.equal(heroProfiles.length, 133);
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


test("canonical Russian hero names match across catalog, reference data and detailed profiles", () => {
  const expected = {
    "luo-yi": "Ло Йи",
    kaja: "Кайя",
    claude: "Клауд",
    cici: "Чичи",
    baxia: "Баксий",
    aldous: "Алдос",
    pharsa: "Фаша",
    dyrroth: "Дариус"
  };
  for (const [id, name] of Object.entries(expected)) {
    assert.equal(heroCatalog.find(hero => hero.id === id)?.displayNameRu, name, id + ": catalog name");
    assert.equal(heroReferenceData.find(hero => hero.id === id)?.displayNameRu, name, id + ": reference name");
    assert.equal(heroProfiles.find(profile => profile.id === id)?.names?.ru, name, id + ": profile name");
  }
});


test("X.Borg portrait uses the real xborg.png asset filename", async () => {
  const appSource = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  assert.match(appSource, /"x-borg"\s*:\s*"xborg"/);
});
