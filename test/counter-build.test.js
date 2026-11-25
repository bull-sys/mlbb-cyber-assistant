import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { items } from "../server/data.js";

const appSource = await readFile(new URL("../public/app.js", import.meta.url), "utf8");

function extractFunction(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Missing ${marker}`);
  const signatureEnd = source.indexOf(")", start);
  assert.notEqual(signatureEnd, -1, `Missing signature end for ${name}`);
  const open = source.indexOf("{", signatureEnd);
  assert.notEqual(open, -1, `Missing body for ${name}`);
  let depth = 0;
  let state = "code";
  let escaped = false;
  for (let i = open; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (state === "line") {
      if (char === "\n") state = "code";
      continue;
    }
    if (state === "block") {
      if (char === "*" && next === "/") { state = "code"; i += 1; }
      continue;
    }
    if (state !== "code") {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if ((state === "single" && char === "'") ||
               (state === "double" && char === '"') ||
               (state === "template" && char === "`")) state = "code";
      continue;
    }
    if (char === "/" && next === "/") { state = "line"; i += 1; }
    else if (char === "/" && next === "*") { state = "block"; i += 1; }
    else if (char === "'") state = "single";
    else if (char === '"') state = "double";
    else if (char === "`") state = "template";
    else if (char === "{") depth += 1;
    else if (char === "}" && --depth === 0) {
      return source.slice(start, i + 1);
    }
  }
  throw new Error(`Could not find the end of ${name}`);
}

const recommendBuild = new Function(
  `items`,
  `${extractFunction(appSource, "recommendBuild")}\nreturn recommendBuild;`
)(items);

const names = (archetype, threats) =>
  recommendBuild({ items, archetype, threats }).map(item => item.name);

test("mage counter-build selects magic defense and anti-heal without physical attack items", () => {
  const result = names("Маг / взрывной урон", ["heal", "magic"]);
  assert.ok(result.includes("Щит Валькирии"));
  assert.ok(result.includes("Пылающий жезл"));
  assert.ok(!result.includes("Трезубец"));
  assert.ok(!result.includes("Злобный рык"));
});

test("marksman build can include defensive answers to attack speed and physical damage", () => {
  const result = names("Стрелок / скорость атаки", ["speed", "physical"]);
  assert.ok(result.includes("Господство льда"));
  assert.ok(result.includes("Древняя кираса"));
});

test("physical assassin build uses penetration against a tank and excludes magic items", () => {
  const result = names("Убийца / физический урон", ["tank"]);
  assert.ok(result.includes("Злобный рык"));
  assert.ok(!result.includes("Палочка гения"));
  assert.ok(!result.includes("Божественный меч"));
});

test("tank build prioritizes magic protection and survival against burst", () => {
  const result = names("Танк / инициатор", ["magic", "burst"]);
  assert.ok(result.includes("Щит Валькирии"));
  assert.ok(result.includes("Бессмертие"));
});

test("unknown archetypes and empty catalog return no recommendations", () => {
  assert.deepEqual(recommendBuild({ items, archetype: "Неизвестный", threats: ["heal"] }), []);
  assert.deepEqual(recommendBuild({ items: [], archetype: "Маг / взрывной урон", threats: [] }), []);
});

test("recommendations are limited to six unique catalogue items with reasons", () => {
  const result = recommendBuild({
    items,
    archetype: "Боец / длительный бой",
    threats: ["heal", "magic", "speed", "tank", "cc", "physical", "burst"]
  });
  assert.ok(result.length <= 6);
  assert.equal(new Set(result.map(item => item.name)).size, result.length);
  assert.ok(result.every(item => item.reasons.length > 0 && item.description));
});
