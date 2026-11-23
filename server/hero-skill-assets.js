const MOONTON_GMS_URL = "https://api.gms.moontontech.com/api/gms/source/2669606/2756564";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const RUSSIAN_SKILLS_URL = "https://raw.githubusercontent.com/achedon12/mlbb/92f0fe94e4226ab6057db25711c4d65b3ca12130/src/data/game/skills/ru.json";
const RUSSIAN_SKILLS_TTL_MS = 12 * 60 * 60 * 1000;
const TRANSLATE_URL = "https://clients5.google.com/translate_a/t";
let russianSkillsCache = null;
let russianSkillsExpiresAt = 0;
let russianSkillsRequest = null;
const translatedSkillNames = new Map();

async function getRussianSkills() {
  if (russianSkillsCache && Date.now() < russianSkillsExpiresAt) return russianSkillsCache;
  if (russianSkillsRequest) return russianSkillsRequest;
  russianSkillsRequest = fetch(RUSSIAN_SKILLS_URL, {
    headers: { "user-agent": "MLBB-Cyber-Assistant/1.0" },
    signal: AbortSignal.timeout(15000)
  }).then(async response => {
    if (!response.ok) throw new Error("Russian skill catalogue HTTP " + response.status);
    const payload = await response.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Unexpected Russian skill catalogue");
    russianSkillsCache = payload;
    russianSkillsExpiresAt = Date.now() + RUSSIAN_SKILLS_TTL_MS;
    return payload;
  }).finally(() => { russianSkillsRequest = null; });
  return russianSkillsRequest;
}

async function translateSkillNames(names) {
  const unique = [...new Set(names.map(name => String(name || "").trim()).filter(Boolean))];
  const missing = unique.filter(name => !translatedSkillNames.has(name));
  if (missing.length) {
    try {
      const url = new URL(TRANSLATE_URL);
      url.searchParams.set("client", "dict-chrome-ex");
      url.searchParams.set("sl", "en");
      url.searchParams.set("tl", "ru");
      for (const name of missing) url.searchParams.append("q", name);
      const response = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; MLBB-Cyber-Assistant/1.0)" },
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) throw new Error("Translation service HTTP " + response.status);
      const payload = await response.json();
      const values = Array.isArray(payload) ? payload.flat(Infinity) : [];
      if (values.length === missing.length) {
        missing.forEach((name, index) => {
          const translated = String(values[index] || "").trim();
          translatedSkillNames.set(name, translated && translated.toLowerCase() !== name.toLowerCase() ? translated : null);
        });
      } else {
        missing.forEach(name => translatedSkillNames.set(name, null));
      }
    } catch {
      missing.forEach(name => translatedSkillNames.set(name, null));
    }
  }
  return Object.fromEntries(unique.map(name => [name, translatedSkillNames.get(name) || null]));
}

export function russianizeSkillDescription(value, heroNameEn, heroNameRu) {
  let text = cleanText(value);
  if (!text) return "";
  if (heroNameEn && heroNameRu) text = text.split(heroNameEn).join(heroNameRu);
  if (normalizeName(heroNameEn) === "helcurt") text = text.replace(/Бродяги/giu, "Prowler");
  const terms = [
    [/\bBasic Attacks?\b/giu, "базовые атаки"],
    [/\bMovement Speed\b/giu, "скорость передвижения"],
    [/\bMagic Damage\b/giu, "магический урон"],
    [/\bPhysical Damage\b/giu, "физический урон"],
    [/\bTrue Damage\b/giu, "чистый урон"],
    [/\bTotal Magic Power\b/giu, "общей магической силы"],
    [/\bTotal Physical Attack\b/giu, "общей физической атаки"],
    [/\bExtra Physical Attack\b/giu, "дополнительной физической атаки"],
    [/\bMax HP\b/giu, "максимального запаса ОЗ"],
    [/\bHP\b/giu, "ОЗ"],
    [/\bCooldown\b/giu, "перезарядка"],
    [/\bCreeps?\b/giu, "монстры"],
    [/\bMinions?\b/giu, "миньоны"]
  ];
  for (const [pattern, replacement] of terms) text = text.replace(pattern, replacement);
  return text.replace(/\s+/gu, " ").trim();
}


let rosterCache = null;
let cacheExpiresAt = 0;
let rosterRequest = null;

