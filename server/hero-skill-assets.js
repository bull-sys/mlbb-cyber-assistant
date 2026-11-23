const MOONTON_GMS_URL = "https://api.gms.moontontech.com/api/gms/source/2669606/2756564";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

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

export async function getHeroSkillAssets(heroNameEn) {
  try {
    const roster = await getRoster();
    const target = normalizeName(heroNameEn);
    const hero = roster.find(entry => entry.normalizedName === target);

    if (!hero) {
      return {
        ok: false,
        skills: [],
        error: "Для этого героя не удалось сопоставить навыки с данными игрового клиента."
      };
    }

    return {
      ok: true,
      heroName: hero.name,
      skills: hero.skills,
      source: {
        name: "Moonton game client data",
        note: "Skill icons and game assets are the property of Moonton."
      }
    };
  } catch (error) {
    return {
      ok: false,
      skills: [],
      error: "Не удалось получить изображения навыков из источника игрового клиента.",
      detail: String(error?.message || error).slice(0, 180)
    };
  }
}
