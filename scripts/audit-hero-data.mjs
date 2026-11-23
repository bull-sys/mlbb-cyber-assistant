import { mkdir, writeFile } from "node:fs/promises";
import { heroCatalog } from "../server/hero-catalog.js";
import { heroReferenceData } from "../server/hero-reference-data.js";
import { parseHeroGrowthPage } from "../server/hero-growth-adapter.js";

const UPSTREAM_URL = "https://raw.githubusercontent.com/achedon12/mlbb/92f0fe94e4226ab6057db25711c4d65b3ca12130/src/data/game/heroes.json";
const GROWTH_BASE = "https://mlbb.io/en/hero/";
const CONCURRENCY = 4;
const TIMEOUT_MS = 12000;
const STAT_KEYS = [
  "hp1", "hp15", "hp_regen1", "hp_regen15", "mana1", "mana15",
  "mana_regen1", "mana_regen15", "physical_atk1", "physical_atk15",
  "physical_def1", "physical_def15", "magic_def1", "magic_def15",
  "atk_spd1", "atk_spd15", "movement_spd", "basic_atk_range"
];
const GROWTH_KEYS = [
  "hp", "hpRegen", "mana", "manaRegen", "physicalAttack",
  "physicalDefense", "magicDefense", "attackSpeed", "movementSpeed"
];
const ROLE_NAMES = ["Assassin", "Fighter", "Mage", "Marksman", "Support", "Tank"];
const normalizeName = value => String(value || "")
  .normalize("NFKD").replace(/[\u0300-\u036f]/gu, "")
  .toLowerCase().replace(/[^a-z0-9]/gu, "");

function pageIdentityAndClassification(html, expectedName) {
  const heading = String(html || "").match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/iu);
  if (!heading) return { heading: null, nameMatches: false, roles: [], lanes: [], status: "heading-not-found" };
const headingText = heading[1].replace(/<[^>]*>/gu, " ").replace(/&amp;/giu, "&").replace(/&#x27;|&#39;/giu, "'").replace(/&quot;/giu, '"').replace(/\s+/gu, " ").trim();
  const offset = (heading.index || 0) + heading[0].length;
  const tail = String(html).slice(offset, offset + 1400);
  const headerText = tail.replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ").replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&").replace(/\s+/gu, " ").trim();
  const roles = ROLE_NAMES.filter(role => new RegExp("\\b" + role + "\\b", "iu").test(headerText));
  const laneAliases = [
    ["Jungle", /\bJungle\b/iu], ["Roam", /\bRoam\b/iu],
    ["Mid", /\bMid(?:\s+Lane)?\b/iu], ["Exp", /\bExp(?:\s+Lane)?\b/iu],
    ["Gold", /\bGold(?:\s+Lane)?\b/iu]
  ];
  const lanes = laneAliases.filter(([, pattern]) => pattern.test(headerText)).map(([lane]) => lane);
  return {
    heading: headingText,
    nameMatches: normalizeName(headingText) === normalizeName(expectedName),
    roles,
    lanes,
    status: roles.length && lanes.length ? "parsed" : "partial"
  };
}

const numeric = value => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};
const sorted = values => [...(values || [])].sort();
const same = (a, b) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
const roleMap = {
  Assassin: "Убийца", Fighter: "Боец", Mage: "Маг",
  Marksman: "Стрелок", Support: "Поддержка", Tank: "Танк"
};
const laneMap = {
  Jungle: "Лес", Roam: "Роум", Mid: "Мид",
  Exp: "Линия опыта", Gold: "Золотая линия"
};

function compareReference(local, source) {
  const differences = [];
  const compare = (field, localValue, sourceValue) => {
    if (JSON.stringify(localValue) !== JSON.stringify(sourceValue)) {
      differences.push({ field, local: localValue ?? null, source: sourceValue ?? null });
    }
  };
  compare("title", local.titleEn, source.title);
  compare("roles", sorted(local.roles.map(item => item.en)), sorted(source.roles));
  compare("lanes", sorted(local.lanes.map(item => item.en)), sorted(source.lanes));
  compare("specialties", sorted(local.specialties.map(item => item.en)), sorted(source.specialties));
  compare("release", local.release, source.release);
  compare("releaseYear", local.releaseYear, source.year);
  compare("resource", local.resource, source.resource);
  compare("region", local.region, source.region);
  for (const key of STAT_KEYS) {
    const left = local.stats?.[key];
    const right = source.stats?.[key];
    const leftNumber = numeric(left), rightNumber = numeric(right);
    const equal = leftNumber !== null && rightNumber !== null
      ? Math.abs(leftNumber - rightNumber) < 0.000001
      : String(left ?? "").trim() === String(right ?? "").trim();
    if (!equal) differences.push({ field: "stats." + key, local: left ?? null, source: right ?? null });
  }
  return differences;
}

