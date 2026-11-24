import { heroes } from "./data.js";
import { heroCatalog } from "./hero-catalog.js";
import { heroProfiles } from "./hero-profiles.js";
import { getVerifiedHeroCatalogLegacyMappings } from "./hero-catalog-adapter.js";

const mappings = getVerifiedHeroCatalogLegacyMappings();
const mappingById = new Map(mappings.map(mapping => [mapping.id, mapping.legacyName]));
const mappingByLegacyName = new Map(mappings.map(mapping => [mapping.legacyName, mapping.id]));
const profilesById = new Map(heroProfiles.map(profile => [profile.id, profile]));
const roleNames = {
  Assassin: "Убийца", Fighter: "Боец", Marksman: "Стрелок",
  Mage: "Маг", Tank: "Танк", Support: "Поддержка"
};
const laneNames = {
  Jungle: "Лес", Roam: "Роум", "EXP Lane": "Опыт",
  "Gold Lane": "Золото", "Mid Lane": "Мид"
};

function makeBaselineProfile(hero) {
  const roles = (hero.role?.values || []).map(role => roleNames[role] || role);
  const lanes = [hero.lanes?.primary, ...(hero.lanes?.flexible || [])]
    .filter(Boolean).map(lane => laneNames[lane] || lane);
  return {
    id: hero.id,
    names: { ru: hero.displayNameRu || hero.nameEn || hero.id, en: hero.nameEn, aliases: [] },
    roles,
    lanes,
    combat: {
      damage: "unknown", range: "unknown", mobility: "unknown", burst: "unknown",
      dps: "unknown", durability: "unknown", sustain: "unknown", control: "unknown",
      engage: "unknown", disengage: "unknown", waveClear: "unknown", objectiveDamage: "unknown"
    },
    mechanics: [], strengths: [], weaknesses: [],
    matchups: { strongAgainst: [], weakAgainst: [] },
    synergies: [], itemNotes: [], confidence: "unverified",
    analysisDepth: "baseline"
  };
}

export function getDraftHeroAnalysisProfiles() {
  return heroCatalog.map(hero => {
    const profile = profilesById.get(hero.id);
    return profile ? { ...profile, analysisDepth: "detailed" } : makeBaselineProfile(hero);
  });
}

const analysisProfiles = getDraftHeroAnalysisProfiles();
const analysisProfilesById = new Map(analysisProfiles.map(profile => [profile.id, profile]));

export function isCatalogHeroId(value) {
  return typeof value === "string" && heroCatalog.some(hero => hero.id === value);
}

export function getDraftHeroOptions() {
  return heroCatalog.map(hero => {
    const profile = analysisProfilesById.get(hero.id);
    return {
      id: hero.id,
      name: hero.displayNameRu || hero.nameEn || hero.id,
      nameEn: hero.nameEn,
      localizationStatus: hero.localization?.status || "pending_review",
      analysisSupported: true,
      analysisDepth: profile?.analysisDepth || "baseline",
      tacticalProfileStatus: hero.tacticalProfile?.status || "missing"
    };
  });
}

export function resolveDraftHeroSelection(value) {
  if (typeof value !== "string" || !value) return null;

  let catalogHero = heroCatalog.find(hero => hero.id === value) || null;
  if (!catalogHero) {
    const mappedId = mappingByLegacyName.get(value);
    if (mappedId) catalogHero = heroCatalog.find(hero => hero.id === mappedId) || null;
  }
  if (!catalogHero) {
    const matchingProfile = heroProfiles.find(profile => profile.names?.ru === value);
    if (matchingProfile) catalogHero = heroCatalog.find(hero => hero.id === matchingProfile.id) || null;
  }
  if (!catalogHero) {
    catalogHero = heroCatalog.find(hero => hero.displayNameRu === value || hero.nameEn === value) || null;
  }

  if (catalogHero) {
    const profile = analysisProfilesById.get(catalogHero.id);
    const canonicalName = profile?.names?.ru || catalogHero.displayNameRu || catalogHero.nameEn || catalogHero.id;
    return {
      id: catalogHero.id,
      name: catalogHero.displayNameRu || catalogHero.nameEn || catalogHero.id,
      legacyName: canonicalName,
      analysisSupported: true,
      analysisDepth: profile?.analysisDepth || "baseline"
    };
  }

  const legacyHero = heroes.find(hero => hero.name === value);
  if (legacyHero) {
    return {
      id: null,
      name: legacyHero.name,
      legacyName: legacyHero.name,
      analysisSupported: true,
      analysisDepth: "legacy"
    };
  }
  return null;
}
