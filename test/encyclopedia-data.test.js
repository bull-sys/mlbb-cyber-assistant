import test from "node:test";
import assert from "node:assert/strict";
import { items, emblems, talents } from "../server/data.js";
import { readFile } from "node:fs/promises";

const appSource = await readFile(new URL("../public/app.js", import.meta.url), "utf8");

test("encyclopedia has all seven emblem sets with visible factual attributes", () => {
  assert.equal(emblems.length, 7);
  assert.equal(new Set(emblems.map(item => item.id)).size, 7);
  for (const emblem of emblems) {
    assert.ok(emblem.name, "emblem name is required");
    assert.ok(emblem.image?.startsWith("https://"), emblem.name + " needs an HTTPS icon");
    assert.ok(Array.isArray(emblem.attributes) && emblem.attributes.length >= 2, emblem.name + " needs attribute details");
    assert.ok(emblem.description?.length > 30, emblem.name + " needs a meaningful description");
    assert.ok(emblem.source?.startsWith("https://"), emblem.name + " needs provenance");
  }
});

test("encyclopedia has all 26 emblem talents split into 8/8/10 tiers", () => {
  assert.equal(talents.length, 26);
  assert.equal(new Set(talents.map(item => item.id)).size, 26);
  assert.deepEqual(
    [1, 2, 3].map(tier => talents.filter(item => item.tier === tier).length),
    [8, 8, 10]
  );
  for (const talent of talents) {
    assert.ok(talent.name, "talent name is required");
    assert.ok(talent.nameEn, talent.name + " needs its English reference name");
    assert.ok(talent.image?.startsWith("https://"), talent.name + " needs an HTTPS icon");
    assert.ok(talent.description?.length > 20, talent.name + " needs a meaningful explanation");
    assert.ok(talent.effect?.length > 12, talent.name + " needs an effect summary");
    assert.ok(talent.source?.startsWith("https://"), talent.name + " needs provenance");
    assert.ok(talent.checkedAt, talent.name + " needs a verification date");
  }
});

