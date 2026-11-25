const DAMAGE_KINDS = Object.freeze(["physical", "magic"]);

export function getCombatDamageKinds(profile, hero) {
  const raw = String(profile?.combat?.damage || "").toLowerCase();
  const kinds = new Set();

  if (raw.includes("physical")) kinds.add("physical");
  if (raw.includes("magic")) kinds.add("magic");
  if (raw === "mixed") {
    kinds.add("physical");
    kinds.add("magic");
  }

  // Hero tags may confirm a damage type, but hero class is not a damage type:
  // assassins and fighters can deal magic damage, and mages can deal physical.
  for (const tag of hero?.tags || []) {
    if (DAMAGE_KINDS.includes(tag)) kinds.add(tag);
  }

  return [...kinds];
}

export function hasCombatDamageKind(profile, hero, kind) {
  return getCombatDamageKinds(profile, hero).includes(kind);
}
