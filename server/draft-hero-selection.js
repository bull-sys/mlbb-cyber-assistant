import { heroes } from "./data.js";
import { heroCatalog } from "./hero-catalog.js";
import { getVerifiedHeroCatalogLegacyMappings } from "./hero-catalog-adapter.js";

const getMappingsById = () => new Map(
  getVerifiedHeroCatalogLegacyMappings().map(mapping => [mapping.id, mapping.legacyName])
);

export function isCatalogHeroId(value) {
  return typeof value === "string" && heroCatalog.some(hero => hero.id === value);
}

export function getDraftHeroOptions() {
  const mappings = getMappingsById();
  return heroCatalog.map(hero => ({
    id: hero.id,
    name: hero.displayNameRu || hero.nameEn || hero.id,
    nameEn: hero.nameEn,
    localizationStatus: hero.localization?.status || "pending_review",
    analysisSupported: mappings.has(hero.id)
  }));
}

export function resolveDraftHeroSelection(value) {
  if (typeof value !== "string" || !value) return null;

  const legacyHero = heroes.find(hero => hero.name === value);
  if (legacyHero) {
    return {
      id: null,
      name: legacyHero.name,
      legacyName: legacyHero.name,
      analysisSupported: true
    };
  }

  const catalogHero = heroCatalog.find(hero => hero.id === value);
  if (!catalogHero) return null;

  const legacyName = getMappingsById().get(catalogHero.id) || null;
  return {
    id: catalogHero.id,
    name: catalogHero.displayNameRu || catalogHero.nameEn || catalogHero.id,
    legacyName,
    analysisSupported: Boolean(legacyName)
  };
}