test("item encyclopedia records have descriptions and the six shop categories", () => {
  assert.equal(items.length, 104);
  assert.ok(items.every(item => typeof item.englishName === "string" && item.englishName.length > 0));
  assert.equal(new Set(items.map(item => item.englishName)).size, 104);
  assert.ok(items.every(item => [1, 2, 3].includes(item.tier)));
  assert.ok(items.every(item => Number.isFinite(item.priceGold) && item.priceGold >= 0));
  const categories = new Set(items.map(item => item.category));
  assert.deepEqual(
    [...categories].sort(),
    ["Атака", "Защита", "Лес", "Магия", "Передвижение", "Роум"].sort()
  );
  const categoryCounts = Object.fromEntries(["Атака", "Магия", "Защита", "Передвижение", "Лес", "Роум"].map(category => [
    category,
    items.filter(item => (item.categories || [item.category]).includes(category)).length
  ]));
  assert.deepEqual(categoryCounts, { "Атака": 34, "Магия": 31, "Защита": 26, "Передвижение": 11, "Лес": 3, "Роум": 4 });
  const adaptive = items.filter(item => item.categories?.includes("Магия"));
  assert.deepEqual(adaptive.filter(item => ["Fleeting Time", "Sky Piercer"].includes(item.englishName)).map(item => item.englishName).sort(), ["Fleeting Time", "Sky Piercer"].sort());
  assert.deepEqual(items.find(item => item.englishName === "Fleeting Time").categories, ["Атака", "Магия", "Защита"]);
  assert.deepEqual(items.find(item => item.englishName === "Winter Crown").categories, ["Атака", "Магия"]);
  assert.ok(items.find(item => item.englishName === "Expert Gloves").stats.includes("+30 адаптивной атаки"));
  const itemById = id => items.find(item => item.englishName === id);
  assert.match(itemById("Dominance Ice").passive, /Lifebane/);
  assert.match(itemById("Athena's Shield").passive, /25%.*3 секунды/);
  assert.match(itemById("Radiant Armor").passive, /0,4 секунды/);
  assert.match(itemById("Genius Wand").passive, /2,5.*3 раз/);
  assert.match(itemById("Blade of Despair").passive, /ниже 50%.*25%/);
  
  assert.match(itemById("Guardian Helmet").passive, /2,5%.*0,5%.*Defender/);
  assert.match(itemById("Queen's Wings").passive, /30%.*60 секунд.*15%/);
  assert.match(itemById("Chastise Pauldron").passive, /75%.*60 секунд/);
  assert.match(itemById("Brute Force Breastplate").passive, /8 адаптивной атаки.*6 зарядов.*25%/);
  assert.match(itemById("Cursed Helmet").passive, /1,2%.*125.*15.*3 зарядов/);
  assert.match(itemById("Oracle").passive, /25%/);
  assert.match(itemById("Thunder Belt").passive, /каждые 4 секунды.*чистый урон.*99%/);
  assert.match(itemById("Blood Wings").passive, /800.*100% магической силы.*150 скорости/);
  assert.match(itemById("Clock of Destiny").passive, /4,5.*6 зарядов.*15% здоровья/);
  assert.match(itemById("Concentrated Energy").passive, /5.*6 раз.*12%/);
  assert.match(itemById("Enchanted Talisman").passive, /15% максимальной маны.*10 секунд.*5%/);
  assert.match(itemById("Flask of the Oasis").passive, /35%.*100 × уровень героя.*60 секунд/);
  assert.match(itemById("Starlium Scythe").passive, /90.*60% общей магической силы.*15%/);
  assert.match(itemById("Wishing Lantern").passive, /каждые 900.*8% его текущего здоровья/);
  assert.match(itemById("Antique Cuirass").passive, /8%/);
  assert.match(itemById("Immortality").passive, /210 секунд/);
  assert.match(itemById("Sea Halberd").passive, /Punish/);
  assert.match(itemById("Divine Glaive").passive, /20%/);
  assert.match(itemById("Wind of Nature").passive, /90 секунд/);
  assert.match(itemById("Berserker's Fury").passive, /12%/);
  assert.match(itemById("Corrosion Scythe").passive, /Impulse/);
  assert.match(itemById("Demon Hunter Sword").passive, /8% текущего здоровья/);
  assert.match(itemById("Endless Battle").passive, /60% общей физической атаки/);
  assert.match(itemById("Feather of Heaven").passive, /30% общей магической силы/);
  assert.match(itemById("Holy Crystal").passive, /21–35%/);
  assert.match(itemById("Hunter Strike").passive, /50% скорости передвижения/);
  assert.match(itemById("Ice Queen Wand").passive, /10% на 2 секунды/);
  assert.match(itemById("Malefic Roar").passive, /30% физического пробивания/);
  assert.match(itemById("Golden Staff").passive, /Endless Strike/);
  assert.match(itemById("Lightning Truncheon").passive, /Каждые 6 секунд/);
  assert.equal(items.filter(item => item.verification === "checked against item detail page").length, 42);
  for (const item of items) {
    assert.ok(item.name, "item name is required");
    assert.ok(item.description?.length > 15, item.name + " needs a description");
    assert.ok(categories.has(item.category), item.name + " needs a valid shop category");
    assert.ok(item.source?.startsWith("https://"), item.name + " needs provenance");
    assert.ok(item.checkedAt, item.name + " needs a verification date");
    assert.ok(["partial", "checked against item detail page"].includes(item.verification), item.name + " needs a clear verification status");
  }
});

test("encyclopedia groups equipment cards under their shop category headings", () => {
  assert.match(appSource, /group\.type==="item"\)list\.sort/);
  assert.match(appSource, /ency-subgroup-heading/);
});
