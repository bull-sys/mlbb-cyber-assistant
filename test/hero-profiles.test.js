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
 
test("Fanny has a cross-checked Assassin/Jungle profile with explicit ranked and pro caveats", () => {
  const fanny = heroProfiles.find(hero => hero.id === "fanny");
  assert.ok(fanny);
  assert.equal(fanny.names.en, "Fanny");
  assert.equal(fanny.names.ru, "Фанни");
  assert.deepEqual(fanny.roles, ["Убийца"]);
  assert.deepEqual(fanny.lanes, ["Лес"]);
  assert.ok(fanny.mechanics.length >= 6);
  assert.ok(fanny.mechanics.some(note => note.includes("трос")));
  assert.ok(fanny.mechanics.some(note => note.includes("энерги")));
  assert.ok(fanny.strengths.length >= 3);
  assert.ok(fanny.weaknesses.length >= 3);
  assert.ok(fanny.sources.some(source => source.includes("metammo.com")));
  assert.ok(fanny.sources.some(source => source.includes("mlbbdex.com")));
  assert.ok(fanny.sources.some(source => source.includes("mlbb.io")));
  assert.equal(fanny.confidence, "partial");
  assert.equal(fanny.patch.version, HERO_DB_PATCH);
  assert.equal(fanny.patch.reviewedAt, "2026-11-22");
  assert.deepEqual(fanny.matchups.strongAgainst, []);
  assert.deepEqual(fanny.matchups.weakAgainst, []);
  const notes = fanny.patch.notes.join(" ");
  assert.match(notes, /Рейтинговая статистика/);
  assert.match(notes, /Профессиональные турниры/);
  assert.match(notes, /VOD/);
});

