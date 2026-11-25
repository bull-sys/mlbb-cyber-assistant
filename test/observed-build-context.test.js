import test from "node:test";
import assert from "node:assert/strict";
import { selectObservedBuild } from "../server/observed-build-context.js";

const sample = {
  ok: true,
  source: { name: "MLBBDex" },
  positions: [{
    id: "jungle", label: "Лес",
    ranks: {
      all: { label: "Все ранги", builds: [{ items: ["A"] }] },
      legend: { label: "Легенда", builds: [{ items: ["B"] }, { items: ["C"] }] },
      honor: { label: "Мифическая честь", builds: [{ items: ["D"] }] },
      glory: { label: "Мифическая слава", builds: [{ items: ["E"] }] }
    }
  }]
};

test("selects the exact lane and rank from observed hero builds", () => {
  const result = selectObservedBuild(sample, { lane: "Лес", rank: "legend" });
  assert.equal(result.status, "available");
  assert.equal(result.position.id, "jungle");
  assert.equal(result.rankUsed, "legend");
  assert.equal(result.rankFallback, false);
  assert.deepEqual(result.builds.map(build => build.items[0]), ["B", "C"]);
});

test("falls back to all ranks only when the requested rank has no build", () => {
  const result = selectObservedBuild(sample, { lane: "Лес", rank: "glory" });
  assert.equal(result.status, "available");
  assert.equal(result.rankUsed, "all");
  assert.equal(result.rankFallback, true);
  assert.equal(result.builds[0].items[0], "A");
});

test("does not substitute another lane when the selected position is absent", () => {
  const result = selectObservedBuild(sample, { lane: "Золото", rank: "all" });
  assert.equal(result.status, "position-unavailable");
  assert.equal(result.builds, undefined);
});

test("reports source failures without fabricating a build", () => {
  const result = selectObservedBuild({ ok: false, error: "HTTP 503" }, { lane: "Лес" });
  assert.equal(result.status, "unavailable");
  assert.equal(result.message, "HTTP 503");
});


test("supports Mythical Honor and Mythical Glory as distinct source ranks", () => {
  const honor = selectObservedBuild(sample, { lane: "Лес", rank: "honor" });
  const glory = selectObservedBuild(sample, { lane: "Лес", rank: "glory" });
  assert.equal(honor.rankUsed, "honor");
  assert.equal(honor.rankLabel, "Мифическая честь");
  assert.equal(honor.builds[0].items[0], "D");
  assert.equal(glory.rankUsed, "glory");
  assert.equal(glory.rankLabel, "Мифическая слава");
  assert.equal(glory.builds[0].items[0], "E");
});
