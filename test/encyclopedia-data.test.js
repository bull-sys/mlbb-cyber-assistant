import test from "node:test";
import assert from "node:assert/strict";
import { items, emblems, talents } from "../server/data.js";
import { getGameAssets } from "../server/mlbbdex-adapter.js";
import { readFile } from "node:fs/promises";

const appSource = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
const assetAdapterSource = await readFile(new URL("../server/mlbbdex-adapter.js", import.meta.url), "utf8");

test("encyclopedia has all seven emblem sets with visible factual attributes", () => {
  assert.equal(emblems.length, 7);
  assert.equal(new Set(emblems.map(item => item.id)).size, 7);
  for (const emblem of emblems) {
    assert.ok(emblem.name, "emblem name is required");
    assert.ok(emblem.image?.startsWith("https://"), emblem.name + " needs an HTTPS icon");
    assert.ok(Array.isArray(emblem.attributes) && emblem.attributes.length >= 2, emblem.name + " needs attribute details");
    assert.ok(emblem.description?.length > 30, emblem.name + " needs a meaningful description");
    assert.ok(emblem.source?.startsWith("https://"), emblem.name + " needs provenance");
  }
});

test("encyclopedia has all 26 emblem talents split into 8/8/10 tiers", () => {
  assert.equal(talents.length, 26);
  assert.equal(new Set(talents.map(item => item.id)).size, 26);
  assert.deepEqual(
    [1, 2, 3].map(tier => talents.filter(item => item.tier === tier).length),
    [8, 8, 10]
  );
  for (const talent of talents) {
    assert.ok(talent.name, "talent name is required");
    assert.ok(talent.nameEn, talent.name + " needs its English reference name");
    assert.ok(talent.image?.startsWith("https://"), talent.name + " needs an HTTPS icon");
    assert.ok(talent.description?.length > 20, talent.name + " needs a meaningful explanation");
    assert.ok(talent.effect?.length > 12, talent.name + " needs an effect summary");
    assert.ok(talent.source?.startsWith("https://"), talent.name + " needs provenance");
    assert.ok(talent.checkedAt, talent.name + " needs a verification date");
  }
});

