import { heroes } from "./data.js";
import {
  HERO_CATALOG_ROSTER_STATUS,
  heroCatalog
} from "./hero-catalog.js";
import { validateHeroCatalog } from "./hero-catalog-validation.js";

const CONFIGURED_MAPPINGS = Object.freeze([
  Object.freeze({ id: "jawhead", legacyName: "Кусака" }),
  Object.freeze({ id: "dyrroth", legacyName: "Диррот" })
]);

export function isLegacyHeroName(name) {
  return typeof name === "string" && heroes.some(hero => hero.name === name);
}

export function getVerifiedHeroCatalogLegacyMappings(
  catalog = heroCatalog,
  legacyHeroes = heroes,
  configuredMappings = CONFIGURED_MAPPINGS
) {
  if (!Array.isArray(catalog) ||
      !Array.isArray(legacyHeroes) ||
      !Array.isArray(configuredMappings)) return [];

  const validMappings = configuredMappings.filter(mapping =>
    mapping !== null &&
    typeof mapping === "object" &&
    typeof mapping.id === "string" &&
    mapping.id.trim() !== "" &&
    typeof mapping.legacyName === "string" &&
    mapping.legacyName.trim() !== ""
  );
  const configuredIdCounts = new Map();
  const configuredNameCounts = new Map();
  for (const { id, legacyName } of validMappings) {
    configuredIdCounts.set(id, (configuredIdCounts.get(id) || 0) + 1);
    configuredNameCounts.set(
      legacyName,
      (configuredNameCounts.get(legacyName) || 0) + 1
    );
  }

  const mappings = [];

  for (const { id, legacyName } of validMappings) {
    if (configuredIdCounts.get(id) !== 1 ||
        configuredNameCounts.get(legacyName) !== 1) continue;

    const catalogEntries = catalog.filter(hero => hero?.id === id);
    const legacyEntries = legacyHeroes.filter(hero => hero?.name === legacyName);
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
