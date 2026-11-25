import assert from "node:assert/strict";
import { items } from "../server/data.js";

const BASE = "https://mlbbdex.com";
const slugify = value => String(value || "")
  .normalize("NFKD").replace(/[\u0300-\u036f]/gu, "")
  .toLowerCase().replace(/&/g, "and").replace(/['’]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const response = await fetch(BASE + "/api/v1/items?locale=en", {
  headers: { "user-agent": "MLBB-Cyber-Assistant-item-audit/1.0" },
  signal: AbortSignal.timeout(20000)
});
assert.equal(response.ok, true, "MLBBDex item API returned HTTP " + response.status);
const payload = await response.json();
assert.ok(Array.isArray(payload.data), "MLBBDex response has no item array");
const upstream = new Map(payload.data.filter(x => x && typeof x.slug === "string").map(x => [x.slug, x]));
const missing = [];
const broken = [];
const checked = [];
for (const item of items) {
  const slug = item.assetSlug || slugify(item.englishName || item.name);
  const sourceItem = upstream.get(slug);
  if (item.assetImage) { checked.push({ name: item.name, slug, image: item.assetImage, source: "dedicated" }); continue; }
  if (!sourceItem) {
    missing.push({ name: item.name, englishName: item.englishName, slug });
    continue;
  }
  checked.push({ name: item.name, slug, image: BASE + "/visuels/objets/" + sourceItem.slug + ".webp", source: "MLBBDex" });
}
for (let offset = 0; offset < checked.length; offset += 8) {
  const batch = checked.slice(offset, offset + 8);
  await Promise.all(batch.map(async item => {
    try {
      const result = await fetch(item.image, { headers: { range: "bytes=0-0" }, signal: AbortSignal.timeout(12000) });
      const type = result.headers.get("content-type") || "";
      if (!result.ok || !type.includes("image")) broken.push({ ...item, status: result.status, contentType: type });
      await result.body?.cancel();
    } catch (error) {
      broken.push({ ...item, error: String(error?.message || error) });
    }
  }));
}
console.log(JSON.stringify({
  localItems: items.length,
  upstreamItems: payload.data.length,
  matchedSlugs: checked.filter(item => item.source === "MLBBDex").length,
  dedicatedImages: checked.filter(item => item.source === "dedicated").length,
  missingSlugs: missing,
  brokenImages: broken,
  upstreamCatalog: payload.data.map(item => ({ name: item.name, slug: item.slug, category: item.category }))
}, null, 2));
assert.equal(missing.length, 0, "Some local items do not match current MLBBDex item slugs");
assert.equal(broken.length, 0, "Some item image URLs do not return a valid image");