test("item encyclopedia records have descriptions and the six shop categories", () => {
  assert.equal(items.length, 104);
  assert.ok(items.every(item => typeof item.englishName === "string" && item.englishName.length > 0));
  assert.equal(new Set(items.map(item => item.englishName)).size, 104);
  assert.ok(items.every(item => [1, 2, 3].includes(item.tier)));
  assert.ok(items.every(item => Number.isFinite(item.priceGold) && item.priceGold >= 0));
  const categories = new Set(items.map(item => item.category));
  assert.deepEqual(
    [...categories].sort(),
    ["Атака", "Защита", "Лес", "Магия", "Передвижение", "Роум"].sort()
  );
  const categoryCounts = Object.fromEntries(["Атака", "Магия", "Защита", "Передвижение", "Лес", "Роум"].map(category => [
    category,
    items.filter(item => (item.categories || [item.category]).includes(category)).length
  ]));
  assert.deepEqual(categoryCounts, { "Атака": 34, "Магия": 31, "Защита": 26, "Передвижение": 11, "Лес": 3, "Роум": 4 });
  const adaptive = items.filter(item => item.categories?.includes("Магия"));
  assert.deepEqual(adaptive.filter(item => ["Fleeting Time", "Sky Piercer"].includes(item.englishName)).map(item => item.englishName).sort(), ["Fleeting Time", "Sky Piercer"].sort());
  assert.deepEqual(items.find(item => item.englishName === "Fleeting Time").categories, ["Атака", "Магия", "Защита"]);
  assert.deepEqual(items.find(item => item.englishName === "Winter Crown").categories, ["Атака", "Магия"]);
  assert.ok(items.find(item => item.englishName === "Expert Gloves").stats.includes("+30 адаптивной атаки"));
  const itemById = id => items.find(item => item.englishName === id);
  assert.match(itemById("Dominance Ice").passive, /Lifebane/);
  assert.match(itemById("Valkyrie's Shield").passive, /25%.*3 секунды/);
  assert.match(itemById("Radiant Armor").passive, /0,4 секунды/);
  assert.match(itemById("Genius Wand").passive, /2,5.*3 раз/);
  assert.match(itemById("Blade of Despair").passive, /ниже 50%.*25%/);
  
  assert.match(itemById("Guardian Helmet").passive, /2,5%.*0,5%.*Defender/);
  assert.match(itemById("Queen's Wings").passive, /30%.*60 секунд.*15%/);
  assert.match(itemById("Chastise Pauldron").passive, /80%.*60 секунд/);
  assert.match(itemById("Brute Force Breastplate").passive, /8 адаптивной атаки.*6 зарядов.*25%/);
  assert.match(itemById("Cursed Helmet").passive, /1,2%.*125.*15.*3 зарядов/);
  assert.match(itemById("Oracle").passive, /25%/);
  assert.match(itemById("Thunder Belt").passive, /каждые 4 секунды.*чистый урон.*99%/);
  assert.match(itemById("Blood Wings").passive, /800.*100% магической силы.*150 скорости/);
  assert.match(itemById("Clock of Destiny").passive, /4,5.*6 зарядов.*15% здоровья/);
  assert.match(itemById("Concentrated Energy").passive, /5.*6 раз.*12%/);
  assert.match(itemById("Enchanted Talisman").passive, /15% максимальной маны.*10 секунд.*5%/);
  assert.match(itemById("Flask of the Oasis").passive, /35%.*100 × уровень героя.*60 секунд/);
  assert.match(itemById("Starlium Scythe").passive, /90.*60% общей магической силы.*15%/);
  assert.match(itemById("Wishing Lantern").passive, /каждые 900.*8% его текущего здоровья/);
  assert.match(itemById("Blade of the Heptaseas").passive, /5 секунд.*160.*40% общей физической атаки/);
  assert.match(itemById("Great Dragon Spear").passive, /После применения ультимейта.*30%.*7,5 секунды/);
  assert.match(itemById("Malefic Gun").passive, /30%.*12%.*10% скорости/);
  assert.match(itemById("Windtalker").passive, /5–2 секунды.*150–362.*200%/);
  assert.match(itemById("Demon Shoes").passive, /Mysticism.*4% маны.*2 секунд/);
  assert.equal(itemById("Magic Shoes").passive, undefined);
  assert.equal(itemById("Rapid Boots").passive, undefined);
  assert.match(itemById("Tough Boots").passive, /25%/);
  assert.match(itemById("Warrior Boots").passive, /4 дополнительной физической защиты.*до 20/);
  assert.equal(itemById("Arcane Boots").passive, undefined);
  assert.equal(itemById("Swift Boots").passive, undefined);
  assert.match(itemById("Haas' Claws").passive, /критические атаки.*20% скорости атаки.*2 секунды/);
  assert.match(itemById("Rose Gold Meteor").passive, /каждые 4 единицы.*Lifeline.*ниже 30%.*60 секунд/);
  assert.match(itemById("Magic Potion").passive, /120 секунд.*30 магической силы.*10%/);
  assert.match(itemById("Power Potion").passive, /120 секунд.*30 физической атаки.*15% физического вампиризма/);
  assert.match(itemById("Rock Potion").passive, /120 секунд.*500 к максимальному здоровью.*5%/);
  assert.equal(itemById("Ares Belt").passive, undefined);
  assert.match(itemById("Black Ice Shield").passive, /радиусе 5 единиц.*на 4.*максимум на 20/);
  assert.match(itemById("Dreadnaught Armor").passive, /4%.*2 секунды.*3 раз/);
  assert.match(itemById("Molten Essence").passive, /0,6%.*каждую секунду.*125/);
  assert.equal(itemById("Silence Robe").passive, undefined);
  assert.equal(itemById("Steel Legplates").passive, undefined);
  assert.match(itemById("Azure Blade").passive, /в течение 3 секунд.*50 чистого урона.*1,5 секунды/);
  assert.match(itemById("Elegant Gem").passive, /ниже 50%.*15% здоровья.*15% маны.*60 секунд/);
  assert.equal(itemById("Exotic Veil").passive, undefined);
  assert.equal(itemById("Fury Hammer").passive, undefined);
  assert.equal(itemById("Legion Sword").passive, undefined);
  assert.match(itemById("Magic Blade").passive, /ниже 30%.*60 × уровень героя.*60 секунд/);
  assert.equal(itemById("Mystic Container").passive, undefined);
  assert.equal(itemById("Ogre Tomahawk").passive, undefined);
  assert.equal(itemById("Regular Spear").passive, undefined);
  assert.equal(itemById("Rogue Meteor").passive, undefined);
  assert.equal(itemById("Tome of Evil").passive, undefined);
  assert.match(itemById("Swift Crossbow").passive, /40 адаптивного урона.*3% скорости атаки.*5 зарядов/);
  assert.equal(itemById("Boots").stats[0], "+20 скорости передвижения");
  assert.equal(itemById("Healing Necklace").stats[0], "+4 восстановления здоровья");
  assert.equal(itemById("Hero's Ring").stats[1], "+5% сокращения перезарядки");
  assert.equal(itemById("Leather Jerkin").stats[0], "+14 физической защиты");
  assert.equal(itemById("Magic Resist Cloak").stats[0], "+14 магической защиты");
  assert.equal(itemById("Vitality Crystal").stats[0], "+230 здоровья");
  assert.equal(itemById("Book of Sages").stats[1], "+5% сокращения перезарядки");
  assert.equal(itemById("Dagger").stats[0], "+15 физической атаки");
  assert.equal(itemById("Iron Hunting Bow").stats[1], "+5% сокращения перезарядки");
  assert.equal(itemById("Javelin").stats[0], "+8% шанса критического удара");
  assert.equal(itemById("Knife").stats[0], "+10% скорости атаки");
  assert.equal(itemById("Magic Necklace").stats[0], "+2 восстановления маны");
  assert.equal(itemById("Magic Wand").stats[0], "+45 магической силы");
  assert.equal(itemById("Mystery Codex").stats[0], "+15 магической силы");
  assert.equal(itemById("Power Crystal").stats[0], "+280 маны");
  assert.equal(itemById("Vampire Mallet").stats[1], "+8% физического вампиризма");
  assert.match(itemById("Conceal").passive, /40%.*5 секунд.*60 секунд.*1000 золота/);
  assert.match(itemById("Dire Hit").passive, /При 20 зарядах.*чистый урон.*Перезарядка — 15 секунд/);
  assert.match(itemById("Encourage").passive, /20 дополнительной гибридной защиты.*1000 золота/);
  assert.match(itemById("Favor").passive, /Каждые 15 секунд.*400 здоровья.*5 единиц/);
  assert.match(itemById("Bloody Retribution").passive, /40.*3 × уровень героя.*1%.*3 секунд/);
  assert.match(itemById("Bloody Retribution").effect, /100 чистого урона.*24% дополнительного здоровья.*35 секунд/);
  assert.match(itemById("Flame Retribution").effect, /71–120 физической атаки.*35 секунд/);
  assert.match(itemById("Ice Retribution").effect, /52–80 скорости передвижения.*35 секунд/);
  assert.match(itemById("Allow Throw").passive, /союзному Джавхеду.*подбрасывать/);
  assert.match(itemById("Broken Heart").passive, /иммунитет.*Сесилиона/);
  assert.match(itemById("Flower of Hope").passive, /Каждые 6 секунд.*100.*40% общей физической атаки.*30% общей магической силы/);
  assert.equal(itemById("Flower of Hope").stats[0], "+8% адаптивной атаки");
  assert.match(itemById("Lantern of Hope").passive, /Характеристики.*увеличиваются с уровнем героя/);
  assert.match(itemById("Throw Forbidden").passive, /иммунитет.*Джавхеда/);
  assert.match(itemById("Antique Cuirass").passive, /8%/);
  assert.match(itemById("Immortality").passive, /210 секунд/);
  assert.match(itemById("Sea Halberd").passive, /Punish/);
  assert.match(itemById("Divine Glaive").passive, /20%/);
  assert.match(itemById("Wind of Nature").passive, /90 секунд/);
  assert.match(itemById("Berserker's Fury").passive, /12%/);
  assert.match(itemById("Corrosion Scythe").passive, /Impulse/);
  assert.match(itemById("Demon Hunter Sword").passive, /8% текущего здоровья/);
  assert.match(itemById("Endless Battle").passive, /60% общей физической атаки/);
  assert.match(itemById("Feather of Heaven").passive, /30% общей магической силы/);
  assert.match(itemById("Holy Crystal").passive, /21–35%/);
  assert.match(itemById("Hunter Strike").passive, /50% скорости передвижения/);
  assert.match(itemById("Ice Queen Wand").passive, /10% на 2 секунды/);
  assert.match(itemById("Malefic Roar").passive, /30% физического пробивания/);
  assert.match(itemById("Golden Staff").passive, /Endless Strike/);
  assert.match(itemById("Lightning Truncheon").passive, /Каждые 6 секунд/);
  assert.equal(items.filter(item => item.verification === "checked against item detail page").length, 104);
  for (const item of items) {
    assert.ok(item.name, "item name is required");
    assert.ok(item.description?.length > 15, item.name + " needs a description");
    assert.ok(categories.has(item.category), item.name + " needs a valid shop category");
    assert.ok(item.source?.startsWith("https://"), item.name + " needs provenance");
    assert.ok(item.checkedAt, item.name + " needs a verification date");
    assert.ok(["partial", "checked against item detail page"].includes(item.verification), item.name + " needs a clear verification status");
  }
});

