const STATUS_VALUES = {
  identity: new Set(["pending_review", "user_confirmed", "source_verified"]),
  localization: new Set(["pending_review", "user_confirmed", "client_verified"]),
  role: new Set(["pending_review", "verified"]),
  lanes: new Set(["pending_review", "verified"]),
  tacticalProfile: new Set(["missing", "partial", "complete"])
};

/**
 * Validate the structure and verification statuses of a hero catalog.
 * This function deliberately does not validate or infer game data.
 *
 * @param {Array<object>} catalog
 * @returns {{ ok: boolean, count: number, errors: string[] }}
 */
export function validateHeroCatalog(catalog) {
  const errors = [];

  if (!Array.isArray(catalog)) {
    return { ok: false, count: 0, errors: ["Catalog must be an array"] };
  }

  const ids = new Set();

  catalog.forEach((hero, index) => {
    const label = `Hero at index ${index}`;
    if (!hero || typeof hero !== "object" || Array.isArray(hero)) {
      errors.push(`${label} must be an object`);
      return;
    }

    if (typeof hero.id !== "string" || hero.id.trim() === "") {
      errors.push(`${label} has a missing or invalid ID`);
    } else if (ids.has(hero.id)) {
      errors.push(`Duplicate ID: ${hero.id}`);
    } else {
      ids.add(hero.id);
    }

    for (const [field, allowed] of Object.entries(STATUS_VALUES)) {
      const status = hero[field]?.status;
      if (!allowed.has(status)) {
        errors.push(`${hero.id || label}: invalid ${field} status`);
      }
    }
  });

  return { ok: errors.length === 0, count: catalog.length, errors };
}

export const HERO_CATALOG_STATUS_VALUES = Object.freeze(
  Object.fromEntries(
    Object.entries(STATUS_VALUES).map(([field, values]) => [field, [...values]])
  )
);
