import test from "node:test";
import assert from "node:assert/strict";
import { emblems, talents } from "../server/data.js";

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
    assert.ok(talent.description?.length > 30, talent.name + " needs a meaningful explanation");
    assert.ok(talent.effect?.length > 12, talent.name + " needs an effect summary");
    assert.ok(talent.source?.startsWith("https://"), talent.name + " needs provenance");
    assert.ok(talent.checkedAt, talent.name + " needs a verification date");
  }
});