const cleanText = value => String(value || "")
  .replace(/<[^>]*>/gu, " ")
  .replace(/&nbsp;/giu, " ")
  .replace(/&amp;/giu, "&")
  .replace(/&lt;/giu, "<")
  .replace(/&gt;/giu, ">")
  .replace(/&quot;/giu, '"')
  .replace(/&#39;/giu, "'")
  .replace(/\\s+/gu, " ")
  .trim();

const normalizeName = value => String(value || "")
  .normalize("NFKD")
  .replace(/[\\u0300-\\u036f]/gu, "")
  .toLocaleLowerCase("en")
  .replace(/[^a-z0-9]+/gu, "");

function safeImageUrl(value) {
  try {
    const url = new URL(String(value || ""));
    if (url.protocol !== "https:") return null;
    if (!url.hostname.endsWith(".youngjoygame.com") &&
        !url.hostname.endsWith(".moontontech.com")) return null;
    return url.href;
  } catch {
    return null;
  }
}

async function fetchRoster() {
  const response = await fetch(MOONTON_GMS_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "Mozilla/5.0 MLBB-Cyber-Assistant"
    },
    body: JSON.stringify({
      pageSize: 200,
      pageIndex: 1,
      filters: [],
      sorts: [{ data: { field: "hero_id", order: "desc" }, type: "sequence" }],
      fields: [],
      object: []
    }),
    signal: AbortSignal.timeout(12000)
  });

  if (!response.ok) {
    throw new Error("Moonton data source returned HTTP " + response.status);
  }

  const payload = await response.json();
  const records = payload?.data?.records;
  if (!Array.isArray(records)) {
    throw new Error("Moonton data source returned an unexpected roster format");
  }

  return records.map(record => {
    const rawHero = record?.data || {};
    const hero = rawHero.hero?.data || rawHero;
    const skills = [];

    for (const [groupIndex, group] of (Array.isArray(hero.heroskilllist) ? hero.heroskilllist : []).entries()) {
      for (const [skillIndex, skill] of (Array.isArray(group?.skilllist) ? group.skilllist : []).entries()) {
        const name = cleanText(skill?.skillname);
        if (!name) continue;
        skills.push({
          id: String(skill.skillid || ""),
          group: groupIndex + 1,
          order: skillIndex + 1,
          name,
          iconUrl: safeImageUrl(skill.skillicon),
          description: cleanText(skill.skilldesc),
          cooldownAndCost: cleanText(skill["skillcd&cost"])
        });
      }
    }

    return {
      name: cleanText(hero.name),
      normalizedName: normalizeName(hero.name),
      skills
    };
  }).filter(hero => hero.normalizedName && hero.skills.length);
}

async function getRoster() {
  if (rosterCache && Date.now() < cacheExpiresAt) return rosterCache;
  if (rosterRequest) return rosterRequest;

  rosterRequest = fetchRoster()
    .then(roster => {
      rosterCache = roster;
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
      return roster;
    })
    .finally(() => {
      rosterRequest = null;
    });

  return rosterRequest;
}

export async function getHeroSkillAssets(heroNameEn, heroNameRu = "") {
  try {
    const [roster, russianSkills] = await Promise.all([
      getRoster(),
      getRussianSkills().catch(() => null)
    ]);
    const target = normalizeName(heroNameEn);
    const hero = roster.find(entry => entry.normalizedName === target);
    if (!hero) {
      return {
        ok: false,
        skills: [],
        error: "Для этого героя не удалось сопоставить навыки с данными игрового клиента."
      };
    }

    const slug = String(heroNameEn || "").normalize("NFKD")
      .replace(/[\u0300-\u036f]/gu, "").toLowerCase()
      .replace(/&/g, "and").replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const localizedKey = russianSkills?.[slug] ? slug : Object.keys(russianSkills || {}).find(key => normalizeName(key) === normalizeName(slug));
    const localized = Array.isArray(russianSkills?.[localizedKey]) ? russianSkills[localizedKey] : [];
    const matching = hero.skills.map((skill, index) => {
      const candidate = localized[index];
      const sameSkill = candidate && normalizeName(candidate.name) === normalizeName(skill.name);
      return {
        ...skill,
        nameRu: null,
        descriptionRu: sameSkill ? russianizeSkillDescription(candidate.description, hero.name, heroNameRu) : "",
        translationStatus: sameSkill && candidate.description ? "ru-machine" : "pending"
      };
    });
    const translatedNames = await translateSkillNames(matching.map(skill => skill.name));
    const skills = matching.map(skill => ({
      ...skill,
      nameRu: translatedNames[skill.name] || null
    }));

    return {
      ok: true,
      heroName: hero.name,
      skills,
      translation: {
        language: "ru",
        status: localized.length ? "machine-translated-source" : "not-available",
        source: "MLBBDex Russian skill catalogue",
        note: "Русские описания основаны на данных Mobile Legends Wiki и автоматически переведены. Названия умений переведены отдельно; при отсутствии перевода сохраняется оригинальное название."
      },
      source: {
        name: "Данные игрового клиента Moonton; русские описания MLBBDex",
        note: "Игровые изображения принадлежат Moonton. Тексты вики используются с указанием источника и лицензии CC BY-SA."
      }
    };
  } catch (error) {
    return {
      ok: false,
      skills: [],
      error: "Не удалось получить проверенные данные об умениях.",
      detail: String(error?.message || error).slice(0, 180)
    };
  }
}
