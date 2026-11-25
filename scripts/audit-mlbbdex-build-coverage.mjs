import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { heroReferenceData } from "../server/hero-reference-data.js";
import { items, emblems, talents } from "../server/data.js";

const BASE = "https://mlbbdex.com";
const RANKS = ["all", "epic", "legend", "mythic", "honor", "glory"];
const POSITIONS = ["Exp", "Jungle", "Mid", "Gold", "Roam"];
const normalize = value => String(value || "").normalize("NFKD")
  .replace(/[\\u0300-\\u036f]/gu, "").toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
const slugify = value => String(value || "").normalize("NFKD")
  .replace(/[\\u0300-\\u036f]/gu, "").toLowerCase().replace(/&/g, "and")
  .replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function getJson(url) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": "MLBB-Cyber-Assistant-build-coverage-audit/1.0" },
        signal: AbortSignal.timeout(15000)
      });
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 120000) : 15000;
        if (attempt === 0) { await new Promise(resolve => setTimeout(resolve, waitMs)); continue; }
        throw new Error("HTTP 429 after retry delay");
      }
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  throw lastError;
}

function getHeroSlugMap(payload) {
  assert.ok(Array.isArray(payload?.data), "MLBBDex hero catalogue response has no data array");
  const byName = new Map();
  for (const hero of payload.data) {
    const name = normalize(hero?.nameEn || hero?.name || hero?.title);
    if (name && typeof hero?.slug === "string") byName.set(name, hero.slug);
  }
  return byName;
}

function catalogIndex(records, nameField) {
  return new Map(records.map(record => [normalize(record[nameField]), record]).filter(([key]) => key));
}

const itemIndex = catalogIndex(items.filter(item => item.englishName), "englishName");
const emblemIndex = new Map();
for (const emblem of emblems) {
  const full = normalize(emblem.nameEn);
  const short = normalize(String(emblem.nameEn || "").replace(/^Custom /u, ""));
  for (const key of [full, short, normalize(emblem.id), ...(emblem.id === "common" ? ["all"] : [])]) if (key) emblemIndex.set(key, emblem);
}
const talentIndex = catalogIndex(talents, "nameEn");\ntalentIndex.set(normalize("Weapons Master"), talents.find(talent => talent.id === "weapon-master"));

const heroList = await getJson(BASE + "/api/v1/heroes");
const slugByName = getHeroSlugMap(heroList);
const queue = [...heroReferenceData];
const results = [];
let cursor = 0;
const worker = async () => {
  while (cursor < queue.length) {
    const hero = queue[cursor++];
    const slug = slugByName.get(normalize(hero.nameEn)) || slugify(hero.id);
    const record = {
      id: hero.id, nameEn: hero.nameEn, slug,
      slugMatchedByName: slugByName.has(normalize(hero.nameEn)),
      status: "pending", positions: [], rankCoverage: {}, buildCount: 0,
      itemCount: 0, matchedItems: 0, unmatchedItems: [],
      emblemCount: 0, matchedEmblems: 0, unmatchedEmblems: [],
      talentCount: 0, matchedTalents: 0, unmatchedTalents: [],
      spells: [], error: null
    };
    try {
      const payload = await getJson(BASE + "/api/v1/heroes/" + encodeURIComponent(slug) + "/builds");
      const raw = payload?.data;
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid build response shape");
      record.status = "ok";
      record.source = payload.source || null;
      for (const position of POSITIONS) {
        const rankData = raw[position];
        if (!rankData || typeof rankData !== "object") continue;
        const positionResult = { position, ranks: {} };
        for (const rank of RANKS) {
          const builds = rankData[rank];
          if (!Array.isArray(builds)) continue;
          const buildCount = builds.length;
          positionResult.ranks[rank] = buildCount;
          record.rankCoverage[rank] = (record.rankCoverage[rank] || 0) + buildCount;
          record.buildCount += buildCount;
          for (const build of builds) {
            const buildItems = Array.isArray(build?.items) ? build.items.filter(value => typeof value === "string") : [];
            record.itemCount += buildItems.length;
            for (const name of buildItems) {
              if (itemIndex.has(normalize(name))) record.matchedItems++;
              else record.unmatchedItems.push(name);
            }
            if (typeof build?.emblem === "string" && build.emblem) {
              record.emblemCount++;
              const key = normalize(build.emblem);
              if (emblemIndex.has(key) || emblemIndex.has(key.replace(/^custom /u, ""))) record.matchedEmblems++;
              else record.unmatchedEmblems.push(build.emblem);
            }
            const buildTalents = Array.isArray(build?.talents) ? build.talents.filter(value => typeof value === "string") : [];
            record.talentCount += buildTalents.length;
            for (const name of buildTalents) {
              if (talentIndex.has(normalize(name))) record.matchedTalents++;
              else record.unmatchedTalents.push(name);
            }
            if (typeof build?.spell === "string" && !record.spells.includes(build.spell)) record.spells.push(build.spell);
          }
        }
        if (Object.keys(positionResult.ranks).length) record.positions.push(positionResult);
      }
      record.unmatchedItems = [...new Set(record.unmatchedItems)].sort();
      record.unmatchedEmblems = [...new Set(record.unmatchedEmblems)].sort();
      record.unmatchedTalents = [...new Set(record.unmatchedTalents)].sort();
    } catch (error) {
      record.status = "error";
      record.error = String(error?.message || error).slice(0, 180);
    }
    results.push(record);
  }
};
await Promise.all(Array.from({ length: 4 }, worker));
results.sort((a, b) => a.id.localeCompare(b.id));

