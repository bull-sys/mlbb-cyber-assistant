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
          talents: ["Fatal", "Weapons Master", "War Cry"],
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
  assert.equal(build.items[0].name, "Коса коррозии");
  assert.equal(build.items[0].catalogMatched, true);
  assert.equal(build.emblem.name, "Эмблема стрелка");
  assert.equal(build.emblem.catalogMatched, true);
  assert.deepEqual(build.talents.map(talent => talent.name), ["Роковой удар", "Мастер оружия", "Боевой клич"]);
  assert.equal(build.spell.name, "Окаменение");
  assert.equal(build.spell.catalogMatched, true);
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
  assert.equal(build.winRate, null);
  assert.equal(build.pickRate, null);
});

test("rejects malformed build payloads instead of inventing an empty build", () => {
  assert.equal(normalizeHeroBuildPayload({ data: [] }).ok, false);
  assert.equal(normalizeHeroBuildPayload({}).ok, false);
});

test("maps Weapon Master but preserves generic All emblem as unmatched", () => {
  const result = normalizeHeroBuildPayload({
    data: { Gold: { all: [{ items: [], emblem: "All", talents: ["Weapons Master"], spell: "Inspire" }] } }
  });
  const build = result.positions[0].ranks.all.builds[0];
  assert.equal(build.emblem.id, null);
  assert.equal(build.emblem.name, "All");
  assert.equal(build.emblem.catalogMatched, false);
  assert.equal(build.talents[0].id, "weapon-master");
  assert.equal(build.talents[0].catalogMatched, true);
  assert.equal(build.spell.name, "Вдохновение");
  assert.equal(build.spell.catalogMatched, true);
});

test("maps every documented MLBBDex battle spell to the local catalogue", () => {
  const spells = [
    ["Petrify", "Окаменение"],
    ["Aegis", "Щит"],
    ["Vengeance", "Месть"],
    ["Revitalize", "Исцеление"],
    ["Flameshot", "Пламя"]
  ];
  for (const [sourceSpell, localName] of spells) {
    const result = normalizeHeroBuildPayload({
      data: { Mid: { all: [{ items: [], emblem: "All", talents: [], spell: sourceSpell }] } }
    });
    const spell = result.positions[0].ranks.all.builds[0].spell;
    assert.equal(spell.name, localName, sourceSpell);
    assert.equal(spell.catalogMatched, true, sourceSpell);
  }
});