function classifyGrowth(stat, key) {
  if (!stat) return "missing";
  const first = numeric(stat.level1), last = numeric(stat.level15), perLevel = numeric(stat.perLevel);
  if (first === null && last === null) return "missing";
  if (key === "movementSpeed" && first !== null && last !== null && first === last) return "fixed";
  if (first === null || last === null) return "single-value";
  if (perLevel === null) return "endpoint-estimate";
  const tolerance = Math.max(0.005, Math.abs(last) * 0.0005);
  return Math.abs(first + perLevel * 14 - last) <= tolerance
    ? "published-growth"
    : "endpoint-estimate";
}

async function fetchWithRetry(url) {
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": "MLBB-Cyber-Assistant-Hero-Audit/1.0",
          "accept-language": "en"
        },
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error("HTTP " + response.status);
        if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 900));
        continue;
      }
      return { response, html: await response.text() };
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  throw lastError || new Error("Request failed");
}

async function auditGrowth(hero) {
  const url = GROWTH_BASE + encodeURIComponent(hero.id);
  try {
    const { response, html } = await fetchWithRetry(url);
    if (!response.ok) return {
      status: "http-error", httpStatus: response.status, url,
      stats: {}, missing: GROWTH_KEYS, chartStatus: {}
    };
    const parsed = parseHeroGrowthPage(html, hero.id);
    const stats = parsed.stats || {};
    const pageProfile = pageIdentityAndClassification(html, hero.nameEn);
    const chartStatus = Object.fromEntries(GROWTH_KEYS.map(key => [
      key, classifyGrowth(stats[key], key)
    ]));
    return {
      status: Object.keys(stats).length ? "parsed" : "unparsed",
      httpStatus: response.status,
      url,
      updatedAt: parsed.source?.updatedAt || null,
      statRows: Object.keys(stats).length,
      stats,
      missing: GROWTH_KEYS.filter(key => !stats[key]),
      chartStatus,
      pageProfile,
      parseError: parsed.error || null
    };
  } catch (error) {
    return {
      status: "request-error", url, stats: {}, missing: GROWTH_KEYS,
      chartStatus: {}, error: String(error?.message || error).slice(0, 180)
    };
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  }));
  return results;
}

