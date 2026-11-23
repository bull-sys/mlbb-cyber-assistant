const SOURCE_BASE = "https://mlbb.io/en/hero/";
const CACHE_TTL = 12 * 60 * 60 * 1000;
const cache = new Map();
const inFlight = new Map();

const LABELS = new Map([
  ["hp", "hp"], ["health", "hp"], ["health points (hp)", "hp"],
  ["hp regen", "hpRegen"], ["health regen", "hpRegen"], ["health regeneration", "hpRegen"],
  ["mana", "mana"], ["mana regen", "manaRegen"], ["mana regeneration", "manaRegen"],
  ["physical attack", "physicalAttack"], ["physical atk", "physicalAttack"],
  ["physical defense", "physicalDefense"], ["physical def", "physicalDefense"],
  ["magic power", "magicPower"], ["magical power", "magicPower"],
  ["magic defense", "magicDefense"], ["magical defense", "magicDefense"], ["magical def", "magicDefense"],
  ["attack speed", "attackSpeed"], ["movement speed", "movementSpeed"],
  ["basic attack range", "basicAttackRange"]
]);

function cleanText(value) {
  return String(value || "")
    .replace(/<script[\\s\\S]*?<\\/script>/giu, " ")
    .replace(/<style[\\s\\S]*?<\\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/giu, " ").replace(/&amp;/giu, "&")
    .replace(/&#39;/giu, "'").replace(/&quot;/giu, '"')
    .replace(/\\s+/gu, " ").trim();
}

function numberFrom(value) {
  const text = cleanText(value).replace(/,/g, "").replace(/%/g, "").trim();
  if (!text || text === "—" || text === "-" || text.toLowerCase() === "n/a") return null;
  const match = text.match(/[+-]?\\d+(?:\\.\\d+)?/);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) ? number : null;
}

function parseBaseStatsTable(html) {
  const source = String(html || "");
  const heading = source.search(/base\\s+stats/i);
  if (heading < 0) return { stats: {}, error: "Base stats section not found" };
  const tail = source.slice(heading);
  const tableStart = tail.search(/<table\\b/i);
  if (tableStart < 0) return { stats: {}, error: "Base stats table not found" };
  const tableMatch = tail.slice(tableStart).match(/<table\\b[^>]*>([\\s\\S]*?)<\\/table>/i);
  if (!tableMatch) return { stats: {}, error: "Base stats table is incomplete" };

  const stats = {};
  const rows = tableMatch[1].match(/<tr\\b[^>]*>[\\s\\S]*?<\\/tr>/giu) || [];
  for (const row of rows) {
    const cells = [...row.matchAll(/<(?:td|th)\\b[^>]*>([\\s\\S]*?)<\\/(?:td|th)>/giu)]
      .map(match => cleanText(match[1]));
    if (cells.length < 2) continue;
    const key = LABELS.get(cells[0].toLowerCase().replace(/\\s+/g, " ").trim());
    if (!key) continue;
    const level1 = numberFrom(cells[1]);
    const level15 = numberFrom(cells[2]);
    const perLevel = numberFrom(cells[3]);
    if (level1 === null && level15 === null) continue;
    stats[key] = { level1, level15, perLevel };
  }

  return Object.keys(stats).length
    ? { stats, error: null }
    : { stats: {}, error: "No recognized base-stat rows found" };
}

function pageUpdatedAt(html) {
  const text = cleanText(String(html || "").slice(0, 180000));
  const match = text.match(/Data updated\\s+([A-Za-z]{3,9}\\s+\\d{1,2},\\s+\\d{4})/i);
  if (!match) return null;
  const date = new Date(match[1]);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

export function parseHeroGrowthPage(html, heroId = "") {
  const parsed = parseBaseStatsTable(html);
  return {
    heroId,
    stats: parsed.stats,
    source: {
      name: "MLBB.io",
      url: SOURCE_BASE + encodeURIComponent(heroId),
      updatedAt: pageUpdatedAt(html)
    },
    error: parsed.error
  };
}

export async function getHeroGrowthData(hero) {
  const slug = String(hero?.id || hero?.nameEn || "")
    .normalize("NFKD").replace(/[\\u0300-\\u036f]/gu, "")
    .toLowerCase().replace(/&/g, "and").replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) return null;
  const url = SOURCE_BASE + encodeURIComponent(slug);
  const cached = cache.get(slug);
  if (cached && Date.now() - cached.at < CACHE_TTL) return cached.value;
  if (inFlight.has(slug)) return inFlight.get(slug);

  const request = (async () => {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": "MLBB-Cyber-Assistant/1.0 (+hero reference stats)" },
        signal: AbortSignal.timeout(12000)
      });
      if (!response.ok) throw new Error("MLBB.io HTTP " + response.status);
      const html = await response.text();
      const result = parseHeroGrowthPage(html, slug);
      if (!Object.keys(result.stats).length) throw new Error(result.error || "No stat data");
      const value = { ...result, checkedAt: new Date().toISOString() };
      cache.set(slug, { at: Date.now(), value });
      return value;
    } catch {
      return null;
    } finally {
      inFlight.delete(slug);
    }
  })();
  inFlight.set(slug, request);
  return request;
}
