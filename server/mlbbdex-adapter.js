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

export async function getHeroKnowledge(hero) {
  const slug = slugify(hero?.nameEn || hero?.id);
  if (!slug) return { ok: false, error: "Неизвестный герой" };
  try {
    const profilePayload = await cachedJson("hero:" + slug, BASE + "/api/v1/heroes/" + encodeURIComponent(slug));
    const profile = profilePayload?.data || null;
    const images = profile?.images || {};
    const { analysis: _analysis, builds: _builds, ...neutralProfile } = profile || {};
    return {
      ok: Boolean(profile),
      profile: profile ? {
        ...neutralProfile,
        images: {
          ...images,
          portrait: absoluteImage(images.portrait),
          icon: absoluteImage(images.icon)
        }
      } : null,
      source: profilePayload?.source || null,
      updatedAt: new Date().toISOString(),
      dataPatch: profile?.patch || null
    };
  } catch (error) {
    return { ok: false, error: "Не удалось получить актуальный профиль героя.", detail: String(error?.message || error).slice(0, 160) };
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
  const items = (Array.isArray(itemsResult?.data) ? itemsResult.data : []).map(normalizeAsset);
  return {
    ok: true,
    emblems,
    items,
    talents,
    sources: [emblemsResult?.source, itemsResult?.source].filter(Boolean),
    updatedAt: new Date().toISOString()
  };
}
