import assert from "node:assert/strict";
import test from "node:test";
import {
  getRankedMatchupEvidence,
  normalizeRankedCounterPayload,
  normalizeRankedMatchupRank
} from "../server/ranked-matchup-adapter.js";
import { heroProfiles } from "../server/hero-profiles.js";

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


test("ranked evidence fetch maps upstream hero IDs and requests the selected rank window", async () => {
  const enemy = heroProfiles.find(profile => profile.names.ru === "Эйдора");
  const candidate = heroProfiles.find(profile => profile.names.ru === "Кэрри");
  const requested = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => {
    const value = String(url);
    requested.push(value);
    if (value.includes("/heroes/rank?")) {
      return {
        ok: true,
        json: async () => ({
          code: 0,
          data: { records: [
            { data: { main_heroid: 17, main_hero: { data: { name: "Eudora" } } } },
            { data: { main_heroid: 39, main_hero: { data: { name: "Karrie" } } } }
          ] }
        })
      };
    }
    if (value.includes("/heroes/Eudora/counters?")) {
      return {
        ok: true,
        json: async () => ({
          code: 0,
          data: { records: [{
            _updatedAt: 1795521600000,
            data: {
              main_heroid: 17,
              sub_hero: [{ heroid: 39, increase_win_rate: 0.03125 }]
            }
          }] }
        })
      };
    }
    throw new Error("Unexpected upstream URL: " + value);
  };

  try {
    const result = await getRankedMatchupEvidence([enemy], "Легенда", heroProfiles);
    const evidence = result.byOpponent[enemy.id]?.[candidate.id];
    assert.ok(evidence);
    assert.equal(evidence.advantagePp, 3.1);
    assert.equal(evidence.rankBracket, "legend");
    assert.equal(evidence.windowDays, 15);
    assert.equal(evidence.lane, null);
    assert.equal(evidence.sampleSize, null);
    assert.equal(result.metadata.status, "available");
    assert.equal(result.metadata.laneScoped, false);
    assert.ok(requested.some(url => url.includes("rank=all") && url.includes("size=200")));
    assert.ok(requested.some(url => url.includes("rank=legend") && url.includes("days=15")));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
