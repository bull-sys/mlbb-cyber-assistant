import assert from "node:assert/strict";
import test from "node:test";
import { heroProfiles, validateHeroProfiles, HERO_DB_PATCH } from "../server/hero-profiles.js";

test("hero profile database remains structurally valid", () => {
  const result = validateHeroProfiles();
  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 0);
});

test("Helcurt profile contains sourced mechanics and explicit uncertainty", () => {
  const helcurt = heroProfiles.find(hero => hero.id === "helcurt");
  assert.ok(helcurt);
  assert.equal(helcurt.names.en, "Helcurt");
  assert.deepEqual(helcurt.roles, ["Убийца"]);
  assert.deepEqual(helcurt.lanes, ["Лес", "Роум"]);
  assert.ok(helcurt.mechanics.length >= 4);
  assert.ok(helcurt.strengths.length >= 2);
  assert.ok(helcurt.weaknesses.length >= 2);
  assert.ok(helcurt.sources.some(source => source.includes("liquipedia.net")));
  assert.ok(helcurt.sources.some(source => source.includes("mlbb.io")));
  assert.equal(helcurt.confidence, "partial");
  assert.equal(helcurt.patch.version, HERO_DB_PATCH);
  assert.equal(helcurt.patch.reviewedAt, "2026-11-22");
  assert.deepEqual(helcurt.matchups.strongAgainst, []);
  assert.deepEqual(helcurt.matchups.weakAgainst, []);
});

test("Helcurt patch notes keep ranked and professional evidence separate", () => {
  const helcurt = heroProfiles.find(hero => hero.id === "helcurt");
  const notes = helcurt.patch.notes.join(" ");
  assert.match(notes, /рейтинговой статистики/);
  assert.match(notes, /профессиональных игр/);
  assert.match(notes, /VOD/);
});
