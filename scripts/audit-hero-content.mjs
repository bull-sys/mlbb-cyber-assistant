import { mkdir, writeFile } from "node:fs/promises";
import { heroCatalog } from "../server/hero-catalog.js";
import { heroLoreData } from "../server/hero-lore-data.js";

const PROFILE_BASE = "https://mlbbdex.com/api/v1/heroes/";
const RUSSIAN_SKILLS_URL = "https://raw.githubusercontent.com/achedon12/mlbb/92f0fe94e4226ab6057db25711c4d65b3ca12130/src/data/game/skills/ru.json";
const CONCURRENCY = 4;
const TIMEOUT_MS = 15000;
const normalize = value => String(value || "").normalize("NFKD")
  .replace(/[\u0300-\u036f]/gu, "").toLowerCase().replace(/[^a-z0-9]/gu, "");
const slug = value => String(value || "").normalize("NFKD")
  .replace(/[\u0300-\u036f]/gu, "").toLowerCase().replace(/&/g, "and")
  .replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const textValue = value => typeof value === "string" ? value.replace(/\s+/gu, " ").trim() : "";

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "MLBB-Cyber-Assistant-Content-Audit/1.0", "accept-language": "en" },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!response.ok) throw new Error("HTTP " + response.status);
  return response.json();
}
async function mapLimit(items, limit, mapper) {
  const result = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      result[index] = await mapper(items[index], index);
    }
  }));
  return result;
}
function collectTextFields(value, path = "", output = [], depth = 0) {
  if (depth > 5 || value == null) return output;
  if (typeof value === "string") {
    const clean = textValue(value);
    if (clean.length >= 45 && clean.length <= 6000) {
      output.push({ path, text: clean });
    }
    return output;
  }
  if (Array.isArray(value)) {
    value.slice(0, 80).forEach((entry, index) => collectTextFields(entry, path + "[" + index + "]", output, depth + 1));
    return output;
  }
  if (typeof value === "object") {
    for (const [key, entry] of Object.entries(value).slice(0, 120)) {
      if (/image|icon|portrait|avatar|url|asset|build|counter|analysis|item|emblem|talent/iu.test(key)) continue;
      collectTextFields(entry, path ? path + "." + key : key, output, depth + 1);
    }
  }
  return output;
}
function pickLoreCandidates(fields) {
  const exact = /(^|\.)(lore|story|bio|biography|background|history|origin|description|quote|overview|introduction)(\.|$)/iu;
  return fields.filter(field =>
    exact.test(field.path) &&
    !/^skills\[/iu.test(field.path) &&
    field.text.length >= 60
  );
}
function auditRussianSkillText(hero, russianSkills) {
  const key = slug(hero.nameEn);
  const entries = Array.isArray(russianSkills?.[key]) ? russianSkills[key] : [];
  const skills = entries.map((skill, index) => {
    const name = textValue(skill?.name);
    const description = textValue(skill?.description);
    const englishRemainders = (description.match(/\b(?:the|and|when|while|after|before|enemy|enemies|damage|physical|magic|skill|basic attack|movement speed|cooldown)\b/giu) || []);
    const suspicious = [];
    if (hero.id === "helcurt" && /бродяг|бродяж/iu.test(description)) suspicious.push("possible-literal-state-translation");
    if (/\bProwler\b|\bHanekage\b|\bMoonton\b/iu.test(description)) suspicious.push("unlocalized-proper-term");
    if (englishRemainders.length >= 3) suspicious.push("multiple-english-remnants");
    if (!name) suspicious.push("missing-skill-name");
    if (!description) suspicious.push("missing-description");
    return {
      index,
      name,
      description,
      length: description.length,
      englishRemainderCount: englishRemainders.length,
      suspicious
    };
  });
  return {
    sourceKey: key,
    count: skills.length,
    missingDescriptions: skills.filter(skill => !skill.description).length,
    suspiciousCount: skills.filter(skill => skill.suspicious.length).length,
    skills
  };
}
let russianSkills = null, russianSkillsError = null;
try { russianSkills = await fetchJson(RUSSIAN_SKILLS_URL); }
catch (error) { russianSkillsError = String(error?.message || error); }

const localLoreById = new Map(heroLoreData.map(entry => [entry.id, entry]));

const heroes = await mapLimit(heroCatalog, CONCURRENCY, async hero => {
  const url = PROFILE_BASE + encodeURIComponent(slug(hero.id));
  let payload = null, error = null;
  try { payload = await fetchJson(url); }
  catch (caught) { error = String(caught?.message || caught); }
  const profile = payload?.data || null;
  const fields = collectTextFields(profile);
  const loreCandidates = pickLoreCandidates(fields);
  const skillData = auditRussianSkillText(hero, russianSkills);
  return {
    id: hero.id,
    nameEn: hero.nameEn,
    displayNameRu: hero.displayNameRu,
    localLore: {
      status: localLoreById.has(hero.id) ? "available" : "missing",
      summaryLength: textValue(localLoreById.get(hero.id)?.summary).length
    },
    profile: {
      status: profile ? "available" : "unavailable",
      url,
      source: payload?.source || null,
      patch: profile?.patch || null,
      topLevelKeys: profile && typeof profile === "object" ? Object.keys(profile) : [],
      loreCandidates,
      textFieldCount: fields.length,
      error
    },
    russianSkills: skillData
  };
});
const profileAvailable = heroes.filter(hero => hero.profile.status === "available").length;
const loreAvailable = heroes.filter(hero => hero.profile.loreCandidates.length).length;
const skillEntries = heroes.reduce((sum, hero) => sum + hero.russianSkills.count, 0);
const report = {
  generatedAt: new Date().toISOString(),
  rosterCount: heroCatalog.length,
  profileSource: PROFILE_BASE,
  russianSkillSource: RUSSIAN_SKILLS_URL,
  russianSkillsError,
  profileAvailable,
  profileUnavailable: heroCatalog.length - profileAvailable,
  localLoreAvailable: heroCatalog.filter(hero => localLoreById.has(hero.id) && textValue(localLoreById.get(hero.id)?.summary)).length,
  localLoreMissing: heroCatalog.filter(hero => !localLoreById.has(hero.id) || !textValue(localLoreById.get(hero.id)?.summary)).map(hero => hero.id),
  localLoreDuplicateIds: heroLoreData.length - localLoreById.size,
  profilesWithExplicitLoreCandidates: loreAvailable,
  totalRussianSkillEntries: skillEntries,
  heroes
};
await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/hero-content-audit.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({
  roster: report.rosterCount,
  profileAvailable,
  profileUnavailable: report.profileUnavailable,
  localLoreAvailable: report.localLoreAvailable,
  localLoreMissing: report.localLoreMissing,
  localLoreDuplicateIds: report.localLoreDuplicateIds,
  profilesWithExplicitLoreCandidates: loreAvailable,
  totalRussianSkillEntries: skillEntries,
  russianSkillsError,
  perHero: heroes.map(hero => ({
    id: hero.id,
    localLore: hero.localLore.status,
    profile: hero.profile.status,
    keys: hero.profile.topLevelKeys,
    loreCandidates: hero.profile.loreCandidates.map(item => item.path),
    skills: hero.russianSkills.count,
    missingSkillDescriptions: hero.russianSkills.missingDescriptions,
    suspiciousSkills: hero.russianSkills.suspiciousCount
  }))
}, null, 2));
