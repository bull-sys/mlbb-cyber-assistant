import { heroReferenceData, HERO_REFERENCE_SOURCE } from "./hero-reference-data.js";

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
  const [emblemsResult, talents] = await Promise.all([
    cachedJson("emblems", BASE + "/api/v1/emblems?locale=en").catch(() => null),
    getTalentAssets()
  ]);
  const normalizeAsset = item => {
    const candidate = item.image || item.icon || item.iconUrl || item.icon_url ||
      item.imageUrl || item.image_url || item.img || item.images?.icon ||
      item.images?.small || item.icon?.url || item.image?.url || item.assets?.icon;
    return { ...item, image: absoluteImage(candidate) };
  };
  const emblems = (Array.isArray(emblemsResult?.data) ? emblemsResult.data : []).map(normalizeAsset);
  const items = [];
  return {
    ok: true,
    emblems,
    items,
    talents,
    sources: [emblemsResult?.source].filter(Boolean),
    updatedAt: new Date().toISOString()
  };
}
