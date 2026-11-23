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
    const marker = /<h[1-6][^>]*>[\\s\\S]*?Комбо[\\s\\S]*?<\\/h[1-6]>/iu;
    const match = marker.exec(html);
    if (!match) return [];
    const level = Number(match[0].match(/^<h([1-6])/iu)?.[1] || 3);
    const start = match.index + match[0].length;
    const tail = html.slice(start);
    const nextHeading = new RegExp("<h[1-" + level + "][^>]*>", "iu");
    const next = tail.search(nextHeading);
    const section = next >= 0 ? tail.slice(0, next) : tail.slice(0, 16000);
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
    const [profilePayload, countersPayload, combos] = await Promise.all([
      cachedJson("hero:" + slug, BASE + "/api/v1/heroes/" + encodeURIComponent(slug)),
      cachedJson("counters:" + slug, BASE + "/api/v1/heroes/" + encodeURIComponent(slug) + "/counters").catch(() => ({ data: null })),
      getCombos(slug)
    ]);
    const profile = profilePayload?.data || null;
    const images = profile?.images || {};
    const { builds: _rankedBuilds, ...analysisWithoutBuilds } = profile?.analysis || {};
    if (profile) profile.analysis = analysisWithoutBuilds;
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
    const matches = [...html.matchAll(/(?:src|data-src)="([^"]*(?:visuels\\/talents\\/|visuels%2Ftalents%2F)([^"/?%]+)(?:\\.webp|%2Ewebp)[^"]*)"/giu)];
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
  try {
    const [emblemsPayload, talents] = await Promise.all([
      cachedJson("emblems", BASE + "/api/v1/emblems?locale=en"),
      getTalentAssets()
    ]);
    const emblems = (Array.isArray(emblemsPayload?.data) ? emblemsPayload.data : []).map(item => ({
      ...item, image: absoluteImage(item.image)
    }));
    return {
      ok: true,
      emblems,
      talents,
      sources: [emblemsPayload?.source].filter(Boolean),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    return { ok: false, emblems: [], talents: [], error: String(error?.message || error).slice(0, 160) };
  }
}
