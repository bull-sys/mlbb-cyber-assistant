const MAX_TEAM_SIZE = 5;
const ALLOWED_THREATS = new Set(["heal", "magic", "speed", "tank", "cc", "physical", "burst"]);
const ALLOWED_RANKS = new Set(["", "all", "epic", "legend", "mythic", "honor", "glory"]);

export function normalizeDraftState(input, { heroes, lanes } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input) || input.version !== 1) return null;
  const allowedHeroes = heroes instanceof Set ? heroes : new Set(heroes || []);
  const allowedLanes = lanes instanceof Set ? lanes : new Set(lanes || []);
  const normalizeTeam = value => {
    if (!Array.isArray(value) || value.length > MAX_TEAM_SIZE) return null;
    if (value.some(item => typeof item !== "string" || !allowedHeroes.has(item))) return null;
    if (new Set(value).size !== value.length) return null;
    return [...value];
  };
  const enemies = normalizeTeam(input.enemies);
  const allies = normalizeTeam(input.allies);
  if (!enemies || !allies) return null;
  if (typeof input.lane !== "string" || (input.lane && !allowedLanes.has(input.lane))) return null;
  if (typeof input.myHero !== "string" || (input.myHero && !allowedHeroes.has(input.myHero))) return null;
  const rank = input.rank === undefined ? "" : input.rank;
  if (typeof rank !== "string" || !ALLOWED_RANKS.has(rank)) return null;
  if (!Array.isArray(input.threats) || input.threats.length > ALLOWED_THREATS.size) return null;
  if (input.threats.some(item => typeof item !== "string" || !ALLOWED_THREATS.has(item))) return null;
  if (new Set(input.threats).size !== input.threats.length) return null;
  const savedAt = Number(input.savedAt);
  if (!Number.isSafeInteger(savedAt) || savedAt < 0) return null;
  return {
    version: 1,
    enemies,
    allies,
    lane: input.lane,
    rank,
    myHero: input.myHero,
    threats: [...input.threats],
    savedAt
  };
}
