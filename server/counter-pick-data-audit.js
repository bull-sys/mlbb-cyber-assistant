import { heroCatalog } from "./hero-catalog.js";
import { heroProfiles } from "./hero-profiles.js";
import { heroes as legacyDraftCandidates } from "./data.js";

const REQUIRED_COMBAT_FIELDS = [
  "damage", "range", "mobility", "burst", "dps", "durability",
  "sustain", "control", "engage", "disengage", "waveClear", "objectiveDamage"
];

const LANE_ALIASES = new Map([
  ["Опыт", "EXP"],
  ["Линия опыта", "EXP"],
  ["EXP-линия", "EXP"],
  ["Золотая линия", "Золото"],
  ["Линия золота", "Золото"],
  ["Центр", "Мид"],
  ["Средняя линия", "Мид"]
]);

export function buildCounterPickDataAudit({
  catalog = heroCatalog,
  profiles = heroProfiles,
  legacyCandidates = legacyDraftCandidates
} = {}) {
  const catalogIds = new Set(catalog.map(hero => hero.id));
  const profileIds = new Set(profiles.map(hero => hero.id));
  const missingProfiles = catalog
    .filter(hero => !profileIds.has(hero.id))
    .map(hero => hero.id);
  const profilesOutsideCatalog = profiles
    .filter(hero => !catalogIds.has(hero.id))
    .map(hero => hero.id);

  const matchupTargets = new Set();
  let strongMatchupCount = 0;
  let weakMatchupCount = 0;
  const profilesWithoutMatchupEvidence = [];
  const profilesWithRankedMatchupEvidence = [];
  const profilesWithDatedMethodReview = [];
  const incompleteCombatProfiles = [];

  for (const hero of profiles) {
    const strong = Array.isArray(hero.matchups?.strongAgainst)
      ? hero.matchups.strongAgainst
      : [];
    const weak = Array.isArray(hero.matchups?.weakAgainst)
      ? hero.matchups.weakAgainst
      : [];

    strongMatchupCount += strong.length;
    weakMatchupCount += weak.length;
    for (const id of [...strong, ...weak]) matchupTargets.add(id);

    const evidence = hero.matchupEvidence;
    const hasRankedEvidence = Boolean(
      evidence?.source && evidence?.method && evidence?.checkedAt
    );
    const hasDatedMethodReview = Boolean(
      hero.matchupsReviewedAt && hero.matchupsMethod
    );

    if (hasRankedEvidence) profilesWithRankedMatchupEvidence.push(hero.id);
    if (hasDatedMethodReview) profilesWithDatedMethodReview.push(hero.id);
    if (!hasRankedEvidence && !hasDatedMethodReview) {
      profilesWithoutMatchupEvidence.push(hero.id);
    }

    const missingFields = REQUIRED_COMBAT_FIELDS.filter(field =>
      hero.combat?.[field] === undefined ||
      hero.combat?.[field] === null ||
      hero.combat?.[field] === ""
    );
    if (missingFields.length) {
      incompleteCombatProfiles.push({ id: hero.id, fields: missingFields });
    }
  }

  const matchupTargetsWithoutProfile = [...matchupTargets]
    .filter(id => !profileIds.has(id))
    .sort();

  const laneCoverage = {};
  for (const hero of profiles) {
    for (const rawLane of hero.lanes || []) {
      const lane = LANE_ALIASES.get(rawLane) || rawLane;
      laneCoverage[lane] = (laneCoverage[lane] || 0) + 1;
    }
  }

  return {
    catalogCount: catalog.length,
    profileCount: profiles.length,
    missingProfiles,
    profilesOutsideCatalog,
    matchup: {
      strongMatchupCount,
      weakMatchupCount,
      uniqueTargets: matchupTargets.size,
      targetsWithoutProfile: matchupTargetsWithoutProfile,
      profilesWithRankedEvidence: profilesWithRankedMatchupEvidence.length,
      profilesWithDatedMethodReview: profilesWithDatedMethodReview.length,
      profilesWithoutEvidence: profilesWithoutMatchupEvidence
    },
    incompleteCombatProfiles,
    laneCoverage,
    legacyDraftCandidateCount: legacyCandidates.length
  };
}
