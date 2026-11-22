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

test("Ling has a cross-checked Assassin/Jungle profile with explicit uncertainty", () => {
  const ling = heroProfiles.find(hero => hero.id === "ling");
  assert.ok(ling);
  assert.equal(ling.names.en, "Ling");
  assert.equal(ling.names.ru, "Линг");
  assert.deepEqual(ling.roles, ["Убийца"]);
  assert.deepEqual(ling.lanes, ["Лес"]);
  assert.ok(ling.mechanics.length >= 5);
  assert.ok(ling.mechanics.some(note => note.includes("Lightness Points")));
  assert.ok(ling.mechanics.some(note => note.includes("меч")));
  assert.ok(ling.strengths.length >= 3);
  assert.ok(ling.weaknesses.length >= 3);
  assert.ok(ling.sources.some(source => source.includes("mlbbhub.com")));
  assert.ok(ling.sources.some(source => source.includes("mlbb.io")));
  assert.ok(ling.sources.some(source => source.includes("mlbbanalytics.com")));
  assert.equal(ling.confidence, "partial");
  assert.equal(ling.patch.version, HERO_DB_PATCH);
  assert.equal(ling.patch.reviewedAt, "2026-11-22");
  assert.deepEqual(ling.matchups.strongAgainst, []);
  assert.deepEqual(ling.matchups.weakAgainst, []);
  const notes = ling.patch.notes.join(" ");
  assert.match(notes, /Рейтинговая статистика/);
  assert.match(notes, /Профессиональные данные/);
  assert.match(notes, /VOD/);
});

test("Nolan has a cross-checked Assassin/Jungle profile with explicit uncertainty", () => {
  const nolan = heroProfiles.find(hero => hero.id === "nolan");
  assert.ok(nolan);
  assert.equal(nolan.names.en, "Nolan");
  assert.equal(nolan.names.ru, "Нолан");
  assert.deepEqual(nolan.roles, ["Убийца"]);
  assert.deepEqual(nolan.lanes, ["Лес"]);
  assert.ok(nolan.mechanics.length >= 5);
  assert.ok(nolan.mechanics.some(note => note.includes("разлом")));
  assert.ok(nolan.strengths.length >= 3);
  assert.ok(nolan.weaknesses.length >= 3);
  assert.ok(nolan.sources.some(source => source.includes("mlbb.io")));
  assert.ok(nolan.sources.some(source => source.includes("mlbbhub.com")));
  assert.ok(nolan.sources.some(source => source.includes("mlbbdex.com")));
  assert.equal(nolan.confidence, "partial");
  assert.equal(nolan.patch.version, HERO_DB_PATCH);
  assert.equal(nolan.patch.reviewedAt, "2026-11-22");
  assert.deepEqual(nolan.matchups.strongAgainst, []);
  assert.deepEqual(nolan.matchups.weakAgainst, []);
  const notes = nolan.patch.notes.join(" ");
  assert.match(notes, /Рейтинговая статистика/);
  assert.match(notes, /Профессиональная выборка/);
  assert.match(notes, /VOD/);
});
