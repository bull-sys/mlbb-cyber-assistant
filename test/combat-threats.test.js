import assert from "node:assert/strict";
import test from "node:test";
import { getCombatDamageKinds, hasCombatDamageKind } from "../server/combat-threats.js";

test("uses the explicit damage profile instead of guessing from hero class", () => {
  assert.deepEqual(getCombatDamageKinds({ combat: { damage: "magic" } }, { type: "assassin" }), ["magic"]);
  assert.deepEqual(getCombatDamageKinds({ combat: { damage: "physical" } }, { type: "mage" }), ["physical"]);
});

test("recognizes hybrid and physical-plus-true damage profiles", () => {
  assert.deepEqual(getCombatDamageKinds({ combat: { damage: "physical_and_magic" } }), ["physical", "magic"]);
  assert.deepEqual(getCombatDamageKinds({ combat: { damage: "physical_and_true" } }), ["physical", "true"]);
  assert.deepEqual(getCombatDamageKinds({ combat: { damage: "physical_true" } }), ["physical", "true"]);
  assert.deepEqual(getCombatDamageKinds({ combat: { damage: "magic_and_true" } }), ["magic", "true"]);
  assert.deepEqual(getCombatDamageKinds({ combat: { damage: "mixed" } }), ["physical", "magic"]);
});

test("uses explicit damage tags only when profile damage is unavailable", () => {
  assert.deepEqual(getCombatDamageKinds(null, { tags: ["physical", "control"] }), ["physical"]);
  assert.deepEqual(getCombatDamageKinds(null, { type: "mage", tags: ["control"] }), []);
});

test("does not classify unknown or empty damage as physical or magic", () => {
  assert.equal(hasCombatDamageKind({ combat: { damage: "unknown" } }, { type: "fighter" }, "physical"), false);
  assert.equal(hasCombatDamageKind(null, { type: "assassin" }, "magic"), false);
});

test("treats very high burst as a defensive threat, not only high burst", async () => {
  const { isHighBurstThreat } = await import("../server/combat-threats.js");
  assert.equal(isHighBurstThreat({ combat: { burst: "very_high" } }, {}), true);
  assert.equal(isHighBurstThreat({ combat: { burst: "high" } }, {}), true);
  assert.equal(isHighBurstThreat({ combat: { burst: "medium" } }, {}), false);
});


test("recognizes Karina-style magic plus true damage without treating true damage as physical", () => {
  const profile = { combat: { damage: "magic_and_true" } };
  assert.deepEqual(getCombatDamageKinds(profile), ["magic", "true"]);
  assert.equal(hasCombatDamageKind(profile, {}, "magic"), true);
  assert.equal(hasCombatDamageKind(profile, {}, "true"), true);
  assert.equal(hasCombatDamageKind(profile, {}, "physical"), false);
});