test("Suyou, Jawhead, Karrie, Bruno and Terizla have sourced partial tactical profiles", () => {
  const expected = [
    ["suyou", "Су Ё", "https://liquipedia.net/mobilelegends/Suyou"],
    ["jawhead", "Кусака", "https://liquipedia.net/mobilelegends/Jawhead"],
    ["karrie", "Кэрри", "https://liquipedia.net/mobilelegends/Karrie"],
    ["bruno", "Бруно", "https://mlbb.tools/patch-notes/2.2.16"],
    ["terizla", "Теризла", "https://liquipedia.net/mobilelegends/Terizla"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(entry => entry.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 3, id + " mechanics");
    assert.ok(hero.strengths.length >= 2, id + " strengths");
    assert.ok(hero.weaknesses.length >= 2, id + " weaknesses");
    assert.ok(hero.sources.includes(source), id + " source");
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
  }
});

test("Masha, Marcel, Argus, Khufra and Diggie have sourced partial tactical profiles", () => {
  const expected = [
    ["masha", "Маша", "https://www.youtube.com/watch?v=glz0ubRP59g"],
    ["marcel", "Марсель", "https://www.mobilelegends.com/en/hero/28"],
    ["argus", "Аргус", "https://liquipedia.net/mobilelegends/Argus"],
    ["khufra", "Хуфра", "https://liquipedia.net/mobilelegends/Khufra"],
    ["diggie", "Дигги", "https://mlbb-knowledge.vercel.app/heroes/48"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(entry => entry.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4, id + " mechanics");
    assert.ok(hero.strengths.length >= 2, id + " strengths");
    assert.ok(hero.weaknesses.length >= 2, id + " weaknesses");
    assert.ok(hero.sources.includes(source), id + " source");
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
  }
});


test("Sun, Belerick, Hanabi, Xavier and Obsidia have sourced partial tactical profiles", () => {
  const expected = [
    ["sun", "Сан", "https://mlbb-knowledge.vercel.app/heroes/27"],
    ["belerick", "Белерик", "https://mlbb-knowledge.vercel.app/heroes/70"],
    ["hanabi", "Ханаби", "https://www.mlbbguides.com/heroes/hanabi/skills/"],
    ["xavier", "Ксавьер", "https://mlbb.tools/heroes/xavier"],
    ["obsidia", "Обсидия", "https://www.mobilelegends.com/en/hero/15"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(entry => entry.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4, id + " mechanics");
    assert.ok(hero.strengths.length >= 2, id + " strengths");
    assert.ok(hero.weaknesses.length >= 2, id + " weaknesses");
    assert.ok(hero.sources.includes(source), id + " source");
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
  }
});


test("Aldous, Floryn, Estes, Minotaur and Lunox have sourced partial tactical profiles", () => {
 const expected=[["aldous","Олдос","https://mlbb-knowledge.vercel.app/heroes/64"],["floryn","Флорин","https://mlbb-knowledge.vercel.app/heroes/112"],["estes","Эстес","https://mlbb.io/en/hero/estes"],["minotaur","Минотавр","https://mlbbhub.com/heroes/minotaur"],["lunox","Люнокс","https://liquipedia.net/mobilelegends/Lunox"]];
 for(const [id,name,source] of expected){const h=heroProfiles.find(x=>x.id===id);assert.ok(h,id);assert.equal(h.names.ru,name);assert.ok(h.mechanics.length>=4);assert.ok(h.strengths.length>=2);assert.ok(h.weaknesses.length>=2);assert.ok(h.sources.includes(source));assert.equal(h.confidence,"partial");assert.equal(h.patch.version,HERO_DB_PATCH);assert.equal(h.patch.reviewedAt,"2026-11-22");}
});


test("Cyclops, Julian, Tigreal, Chou and Dyrroth have sourced partial tactical profiles", () => {
 const expected=[["cyclops","Циклоп","https://liquipedia.net/mobilelegends/Cyclops"],["julian","Джулиан","https://www.mlbbguides.com/heroes/julian/passive-skill/"],["tigreal","Тигрил","https://liquipedia.net/mobilelegends/Tigreal"],["chou","Чу","https://mlbb.io/en/hero/chou"],["dyrroth","Диррот","https://liquipedia.net/mobilelegends/Dyrroth"]];
 for(const [id,name,source] of expected){const h=heroProfiles.find(x=>x.id===id);assert.ok(h,id);assert.equal(h.names.ru,name);assert.ok(h.mechanics.length>=4);assert.ok(h.strengths.length>=2);assert.ok(h.weaknesses.length>=2);assert.ok(h.sources.includes(source));assert.equal(h.confidence,"partial");assert.equal(h.patch.version,HERO_DB_PATCH);assert.equal(h.patch.reviewedAt,"2026-11-22");}
});


test("Alpha, Freya, Edith, Barats and Hilda have sourced partial tactical profiles",()=>{const expected=[["alpha","Альфа","https://mlbb.io/en/hero/alpha"],["freya","Фрея","https://mlbb-knowledge.vercel.app/heroes/22"],["edith","Эдит","https://liquipedia.net/mobilelegends/Edith"],["barats","Баратс","https://liquipedia.net/mobilelegends/Barats"],["hilda","Хильда","https://liquipedia.net/mobilelegends/Hilda"]];for(const [id,name,source] of expected){const h=heroProfiles.find(x=>x.id===id);assert.ok(h,id);assert.equal(h.names.ru,name);assert.ok(h.mechanics.length>=4);assert.ok(h.strengths.length>=2);assert.ok(h.weaknesses.length>=2);assert.ok(h.sources.includes(source));assert.equal(h.confidence,"partial");assert.equal(h.patch.version,HERO_DB_PATCH);assert.equal(h.patch.reviewedAt,"2026-11-22");}});


test("Kaja, Valir, Paquito, Aulus and Rafaela have sourced partial tactical profiles", () => {
  const expected = [
    ["kaja", "Каджа", "https://liquipedia.net/mobilelegends/Kaja"],
    ["valir", "Валир", "https://liquipedia.net/mobilelegends/Valir"],
    ["paquito", "Пакито", "https://liquipedia.net/mobilelegends/Paquito"],
    ["aulus", "Аулус", "https://mlbb-knowledge.vercel.app/heroes/108"],
    ["rafaela", "Рафаэль", "https://mobilelegends.com/hero/detail?heroid=14"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(item => item.id === id);
    assert.ok(hero, id);
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4);
    assert.ok(hero.strengths.length >= 2);
    assert.ok(hero.weaknesses.length >= 2);
    assert.ok(hero.sources.includes(source));
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
  }
  const rafaela = heroProfiles.find(item => item.id === "rafaela");
  assert.ok(rafaela.mechanics[0].includes("воскресить союзника"));
  const kaja = heroProfiles.find(item => item.id === "kaja");
  assert.ok(kaja.mechanics.some(note => note.includes("массовый контроль")));
  const valir = heroProfiles.find(item => item.id === "valir");
  assert.ok(valir.patch.notes.some(note => note.includes("Brawl-модификатор")));
});
