import assert from "node:assert/strict";
import test from "node:test";
import { normalizeDraftState } from "../server/draft-state.js";

const options = {
  heroes: new Set(["Хелкарт", "saber", "Тигрил"]),
  lanes: new Set(["Лес", "Мид", "Роум"])
};
const valid = {
  version: 1,
  enemies: ["saber", "Тигрил"],
  allies: ["Хелкарт"],
  lane: "Лес",
  myHero: "saber",
  threats: ["heal", "cc"],
  savedAt: 1795370000000
};

test("draft state accepts known legacy names and catalog IDs", () => {
  assert.deepEqual(normalizeDraftState(valid, options), valid);
});

test("draft state accepts a partially completed draft without a selected lane", () => {
  assert.equal(normalizeDraftState({ ...valid, lane: "" }, options).lane, "");
});

test("draft state rejects unknown hero identifiers and invalid lanes", () => {
  assert.equal(normalizeDraftState({ ...valid, enemies: ["unknown"] }, options), null);
  assert.equal(normalizeDraftState({ ...valid, lane: "unknown" }, options), null);
});

test("draft state enforces team size, uniqueness and threat allowlist", () => {
  assert.equal(normalizeDraftState({ ...valid, enemies: Array(6).fill("saber") }, options), null);
  assert.equal(normalizeDraftState({ ...valid, allies: ["Тигрил", "Тигрил"] }, options), null);
  assert.equal(normalizeDraftState({ ...valid, threats: ["unexpected"] }, options), null);
});

test("draft state rejects malformed versions and timestamps", () => {
  assert.equal(normalizeDraftState({ ...valid, version: 2 }, options), null);
  assert.equal(normalizeDraftState({ ...valid, savedAt: Infinity }, options), null);
  assert.equal(normalizeDraftState(null, options), null);
});
