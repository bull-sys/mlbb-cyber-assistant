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
  assert.ok(items.length >= 54);
  const categories = new Set(items.map(item => item.category));
  assert.deepEqual(
    [...categories].sort(),
    ["Атака", "Защита", "Лес", "Магия", "Передвижение", "Роум"].sort()
  );
  const adaptive = items.filter(item => item.secondaryCategory === "Магия");
  assert.deepEqual(adaptive.map(item => item.englishName).sort(), ["Fleeting Time", "Sky Piercer"].sort());
  for (const item of items) {
    assert.ok(item.name, "item name is required");
    assert.ok(item.description?.length > 15, item.name + " needs a description");
    assert.ok(categories.has(item.category), item.name + " needs a valid shop category");
  }
});

test("encyclopedia groups equipment cards under their shop category headings", () => {
  assert.match(appSource, /group\.type==="item"\)list\.sort/);
  assert.match(appSource, /ency-subgroup-heading/);
});
