const STATUS_VALUES = {
  identity: new Set(["pending_review", "user_confirmed", "source_verified"]),
  localization: new Set(["pending_review", "user_confirmed", "client_verified", "source_verified"]),
  role: new Set(["pending_review", "verified"]),
  lanes: new Set(["pending_review", "verified"]),
  tacticalProfile: new Set(["missing", "partial", "complete"])
};

const isRecord = value =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const ownValue = (object, key) => {
  if (!Object.hasOwn(object, key)) return { present: false };
  return { present: true, value: object[key] };
};

/**
 * Validate catalog shape, unique IDs, and verification/completeness statuses.
 * This function does not infer, normalize, or add hero data.
 *
 * @param {unknown} catalog
 * @returns {{ ok: boolean, count: number, errors: string[] }}
 */
export function validateHeroCatalog(catalog) {
  const errors = [];

  if (!Array.isArray(catalog)) {
    return { ok: false, count: 0, errors: ["Catalog must be an array"] };
  }

  const normalizedIds = new Set();

  for (let index = 0; index < catalog.length; index += 1) {
    const label = `Hero at index ${index}`;

    if (!Object.hasOwn(catalog, index)) {
      errors.push(`${label} is a sparse array slot`);
      continue;
    }

    const hero = catalog[index];
    if (!isRecord(hero)) {
      errors.push(`${label} must be an object`);
      continue;
    }

    const idField = ownValue(hero, "id");
    const id = idField.value;
    let heroLabel = label;

    if (!idField.present || typeof id !== "string" || id.trim() === "") {
      errors.push(`${label} has a missing or invalid ID`);
    } else {
      const normalizedId = id.trim().replace(/\s+/gu, " ").toLowerCase();
      heroLabel = id;
      if (normalizedIds.has(normalizedId)) {
        errors.push(`Duplicate ID after normalization: ${id}`);
      } else {
        normalizedIds.add(normalizedId);
      }
    }

    for (const [section, allowedStatuses] of Object.entries(STATUS_VALUES)) {
      const sectionField = ownValue(hero, section);
      if (!sectionField.present || !isRecord(sectionField.value)) {
        errors.push(`${heroLabel}: missing or invalid ${section} section`);
        continue;
      }

      const statusField = ownValue(sectionField.value, "status");
      if (!statusField.present) {
        errors.push(`${heroLabel}: ${section}.status must be an own property`);
      } else if (typeof statusField.value !== "string" ||
                 !allowedStatuses.has(statusField.value)) {
        errors.push(`${heroLabel}: invalid ${section} status`);
      }
    }
  }

  return { ok: errors.length === 0, count: catalog.length, errors };
}

export const HERO_CATALOG_STATUS_VALUES = Object.freeze(
  Object.fromEntries(
    Object.entries(STATUS_VALUES).map(([field, values]) => [
      field,
      Object.freeze([...values])
    ])
  )
);
