import assert from "node:assert/strict";
import test from "node:test";
import { heroProfiles, validateHeroProfiles, HERO_DB_PATCH } from "../server/hero-profiles.js";
import { heroCatalog } from "../server/hero-catalog.js";

const MATCHUP_REVIEWED_IDS = new Set(["helcurt", "hanzo", "roger", "ling", "badang"]);

test("hero profile database remains structurally valid", () => {
  const result = validateHeroProfiles();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
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
  assert.ok(helcurt.matchups.strongAgainst.length > 0);
  assert.ok(helcurt.matchups.weakAgainst.length > 0);
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
  assert.ok(hanzo.matchups.strongAgainst.length > 0);
  assert.ok(hanzo.matchups.weakAgainst.length > 0);
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
  assert.ok(roger.matchups.strongAgainst.length > 0);
  assert.ok(roger.matchups.weakAgainst.length > 0);
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
  assert.ok(ling.matchups.strongAgainst.length > 0);
  assert.ok(ling.matchups.weakAgainst.length > 0);
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


test("Atlas, Kagura, Layla, Miya and Granger have sourced partial tactical profiles", () => {
  const expected = [
    ["atlas", "Атлас", "https://liquipedia.net/mobilelegends/Atlas"],
    ["kagura", "Кагура", "https://liquipedia.net/mobilelegends/Kagura"],
    ["layla", "Лейла", "https://mlbb-knowledge.vercel.app/heroes/18"],
    ["miya", "Мия", "https://mlbb-knowledge.vercel.app/heroes/1"],
    ["granger", "Грейнджер", "https://liquipedia.net/mobilelegends/Granger"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(item => item.id === id);
    assert.ok(hero, id);
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4);
    assert.ok(hero.strengths.length >= 3);
    assert.ok(hero.weaknesses.length >= 3);
    assert.ok(hero.sources.includes(source));
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
  }
  const atlas = heroProfiles.find(item => item.id === "atlas");
  assert.ok(atlas.patch.notes.some(note => note.includes("66 выборов")));
  const kagura = heroProfiles.find(item => item.id === "kagura");
  assert.ok(kagura.mechanics.some(note => note.includes("зонт")));
  const granger = heroProfiles.find(item => item.id === "granger");
  assert.ok(granger.mechanics.some(note => note.includes("энерг")));
});


test("Lukas, Thamuz, Eudora, Pharsa and Nana have sourced partial tactical profiles", () => {
  const expected = [
    ["lukas", "Лукас", "https://mlbb.tools/heroes/lukas"],
    ["thamuz", "Тамуз", "https://liquipedia.net/mobilelegends/Thamuz"],
    ["eudora", "Эйдора", "https://mobilelegends.com/hero/detail?heroid=15"],
    ["pharsa", "Фарса", "https://mlbb.io/en/hero/pharsa"],
    ["nana", "Нана", "https://liquipedia.net/mobilelegends/Nana"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(item => item.id === id);
    assert.ok(hero, id);
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4);
    assert.ok(hero.strengths.length >= 3);
    assert.ok(hero.weaknesses.length >= 3);
    assert.ok(hero.sources.includes(source));
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
  }
  const lukas = heroProfiles.find(item => item.id === "lukas");
  assert.ok(lukas.mechanics.some(note => note.includes("Resolve")));
  const eudora = heroProfiles.find(item => item.id === "eudora");
  assert.ok(eudora.mechanics.some(note => note.includes("Сверхпроводник")));
  const nana = heroProfiles.find(item => item.id === "nana");
  assert.ok(nana.mechanics.some(note => note.includes("Молина")));
});


test("Franco, Akai, Alucard, Arlott and Aurora have sourced partial tactical profiles",()=>{const expected=[["franco","Франко","https://liquipedia.net/mobilelegends/Franco"],["akai","Акай","https://liquipedia.net/mobilelegends/Akai"],["alucard","Алукард","https://liquipedia.net/mobilelegends/Alucard"],["arlott","Арлотт","https://liquipedia.net/mobilelegends/Arlott"],["aurora","Аврора","https://liquipedia.net/mobilelegends/Aurora"]];for(const [id,name,source] of expected){const h=heroProfiles.find(x=>x.id===id);assert.ok(h,id);assert.equal(h.names.ru,name);assert.ok(h.mechanics.length>=4);assert.ok(h.strengths.length>=3);assert.ok(h.weaknesses.length>=3);assert.ok(h.sources.includes(source));assert.equal(h.confidence,"partial");assert.equal(h.patch.version,HERO_DB_PATCH);assert.equal(h.patch.reviewedAt,"2026-11-22");if(id!=="badang"){assert.deepEqual(h.matchups.strongAgainst,[]);assert.deepEqual(h.matchups.weakAgainst,[]);}}});


test("Badang, Balmond, Bane, Baxia and Beatrix have sourced partial tactical profiles",()=>{const expected=[["badang","Баданг","https://liquipedia.net/mobilelegends/Badang"],["balmond","Бальмонд","https://liquipedia.net/mobilelegends/Balmond"],["bane","Бейн","https://liquipedia.net/mobilelegends/Bane"],["baxia","Баксия","https://liquipedia.net/mobilelegends/Baxia"],["beatrix","Беатрис","https://liquipedia.net/mobilelegends/Beatrix"]];for(const [id,name,source] of expected){const h=heroProfiles.find(x=>x.id===id);assert.ok(h,id);assert.equal(h.names.ru,name);assert.ok(h.mechanics.length>=4);assert.ok(h.strengths.length>=3);assert.ok(h.weaknesses.length>=3);assert.ok(h.sources.includes(source));assert.equal(h.confidence,"partial");assert.equal(h.patch.version,HERO_DB_PATCH);assert.equal(h.patch.reviewedAt,"2026-11-22");assert.deepEqual(h.matchups.strongAgainst,[]);assert.deepEqual(h.matchups.weakAgainst,[]);}});


test("Benedetta, Brody, Carmilla, Cecilion and Chang'e have sourced partial tactical profiles", () => {
  const expected = [
    ["benedetta", "Бенедетта", "https://liquipedia.net/mobilelegends/Benedetta"],
    ["brody", "Броуди", "https://liquipedia.net/mobilelegends/Brody"],
    ["carmilla", "Кармилла", "https://mlbb-knowledge.vercel.app/heroes/92"],
    ["cecilion", "Сесилион", "https://liquipedia.net/mobilelegends/Cecilion"],
    ["chang-e", "Чан’Э", "https://liquipedia.net/mobilelegends/Chang%27e"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(item => item.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4, id + " mechanics");
    assert.ok(hero.strengths.length >= 2, id + " strengths");
    assert.ok(hero.weaknesses.length >= 2, id + " weaknesses");
    assert.ok(hero.sources.includes(source), id + " source");
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
  }
});


test("Russian hero labels use the confirmed in-game spellings", () => {
  const expected = [
    ["brody", "Броуди", "Броди"],
    ["cecilion", "Сесилион", "Цицилион"],
    ["jawhead", "Кусака", null]
  ];
  for (const [id, ru, legacyAlias] of expected) {
    const hero = heroProfiles.find(item => item.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, ru);
    if (legacyAlias) assert.ok(hero.names.aliases.includes(legacyAlias));
  }
});


test("Chip, Cici, Claude, Clint and Esmeralda have sourced partial tactical profiles", () => {
  const expected = [
    ["chip", "Чип", "https://mlbb-knowledge.vercel.app/heroes/124"],
    ["cici", "Сиси", "https://mlbb-knowledge.vercel.app/heroes/123"],
    ["claude", "Клод", "https://mlbb-knowledge.vercel.app/heroes/65"],
    ["clint", "Клинт", "https://www.mlbbanalytics.com/heroes?hero=Clint"],
    ["esmeralda", "Эсмеральда", "https://mlbb-knowledge.vercel.app/heroes/81"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(item => item.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4, id + " mechanics");
    assert.ok(hero.strengths.length >= 3, id + " strengths");
    assert.ok(hero.weaknesses.length >= 3, id + " weaknesses");
    assert.ok(hero.sources.includes(source), id + " source");
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
  }
  const chip = heroProfiles.find(item => item.id === "chip");
  assert.ok(chip.mechanics.some(note => note.includes("портал")));
  assert.ok(chip.mechanics.some(note => note.includes("маяк")));
  const cici = heroProfiles.find(item => item.id === "cici");
  assert.ok(cici.mechanics.some(note => note.includes("Йо-йо")));
  const claude = heroProfiles.find(item => item.id === "claude");
  assert.ok(claude.mechanics.some(note => note.includes("Декстера")));
  const clint = heroProfiles.find(item => item.id === "clint");
  assert.ok(clint.mechanics.some(note => note.includes("Двойной выстрел")));
  const esmeralda = heroProfiles.find(item => item.id === "esmeralda");
  assert.ok(esmeralda.mechanics.some(note => note.includes("игнорирует щиты")));
});


test("Faramis, Fredrinn, Gatotkaca, Gloo and Gord have sourced partial tactical profiles", () => {
  const expected = [
    ["faramis", "Фарамис", "https://mlbb-knowledge.vercel.app/heroes/76"],
    ["fredrinn", "Фредрин", "https://mlbb-knowledge.vercel.app/heroes/117"],
    ["gatotkaca", "Гатоткача", "https://mlbb-knowledge.vercel.app/heroes/41"],
    ["gloo", "Глу", "https://mlbb-knowledge.vercel.app/heroes/104"],
    ["gord", "Горд", "https://mlbb.io/en/hero/gord"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(item => item.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4, id + " mechanics");
    assert.ok(hero.strengths.length >= 3, id + " strengths");
    assert.ok(hero.weaknesses.length >= 3, id + " weaknesses");
    assert.ok(hero.sources.includes(source), id + " source");
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
  }
  const gloo = heroProfiles.find(item => item.id === "gloo");
  assert.ok(gloo.patch.notes.some(note => note.includes("2.2.23")));
  const fredrinn = heroProfiles.find(item => item.id === "fredrinn");
  assert.ok(fredrinn.mechanics.some(note => note.includes("Кристальной энергии")));
  const faramis = heroProfiles.find(item => item.id === "faramis");
  assert.ok(faramis.mechanics.some(note => note.includes("Царство Бездны")));
});


test("Grock, Guinevere, Gusion, Harith and Harley have sourced partial tactical profiles", () => {
  const expected = [
    ["grock", "Грок", "https://mlbb-knowledge.vercel.app/heroes/44"],
    ["guinevere", "Гвиневра", "https://mlbb-knowledge.vercel.app/heroes/80"],
    ["gusion", "Госсен", "https://mlbb-knowledge.vercel.app/heroes/56"],
    ["harith", "Харит", "https://mlbb-knowledge.vercel.app/heroes/73"],
    ["harley", "Харли", "https://mlbb-knowledge.vercel.app/heroes/42"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(item => item.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4, id + " mechanics");
    assert.ok(hero.strengths.length >= 3, id + " strengths");
    assert.ok(hero.weaknesses.length >= 3, id + " weaknesses");
    assert.ok(hero.sources.includes(source), id + " source");
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
  }
  const grock = heroProfiles.find(item => item.id === "grock");
  assert.ok(grock.mechanics.some(note => note.includes("препятств")));
  const guinevere = heroProfiles.find(item => item.id === "guinevere");
  assert.ok(guinevere.mechanics.some(note => note.includes("три метки")));
  const gusion = heroProfiles.find(item => item.id === "gusion");
  assert.ok(gusion.weaknesses.some(note => note.includes("маны")));
  const harith = heroProfiles.find(item => item.id === "harith");
  assert.ok(harith.mechanics.some(note => note.includes("разлом")));
  const harley = heroProfiles.find(item => item.id === "harley");
  assert.ok(harley.mechanics.some(note => note.includes("шляпу")));
});


test("Hayabusa, Hylos, Irithel, Ixia and Johnson have sourced partial tactical profiles", () => {
  const expected = [
    ["hayabusa", "Хаябуса", "https://mlbb-knowledge.vercel.app/heroes/21"],
    ["hylos", "Хилос", "https://mlbb-knowledge.vercel.app/heroes/49"],
    ["irithel", "Иритэль", "https://mlbb-knowledge.vercel.app/heroes/43"],
    ["ixia", "Иксия", "https://mlbbhub.com/ru/heroes/ixia"],
    ["johnson", "Джонсон", "https://mlbb-knowledge.vercel.app/heroes/32"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(item => item.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4, id + " mechanics");
    assert.ok(hero.strengths.length >= 3, id + " strengths");
    assert.ok(hero.weaknesses.length >= 3, id + " weaknesses");
    assert.ok(hero.sources.includes(source), id + " source");
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
  }
  const hayabusa = heroProfiles.find(item => item.id === "hayabusa");
  assert.ok(hayabusa.mechanics.some(note => note.includes("фантом")));
  const hylos = heroProfiles.find(item => item.id === "hylos");
  assert.ok(hylos.mechanics.some(note => note.includes("расходуя здоровье")));
  const irithel = heroProfiles.find(item => item.id === "irithel");
  assert.ok(irithel.mechanics.some(note => note.includes("движения")));
  const ixia = heroProfiles.find(item => item.id === "ixia");
  assert.ok(ixia.mechanics.some(note => note.includes("заряды")));
  const johnson = heroProfiles.find(item => item.id === "johnson");
  assert.ok(johnson.mechanics.some(note => note.includes("автомобиль")));
});


test("Hayabusa, Hylos, Irithel, Ixia and Johnson have sourced partial tactical profiles", () => {
  const expected = [
    ["hayabusa", "Хаябуса", "https://mlbb-knowledge.vercel.app/heroes/21"],
    ["hylos", "Хилос", "https://mlbb-knowledge.vercel.app/heroes/49"],
    ["irithel", "Иритэль", "https://mlbb-knowledge.vercel.app/heroes/43"],
    ["ixia", "Иксия", "https://mlbbhub.com/ru/heroes/ixia"],
    ["johnson", "Джонсон", "https://mlbb-knowledge.vercel.app/heroes/32"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(item => item.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4, id + " mechanics");
    assert.ok(hero.strengths.length >= 3, id + " strengths");
    assert.ok(hero.weaknesses.length >= 3, id + " weaknesses");
    assert.ok(hero.sources.includes(source), id + " source");
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
  }
  const hayabusa = heroProfiles.find(item => item.id === "hayabusa");
  assert.ok(hayabusa.mechanics.some(note => note.includes("тени")));
  const hylos = heroProfiles.find(item => item.id === "hylos");
  assert.ok(hylos.mechanics.some(note => note.includes("маны")));
  const irithel = heroProfiles.find(item => item.id === "irithel");
  assert.ok(irithel.mechanics.some(note => note.includes("движ")));
  const ixia = heroProfiles.find(item => item.id === "ixia");
  assert.ok(ixia.mechanics.some(note => note.includes("сектор")));
  const johnson = heroProfiles.find(item => item.id === "johnson");
  assert.ok(johnson.mechanics.some(note => note.includes("союзник")));
});

test("hero profile coverage count and unique IDs stay aligned with the audited baseline", () => {
  assert.equal(heroProfiles.length, 133);
  assert.equal(new Set(heroProfiles.map(hero => hero.id)).size, 133);
  const saber = heroProfiles.find(hero => hero.id === "saber");
  assert.ok(saber);
  assert.ok(Array.isArray(saber.mechanics));
  assert.equal(saber.confidence, "partial");
  assert.ok(Array.isArray(saber.sources) && saber.sources.length > 0);
});

test("Joy, Kadita, Karina, Lancelot and Leomord have sourced partial tactical profiles", () => {
  const expected = [
    ["joy", "Джой", "https://liquipedia.net/mobilelegends/Joy"],
    ["kadita", "Кадита", "https://mlbb-knowledge.vercel.app/heroes/75"],
    ["karina", "Карина", "https://mlbb-knowledge.vercel.app/heroes/8"],
    ["lancelot", "Ланселот", "https://mlbb-knowledge.vercel.app/heroes/47"],
    ["leomord", "Леоморд", "https://mlbb-knowledge.vercel.app/heroes/67"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(item => item.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4, id + " mechanics");
    assert.ok(hero.strengths.length >= 3, id + " strengths");
    assert.ok(hero.weaknesses.length >= 3, id + " weaknesses");
    assert.ok(hero.sources.includes(source), id + " source");
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
  }
});


test("Hirara, Kalea, Khaleed, Kimmy and Lapu-Lapu have sourced partial tactical profiles", () => {
  const expected = [
    ["hirara", "Хирара", "https://liquipedia.net/mobilelegends/Hirara"],
    ["kalea", "Калеа", "https://www.mobilelegends.com/en/hero/56/skill"],
    ["khaleed", "Халид", "https://liquipedia.net/mobilelegends/Khaleed"],
    ["kimmy", "Кимми", "https://www.mlbb.io/en/hero/kimmy"],
    ["lapu-lapu", "Лапу-Лапу", "https://mlbb.io/en/hero/lapu-lapu"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(item => item.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4, id + " mechanics");
    assert.ok(hero.strengths.length >= 3, id + " strengths");
    assert.ok(hero.weaknesses.length >= 3, id + " weaknesses");
    assert.ok(hero.sources.includes(source), id + " source");
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
  }
});


test("Lesley, Lolita, Luo Yi, Lylia and Martis have sourced partial tactical profiles", () => {
  const expected = [
    ["lesley", "Лесли", "https://mlbb.io/en/hero/lesley"],
    ["lolita", "Лолита", "https://mlbb.io/en/hero/lolita"],
    ["luo-yi", "Ло И", "https://mlbb.io/en/hero/luo-yi"],
    ["lylia", "Лилия", "https://mlbb.io/en/hero/lylia"],
    ["martis", "Мартис", "https://www.mlbb.io/en/hero/martis"]
  ];
  for (const [id, name, source] of expected) {
    const hero = heroProfiles.find(item => item.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, name);
    assert.ok(hero.mechanics.length >= 4, id + " mechanics");
    assert.ok(hero.strengths.length >= 3, id + " strengths");
    assert.ok(hero.weaknesses.length >= 3, id + " weaknesses");
    assert.ok(hero.sources.includes(source), id + " source");
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-22");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
  }
  assert.ok(heroProfiles.find(item => item.id === "lesley").mechanics.some(note => note.includes("перехвачены")));
  assert.ok(heroProfiles.find(item => item.id === "lolita").mechanics.some(note => note.includes("отражает")));
  assert.ok(heroProfiles.find(item => item.id === "luo-yi").mechanics.some(note => note.includes("Инь-Ян")));
  assert.ok(heroProfiles.find(item => item.id === "lylia").mechanics.some(note => note.includes("Чёрные ботинки")));
  assert.ok(heroProfiles.find(item => item.id === "martis").mechanics.some(note => note.includes("иммунитет к контролю")));
});


test("Saber has a complete researched tactical profile instead of a placeholder", () => {
  const saber = heroProfiles.find(hero => hero.id === "saber");
  assert.ok(saber, "Saber profile exists");
  assert.equal(saber.names.ru, "Сабер");
  assert.equal(saber.names.en, "Saber");
  assert.deepEqual(saber.roles, ["Убийца"]);
  assert.deepEqual(saber.lanes, ["Лес", "Роум"]);
  assert.equal(saber.mechanics.length, 4);
  assert.ok(saber.mechanics.some(note => note.includes("Погибель врагам")));
  assert.ok(saber.mechanics.some(note => note.includes("Летающие мечи")));
  assert.ok(saber.mechanics.some(note => note.includes("Рывок")));
  assert.ok(saber.mechanics.some(note => note.includes("Тройной удар")));
  assert.ok(saber.strengths.length >= 4);
  assert.ok(saber.weaknesses.length >= 4);
  assert.ok(saber.itemNotes.length >= 3);
  assert.ok(saber.teamfight.preferredPlan);
  assert.ok(saber.teamfight.targetPriority.length >= 2);
  assert.ok(saber.teamfight.avoid.length >= 3);
  assert.ok(saber.sources.includes("https://liquipedia.net/mobilelegends/Saber"));
  assert.ok(saber.sources.includes("https://mlbb-knowledge.vercel.app/heroes/3"));
  assert.ok(saber.sources.includes("https://mlbbhub.com/ru/heroes/saber"));
  assert.equal(saber.confidence, "partial");
  assert.equal(saber.patch.version, HERO_DB_PATCH);
  assert.equal(saber.patch.reviewedAt, "2026-11-22");
  assert.deepEqual(saber.matchups.strongAgainst, []);
  assert.deepEqual(saber.matchups.weakAgainst, []);
});

test("Mathilda has a sourced partial tactical profile with distinct support and engage mechanics", () => {
  const mathilda = heroProfiles.find(hero => hero.id === "mathilda");
  assert.ok(mathilda, "Mathilda profile exists");
  assert.equal(mathilda.names.ru, "Матильда");
  assert.equal(mathilda.names.en, "Mathilda");
  assert.deepEqual(mathilda.roles, ["Поддержка", "Убийца"]);
  assert.deepEqual(mathilda.lanes, ["Роум"]);
  assert.equal(mathilda.mechanics.length, 4);
  assert.ok(mathilda.mechanics.some(note => note.includes("Родовое наставление")));
  assert.ok(mathilda.mechanics.some(note => note.includes("до шести")));
  assert.ok(mathilda.mechanics.some(note => note.includes("переместиться к Матильде")));
  assert.ok(mathilda.mechanics.some(note => note.includes("иммунитет к контролю")));
  assert.ok(mathilda.strengths.length >= 4);
  assert.ok(mathilda.weaknesses.length >= 4);
  assert.ok(mathilda.itemNotes.length >= 2);
  assert.ok(mathilda.teamfight.preferredPlan);
  assert.ok(mathilda.teamfight.targetPriority.length >= 3);
  assert.ok(mathilda.teamfight.avoid.length >= 4);
  assert.ok(mathilda.sources.includes("https://liquipedia.net/mobilelegends/Mathilda"));
  assert.ok(mathilda.sources.includes("https://mlbb.io/en/hero/mathilda"));
  assert.ok(mathilda.sources.includes("https://mlbb-knowledge.vercel.app/heroes/102"));
  assert.equal(mathilda.confidence, "partial");
  assert.equal(mathilda.patch.version, HERO_DB_PATCH);
  assert.equal(mathilda.patch.reviewedAt, "2026-11-23");
  assert.deepEqual(mathilda.matchups.strongAgainst, []);
  assert.deepEqual(mathilda.matchups.weakAgainst, []);
});



test("Melissa has a sourced partial tactical profile with doll-link damage and anti-dive zoning", () => {
  const melissa = heroProfiles.find(hero => hero.id === "melissa");
  assert.ok(melissa, "Melissa profile exists");
  assert.equal(melissa.names.ru, "Мелисса");
  assert.deepEqual(melissa.roles, ["Стрелок"]);
  assert.deepEqual(melissa.lanes, ["Линия золота"]);
  assert.equal(melissa.mechanics.length, 4);
  assert.ok(melissa.mechanics.some(note => note.includes("125%")));
  assert.ok(melissa.mechanics.some(note => note.includes("Маддлс")));
  assert.ok(melissa.mechanics.some(note => note.includes("связывает")));
  assert.ok(melissa.mechanics.some(note => note.includes("отталкиванием")));
  assert.ok(melissa.strengths.length >= 4);
  assert.ok(melissa.weaknesses.length >= 4);
  assert.ok(melissa.itemNotes.length >= 3);
  assert.ok(melissa.teamfight.preferredPlan);
  assert.ok(melissa.teamfight.targetPriority.length >= 3);
  assert.ok(melissa.teamfight.avoid.length >= 4);
  assert.ok(melissa.sources.includes("https://liquipedia.net/mobilelegends/Melissa"));
  assert.ok(melissa.sources.includes("https://mlbb.io/en/hero/melissa"));
  assert.equal(melissa.confidence, "partial");
  assert.equal(melissa.patch.version, HERO_DB_PATCH);
  assert.equal(melissa.patch.reviewedAt, "2026-11-23");
  assert.deepEqual(melissa.matchups.strongAgainst, []);
  assert.deepEqual(melissa.matchups.weakAgainst, []);
});


test("Minsitthar tactical profile contains sourced hero-specific mechanics", () => {
  const hero = heroProfiles.find(entry => entry.id === "minsitthar");
  assert.ok(hero, "Minsitthar profile exists");
  assert.equal(hero.names.ru, "Минситтар");
  assert.deepEqual(hero.roles, ["Боец"]);
  assert.deepEqual(hero.lanes, ["Линия опыта"]);
  assert.equal(hero.mechanics.length, 4);
  assert.ok(hero.strengths.length >= 4);
  assert.ok(hero.weaknesses.length >= 4);
  assert.ok(hero.itemNotes.length >= 3);
  assert.ok(hero.teamfight.preferredPlan);
  assert.ok(hero.teamfight.targetPriority.length >= 3);
  assert.ok(hero.teamfight.avoid.length >= 3);
  assert.ok(hero.sources.length >= 2);
  assert.equal(hero.confidence, "partial");
  assert.equal(hero.patch.version, HERO_DB_PATCH);
  assert.equal(hero.patch.reviewedAt, "2026-11-23");
  if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
  if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
});


test("Moskov tactical profile contains sourced hero-specific mechanics", () => {
  const hero = heroProfiles.find(entry => entry.id === "moskov");
  assert.ok(hero, "Moskov profile exists");
  assert.equal(hero.names.ru, "Москов");
  assert.deepEqual(hero.roles, ["Стрелок"]);
  assert.deepEqual(hero.lanes, ["Линия золота"]);
  assert.equal(hero.mechanics.length, 4);
  assert.ok(hero.strengths.length >= 4);
  assert.ok(hero.weaknesses.length >= 4);
  assert.ok(hero.itemNotes.length >= 3);
  assert.ok(hero.teamfight.preferredPlan);
  assert.ok(hero.teamfight.targetPriority.length >= 3);
  assert.ok(hero.teamfight.avoid.length >= 3);
  assert.ok(hero.sources.length >= 2);
  assert.equal(hero.confidence, "partial");
  assert.equal(hero.patch.version, HERO_DB_PATCH);
  assert.equal(hero.patch.reviewedAt, "2026-11-23");
  if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
  if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
});


test("Natalia tactical profile contains sourced hero-specific mechanics", () => {
  const hero = heroProfiles.find(entry => entry.id === "natalia");
  assert.ok(hero, "Natalia profile exists");
  assert.equal(hero.names.ru, "Наталья");
  assert.deepEqual(hero.roles, ["Убийца"]);
  assert.deepEqual(hero.lanes, ["Лес","Роум"]);
  assert.equal(hero.mechanics.length, 4);
  assert.ok(hero.strengths.length >= 4);
  assert.ok(hero.weaknesses.length >= 4);
  assert.ok(hero.itemNotes.length >= 3);
  assert.ok(hero.teamfight.preferredPlan);
  assert.ok(hero.teamfight.targetPriority.length >= 3);
  assert.ok(hero.teamfight.avoid.length >= 3);
  assert.ok(hero.sources.length >= 2);
  assert.equal(hero.confidence, "partial");
  assert.equal(hero.patch.version, HERO_DB_PATCH);
  assert.equal(hero.patch.reviewedAt, "2026-11-23");
  if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
  if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
});


test("Natan tactical profile contains sourced hero-specific mechanics", () => {
  const hero = heroProfiles.find(entry => entry.id === "natan");
  assert.ok(hero, "Natan profile exists");
  assert.equal(hero.names.ru, "Натан");
  assert.deepEqual(hero.roles, ["Стрелок"]);
  assert.deepEqual(hero.lanes, ["Линия золота"]);
  assert.equal(hero.mechanics.length, 4);
  assert.ok(hero.strengths.length >= 4);
  assert.ok(hero.weaknesses.length >= 4);
  assert.ok(hero.itemNotes.length >= 3);
  assert.ok(hero.teamfight.preferredPlan);
  assert.ok(hero.teamfight.targetPriority.length >= 3);
  assert.ok(hero.teamfight.avoid.length >= 3);
  assert.ok(hero.sources.length >= 2);
  assert.equal(hero.confidence, "partial");
  assert.equal(hero.patch.version, HERO_DB_PATCH);
  assert.equal(hero.patch.reviewedAt, "2026-11-23");
  if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
  if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
});


test("Novaria tactical profile contains sourced hero-specific mechanics", () => {
  const hero = heroProfiles.find(entry => entry.id === "novaria");
  assert.ok(hero, "Novaria profile exists");
  assert.equal(hero.names.ru, "Новария");
  assert.deepEqual(hero.roles, ["Маг"]);
  assert.deepEqual(hero.lanes, ["Средняя линия"]);
  assert.equal(hero.mechanics.length, 4);
  assert.ok(hero.strengths.length >= 4);
  assert.ok(hero.weaknesses.length >= 4);
  assert.ok(hero.itemNotes.length >= 3);
  assert.ok(hero.teamfight.preferredPlan);
  assert.ok(hero.teamfight.targetPriority.length >= 3);
  assert.ok(hero.teamfight.avoid.length >= 3);
  assert.ok(hero.sources.length >= 2);
  assert.equal(hero.confidence, "partial");
  assert.equal(hero.patch.version, HERO_DB_PATCH);
  assert.equal(hero.patch.reviewedAt, "2026-11-23");
  if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
  if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
});


test("Aamon, Alice, Angela, Odette and Phoveus tactical profiles are sourced and structurally complete", () => {
  const expected = [
    ["aamon", "Эймон", ["Убийца"], ["Лес"]],
    ["alice", "Алиса", ["Танк", "Маг"], ["Линия опыта"]],
    ["angela", "Ангела", ["Поддержка"], ["Роум"]],
    ["odette", "Одетта", ["Маг"], ["Средняя линия"]],
    ["phoveus", "Фовиус", ["Боец"], ["Линия опыта"]]
  ];
  for (const [id, ru, roles, lanes] of expected) {
    const hero = heroProfiles.find(entry => entry.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, ru);
    assert.deepEqual(hero.roles, roles);
    assert.deepEqual(hero.lanes, lanes);
    assert.equal(hero.mechanics.length, 4);
    assert.ok(hero.strengths.length >= 4);
    assert.ok(hero.weaknesses.length >= 4);
    assert.ok(hero.itemNotes.length >= 3);
    assert.ok(hero.teamfight.preferredPlan);
    assert.ok(hero.teamfight.targetPriority.length >= 3);
    assert.ok(hero.teamfight.avoid.length >= 3);
    assert.ok(hero.sources.length >= 3);
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-23");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.synergies, []);
  }
});


test("Popol and Kupa, Ruby, Selena, Silvanna and Sora tactical profiles are sourced and structurally complete", () => {
  const expected = [
    ["popol-and-kupa", "Пополь и Купа", ["Стрелок"], ["Золотая линия", "Лес"]],
    ["ruby", "Руби", ["Боец"], ["Линия опыта", "Роум"]],
    ["selena", "Селена", ["Убийца", "Маг"], ["Средняя линия"]],
    ["silvanna", "Сильванна", ["Боец"], ["Линия опыта"]],
    ["sora", "Сора", ["Боец", "Убийца"], ["Линия опыта"]]
  ];
  for (const [id, ru, roles, lanes] of expected) {
    const hero = heroProfiles.find(entry => entry.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, ru);
    assert.deepEqual(hero.roles, roles);
    assert.deepEqual(hero.lanes, lanes);
    assert.ok(hero.mechanics.length >= 4);
    assert.ok(hero.strengths.length >= 4);
    assert.ok(hero.weaknesses.length >= 4);
    assert.ok(hero.itemNotes.length >= 3);
    assert.ok(hero.teamfight.preferredPlan);
    assert.ok(hero.teamfight.targetPriority.length >= 3);
    assert.ok(hero.teamfight.avoid.length >= 3);
    assert.ok(hero.sources.length >= 3);
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-23");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.synergies, []);
  }
});


test("Uranus, Vale, Valentina, Vexana and Wanwan tactical profiles are sourced and structurally complete", () => {
  const expected = [
    ["uranus", "Уранус", ["Танк"], ["Линия опыта"]],
    ["vale", "Вэйл", ["Маг"], ["Средняя линия"]],
    ["valentina", "Валентина", ["Маг"], ["Средняя линия"]],
    ["vexana", "Вексана", ["Маг"], ["Средняя линия"]],
    ["wanwan", "Ванван", ["Стрелок"], ["Золотая линия"]]
  ];
  for (const [id, ru, roles, lanes] of expected) {
    const hero = heroProfiles.find(entry => entry.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, ru);
    assert.deepEqual(hero.roles, roles);
    assert.deepEqual(hero.lanes, lanes);
    assert.equal(hero.mechanics.length, 4);
    assert.ok(hero.strengths.length >= 4);
    assert.ok(hero.weaknesses.length >= 4);
    assert.ok(hero.itemNotes.length >= 3);
    assert.ok(hero.teamfight.preferredPlan);
    assert.ok(hero.teamfight.targetPriority.length >= 3);
    assert.ok(hero.teamfight.avoid.length >= 3);
    assert.ok(hero.sources.length >= 3);
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-23");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.synergies, []);
  }
});


test("X.Borg, Yi Sun-shin, Yin, Yu Zhong and Yve tactical profiles are sourced and structurally complete", () => {
  const expected = [
    ["x-borg", "Икс.Борг", ["Боец"], ["Линия опыта"]],
    ["yi-sun-shin", "Ли Сун-Син", ["Стрелок", "Убийца"], ["Лес"]],
    ["yin", "Инь", ["Боец", "Убийца"], ["Лес", "Линия опыта"]],
    ["yu-zhong", "Чонг", ["Боец"], ["Линия опыта"]],
    ["yve", "Ив", ["Маг"], ["Средняя линия"]]
  ];
  for (const [id, ru, roles, lanes] of expected) {
    const hero = heroProfiles.find(entry => entry.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, ru);
    assert.deepEqual(hero.roles, roles);
    assert.deepEqual(hero.lanes, lanes);
    assert.ok(hero.mechanics.length >= 4);
    assert.ok(hero.strengths.length >= 4);
    assert.ok(hero.weaknesses.length >= 4);
    assert.ok(hero.itemNotes.length >= 3);
    assert.ok(hero.teamfight.preferredPlan);
    assert.ok(hero.teamfight.targetPriority.length >= 3);
    assert.ok(hero.teamfight.avoid.length >= 3);
    assert.ok(hero.sources.length >= 3);
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-23");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.synergies, []);
  }
});


test("Zetian, Zhask, Zhuxin and Zilong tactical profiles are sourced and structurally complete", () => {
  const expected = [
    ["zetian", "Цзэтянь", ["Маг"], ["Средняя линия"]],
    ["zhask", "Заск", ["Маг"], ["Средняя линия"]],
    ["zhuxin", "Чжусинь", ["Маг"], ["Средняя линия"]],
    ["zilong", "Зилонг", ["Боец", "Убийца"], ["Линия опыта"]]
  ];
  for (const [id, ru, roles, lanes] of expected) {
    const hero = heroProfiles.find(entry => entry.id === id);
    assert.ok(hero, id + " profile exists");
    assert.equal(hero.names.ru, ru);
    assert.deepEqual(hero.roles, roles);
    assert.deepEqual(hero.lanes, lanes);
    assert.ok(hero.mechanics.length >= 4);
    assert.ok(hero.strengths.length >= 4);
    assert.ok(hero.weaknesses.length >= 4);
    assert.ok(hero.itemNotes.length >= 3);
    assert.ok(hero.teamfight.preferredPlan);
    assert.ok(hero.teamfight.targetPriority.length >= 3);
    assert.ok(hero.teamfight.avoid.length >= 3);
    assert.ok(hero.sources.length >= 3);
    assert.equal(hero.confidence, "partial");
    assert.equal(hero.patch.version, HERO_DB_PATCH);
    assert.equal(hero.patch.reviewedAt, "2026-11-23");
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.strongAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.matchups.weakAgainst, []);
    if (!MATCHUP_REVIEWED_IDS.has(hero.id)) assert.deepEqual(hero.synergies, []);
  }
});

test("all local tactical profiles contain enough material for a useful hero passport", () => {
  assert.equal(heroProfiles.length, 133);
  for (const hero of heroProfiles) {
    assert.ok(hero.mechanics.length >= 3, hero.id + " mechanics");
    assert.ok(hero.strengths.length >= 2, hero.id + " strengths");
    assert.ok(hero.weaknesses.length >= 2, hero.id + " weaknesses");
    assert.ok(hero.itemNotes.length >= 1, hero.id + " item notes");
    assert.ok(hero.teamfight.preferredPlan, hero.id + " teamfight plan");
    assert.ok(hero.teamfight.targetPriority.length >= 1, hero.id + " target priorities");
    assert.ok(hero.teamfight.avoid.length >= 1, hero.id + " tactical cautions");
    assert.ok(hero.sources.length >= 1, hero.id + " sources");
  }
});

test("tactical profile coverage is explicit and does not invent profiles for the remaining catalogue", () => {
  assert.equal(heroCatalog.length, 133);
  const profileIds = new Set(heroProfiles.map(hero => hero.id));
  assert.equal(profileIds.size, heroProfiles.length);
  assert.ok(heroProfiles.every(hero => heroCatalog.some(entry => entry.id === hero.id)));
  const missing = heroCatalog.filter(hero => !profileIds.has(hero.id));
  assert.equal(missing.length, 0);
});

test("five hero profiles contain dated, source-backed matchup and synergy IDs", () => {
  for (const id of MATCHUP_REVIEWED_IDS) {
    const hero = heroProfiles.find(entry => entry.id === id);
    assert.ok(hero, id + " profile exists");
    assert.ok(hero.matchups.strongAgainst.length > 0, id + " strong matchups");
    assert.ok(hero.matchups.weakAgainst.length > 0, id + " weak matchups");
    assert.ok(hero.synergies.length > 0, id + " synergies");
    assert.equal(hero.matchupsReviewedAt, "2026-11-24");
    assert.match(hero.matchupsMethod, /ranked matchup deltas/i);
    assert.ok(hero.sources.some(source => source.includes("mlbb.io")));
  }
});
