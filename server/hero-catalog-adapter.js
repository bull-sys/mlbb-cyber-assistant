import { heroes } from "./data.js";
import {
  HERO_CATALOG_ROSTER_STATUS,
  heroCatalog
} from "./hero-catalog.js";
import { validateHeroCatalog } from "./hero-catalog-validation.js";

const LEGACY_NAME_BY_CATALOG_ID = Object.freeze({
  jawhead: "Кусака",
  dyrroth: "Диррот"
});

export function isLegacyHeroName(name) {
  return typeof name === "string" && heroes.some(hero => hero.name === name);
}

export function getVerifiedHeroCatalogLegacyMappings(
  catalog = heroCatalog,
  legacyHeroes = heroes
) {
  const mappings = [];

  for (const [id, legacyName] of Object.entries(LEGACY_NAME_BY_CATALOG_ID)) {
    const catalogEntries = catalog.filter(hero => hero.id === id);
    const legacyEntries = legacyHeroes.filter(hero => hero.name === legacyName);
    if (catalogEntries.length !== 1 || legacyEntries.length !== 1) continue;

    const identityStatus = catalogEntries[0].identity?.status;
    if (identityStatus !== "user_confirmed" &&
        identityStatus !== "source_verified") continue;

    mappings.push({ id, legacyName });
  }

  return mappings;
}

export function getHeroCatalogApiFields() {
  return {
    heroCatalog,
    heroCatalogRosterStatus: HERO_CATALOG_ROSTER_STATUS,
    heroCatalogValidation: validateHeroCatalog(heroCatalog),
    heroCatalogLegacyMappings: getVerifiedHeroCatalogLegacyMappings()
  };
}
