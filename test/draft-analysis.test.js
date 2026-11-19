import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { heroes, items } from "../server/data.js";

// Keep production code untouched: load the existing local analyze() declaration
// from server/index.js and evaluate only that function with the real catalogue.
// This avoids starting Express or creating/modifying the SQLite database in tests.
const serverSource = await readFile(new URL("../server/index.js", import.meta.url), "utf8");
const analyzeStart = serverSource.indexOf("function analyze(");
const analyzeEnd = serverSource.indexOf('\napp.post("/api/ai/draft"', analyzeStart);
assert.ok(analyzeStart >= 0, "Could not find analyze() in server/index.js");
assert.ok(analyzeEnd > analyzeStart, "Could not determine the end of analyze()");
const analyzeSource = serverSource.slice(analyzeStart, analyzeEnd).trim();
const analyze = new Function("heroes", "items", `${analyzeSource}\nreturn analyze;`)(heroes, items);

const run = (overrides = {}) => analyze({ lane: "Лес", ...overrides });

test("candidate filtering respects lane, enemy picks, and selected hero", () => {
  const result = run({
    lane: "Лес",
    enemies: ["Хелкарт"],
    myHero: "Линг"
  });

  assert.ok(result.counters.length > 0);
  assert.ok(result.counters.every(candidate => candidate.role === "Лес"));
  assert.ok(!result.counters.some(candidate => candidate.name === "Хелкарт"));
  assert.ok(!result.counters.some(candidate => candidate.name === "Линг"));
});

test("counter-pick scoring adds backline-pressure points and returns ranked results", () => {
  const result = run({ lane: "Золото", enemies: ["Эудора"] });

  assert.deepEqual(result.counters.map(({ name, score }) => ({ name, score })), [
    { name: "Бруно", score: 4 },
    { name: "Грейнджер", score: 4 }
  ]);
  assert.ok(result.counters.every(candidate =>
    candidate.reason.includes("давления на стрелков и магов")
  ));
});

test("enemy composition threats reflect the tags and archetypes in the catalogue", () => {
  const result = run({
    enemies: ["Минотавр", "Эудора", "Нана", "Мия", "Тигрил"]
  });

  assert.deepEqual(result.threats, [
    "Восстановление здоровья и устойчивость",
    "Высокая магическая угроза",
    "Высокая скорость атаки",
    "Плотная передняя линия",
    "Много контроля",
    "Высокий взрывной урон"
  ]);
});

test("allied engage adds the current +2 synergy to compatible roam candidates", () => {
  const result = run({ lane: "Роум", allies: ["Тигрил"] });

  assert.deepEqual(result.counters.map(({ name, score }) => ({ name, score })), [
    { name: "Тигрил", score: 2 },
    { name: "Атлас", score: 2 },
    { name: "Минотавр", score: 2 }
  ]);
  assert.ok(result.counters.every(candidate =>
    candidate.reason.includes("инициацией союзников")
  ));
});

test("items answer sustain and double-mage threats while respecting mage category filtering", () => {
  const result = run({
    lane: "Мид",
    myHero: "Эудора",
    enemies: ["Минотавр", "Эудора", "Нана"]
  });

  assert.ok(result.build.includes("Щит Афины"));
  assert.ok(result.build.includes("Господство льда"));
  const antiHealCount = result.build.filter(name =>
    items.find(item => item.name === name)?.tags.includes("anti-heal")
  ).length;
  assert.equal(antiHealCount, 1);
  assert.ok(result.build.every(name =>
    items.find(item => item.name === name)?.category !== "Атака"
  ));
});

test("emblem selection follows selected hero archetype", async t => {
  const cases = [
    ["Эудора", "Мага"],
    ["Кэрри", "Стрелка"],
    ["Тигрил", "Танка"],
    ["Ангела", "Поддержки"],
    ["Теризла", "Бойца"],
    ["Линг", "Убийцы"]
  ];

  for (const [myHero, expected] of cases) {
    await t.test(`${myHero} selects ${expected}`, () => {
      assert.equal(run({ myHero }).emblem, expected);
    });
  }
});

test("battle spell is Retribution only for the jungle lane", () => {
  assert.equal(run({ lane: "Лес" }).spell, "Возмездие");
  for (const lane of ["Золото", "Опыт", "Мид", "Роум"]) {
    assert.equal(run({ lane }).spell, "Вспышка", `${lane} lane`);
  }
});

test("duplicate enemy names have the same analysis effect as one pick", () => {
  const once = run({ lane: "Золото", enemies: ["Эудора"] });
  const repeated = run({ lane: "Золото", enemies: ["Эудора", "Эудора"] });

  assert.deepEqual(repeated, once);
});

test("empty enemy composition yields no threats or counter-picks", () => {
  const result = run({ lane: "Лес", enemies: [] });

  assert.deepEqual(result.threats, []);
  assert.deepEqual(result.counters, []);
});

test("unsupported lane yields no candidates and uses the non-jungle spell fallback", () => {
  const result = run({ lane: "Неизвестная линия", enemies: ["Эудора"] });

  assert.deepEqual(result.counters, []);
  assert.equal(result.spell, "Вспышка");
});

test("equal counter scores retain catalogue order", () => {
  const result = run({ lane: "Золото", enemies: ["Эудора"] });

  assert.equal(result.counters[0].score, result.counters[1].score);
  assert.deepEqual(result.counters.map(candidate => candidate.name), ["Бруно", "Грейнджер"]);
});
