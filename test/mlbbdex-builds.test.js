import test from "node:test";
import assert from "node:assert/strict";
import { normalizeHeroBuildPayload } from "../server/mlbbdex-adapter.js";

test("normalizes observed builds by position and rank", () => {
  const result = normalizeHeroBuildPayload({
    data: {
      Exp: {
        all: [{
          items: ["Corrosion Scythe", "Windtalker", "Berserker's Fury"],
          emblem: "Marksman",
          talents: ["Fatal", "Bargain Hunter", "War Cry"],
          spell: "Petrify",
          winRate: 68.87,
          pickRate: 2.5
        }],
        mythic: []
      },
      Jungle: { all: [] }
    },
    source: { name: "Mobile Legends Wiki", url: "https://mobilelegends.fandom.com", license: "CC BY-SA" }
  });

  assert.equal(result.ok, true);
  assert.equal(result.positions.length, 2);
  const exp = result.positions.find(position => position.id === "exp");
  assert.equal(exp.label, "Опыт");
  assert.equal(exp.ranks.all.builds.length, 1);
  const build = exp.ranks.all.builds[0];
  assert.equal(build.items[0].name, "Коррозионная коса");
  assert.equal(build.items[0].catalogMatched, true);
  assert.equal(build.emblem.name, "Эмблема стрелка");
  assert.equal(build.emblem.catalogMatched, true);
  assert.deepEqual(build.talents.map(talent => talent.name), ["Роковой удар", "Охотник за скидками", "Воинский клич"]);
  assert.equal(build.spell.name, "Окаменение");
  assert.equal(build.winRate, 68.87);
  assert.equal(build.pickRate, 2.5);
  assert.equal(result.sampleSizeAvailable, false);
});

test("preserves source item names when local catalog mapping is missing", () => {
  const result = normalizeHeroBuildPayload({
    data: { Mid: { all: [{ items: ["Uncatalogued Item"], emblem: "Unknown", talents: [], spell: "Unknown Spell" }] } }
  });
  const build = result.positions[0].ranks.all.builds[0];
  assert.equal(build.items[0].name, "Uncatalogued Item");
  assert.equal(build.items[0].catalogMatched, false);
  assert.equal(build.catalogCoverage.unmatchedItems[0], "Uncatalogued Item");
  assert.equal(build.emblem.catalogMatched, false);
});

test("rejects malformed build payloads instead of inventing an empty build", () => {
  assert.equal(normalizeHeroBuildPayload({ data: [] }).ok, false);
  assert.equal(normalizeHeroBuildPayload({}).ok, false);
});
