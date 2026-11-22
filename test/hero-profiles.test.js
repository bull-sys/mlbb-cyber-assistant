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

test("Hanzo profile records the current reworked mechanics and separates evidence types", () => {
  const hanzo = heroProfiles.find(hero => hero.id === "hanzo");
  assert.ok(hanzo);
  assert.equal(hanzo.names.en, "Hanzo");
  assert.deepEqual(hanzo.roles, ["Убийца"]);
  assert.deepEqual(hanzo.lanes, ["Лес"]);
  assert.ok(hanzo.mechanics.length >= 5);
  assert.ok(hanzo.mechanics.some(note => note.includes("Ханэкагэ")));
  assert.ok(hanzo.mechanics.some(note => note.includes("энерг")));
  assert.ok(hanzo.strengths.length >= 3);
  assert.ok(hanzo.weaknesses.length >= 3);
  assert.ok(hanzo.sources.some(source => source.includes("metammo.com")));
  assert.ok(hanzo.sources.some(source => source.includes("mlbb.io")));
  assert.ok(hanzo.sources.some(source => source.includes("mlbbhub.com")));
  assert.equal(hanzo.confidence, "partial");
  assert.equal(hanzo.patch.version, HERO_DB_PATCH);
  assert.equal(hanzo.patch.reviewedAt, "2026-11-22");
  assert.deepEqual(hanzo.matchups.strongAgainst, []);
  assert.deepEqual(hanzo.matchups.weakAgainst, []);
  const notes = hanzo.patch.notes.join(" ");
  assert.match(notes, /Рейтинговая статистика/);
  assert.match(notes, /Профессиональные данные/);
  assert.match(notes, /VOD/);
});

test("Roger has a cross-checked Fighter/Marksman Jungle profile with explicit uncertainty", () => {
  const roger = heroProfiles.find(hero => hero.id === "roger");
  assert.ok(roger);
  assert.equal(roger.names.en, "Roger");
  assert.equal(roger.names.ru, "Роджер");
  assert.deepEqual(roger.roles, ["Боец", "Стрелок"]);
  assert.deepEqual(roger.lanes, ["Лес"]);
  assert.ok(roger.mechanics.length >= 5);
  assert.ok(roger.strengths.length >= 3);
  assert.ok(roger.weaknesses.length >= 3);
  assert.ok(roger.sources.some(source => source.includes("liquipedia.net")));
  assert.ok(roger.sources.some(source => source.includes("mlbb.io")));
  assert.ok(roger.sources.some(source => source.includes("mlbbhub.com")));
  assert.equal(roger.confidence, "partial");
  assert.equal(roger.patch.version, HERO_DB_PATCH);
  assert.equal(roger.patch.reviewedAt, "2026-11-22");
  assert.deepEqual(roger.matchups.strongAgainst, []);
  assert.deepEqual(roger.matchups.weakAgainst, []);
  const notes = roger.patch.notes.join(" ");
  assert.match(notes, /Рейтинговая статистика/);
  assert.match(notes, /Профессиональные данные/);
  assert.match(notes, /VOD/);
});
