const BASE = "https://mlbbdex.com";
const EQUIPMENT_ASSET_BASE = "https://raw.githubusercontent.com/Ceplin03/database-mlbb.Mobile-Legends-Bang-Bang/master/logo-equipment/";
const EQUIPMENT_DATA_URL = "https://raw.githubusercontent.com/Ceplin03/database-mlbb.Mobile-Legends-Bang-Bang/master/equipment.json";
const TTL = 6 * 60 * 60 * 1000;
const cache = new Map();
let equipmentMapCache = null;

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
  .normalize("NFKD").replace(/[\\u0300-\\u036f]/gu, "")
  .toLowerCase().replace(/&/g, "and").replace(/['’]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function absoluteImage(value) {
  if (!value) return null;
  try {
    const url = new URL(value, BASE);
    return url.protocol === "https:" && (url.hostname === "mlbbdex.com" || url.hostname.endsWith(".mlbbdex.com")) ? url.href : null;
  } catch { return null; }
}

async function getEquipmentMap() {
  if (equipmentMapCache) return equipmentMapCache;
  try {
    const response = await fetch(EQUIPMENT_DATA_URL, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error("equipment asset index unavailable");
    const records = await response.json();
    equipmentMapCache = new Map((Array.isArray(records) ? records : []).map(item => [
      String(item["name-equipment"] || "").toLowerCase(),
      EQUIPMENT_ASSET_BASE + encodeURIComponent(item["logo-equipment"] || "")
    ]).filter(([name, url]) => name && !url.endsWith("/")));
  } catch {
    equipmentMapCache = new Map();
  }
  return equipmentMapCache;
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\\s\\S]*?<\\/script>/giu, " ")
    .replace(/<style[\\s\\S]*?<\\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/giu, " ").replace(/&amp;/giu, "&")
    .replace(/&quot;/giu, '"').replace(/&#39;/giu, "'")
    .replace(/&#(\\d+);/gu, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&lt;/giu, "<").replace(/&gt;/giu, ">")
    .replace(/\\s+/gu, " ").trim();
}

async function getCombos(slug) {
  try {
    const response = await fetch(BASE + "/ru/heroes/" + encodeURIComponent(slug), {
      headers: { "user-agent": "Mozilla/5.0 MLBB-Cyber-Assistant" },
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) return [];
    const html = await response.text();
    const marker = /<h[1-6][^>]*>\\s*(?:<[^>]+>\\s*)*Комбо(?:\\s*<[^>]+>)*\\s*<\\/h[1-6]>/iu;
    const match = marker.exec(html);
    if (!match) return [];
    const start = match.index + match[0].length;
    const tail = html.slice(start);
    const next = tail.search(/<h[1-6][^>]*>/iu);
    const section = next >= 0 ? tail.slice(0, next) : tail.slice(0, 12000);
    const groups = [];
    const headingPattern = /<h[2-6][^>]*>([\\s\\S]*?)<\\/h[2-6]>/giu;
    const headings = [...section.matchAll(headingPattern)];
    if (headings.length) {
      for (let i = 0; i < headings.length; i++) {
        const blockStart = headings[i].index + headings[i][0].length;
        const blockEnd = i + 1 < headings.length ? headings[i + 1].index : section.length;
        const block = section.slice(blockStart, blockEnd);
        const steps = [...block.matchAll(/<li[^>]*>([\\s\\S]*?)<\\/li>/giu)]
          .map(entry => stripHtml(entry[1])).filter(Boolean).slice(0, 10);
        const paragraphs = [...block.matchAll(/<p[^>]*>([\\s\\S]*?)<\\/p>/giu)]
          .map(entry => stripHtml(entry[1])).filter(Boolean);
        if (steps.length || paragraphs.length) groups.push({
          title: stripHtml(headings[i][1]),
          steps,
          explanation: paragraphs.join(" ")
        });
      }
    }
    return groups.slice(0, 8);
  } catch { return []; }
}

export async function getHeroKnowledge(hero) {
  const slug = slugify(hero?.nameEn || hero?.id);
  if (!slug) return { ok: false, error: "Неизвестный герой" };
  try {
    const [profilePayload, buildsPayload, countersPayload, combos] = await Promise.all([
      cachedJson("hero:" + slug, BASE + "/api/v1/heroes/" + encodeURIComponent(slug)),
      cachedJson("builds:" + slug, BASE + "/api/v1/heroes/" + encodeURIComponent(slug) + "/builds"),
      cachedJson("counters:" + slug, BASE + "/api/v1/heroes/" + encodeURIComponent(slug) + "/counters").catch(() => ({ data: null })),
      getCombos(slug)
    ]);
    const profile = profilePayload?.data || null;
    const equipment = await getEquipmentMap();
    const buildData = buildsPayload?.data || {};
    const normalizeBuild = build => ({
      ...build,
      items: (Array.isArray(build.items) ? build.items : []).map(name => ({
        name,
        image: BASE + "/visuels/objets/" + slugify(name) + ".webp"
      })),
      talents: (Array.isArray(build.talents) ? build.talents : []).map(name => ({
        name,
        image: BASE + "/visuels/talents/" + slugify(name) + ".webp"
      }))
    });
    const builds = Object.fromEntries(Object.entries(buildData).map(([lane, ranks]) => [
      lane,
      Object.fromEntries(Object.entries(ranks || {}).map(([rank, entries]) => [
        rank, Array.isArray(entries) ? entries.slice(0, 3).map(normalizeBuild) : []
      ]))
    ]));
    const images = profile?.images || {};
    return {
      ok: Boolean(profile),
      profile: profile ? {
        ...profile,
        images: {
          ...images,
          portrait: absoluteImage(images.portrait),
          icon: absoluteImage(images.icon)
        }
      } : null,
      builds,
      counters: countersPayload?.data || null,
      combos,
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
    const matches = [...html.matchAll(/(?:src|data-src)="([^"]*visuels\\/talents\\/([^"/?]+)\\.webp[^"]*)"/giu)];
    const unique = new Map();
    for (const match of matches) {
      const slug = match[2];
      if (!unique.has(slug)) unique.set(slug, {
        slug,
        name: slug.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" "),
        image: absoluteImage(match[1])
      });
    }
    return [...unique.values()];
  } catch { return []; }
}

export async function getGameAssets() {
  try {
    const [itemsPayload, emblemsPayload, talents] = await Promise.all([
      cachedJson("items", BASE + "/api/v1/items?locale=en"),
      cachedJson("emblems", BASE + "/api/v1/emblems?locale=en"),
      getTalentAssets()
    ]);
    const equipment = await getEquipmentMap();
    const items = (Array.isArray(itemsPayload?.data) ? itemsPayload.data : []).filter(item => !item.removed).map(item => ({
      ...item,
      image: absoluteImage(item.image) || BASE + "/visuels/objets/" + slugify(item.name) + ".webp"
    }));
    const emblems = (Array.isArray(emblemsPayload?.data) ? emblemsPayload.data : []).map(item => ({
      ...item, image: absoluteImage(item.image)
    }));
    return {
      ok: true,
      items,
      emblems,
      talents,
      sources: [itemsPayload?.source, emblemsPayload?.source].filter(Boolean),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    return { ok: false, items: [], emblems: [], error: String(error?.message || error).slice(0, 160) };
  }
}
