import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeRankedCounterPayload,
  normalizeRankedMatchupRank
} from "../server/ranked-matchup-adapter.js";

test("rank labels normalize to the upstream rank filters", () => {
  assert.equal(normalizeRankedMatchupRank("Легенда"), "legend");
  assert.equal(normalizeRankedMatchupRank("Мифическая слава"), "honor");
  assert.equal(normalizeRankedMatchupRank("Мифическая бессмертие"), "glory");
  assert.equal(normalizeRankedMatchupRank("all"), "all");
  assert.equal(normalizeRankedMatchupRank("unknown"), null);
});

test("Rone counter records preserve signed percentage-point impact and missing metadata", () => {
  const payload = {
    code: 0,
    data: {
      records: [{
        _updatedAt: 1795521600000,
        data: {
          main_heroid: 17,
          sub_hero: [
            { heroid: 39, increase_win_rate: 0.048121 },
            { heroid: 40, increase_win_rate: -0.011633 }
          ],
          sub_hero_last: [
            { heroid: 41, increase_win_rate: -0.02004 }
          ]
        }
      }]
    }
  };
  const evidence = normalizeRankedCounterPayload(payload, {
    opponentId: "enemy",
    profileIdByRoneId: new Map([[39, "candidate-positive"], [40, "candidate-negative"], [41, "candidate-last"]]),
    rank: "legend",
    observedAt: "2026-11-24T12:00:00.000Z",
    sourceUrl: "https://arena.rone.dev/api/heroes/eudora/counters?rank=legend&days=15"
  });

  assert.equal(evidence.get("candidate-positive").advantagePp, 4.8);
  assert.equal(evidence.get("candidate-positive").direction, "candidate-favourable");
  assert.equal(evidence.get("candidate-negative").advantagePp, -1.2);
  assert.equal(evidence.get("candidate-negative").direction, "opponent-favourable");
  assert.equal(evidence.get("candidate-last").advantagePp, -2);
  assert.equal(evidence.get("candidate-positive").rankBracket, "legend");
  assert.equal(evidence.get("candidate-positive").windowDays, 15);
  assert.equal(evidence.get("candidate-positive").lane, null);
  assert.equal(evidence.get("candidate-positive").sampleSize, null);
  assert.equal(evidence.get("candidate-positive").patch, null);
  assert.equal(evidence.get("candidate-positive").source, "Rone Arena API");
  assert.equal(evidence.get("candidate-positive").observedAt, "2026-11-24T12:00:00.000Z");
  assert.equal(evidence.get("candidate-positive").sourceUpdatedAt, new Date(1795521600000).toISOString());
});

test("Rone counter normalization skips unknown hero IDs, missing values, and zero padding", () => {
  const evidence = normalizeRankedCounterPayload({
    data: { records: [{ data: {
      main_heroid: 17,
      sub_hero: [
        { heroid: 0, increase_win_rate: 0.2 },
        { heroid: 99, increase_win_rate: 0.3 },
        { heroid: 39, increase_win_rate: 0 }
      ]
    } }] }
  }, {
    opponentId: "enemy",
    profileIdByRoneId: new Map([[39, "candidate"]])
  });
  assert.equal(evidence.size, 0);
});