const successful = results.filter(hero => hero.status === "ok");
const withBuilds = successful.filter(hero => hero.buildCount > 0);
const totals = results.reduce((acc, hero) => {
  for (const key of ["buildCount", "itemCount", "matchedItems", "emblemCount", "matchedEmblems", "talentCount", "matchedTalents"]) acc[key] += hero[key] || 0;
  return acc;
}, { buildCount: 0, itemCount: 0, matchedItems: 0, emblemCount: 0, matchedEmblems: 0, talentCount: 0, matchedTalents: 0 });
const positionCoverage = Object.fromEntries(POSITIONS.map(position => [position, {
  heroes: withBuilds.filter(hero => hero.positions.some(entry => entry.position === position)).length,
  builds: successful.reduce((sum, hero) => sum + (hero.positions.find(entry => entry.position === position)?.ranks
    ? Object.values(hero.positions.find(entry => entry.position === position).ranks).reduce((a, b) => a + b, 0) : 0), 0)
}]));
const rankCoverage = Object.fromEntries(RANKS.map(rank => [rank, {
  heroes: successful.filter(hero => (hero.rankCoverage[rank] || 0) > 0).length,
  builds: successful.reduce((sum, hero) => sum + (hero.rankCoverage[rank] || 0), 0)
}]));
const report = {
  generatedAt: new Date().toISOString(),
  source: "MLBBDex public API; ranked build statistics are aggregated through Rone Arena",
  sourceUrl: "https://mlbbdex.com/en/api-doc",
  roster: { localReferenceHeroes: heroReferenceData.length, sourceHeroes: heroList.total ?? heroList.data.length, successfulBuildEndpoints: successful.length, failedBuildEndpoints: results.length - successful.length, heroesWithAtLeastOneBuild: withBuilds.length, heroesWithNoBuilds: successful.length - withBuilds.length },
  totals,
  mappingRates: {
    items: totals.itemCount ? Number((totals.matchedItems / totals.itemCount * 100).toFixed(2)) : null,
    emblems: totals.emblemCount ? Number((totals.matchedEmblems / totals.emblemCount * 100).toFixed(2)) : null,
    talents: totals.talentCount ? Number((totals.matchedTalents / totals.talentCount * 100).toFixed(2)) : null
  },
  positionCoverage, rankCoverage,
  failedHeroes: results.filter(hero => hero.status !== "ok").map(({ id, nameEn, slug, error }) => ({ id, nameEn, slug, error })),
  heroesWithoutBuilds: results.filter(hero => hero.status === "ok" && hero.buildCount === 0).map(({ id, nameEn, slug }) => ({ id, nameEn, slug })),
  unmatchedNames: {
    items: [...new Set(results.flatMap(hero => hero.unmatchedItems))].sort(),
    emblems: [...new Set(results.flatMap(hero => hero.unmatchedEmblems))].sort(),
    talents: [...new Set(results.flatMap(hero => hero.unmatchedTalents))].sort()
  },
  heroes: results
};
await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/mlbbdex-build-coverage.json", JSON.stringify(report, null, 2) + "\\n");
console.log(JSON.stringify({
  roster: report.roster, totals: report.totals, mappingRates: report.mappingRates,
  positionCoverage: report.positionCoverage, rankCoverage: report.rankCoverage,
  failedHeroes: report.failedHeroes, heroesWithoutBuilds: report.heroesWithoutBuilds,
  unmatchedNames: report.unmatchedNames,
  reportFile: "artifacts/mlbbdex-build-coverage.json"
}, null, 2));
if (successful.length < Math.ceil(heroReferenceData.length * 0.8)) {
  process.exitCode = 1;
}
