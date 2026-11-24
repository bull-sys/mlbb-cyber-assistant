const BASE = "https://arena.rone.dev/api";
const TTL = 30 * 60 * 1000;
const cache = new Map();

const normalizeName = value => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/gu, "")
  .toLowerCase()
  .replace(/[^a-z0-9]/gu, "");

const rankAliases = new Map([
  ["all", "all"], ["Эпик", "epic"], ["epic", "epic"],
  ["Легенда", "legend"], ["legend", "legend"],
  ["Мифик", "mythic"], ["mythic", "mythic"],
  ["Мифическая слава", "honor"], ["honor", "honor"],
  ["Мифическая бессмертие", "glory"], ["glory", "glory"]
]);

export function normalizeRankedMatchupRank(value) {
  return rankAliases.get(String(value || "").trim()) || null;
}

async function cachedJson(key, url) {
  const previous = cache.get(key);
  if (previous && Date.now() - previous.at < TTL) return previous.value;
  const response = await fetch(url, {
    headers: { "user-agent": "MLBB-Cyber-Assistant/1.0" },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error("Rone Arena HTTP " + response.status);
  const payload = await response.json();
  if (payload?.code !== 0 || !payload?.data) throw new Error("Unexpected Rone Arena response");
  cache.set(key, { at: Date.now(), value: payload });
  return payload;
}

function recordsOf(payload) {
  const records = payload?.data?.records;
  return Array.isArray(records) ? records : [];
}

function heroIdMapFromRankings(payload, profiles) {
  const idByProfile = new Map();
  const profileByName = new Map();
  for (const profile of profiles) {
    for (const name of [profile.names?.en, ...(profile.names?.aliases || [])]) {
      const normalized = normalizeName(name);
      if (normalized) profileByName.set(normalized, profile.id);
    }
  }
  const profileIdByRoneId = new Map();
  for (const record of recordsOf(payload)) {
    const data = record?.data || {};
    const id = Number(data.main_heroid);
    const name = data.main_hero?.data?.name;
    const profileId = profileByName.get(normalizeName(name));
    if (Number.isInteger(id) && id > 0 && profileId) {
      profileIdByRoneId.set(id, profileId);
      idByProfile.set(profileId, id);
    }
  }
  return { profileIdByRoneId, idByProfile };
}

export function normalizeRankedCounterPayload(payload, {
  opponentId,
  profileIdByRoneId,
  rank = "all",
  observedAt = new Date().toISOString(),
  sourceUrl = null
} = {}) {
  const records = recordsOf(payload);
  const result = new Map();
  for (const record of records) {
    const data = record?.data || {};
    if (data.main_heroid == null) continue;
    const updated = Number(record._updatedAt || record._createdAt || 0);
    const updatedAt = Number.isFinite(updated) && updated > 0
      ? new Date(updated).toISOString()
      : null;
    for (const field of ["sub_hero", "sub_hero_last"]) {
      const entries = Array.isArray(data[field]) ? data[field] : [];
      for (const entry of entries) {
        const roneId = Number(entry?.heroid);
        const candidateId = profileIdByRoneId.get(roneId);
        const impact = Number(entry?.increase_win_rate);
        if (!candidateId || !Number.isFinite(impact) || impact === 0) continue;
        result.set(candidateId, {
          opponentId,
          candidateId,
          source: "Rone Arena API",
          sourceUrl,
          observedAt,
          sourceUpdatedAt: updatedAt,
          patch: null,
          rankBracket: rank,
          windowDays: 15,
          lane: null,
          advantagePp: Math.round(impact * 1000) / 10,
          sampleSize: null,
          direction: impact > 0 ? "candidate-favourable" : "opponent-favourable",
          evidenceKind: "measured-ranked-pair",
          confidence: "ranked-signal-no-sample-size"
        });
      }
    }
  }
  return result;
}

export async function getRankedMatchupEvidence(enemyProfiles, requestedRank, profiles) {
  const rank = normalizeRankedMatchupRank(requestedRank) || "all";
  const observedAt = new Date().toISOString();
  const metadata = {
    source: "Rone Arena API",
    rankBracket: rank,
    windowDays: 15,
    laneScoped: false,
    sampleSizeAvailable: false,
    observedAt,
    status: "unavailable"
  };
  const byOpponent = {};
  if (!Array.isArray(enemyProfiles) || !enemyProfiles.length) {
    return { byOpponent, metadata: { ...metadata, status: "no-enemies" } };
  }

  try {
    const rankingUrl = BASE + "/heroes/rank?days=15&rank=all&sort_field=win_rate&sort_order=desc&size=200&index=1&lang=en";
    const rankings = await cachedJson("hero-id-map", rankingUrl);
    const { profileIdByRoneId, idByProfile } = heroIdMapFromRankings(rankings, profiles);
    if (!profileIdByRoneId.size) throw new Error("Rone Arena hero ID map is empty");

    const results = await Promise.all(enemyProfiles.map(async opponent => {
      const enemyId = idByProfile.get(opponent.id);
      if (!enemyId) return { opponentId: opponent.id, evidence: new Map(), unavailable: true };
      const url = BASE + "/heroes/" + encodeURIComponent(opponent.names?.en || opponent.id) +
        "/counters?rank=" + encodeURIComponent(rank) + "&days=15&size=200&index=1&lang=en";
      try {
        const payload = await cachedJson("counter:" + rank + ":" + opponent.id, url);
        const matchingPayload = {
          ...payload,
          data: {
            ...payload.data,
            records: recordsOf(payload).filter(record =>
              Number(record?.data?.main_heroid) === enemyId
            )
          }
        };
        return {
          opponentId: opponent.id,
          evidence: normalizeRankedCounterPayload(matchingPayload, {
            opponentId: opponent.id,
            profileIdByRoneId,
            rank,
            observedAt,
            sourceUrl: url
          }),
          unavailable: false
        };
      } catch {
        return { opponentId: opponent.id, evidence: new Map(), unavailable: true };
      }
    }));

    let successful = 0;
    for (const result of results) {
      byOpponent[result.opponentId] = Object.fromEntries(result.evidence);
      if (!result.unavailable) successful += 1;
    }
    metadata.status = successful === results.length
      ? "available"
      : successful > 0 ? "partial" : "unavailable";
    metadata.opponentsRequested = results.length;
    metadata.opponentsAvailable = successful;
  } catch {
    metadata.status = "unavailable";
  }

  return { byOpponent, metadata };
}
