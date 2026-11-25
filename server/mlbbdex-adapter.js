import { heroReferenceData, HERO_REFERENCE_SOURCE } from "./hero-reference-data.js";
import { heroLoreById, HERO_LORE_SOURCE } from "./hero-lore-data.js";
import { items as localItems, emblems as localEmblems, talents as localTalents } from "./data.js";

const BASE = "https://mlbbdex.com";
const TTL = 6 * 60 * 60 * 1000;
const cache = new Map();

async function cachedJson(key, url) {
  const old = cache.get(key);
  if (old && Date.now() - old.at < TTL) return old.value;
  const response = await fetch(url, { headers: { "user-agent": "MLBB-Cyber-Assistant/1.0" }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("MLBBDex HTTP " + response.status);
  const payload = await response.json();
  cache.set(key, { at: Date.now(), value: payload });
  return payload;
}

const slugify = value => String(value || "")
  .normalize("NFKD").replace(/[\u0300-\u036f]/gu, "")
  .toLowerCase().replace(/&/g, "and").replace(/['’]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function absoluteImage(value) {
  if (!value) return null;
  if (typeof value === "object") value = value.url || value.src || value.href || null;
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value, BASE);
    return url.protocol === "https:" && (url.hostname === "mlbbdex.com" || url.hostname.endsWith(".mlbbdex.com")) ? url.href : null;
  } catch { return null; }
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/giu, " ").replace(/&amp;/giu, "&")
    .replace(/&quot;/giu, '"').replace(/&#39;/giu, "'")
    .replace(/&#(\d+);/gu, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&lt;/giu, "<").replace(/&gt;/giu, ">")
    .replace(/\s+/gu, " ").trim();
}

const heroReferenceBySlug = new Map(heroReferenceData.map(hero => [hero.id, hero]));

function staticHeroKnowledge(hero, slug) {
  const reference = heroReferenceBySlug.get(slug);
  if (!reference) return null;
  const localLore = heroLoreById.get(slug) || null;
  return {
    ok: true,
    fallback: true,
    stale: true,
    profile: {
      id: reference.heroId,
      name: reference.nameEn,
      title: reference.titleEn,
      roles: reference.roles.map(value => value.ru),
      lanes: reference.lanes.map(value => value.ru),
      specialties: reference.specialties.map(value => value.ru),
      release: reference.release,
      region: reference.region,
      resource: reference.resource,
      stats: reference.stats,
      ratings: reference.ratings,
      lore: localLore?.summary || null,
      loreSource: localLore ? HERO_LORE_SOURCE : null,
      images: {}
    },
    source: HERO_REFERENCE_SOURCE,
    updatedAt: HERO_REFERENCE_SOURCE.updatedAt,
    dataPatch: null,
    note: "Используется локальный резервный набор базовых характеристик. История и часть сведений требуют подключения к источнику."
  };
}

export async function getHeroKnowledge(hero) {
  const slug = slugify(hero?.id || hero?.nameEn);
  if (!slug) return { ok: false, error: "Неизвестный герой" };
  try {
    const profilePayload = await cachedJson("hero:" + slug, BASE + "/api/v1/heroes/" + encodeURIComponent(slug));
    const profile = profilePayload?.data || null;
    if (!profile) {
      const fallback = staticHeroKnowledge(hero, slug);
      return fallback || { ok: false, error: "Профиль героя отсутствует в источнике." };
    }
    const images = profile?.images || {};
    const { analysis: _analysis, builds: _builds, ...neutralProfile } = profile;
    const reference = heroReferenceBySlug.get(slug);
    const localLore = heroLoreById.get(slug) || null;
    const mergedProfile = {
      ...(reference ? {
        id: reference.heroId,
        name: reference.nameEn,
        title: reference.titleEn,
        roles: reference.roles.map(value => value.ru),
        lanes: reference.lanes.map(value => value.ru),
        specialties: reference.specialties.map(value => value.ru),
        release: reference.release,
        region: reference.region,
        resource: reference.resource,
        stats: reference.stats,
        ratings: reference.ratings
      } : {}),
      ...neutralProfile,
      title: neutralProfile.title || reference?.titleEn || null,
      roles: Array.isArray(neutralProfile.roles) && neutralProfile.roles.length
        ? neutralProfile.roles
        : (reference?.roles || []).map(value => value.ru),
      lanes: Array.isArray(neutralProfile.lanes) && neutralProfile.lanes.length
        ? neutralProfile.lanes
        : (reference?.lanes || []).map(value => value.ru),
      specialties: Array.isArray(neutralProfile.specialties) && neutralProfile.specialties.length
        ? neutralProfile.specialties
        : (reference?.specialties || []).map(value => value.ru),
      release: neutralProfile.release || reference?.release || null,
      region: neutralProfile.region || reference?.region || null,
      resource: neutralProfile.resource || reference?.resource || null,
      stats: { ...(reference?.stats || {}), ...(neutralProfile.stats || {}) },
      ratings: { ...(reference?.ratings || {}), ...(neutralProfile.ratings || {}) },
      lore: neutralProfile.lore || neutralProfile.story || neutralProfile.bio || localLore?.summary || null,
      loreSource: localLore ? HERO_LORE_SOURCE : null,
      images: {
        ...images,
        portrait: absoluteImage(images.portrait),
        icon: absoluteImage(images.icon)
      }
    };
    return {
      ok: true,
      profile: mergedProfile,
      source: profilePayload?.source || HERO_REFERENCE_SOURCE,
      updatedAt: new Date().toISOString(),
      dataPatch: profile?.patch || null,
      fallback: false
    };
  } catch (error) {
    const fallback = staticHeroKnowledge(hero, slug);
    if (fallback) return { ...fallback, detail: String(error?.message || error).slice(0, 160) };
    return { ok: false, error: "Не удалось получить профиль героя.", detail: String(error?.message || error).slice(0, 160) };
  }
}

async function getTalentAssets() {
  try {
    const response = await fetch(BASE + "/ru/emblems", { headers: { "user-agent": "Mozilla/5.0 MLBB-Cyber-Assistant" }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) return [];
    const html = await response.text();
    const matches = [...html.matchAll(/(?:src|data-src)="([^"]*(?:visuels\/talents\/|visuels%2Ftalents%2F)([^"/?%]+)(?:\.webp|%2Ewebp)[^"]*)"/giu)];
    const unique = new Map();
    for (const match of matches) {
      const slug = match[2];
      if (!unique.has(slug)) unique.set(slug, {
        slug,
        name: slug.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" "),
        image: BASE + "/visuels/talents/" + slug + ".webp"
      });
    }
    return [...unique.values()];
  } catch { return []; }
}

export async function getGameAssets() {
  const [emblemsResult, itemsResult, talents] = await Promise.all([
    cachedJson("emblems", BASE + "/api/v1/emblems?locale=en").catch(() => null),
    cachedJson("items", BASE + "/api/v1/items?locale=en").catch(() => null),
    getTalentAssets()
  ]);
  const normalizeAsset = item => {
    const candidate = item.image || item.icon || item.iconUrl || item.icon_url ||
      item.imageUrl || item.image_url || item.img || item.images?.icon ||
      item.images?.small || item.icon?.url || item.image?.url || item.assets?.icon;
    return { ...item, image: absoluteImage(candidate) };
  };
  const emblems = (Array.isArray(emblemsResult?.data) ? emblemsResult.data : []).map(normalizeAsset);
  // MLBBDex serves the original item artwork at /visuels/objets/{slug}.webp.
  // The public item JSON supplies stable slugs, but intentionally omits image URLs.
  const items = (Array.isArray(itemsResult?.data) ? itemsResult.data : [])
    .filter(item => item && typeof item.slug === "string" && /^[a-z0-9-]+$/u.test(item.slug))
    .map(item => ({
      slug: item.slug,
      name: item.name || item.slug,
      category: item.category || null,
      image: BASE + "/visuels/objets/" + item.slug + ".webp"
    }));
  return {
    ok: true,
    emblems,
    items,
    talents,
    sources: [emblemsResult?.source, itemsResult?.source].filter(Boolean),
    updatedAt: new Date().toISOString()
  };
}


const buildPositions = {
  Exp: { id: "exp", label: "Опыт" },
  Jungle: { id: "jungle", label: "Лес" },
  Mid: { id: "mid", label: "Мид" },
  Gold: { id: "gold", label: "Золото" },
  Roam: { id: "roam", label: "Роум" }
};
const buildRanks = {
  all: "Все ранги",
  epic: "Эпик",
  legend: "Легенда",
  mythic: "Мифик",
  honor: "Мифическая честь",
  glory: "Мифическая слава"
};
const normalizeBuildName = value => String(value || "").normalize("NFKD")
  .replace(/[\\u0300-\\u036f]/gu, "").toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();

function normalizeObservedBuild(build) {
  const itemByEnglish = new Map(localItems.map(item => [normalizeBuildName(item.englishName), item]).filter(([name]) => name));
  const emblemByEnglish = new Map(localEmblems.flatMap(item => {
    const shortName = String(item.nameEn || "").startsWith("Custom ") ? String(item.nameEn).slice(7) : item.nameEn;
    const names = [item.nameEn, shortName, item.id];
    return names.map(name => [normalizeBuildName(name), item]).filter(([name]) => name);
  }));
  const talentByEnglish = new Map(localTalents.flatMap(item => [[normalizeBuildName(item.nameEn), item], ...(item.id === "weapon-master" ? [[normalizeBuildName("Weapons Master"), item]] : [])]).filter(([name]) => name));
  const itemNames = Array.isArray(build?.items) ? build.items.filter(value => typeof value === "string") : [];
  const items = itemNames.map(englishName => {
    const local = itemByEnglish.get(normalizeBuildName(englishName));
    return local
      ? { name: local.name, englishName, category: local.category || null, catalogMatched: true }
      : { name: englishName, englishName, category: null, catalogMatched: false };
  });
  const emblemName = typeof build?.emblem === "string" ? build.emblem : null;
  const emblem = emblemName ? emblemByEnglish.get(normalizeBuildName(emblemName)) : null;
  const talentNames = Array.isArray(build?.talents) ? build.talents.filter(value => typeof value === "string") : [];
  const talents = talentNames.map(nameEn => {
    const local = talentByEnglish.get(normalizeBuildName(nameEn));
    return local
      ? { id: local.id, name: local.name, nameEn, tier: local.tier, catalogMatched: true }
      : { id: null, name: nameEn, nameEn, tier: null, catalogMatched: false };
  });
  const spellNames = {
    petrify: "Окаменение",
    flicker: "Вспышка",
    retribution: "Возмездие",
    inspire: "Вдохновение",
    purify: "Очищение",
    flameshot: "Огненный выстрел",
    aegis: "Щит",
    sprint: "Спринт",
    revitalize: "Исцеление",
    vengeance: "Месть"
  };
  const spellEn = typeof build?.spell === "string" ? build.spell : null;
  const spellKey = spellEn ? String(spellEn).toLowerCase().replace(/[^a-z]/gu, "") : "";
  const spell = spellEn ? (spellNames[spellKey] || spellEn) : null;
  const winRate = build?.winRate !== null && build?.winRate !== undefined && Number.isFinite(Number(build.winRate)) ? Number(build.winRate) : null;
  const pickRate = build?.pickRate !== null && build?.pickRate !== undefined && Number.isFinite(Number(build.pickRate)) ? Number(build.pickRate) : null;
  return {
    items,
    emblem: emblem ? { id: emblem.id, name: emblem.name, nameEn: emblemName, catalogMatched: true } :
      (emblemName ? { id: null, name: emblemName, nameEn: emblemName, catalogMatched: false } : null),
    talents,
    spell: spell ? { name: spell, nameEn: spellEn, catalogMatched: Boolean(spellEn && spell !== spellEn) } : null,
    winRate,
    pickRate,
    catalogCoverage: {
      matchedItems: items.filter(item => item.catalogMatched).length,
      totalItems: items.length,
      unmatchedItems: items.filter(item => !item.catalogMatched).map(item => item.englishName),
      matchedTalents: talents.filter(item => item.catalogMatched).length,
      totalTalents: talents.length
    }
  };
}

export function normalizeHeroBuildPayload(payload) {
  const raw = payload?.data;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Источник не вернул структуру сборок героя." };
  }
  const positions = Object.entries(raw).flatMap(([key, rankData]) => {
    const position = buildPositions[key];
    if (!position || !rankData || typeof rankData !== "object") return [];
    const ranks = {};
    for (const [rankKey, rankLabel] of Object.entries(buildRanks)) {
      const builds = rankData[rankKey];
      if (Array.isArray(builds)) ranks[rankKey] = { label: rankLabel, builds: builds.map(normalizeObservedBuild) };
    }
    return Object.keys(ranks).length ? [{ ...position, ranks }] : [];
  });
  return {
    ok: true,
    positions,
    source: payload?.source || null,
    sourcePage: "https://mlbbdex.com/ru/api-doc",
    methodology: "https://mlbbdex.com/ru/methodology",
    dataLineage: "Рейтинговые сборки MLBBDex получает через community API arena.rone.dev; это статистика использования, а не редакторская гарантия оптимальности.",
    sampleSizeAvailable: false,
    updatedAt: new Date().toISOString()
  };
}

export async function getHeroBuilds(hero) {
  const slug = slugify(hero?.id || hero?.nameEn);
  if (!slug || !heroReferenceBySlug.has(slug)) {
    return { ok: false, error: "Герой не найден в проверенном справочнике." };
  }
  try {
    const payload = await cachedJson("builds:" + slug, BASE + "/api/v1/heroes/" + encodeURIComponent(slug) + "/builds");
    return normalizeHeroBuildPayload(payload);
  } catch (error) {
    return { ok: false, error: "Не удалось загрузить реальные сборки героя.", detail: String(error?.message || error).slice(0, 160) };
  }
}
