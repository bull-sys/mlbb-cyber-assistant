import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { Script } from "node:vm";
import { parseHeroGrowthPage } from "../server/hero-growth-adapter.js";

const helcurtFixture = `
<h2>Base stats</h2>
<table>
<thead><tr><th>Stat</th><th>Lv 1</th><th>Lv 15</th><th>Per level</th></tr></thead>
<tbody>
<tr><td>HP</td><td>2,599</td><td>4,853</td><td>161</td></tr>
<tr><td>HP Regen</td><td>7</td><td>13.2</td><td>0.44</td></tr>
<tr><td>Physical Attack</td><td>121</td><td>275</td><td>11</td></tr>
<tr><td>Physical Defense</td><td>17</td><td>73</td><td>4</td></tr>
<tr><td>Magic Defense</td><td>15</td><td>50</td><td>2.5</td></tr>
<tr><td>Attack Speed</td><td>1.17</td><td>1.46</td><td>0.02</td></tr>
<tr><td>Movement Speed</td><td>255</td><td>255</td><td></td></tr>
</tbody></table>
<p>Data updated Nov 23, 2026</p>`;

test("parses hero base-stat growth values and source date", () => {
  const result = parseHeroGrowthPage(helcurtFixture, "helcurt");
  assert.equal(result.error, null);
  assert.deepEqual(result.stats.hp, { level1: 2599, level15: 4853, perLevel: 161 });
  assert.deepEqual(result.stats.physicalAttack, { level1: 121, level15: 275, perLevel: 11 });
  assert.deepEqual(result.stats.movementSpeed, { level1: 255, level15: 255, perLevel: null });
  assert.equal(result.source.updatedAt, "2026-11-23");
});

test("does not invent growth when the source does not publish it", () => {
  const result = parseHeroGrowthPage("<h2>Base stats</h2><table><tr><td>Movement Speed</td><td>255</td><td>255</td><td></td></tr></table>", "hero");
  assert.equal(result.stats.movementSpeed.perLevel, null);
});

test("returns a clear error for missing stat tables", () => {
  const result = parseHeroGrowthPage("<h2>Hero info</h2>", "hero");
  assert.equal(result.error, "Base stats section not found");
  assert.deepEqual(result.stats, {});
});

test("encyclopedia client script remains syntactically valid", async () => {
  const app = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  assert.doesNotThrow(() => new Script(app));
});