test("encyclopedia groups equipment cards under their shop category headings", () => {
  assert.match(appSource, /group\.type==="item"\)list\.sort/);
  assert.match(appSource, /ency-subgroup-heading/);
});

test("encyclopedia resolves item artwork from MLBBDex slugs", () => {
  assert.match(appSource, /function encyItemImage\(item\)/);
  assert.match(appSource, /encyRemoteAssets\?\.items\|\|\[\]/);
  assert.match(appSource, /entry\?\.slug===slug/);
  assert.ok(assetAdapterSource.includes("/visuels/objets/"));
  assert.match(appSource, /encyItemImage\(x\)/);
  assert.match(appSource, /onerror=.*ency-info-icon placeholder/s);
});

test("game asset adapter returns verified MLBBDex item image URLs", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => {
    const value = String(url);
    if (value.includes("/api/v1/items?")) {
      return { ok: true, json: async () => ({
        data: [
          { slug: "antique-cuirass", name: "Antique Cuirass", category: "Defense" },
          { slug: "berserkers-fury", name: "Berserker's Fury", category: "Attack" },
          { slug: "../bad", name: "Bad item" }
        ],
        source: { name: "Mobile Legends Wiki", url: "https://mobilelegends.fandom.com" }
      }) };
    }
    if (value.includes("/api/v1/emblems?")) {
      return { ok: true, json: async () => ({ data: [], source: null }) };
    }
    if (value.endsWith("/ru/emblems")) {
      return { ok: true, text: async () => "" };
    }
    throw new Error("Unexpected asset URL: " + value);
  };
  try {
    const result = await getGameAssets();
    assert.equal(result.items.length, 2);
    assert.deepEqual(result.items.map(item => item.image), [
      "https://mlbbdex.com/visuels/objets/antique-cuirass.webp",
      "https://mlbbdex.com/visuels/objets/berserkers-fury.webp"
    ]);
    assert.equal(result.items[0].slug, "antique-cuirass");
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("item records expose curated community nicknames and the current Sky Piercer label", () => {
 const byEnglish=name=>items.find(item=>item.englishName===name);
 assert.deepEqual(byEnglish("Sky Piercer").aliases,["Пронзайка","Небесный пронзатель"]);
 assert.equal(byEnglish("Sky Piercer").name,"Пронзающий небеса");
 assert.deepEqual(byEnglish("Endless Battle").aliases,["ББ","Бесконечка"]);
 for(const item of items.filter(item=>item.aliases))assert.equal(new Set(item.aliases).size,item.aliases.length,item.englishName+" aliases must be unique");
 assert.match(appSource,/Array\.isArray\(x\.aliases\)\?x\.aliases\.join\(" "\)/);
 assert.match(appSource,/ency-item-aliases/);
});


test("all 104 item records resolve to a deterministic MLBBDex artwork URL", () => {
 assert.ok(appSource.includes('return remote?.image||("https://mlbbdex.com/visuels/objets/"+slug+".webp");'));
 assert.match(appSource,/remote\?\.image\|\|\("https:\/\/mlbbdex\.com\/visuels\/objets\//);
});

 
test("special equipment uses dedicated current icon assets and renamed equipment keeps verified asset slugs", () => {
 const byEnglish=name=>items.find(item=>item.englishName===name);
 for(const name of ["Allow Throw","Broken Heart","Bloody Retribution","Flame Retribution","Ice Retribution","Conceal","Dire Hit","Encourage","Favor","Throw Forbidden"]) assert.ok(byEnglish(name)?.assetImage?.endsWith(".png"),name+" needs a dedicated icon");
 assert.equal(byEnglish("Valkyrie's Shield").assetSlug,"valkyrie-s-shield");
 assert.equal(byEnglish("Demon Shoes").assetSlug,"demon-shoes");
 assert.equal(byEnglish("Magic Shoes").assetSlug,"magic-shoes");
 assert.equal(byEnglish("Berserker's Fury").assetSlug,"berserker-s-fury");
});
