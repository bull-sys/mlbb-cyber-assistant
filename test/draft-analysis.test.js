import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { heroes, items } from "../server/data.js";

// Keep production code untouched: load the local analyze() declaration from
// server/index.js and evaluate only that function with the real catalogue.
// This avoids starting Express, initializing SQLite, or requiring OpenAI/network.
const serverSource = await readFile(new URL("../server/index.js", import.meta.url), "utf8");
const analyzeDeclaration = "function analyze(";
const analyzeStart = serverSource.indexOf(analyzeDeclaration);
if (analyzeStart < 0) {
  throw new Error(`Draft analysis tests could not find ${analyzeDeclaration} in server/index.js`);
}

const signatureEnd = serverSource.indexOf(") {", analyzeStart);
if (signatureEnd < 0) {
  throw new Error("Draft analysis tests found function analyze( but could not find its body opener `) {` in server/index.js");
}
const bodyStart = signatureEnd + 2;

// Match the function's closing brace rather than slicing up to an endpoint
// string. Ignore braces inside quoted strings and comments so the extraction
// cannot silently truncate at a brace in a message or comment.
function findFunctionEnd(source, openBraceIndex) {
  let depth = 0;
  let state = "code";
  let escaped = false;

  for (let i = openBraceIndex; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (state === "line-comment") {
      if (char === "\n") state = "code";
      continue;
    }
    if (state === "block-comment") {
      if (char === "*" && next === "/") {
        state = "code";
        i += 1;
      }
      continue;
    }
    if (state === "single-quote" || state === "double-quote" || state === "template") {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (
        (state === "single-quote" && char === "'") ||
        (state === "double-quote" && char === '"') ||
        (state === "template" && char === "`")
      ) {
        state = "code";
      }
      continue;
    }

    if (char === "/" && next === "/") {
      state = "line-comment";
      i += 1;
    } else if (char === "/" && next === "*") {
      state = "block-comment";
      i += 1;
    } else if (char === "'") {
      state = "single-quote";
    } else if (char === '"') {
      state = "double-quote";
    } else if (char === "`") {
      state = "template";
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return i + 1;
      if (depth < 0) break;
    }
  }

  return -1;
}

const analyzeEnd = findFunctionEnd(serverSource, bodyStart);
if (analyzeEnd < 0) {
  throw new Error("Draft analysis tests found function analyze() but could not find its matching closing brace in server/index.js");
}

const endpointMarker = 'app.post("/api/ai/draft"';
const endpointStart = serverSource.indexOf(endpointMarker, analyzeEnd);
if (endpointStart < 0) {
  throw new Error(`Draft analysis tests found the end of analyze() but could not find endpoint marker ${endpointMarker} after it in server/index.js`);
}
if (serverSource.slice(analyzeEnd, endpointStart).trim() !== "") {
  throw new Error(`Draft analysis tests expected ${endpointMarker} immediately after analyze(), but found other code between them`);
}

const analyzeSource = serverSource.slice(analyzeStart, analyzeEnd);
let analyze;
try {
  analyze = new Function("heroes", "items", `${analyzeSource}\nreturn analyze;`)(heroes, items);
} catch (error) {
  throw new Error(`Draft analysis tests could not compile the complete analyze() function from server/index.js: ${error.message}`, { cause: error });
}

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
  const result = run({ lane: "Золото", enemies: ["Эйдора"] });

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
    enemies: ["Минотавр", "Эйдора", "Нана", "Мия", "Тигрил"]
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
    myHero: "Эйдора",
    enemies: ["Минотавр", "Эйдора", "Нана"]
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
    ["Эйдора", "Мага"],
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
  const once = run({ lane: "Золото", enemies: ["Эйдора"] });
  const repeated = run({ lane: "Золото", enemies: ["Эйдора", "Эйдора"] });

  assert.deepEqual(repeated, once);
});

test("empty enemy composition yields no threats or counter-picks", () => {
  const result = run({ lane: "Лес", enemies: [] });

  assert.deepEqual(result.threats, []);
  assert.deepEqual(result.counters, []);
});

test("unsupported lane yields no candidates and uses the non-jungle spell fallback", () => {
  const result = run({ lane: "Неизвестная линия", enemies: ["Эйдора"] });

  assert.deepEqual(result.counters, []);
  assert.equal(result.spell, "Вспышка");
});

test("equal counter scores retain catalogue order", () => {
  const result = run({ lane: "Золото", enemies: ["Эйдора"] });

  assert.equal(result.counters[0].score, result.counters[1].score);
  assert.deepEqual(result.counters.map(candidate => candidate.name), ["Бруно", "Грейнджер"]);
});
