/**
 * MLBB Cyber Assistant
 * Structured Hero Knowledge Base
 */

export const HERO_DB_VERSION = "0.1.0";
export const HERO_DB_PATCH = "2.2.23";

export const heroProfiles = [
  {
    id: "jawhead",
    names: {
      ru: "Кусака",
      en: "Jawhead",
      aliases: []
    },
    roles: ["Боец"],
    lanes: ["Роум", "Опыт"],
    combat: {
      damage: "physical",
      range: "melee",
      mobility: "high",
      burst: "high",
      dps: "medium",
      durability: "medium",
      sustain: "unknown",
      control: "displacement",
      engage: "high",
      disengage: "medium",
      waveClear: "unknown",
      objectiveDamage: "unknown"
    },
    mechanics: [],
    strengths: [],
    weaknesses: [],
    matchups: {
      strongAgainst: [],
      weakAgainst: []
    },
    synergies: [],
    itemNotes: [],
    teamfight: {
      preferredPlan: null,
      targetPriority: [],
      avoid: []
    },
    sources: [],
    patch: {
      version: HERO_DB_PATCH,
      notes: [],
      reviewedAt: null
    },
    confidence: "partial"
  },

  {
    id: "saber",
    names: {
      ru: "Сабер",
      en: "Saber",
      aliases: []
    },
    roles: ["Убийца"],
    lanes: ["Лес", "Роум"],
    combat: {
      damage: "physical",
      range: "melee",
      mobility: "medium",
      burst: "high",
      dps: "low",
      durability: "low",
      sustain: "unknown",
      control: "single_target",
      engage: "high",
      disengage: "medium",
      waveClear: "unknown",
      objectiveDamage: "unknown"
    },
    mechanics: [],
    strengths: [],
    weaknesses: [],
    matchups: {
      strongAgainst: [],
      weakAgainst: []
    },
    synergies: [],
    itemNotes: [],
    teamfight: {
      preferredPlan: null,
      targetPriority: [],
      avoid: []
    },
    sources: [],
    patch: {
      version: HERO_DB_PATCH,
      notes: [],
      reviewedAt: null
    },
    confidence: "partial"
  }
];

export function validateHeroProfiles(profiles = heroProfiles) {
  const errors = [];
  const ids = new Set();

  for (const hero of profiles) {
    if (!hero.id) {
      errors.push("Missing hero ID");
      continue;
    }

    if (ids.has(hero.id)) {
      errors.push("Duplicate ID: " + hero.id);
    }

    ids.add(hero.id);

    if (!hero.names?.ru) {
      errors.push(hero.id + ": missing Russian name");
    }

    if (!hero.matchups?.strongAgainst ||
        !hero.matchups?.weakAgainst) {
      errors.push(hero.id + ": missing matchup data");
    }
  }

  return {
    ok: errors.length === 0,
    count: profiles.length,
    errors
  };
}
