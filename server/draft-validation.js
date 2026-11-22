export function isValidDraftRequest(body, roles, isHeroName) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;

  const { lane, enemies, myHero = "" } = body;
  const allies = body.allies === undefined ? [] : body.allies;

  if (!Array.isArray(roles) || !roles.includes(lane)) return false;
  if (!Array.isArray(enemies) || enemies.length > 5) return false;
  if (!Array.isArray(allies) || allies.length > 5) return false;
  if (typeof isHeroName !== "function") return false;

  const validUniquePicks = picks =>
    picks.every(name => typeof name === "string" && isHeroName(name)) &&
    new Set(picks).size === picks.length;

  if (!validUniquePicks(enemies) || !validUniquePicks(allies)) return false;
  if (typeof myHero !== "string" || (myHero !== "" && !isHeroName(myHero))) return false;

  return true;
}