let upstream = [], upstreamError = null;
try {
  const response = await fetch(UPSTREAM_URL, {
    headers: { "user-agent": "MLBB-Cyber-Assistant-Hero-Audit/1.0" },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!response.ok) throw new Error("Pinned reference source HTTP " + response.status);
  upstream = await response.json();
} catch (error) {
  upstreamError = String(error?.message || error);
}

const upstreamBySlug = new Map(upstream.map(hero => [hero.slug, hero]));
const localBySlug = new Map(heroReferenceData.map(hero => [hero.id, hero]));
const catalogBySlug = new Map(heroCatalog.map(hero => [hero.id, hero]));
const sourceCoverage = Object.fromEntries(STAT_KEYS.map(key => [
  key, upstream.filter(hero => hero.stats?.[key] !== undefined && hero.stats?.[key] !== null && hero.stats?.[key] !== "").length
]));
const referenceDifferences = [];
const heroes = heroCatalog.map(hero => {
  const local = localBySlug.get(hero.id);
  const source = upstreamBySlug.get(hero.id);
  const differences = local && source ? compareReference(local, source) : [
    { field: "source-record", local: Boolean(local), source: Boolean(source) }
  ];
  if (differences.length) referenceDifferences.push({ id: hero.id, name: hero.nameEn, differences });
  return {
    id: hero.id,
    nameEn: hero.nameEn,
    displayNameRu: hero.displayNameRu,
    identityStatus: hero.identity?.status || "unknown",
    roleStatus: hero.role?.status || "unknown",
    laneStatus: hero.lanes?.status || "unknown",
    referenceRecordPresent: Boolean(local),
    upstreamRecordPresent: Boolean(source),
    referenceDifferences: differences,
    referenceStatPresence: Object.fromEntries(STAT_KEYS.map(key => [
      key, local?.stats?.[key] !== undefined && local?.stats?.[key] !== null && local?.stats?.[key] !== ""
    ]))
  };
});

const growthResults = await mapLimit(heroCatalog, CONCURRENCY, async hero => {
  const result = await auditGrowth(hero);
  const target = heroes.find(item => item.id === hero.id);
  target.liveGrowth = result;
  return result;
});
const countStatuses = key => heroCatalog.reduce((counts, hero) => {
  const value = hero[key]?.status || "unknown";
  counts[value] = (counts[value] || 0) + 1;
  return counts;
}, {});
const growthStatusCounts = Object.fromEntries(GROWTH_KEYS.map(key => [
  key,
  growthResults.reduce((counts, result) => {
    const status = result.chartStatus?.[key] || "missing";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {})
]));
const parsedCount = growthResults.filter(result => result.status === "parsed").length;
const pageProfiles = heroes.map(hero => ({ id: hero.id, nameEn: hero.nameEn, ...(hero.liveGrowth?.pageProfile || {}) }));
const pageClassificationAudit = {
  parsedHeadings: pageProfiles.filter(item => item.status === "parsed").length,
  nameMatches: pageProfiles.filter(item => item.nameMatches).length,
  roleMatches: pageProfiles.filter(item => item.status === "parsed" && JSON.stringify(sorted(item.roles)) === JSON.stringify(sorted(
    heroReferenceData.find(hero => hero.id === item.id)?.roles.map(role => role.en) || []
  ))).length,
  laneMatches: pageProfiles.filter(item => item.status === "parsed" && JSON.stringify(sorted(item.lanes)) === JSON.stringify(sorted(
    heroReferenceData.find(hero => hero.id === item.id)?.lanes.map(lane => lane.en) || []
  ))).length,
  mismatches: pageProfiles.filter(item => {
    const ref = heroReferenceData.find(hero => hero.id === item.id);
    return !item.nameMatches || JSON.stringify(sorted(item.roles)) !== JSON.stringify(sorted(ref?.roles.map(role => role.en) || [])) ||
      JSON.stringify(sorted(item.lanes)) !== JSON.stringify(sorted(ref?.lanes.map(lane => lane.en) || []));
  }).map(item => ({
    id: item.id, nameEn: item.nameEn, heading: item.heading,
    roles: item.roles, lanes: item.lanes, status: item.status
  }))
};
const report = {
  generatedAt: new Date().toISOString(),
  rosterCount: heroCatalog.length,
  localReferenceCount: heroReferenceData.length,
  pinnedUpstreamCount: upstream.length,
  upstreamUrl: UPSTREAM_URL,
  growthSource: "MLBB.io hero Base stats table",
  growthConcurrency: CONCURRENCY,
  upstreamError,
  referenceFieldCoverage: sourceCoverage,
  staticBasicAttackRangeCoverage: sourceCoverage.basic_atk_range,
  identityStatusCounts: countStatuses("identity"),
  roleStatusCounts: countStatuses("role"),
  laneStatusCounts: countStatuses("lanes"),
  referenceDifferenceCount: referenceDifferences.length,
  referenceDifferences,
  pageClassificationAudit,
  liveGrowth: {
    parsedPages: parsedCount,
    unavailableOrUnparsedPages: heroCatalog.length - parsedCount,
    chartStatusCounts: growthStatusCounts
  },
  heroes
};
await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/hero-data-audit.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({
  roster: report.rosterCount,
  upstream: report.pinnedUpstreamCount,
  referenceDifferenceCount: report.referenceDifferenceCount,
  pageClassificationAudit: report.pageClassificationAudit,
  parsedGrowthPages: report.liveGrowth.parsedPages,
  unavailableOrUnparsedPages: report.liveGrowth.unavailableOrUnparsedPages,
  identityStatusCounts: report.identityStatusCounts,
  roleStatusCounts: report.roleStatusCounts,
  laneStatusCounts: report.laneStatusCounts,
  growthStatusCounts
}, null, 2));
