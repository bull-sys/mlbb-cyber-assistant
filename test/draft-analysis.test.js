import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { heroes, items, emblems, talents } from "../server/data.js";
import { heroProfiles } from "../server/hero-profiles.js";
import { getDraftHeroAnalysisProfiles } from "../server/draft-hero-selection.js";
const draftAnalysisProfiles = getDraftHeroAnalysisProfiles();

// Keep production code untouched: load the local analyze() declaration from
// server/index.js and evaluate only that function with the real catalogue.
// This avoids starting Express, initializing SQLite, or requiring OpenAI/network.
const serverSource = await readFile(new URL("../server/index.js", import.meta.url), "utf8");
const analyzeDeclaration = "function analyze(";
const analyzeStart = serverSource.indexOf(analyzeDeclaration);
if (analyzeStart < 0) {
  throw new Error(`Draft analysis tests could not find ${analyzeDeclaration} in server/index.js`);
}

const signatureEnd = serverSource.indexOf(") {", analyzeStart);
if (signatureEnd < 0) {
  throw new Error("Draft analysis tests found function analyze( but could not find its body opener `) {` in server/index.js");
}
const bodyStart = signatureEnd + 2;

// Match the function's closing brace rather than slicing up to an endpoint
// string. Ignore braces inside quoted strings and comments so the extraction
// cannot silently truncate at a brace in a message or comment.
function findFunctionEnd(source, openBraceIndex) {
  let depth = 0;
  let state = "code";
  let escaped = false;

  for (let i = openBraceIndex; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (state === "line-comment") {
      if (char === "\n") state = "code";
      continue;
    }
    if (state === "block-comment") {
      if (char === "*" && next === "/") {
        state = "code";
        i += 1;
      }
      continue;
    }
    if (state === "single-quote" || state === "double-quote" || state === "template") {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (
        (state === "single-quote" && char === "'") ||
        (state === "double-quote" && char === '"') ||
        (state === "template" && char === "`")
      ) {
        state = "code";
      }
      continue;
    }

    if (char === "/" && next === "/") {
      state = "line-comment";
      i += 1;
    } else if (char === "/" && next === "*") {
      state = "block-comment";
      i += 1;
    } else if (char === "'") {
      state = "single-quote";
    } else if (char === '"') {
      state = "double-quote";
    } else if (char === "`") {
      state = "template";
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return i + 1;
      if (depth < 0) break;
    }
  }

  return -1;
}

const analyzeEnd = findFunctionEnd(serverSource, bodyStart);
if (analyzeEnd < 0) {
  throw new Error("Draft analysis tests found function analyze() but could not find its matching closing brace in server/index.js");
}

const endpointMarker = 'app.post("/api/ai/draft"';
const endpointStart = serverSource.indexOf(endpointMarker, analyzeEnd);
if (endpointStart < 0) {
  throw new Error(`Draft analysis tests found the end of analyze() but could not find endpoint marker ${endpointMarker} after it in server/index.js`);
}
if (serverSource.slice(analyzeEnd, endpointStart).trim() !== "") {
  throw new Error(`Draft analysis tests expected ${endpointMarker} immediately after analyze(), but found other code between them`);
}

const analyzeSource = serverSource.slice(analyzeStart, analyzeEnd);
let analyze;
try {
  analyze = new Function("heroes", "items", "emblems", "talents", "heroProfiles", "draftAnalysisProfiles", `${analyzeSource}\nreturn analyze;`)(heroes, items, emblems, talents, heroProfiles, draftAnalysisProfiles);
} catch (error) {
  throw new Error(`Draft analysis tests could not compile the complete analyze() function from server/index.js: ${error.message}`, { cause: error });
}

const run = (overrides = {}) => analyze({ lane: "Лес", ...overrides });

test("candidate filtering respects the selected lane, enemy picks, and already selected heroes", () => {
  const result = run({ lane: "Лес", enemies: ["Хелкарт"], myHero: "Линг" });

  assert.equal(result.counters.length, 3);
  assert.ok(result.counters.every(candidate => candidate.role === "Лес"));
  assert.ok(!result.counters.some(candidate => candidate.name === "Хелкарт"));
  assert.ok(!result.counters.some(candidate => candidate.name === "Линг"));
  assert.ok(result.counters.every(candidate => candidate.profileEvidence?.matchupSource));
});test("counter-picks return at least three ranked, sourced options for the selected lane", () => {
  const result = run({ lane: "Золото", enemies: ["Эйдора"] });

  assert.equal(result.counters.length, 3);
  assert.ok(result.counters.every(candidate => candidate.role === "Золото"));
  assert.ok(result.counters.every(candidate => candidate.profileEvidence?.identity));
  assert.ok(result.counters.every(candidate => candidate.profileEvidence?.matchupSource));
  assert.ok(result.counters.every(candidate => candidate.reason.length > 0));
  assert.ok(result.counters.every(candidate => candidate.reason.trim().length > 0));
});test("enemy composition threats reflect the tags and archetypes in the catalogue", () => {
  const result = run({
    enemies: ["Минотавр", "Эйдора", "Нана", "Мия", "Тигрил"]
  });

  assert.deepEqual(result.threats, [
    "Восстановление здоровья и устойчивость",
    "Высокая магическая угроза",
    "Высокая скорость атаки",
    "Плотная передняя линия",
    "Много контроля",
    "Высокий взрывной урон"
  ]);
});

test("allied composition is considered without restricting the candidate pool to the legacy list", () => {
  const result = run({ lane: "Роум", allies: ["Тигрил"], enemies: ["Лесли"] });

  assert.equal(result.counters.length, 3);
  assert.ok(result.counters.every(candidate => candidate.role === "Роум"));
  assert.ok(result.counters.every(candidate => candidate.profileEvidence?.matchupSource));
  assert.ok(result.counters.every(candidate => !["Тигрил", "Лесли"].includes(candidate.name)));
});test("items answer sustain and double-mage threats while respecting mage category filtering", () => {
  const result = run({
    lane: "Мид",
    myHero: "Эйдора",
    enemies: ["Минотавр", "Эйдора", "Нана"]
  });

  assert.ok(result.build.includes("Щит Валькирии"));
  const athena = items.find(item => item.name === "Щит Валькирии");
  assert.ok(athena.tags.includes("magic-defense"));
  assert.ok(athena.tags.includes("anti-magic-burst"));
  assert.equal(items.filter(item => item.name === "Щит Валькирии").length, 1);
  const athenaRecommendation = result.buildDetails.find(item => item.name === "Щит Валькирии");
  assert.ok(athenaRecommendation);
  assert.ok(athenaRecommendation.against.includes("Эйдора"));
  assert.ok(athenaRecommendation.against.includes("Нана"));
  assert.ok(result.build.includes("Пылающий жезл"));
  const antiHealCount = result.build.filter(name =>
    items.find(item => item.name === name)?.tags.includes("anti-heal")
  ).length;
  assert.equal(antiHealCount, 1);
  assert.ok(result.build.every(name =>
    items.find(item => item.name === name)?.category !== "Атака"
  ));
});

test("emblem selection follows selected hero archetype", async t => {
  const cases = [
    ["Эйдора", "Мага"],
    ["Кэрри", "Стрелка"],
    ["Тигрил", "Танка"],
    ["Ангела", "Поддержки"],
    ["Теризла", "Бойца"],
    ["Линг", "Убийцы"]
  ];

  for (const [myHero, expected] of cases) {
    await t.test(`${myHero} selects ${expected}`, () => {
      assert.equal(run({ myHero }).emblem, expected);
    });
  }
});

test("emblem and talent recommendations use the selected hero profile and real catalogue entries", () => {
  const talentById = new Map(talents.map(entry => [entry.id, entry]));
  const emblemById = new Map(emblems.map(entry => [entry.id, entry]));

  assert.equal(heroProfiles.length, 133);
  for (const profile of heroProfiles) {
    const configured = profile.emblemProfile;
    assert.ok(configured?.emblemId, profile.id + " emblem ID");
    assert.ok(emblemById.has(configured.emblemId), profile.id + " emblem exists in catalogue");
    assert.equal(configured.talentIds?.length, 3, profile.id + " has three talent tiers");
    const configuredTalents = configured.talentIds.map(id => talentById.get(id));
    assert.ok(configuredTalents.every(Boolean), profile.id + " talents exist in catalogue");
    assert.deepEqual(configuredTalents.map(entry => entry.tier).sort(), [1, 2, 3], profile.id + " has one talent per tier");

    const result = run({ myHero: profile.names.ru });
    assert.equal(result.emblemDetails?.id, configured.emblemId, profile.names.ru + " emblem");
    assert.equal(result.talentRecommendations.length, 3, profile.names.ru + " has three selected talents");
    assert.deepEqual(
      result.talentRecommendations.map(entry => entry.tier),
      [1, 2, 3],
      profile.names.ru + " has one recommendation per tier"
    );
    for (const recommendation of result.talentRecommendations) {
      assert.ok(talentById.has(recommendation.id), profile.names.ru + " recommendation exists in catalogue");
      if (!recommendation.contextual) {
        assert.equal(recommendation.id, configured.talentIds[recommendation.tier - 1], profile.names.ru + " retains baseline when no contextual rule wins");
      }
    }
    assert.deepEqual(result.talentTiers, result.talentRecommendations.map(entry => entry.name));
  }
});

test("current patch talent catalogue matches the verified 2.2.23 reference snapshot", () => {
  const byId = new Map(talents.map(talent => [talent.id, talent]));
  const expected = {
    fatal: "+10% дополнительного критического урона",
    firmness: "+6 физической и магической защиты",
    "festival-of-blood": "максимум 8 стаков",
    "master-assassin": "+7% урона",
    "pull-yourself-together": "−15%",
    tenacity: "+15 физической и магической защиты",
    "weapon-master": "+5%",
    "quantum-charge": "Перезарядка — 8 секунд",
    "killing-spree": "После устранения вражеского героя",
    "war-cry": "Перезарядка — 6 секунд"
  };

  for (const [id, phrase] of Object.entries(expected)) {
    assert.ok(byId.has(id), id + " exists");
    assert.ok(byId.get(id).effect.includes(phrase), id + " has current effect text");
    assert.equal(byId.get(id).checkedAt, "2026-11-25", id + " has current review date");
    assert.equal(byId.get(id).source, "https://mlbbnexus.com/academy/emblems", id + " has provenance");
  }
  assert.ok(byId.get("impure-rage").effect.includes("восстанавливает 1% здоровья"));
  assert.ok(!byId.get("focusing-mark").effect.includes("+10% скорости передвижения"));
  assert.ok(byId.get("weakness-finder").effect.includes("не ниже 3 секунд"));
});

test("hybrid defense talent uses verified damage types, not hero class labels", () => {
  const magicOnly = run({
    lane: "Роум",
    myHero: "Тигрил",
    enemies: ["Карина", "Циклоп"]
  });
  const mixedDamage = run({
    lane: "Роум",
    myHero: "Тигрил",
    enemies: ["Карина", "Минотавр"]
  });

  assert.notEqual(
    magicOnly.talentRecommendations.find(entry => entry.tier === 1)?.id,
    "firmness",
    "two magic-damage heroes should not be mislabeled as physical threats by their classes"
  );
  assert.equal(
    mixedDamage.talentRecommendations.find(entry => entry.tier === 1)?.id,
    "firmness",
    "hybrid defense is prioritized when the enemy composition contains both physical and magic damage"
  );
});

test("mass talent matrix returns valid tiered recommendations for every hero across enemy archetypes", () => {
  const laneMap = {
    "Лес": "Лес",
    "Золото": "Золото",
    "Золотая линия": "Золото",
    "Линия золота": "Золото",
    "Опыт": "Опыт",
    "EXP-линия": "Опыт",
    "Линия опыта": "Опыт",
    "Мид": "Мид",
    "Средняя линия": "Мид",
    "Центр": "Мид",
    "Роум": "Роум"
  };
  const enemySets = [
    ["Карина", "Эйдора", "Хелкарт"],
    ["Тигрил", "Минотавр", "Теризла"],
    ["Нана", "Мия", "Эстес"]
  ];
  const talentById = new Map(talents.map(entry => [entry.id, entry]));
  let scenarios = 0;

  for (const profile of heroProfiles) {
    const lane = (profile.lanes || []).map(value => laneMap[value]).find(Boolean);
    assert.ok(lane, profile.names.ru + " has a supported lane");
    for (const enemySet of enemySets) {
      const enemies = enemySet.filter(name => name !== profile.names.ru);
      const result = run({ lane, myHero: profile.names.ru, enemies });
      assert.equal(result.talentRecommendations.length, 3, profile.names.ru + " returns three talents");
      assert.deepEqual(result.talentRecommendations.map(entry => entry.tier), [1, 2, 3]);
      assert.equal(new Set(result.talentRecommendations.map(entry => entry.id)).size, 3);
      for (const recommendation of result.talentRecommendations) {
        assert.ok(talentById.has(recommendation.id), profile.names.ru + " uses a catalog talent");
        assert.equal(talentById.get(recommendation.id).tier, recommendation.tier);
        assert.ok(recommendation.reason && recommendation.effect);
      }
      scenarios += 1;
    }
  }

  assert.equal(scenarios, heroProfiles.length * enemySets.length);
});

test("talent recommendations adapt to lane and confirmed enemy threats", () => {
  const marksman = heroProfiles.find(profile => profile.roles?.includes("Стрелок") && profile.combat?.dps === "high");
  const burstEnemies = heroProfiles.filter(profile => profile.id !== marksman?.id &&
    ["high", "very_high"].includes(profile.combat?.burst)).slice(0, 2);
  assert.ok(marksman, "a high-DPS marksman profile exists");
  assert.equal(burstEnemies.length, 2, "two high-burst enemy profiles exist");
  const result = run({
    lane: "Золото",
    myHero: marksman.names.ru,
    enemies: burstEnemies.map(profile => profile.names.ru)
  });
  assert.equal(result.talentRecommendations.length, 3);
  assert.equal(result.talentRecommendations.find(entry => entry.tier === 1)?.id, "vitality");
  assert.equal(result.talentRecommendations.find(entry => entry.tier === 2)?.id, "tenacity");
  assert.ok(result.talentRecommendations.filter(entry => entry.contextual).length >= 2);
  assert.ok(result.talentRecommendations.every(entry => entry.reason && entry.effect));
});

test("jungle lane prioritizes Seasoned Hunter for the second talent tier", () => {
  const assassin = heroProfiles.find(profile => profile.roles?.includes("Убийца"));
  const result = run({ lane: "Лес", myHero: assassin.names.ru, enemies: [] });
  assert.equal(result.talentRecommendations.find(entry => entry.tier === 2)?.id, "seasoned-hunter");
});

test("talent recommendations are empty when no own hero is selected", () => {
  const result = run();
  assert.deepEqual(result.talentTiers, []);
  assert.deepEqual(result.talentRecommendations, []);
  assert.equal(result.emblemDetails, null);
});

test("battle spell is Retribution only for the jungle lane", () => {
  assert.equal(run({ lane: "Лес" }).spell, "Возмездие");
  for (const lane of ["Золото", "Опыт", "Мид", "Роум"]) {
    assert.equal(run({ lane }).spell, "Вспышка", `${lane} lane`);
  }
});

test("duplicate enemy names have the same analysis effect as one pick", () => {
  const once = run({ lane: "Золото", enemies: ["Эйдора"] });
  const repeated = run({ lane: "Золото", enemies: ["Эйдора", "Эйдора"] });

  assert.deepEqual(repeated, once);
});

test("empty enemy composition activates FIRST PICK and returns three lane-eligible options", () => {
  const result = run({ lane: "Лес", enemies: [] });

  assert.deepEqual(result.threats, []);
  assert.equal(result.draftMode, "first-pick");
  assert.equal(result.counters.length, 3);
  assert.ok(result.counters.every(candidate => candidate.role === "Лес"));
  assert.ok(result.counters.every(candidate => candidate.matchupType === "first-pick"));
  assert.ok(result.counters.every(candidate => candidate.matchedEnemies.length === 0));
  assert.ok(result.counters.every(candidate => candidate.reason.includes("FIRST PICK")));
  assert.ok(result.firstPickMeta?.limitation.includes("не являются контрпиками"));
});

test("FIRST PICK recommendations respect all five lanes and exclude known allies", () => {
  for (const lane of ["Лес", "Золото", "Опыт", "Мид", "Роум"]) {
    const result = run({ lane, enemies: [], allies: ["Тигрил"] });
    assert.equal(result.counters.length, 3, lane);
    assert.ok(result.counters.every(candidate => candidate.role === lane), lane);
    assert.ok(result.counters.every(candidate => candidate.name !== "Тигрил"), lane);
    assert.equal(result.draftMode, "first-pick", lane);
  }
});

test("unsupported lane yields no candidates and uses the non-jungle spell fallback", () => {
  const result = run({ lane: "Неизвестная линия", enemies: ["Эйдора"] });

  assert.deepEqual(result.counters, []);
  assert.equal(result.spell, "Вспышка");
});

test("counter-pick ranking is deterministic and sorted by descending score", () => {
  const result = run({ lane: "Золото", enemies: ["Эйдора"] });
  const repeated = run({ lane: "Золото", enemies: ["Эйдора"] });

  assert.deepEqual(result.counters, repeated.counters);
  assert.equal(result.counters.length, 3);
  assert.ok(result.counters.every((candidate, index, list) =>
    index === 0 || list[index - 1].score >= candidate.score
  ));
});test("draft analysis returns hero-specific mechanics, counterplay weaknesses, and provenance", () => {
  const result = run({ enemies: ["Хелкарт"] });
  assert.equal(result.enemyMatchups.length, 1);
  const matchup = result.enemyMatchups[0];
  assert.equal(matchup.name, "Хелкарт");
  assert.ok(matchup.mechanics.length > 0);
  assert.ok(matchup.weaknesses.length > 0);
  assert.ok(matchup.reviewedAt);
  assert.ok(matchup.sources.length > 0);
});

test("team plan adapts to enemy composition threats", () => {
  const result = run({ enemies: ["Хелкарт", "Тигрил", "Минотавр"] });
  const titles = result.teamPlan.map(item => item.title);
  assert.ok(titles.includes("Защити уязвимую заднюю линию"));
  assert.ok(titles.includes("Не собирайтесь в одну точку до инициации"));
  assert.ok(titles.includes("Срежь восстановление и фокусируйте одну цель"));
});

test("defensive, movement, and jungle utility catalogue entries have source and structured metadata", () => {
  const required = [
    "Antique Cuirass", "Valkyrie's Shield", "Black Ice Shield",
    "Dreadnaught Armor", "Healing Necklace", "Hero's Ring",
    "Leather Jerkin", "Magic Resist Cloak", "Molten Essence",
    "Silence Robe", "Steel Legplates", "Vitality Crystal",
    "Arcane Boots", "Swift Boots",
    "Bloody Retribution", "Flame Retribution", "Ice Retribution"
  ];
  for (const englishName of required) {
    const item = items.find(entry => entry.englishName === englishName);
    assert.ok(item, `missing catalogue entry: ${englishName}`);
    assert.ok(item.name, `${englishName} Russian label`);
    assert.ok(item.category, `${englishName} category`);
    assert.ok(item.source, `${englishName} source`);
    assert.ok(item.checkedAt, `${englishName} verification date`);
  }
  assert.equal(items.find(entry => entry.englishName === "Arcane Boots").category, "Передвижение");
  assert.equal(items.find(entry => entry.englishName === "Bloody Retribution").category, "Лес");
});

test("draft analysis reports the size of its current counter-item catalogue", () => {
  const result = run({ myHero: "Роджер", enemies: ["Хелкарт"] });
  assert.equal(result.itemCatalogCount, items.length);
});

test("counter build adapts to Roger versus Helcurt without suggesting mage or marksman-only items", () => {
  const result = run({ myHero: "Роджер", enemies: ["Хелкарт"] });
  const names = result.buildDetails.map(item => item.name);
  assert.ok(names.includes("Древняя кираса"));
  assert.ok(names.includes("Бессмертие"));
  assert.ok(!names.includes("Щит Валькирии"));
  assert.ok(!names.includes("Ветер природы"));
  assert.ok(result.buildDetails.every(item => item.against.includes("Хелкарт")));
  assert.ok(result.enemyMatchups.find(item => item.name === "Хелкарт").counterItems.length > 0);
});

test("counter build responds separately to healing, attack speed, and magic burst in a full enemy team", () => {
  const result = run({ lane: "Золото", myHero: "Мия", enemies: ["Эйдора", "Минотавр", "Мия"] });
  const names = result.buildDetails.map(item => item.name);
  assert.ok(names.includes("Господство льда"));
  assert.ok(names.includes("Щит Валькирии"));
  assert.ok(names.includes("Шипованная броня"));
  assert.ok(result.enemyMatchups.find(item => item.name === "Эйдора").counterItems.some(item => item.name === "Щит Валькирии"));
  assert.ok(result.enemyMatchups.find(item => item.name === "Минотавр").counterItems.some(item => item.name === "Господство льда"));
});

test("without a selected hero the counter build does not guess offensive item compatibility", () => {
  const result = run({ enemies: ["Хелкарт", "Эйдора"] });
  assert.ok(result.buildDetails.every(item => item.category === "Защита"));
});

test("counter-picks include profile-specific identity, strength, and caution", () => {
  const result = run({ lane: "Золото", enemies: ["Эйдора"] });
  assert.ok(result.counters.length > 0);
  for (const candidate of result.counters) {
    assert.ok(candidate.profileEvidence, candidate.name + " profile evidence");
    assert.ok(candidate.profileEvidence.identity, candidate.name + " identity");
    assert.ok(candidate.profileEvidence.strength, candidate.name + " strength");
    assert.ok(candidate.profileEvidence.caution, candidate.name + " caution");
  }
});
test("all 133 hero profiles are available to the counter-pick engine", () => {
  const result = run({ lane: "Опыт", enemies: ["Сора"] });
  assert.equal(result.counters.length, 3);
  assert.ok(result.counters.some(candidate =>
    candidate.name === "Мартис" && candidate.matchedEnemies.includes("Сора")
  ));
});

test("enemy heroes outside the old 32-entry list are resolved from the full profile catalogue", () => {
  const result = run({ lane: "Мид", enemies: ["Лолита"] });
  assert.equal(result.enemyMatchups.length, 1);
  assert.equal(result.enemyMatchups[0].name, "Лолита");
  assert.equal(result.enemyMatchups[0].confidence, "partial");
  assert.ok(result.enemyMatchups[0].mechanics.length > 0);
  assert.equal(result.counters.length, 3);
});

test("current live-patch lane leaders are present in the correct eligible lanes", () => {
  // Snapshot of MLBBDex's 2026-11-24 Original Server report for patch 2.2.23.
  // This is a lane-eligibility smoke test, not a claim that meta leaders are counters.
  const laneAliases = {
    "Лес": "Лес",
    "Линия опыта": "Опыт",
    "EXP-линия": "Опыт",
    "Опыт": "Опыт",
    "Золотая линия": "Золото",
    "Линия золота": "Золото",
    "Золото": "Золото",
    "Средняя линия": "Мид",
    "Центр": "Мид",
    "Мид": "Мид",
    "Роум": "Роум"
  };
  const leaders = {
    "Золото": ["Обсидия", "Ханаби", "Бруно"],
    "Лес": ["Хирара", "Сан", "Сабер"],
    "Мид": ["Эйдора", "Валир", "Ксавьер"],
    "Опыт": ["Маша", "Сан", "Глу"],
    "Роум": ["Марсель", "Белерик", "Эстес"]
  };

  for (const [lane, names] of Object.entries(leaders)) {
    for (const name of names) {
      const profile = heroProfiles.find(entry => entry.names?.ru === name);
      assert.ok(profile, name + " exists in the tactical profile catalogue");
      assert.ok(
        (profile.lanes || []).some(value => laneAliases[value] === lane),
        name + " is eligible for " + lane
      );
      assert.ok(draftAnalysisProfiles.some(entry => entry.id === profile.id), name + " is included in draft analysis");
    }
  }
});

test("ranked matchup advantage remains stronger than capped synergy and composition bonuses", () => {
  const enemy = heroProfiles.find(profile => profile.names.ru === "Эйдора");
  const candidate = heroProfiles.find(profile => profile.names.ru === "Кэрри");
  const result = run({
    lane: "Золото",
    enemies: ["Эйдора"],
    allies: ["Валир"],
    rankedMatchups: {
      [enemy.id]: {
        [candidate.id]: {
          opponentId: enemy.id,
          candidateId: candidate.id,
          source: "Rone Arena API",
          sourceUrl: "https://arena.rone.dev/api/heroes/eudora/counters?rank=legend&days=15",
          rankBracket: "legend",
          windowDays: 15,
          lane: null,
          advantagePp: 4.2,
          sampleSize: null,
          direction: "candidate-favourable",
          evidenceKind: "measured-ranked-pair"
        }
      }
    },
    rankedMatchupMeta: { rankBracket: "legend", laneScoped: false, sampleSizeAvailable: false }
  });
  const karrie = result.counters.find(candidate => candidate.name === "Кэрри");
  assert.ok(karrie, "ranked-positive Karrie remains in the top three");
  assert.equal(karrie.matchupType, "ranked-advantage");
  const secondaryOnly = result.counters.filter(candidate =>
    ["team-synergy", "situational"].includes(candidate.matchupType)
  );
  for (const candidate of secondaryOnly) {
    assert.ok(karrie.score > candidate.score, "strong measured pair signal outranks secondary-only candidate");
  }
});

test("enemy and ally input order does not change counterpick ranking", () => {
  const first = run({
    lane: "Мид",
    enemies: ["Хелкарт", "Тигрил", "Эйдора"],
    allies: ["Ангела", "Бруно"]
  });
  const reversed = run({
    lane: "Мид",
    enemies: ["Эйдора", "Тигрил", "Хелкарт"],
    allies: ["Бруно", "Ангела"]
  });
  const compact = result => result.counters.map(candidate => ({
    name: candidate.name,
    score: candidate.score,
    matchupType: candidate.matchupType,
    matchedEnemies: [...candidate.matchedEnemies].sort(),
    riskyEnemies: [...candidate.riskyEnemies].sort()
  }));
  assert.deepEqual(compact(reversed), compact(first));
});

test("full draft scenario matrix: every catalogue hero can be analyzed against all five selected lanes", () => {
  const lanes = ["Лес", "Золото", "Опыт", "Мид", "Роум"];
  const failures = [];

  for (const lane of lanes) {
    for (const enemy of draftAnalysisProfiles) {
      const enemyName = enemy.names?.ru;
      if (!enemyName) {
        failures.push({ lane, enemy: enemy.id, issue: "missing Russian display name" });
        continue;
      }

      const result = run({ lane, enemies: [enemyName] });
      if (result.enemyMatchups.length !== 1 ||
          result.enemyMatchups[0].name !== enemyName) {
        failures.push({ lane, enemy: enemyName, issue: "enemy profile was not resolved" });
      }
      if (result.counters.length !== 3) {
        failures.push({ lane, enemy: enemyName, issue: "expected three recommendations", count: result.counters.length });
        continue;
      }
      if (result.counters.some(candidate => candidate.role !== lane)) {
        failures.push({ lane, enemy: enemyName, issue: "recommendation escaped selected lane" });
      }
      if (result.counters.some(candidate => candidate.name === enemyName)) {
        failures.push({ lane, enemy: enemyName, issue: "enemy hero recommended as own counterpick" });
      }
      if (result.counters.some(candidate => !candidate.profileEvidence?.matchupSource)) {
        failures.push({ lane, enemy: enemyName, issue: "recommendation missing source provenance" });
      }
      if (result.counters.some(candidate => !candidate.reason?.trim())) {
        failures.push({ lane, enemy: enemyName, issue: "recommendation missing explanation" });
      }
    }
  }

  assert.deepEqual(failures, [], JSON.stringify(failures.slice(0, 20), null, 2));
});

test("multi-enemy scenario matrix: three- and five-hero drafts keep lane lock and exclude occupied picks", () => {
  const scenarios = [
    { lane: "Лес", enemies: ["Хелкарт", "Тигрил", "Эйдора"], allies: ["Бруно"] },
    { lane: "Золото", enemies: ["Нолан", "Минотавр", "Нана", "Теризла", "Ханзо"], allies: ["Ангела"] },
    { lane: "Опыт", enemies: ["Лесли", "Эйдора", "Тигрил"], allies: ["Линг", "Мия"] },
    { lane: "Мид", enemies: ["Хелкарт", "Теризла", "Мия", "Франко", "Нана"], allies: ["Тигрил"] },
    { lane: "Роум", enemies: ["Лесли", "Эйдора", "Нолан"], allies: ["Бруно", "Лилия"] }
  ];

  for (const scenario of scenarios) {
    const result = run(scenario);
    assert.equal(result.counters.length, 3, scenario.lane);
    assert.ok(result.counters.every(candidate => candidate.role === scenario.lane), scenario.lane);
    const occupied = new Set([...scenario.enemies, ...scenario.allies]);
    assert.ok(result.counters.every(candidate => !occupied.has(candidate.name)), scenario.lane);
    assert.ok(result.counters.every(candidate => candidate.reason?.trim()), scenario.lane);
  }
});

test("matchup labels are evidence-based and never call a situational pick a direct counter", () => {
  const result = run({ lane: "Роум", enemies: ["Лесли", "Эйдора", "Тигрил"] });
  for (const candidate of result.counters) {
    if (candidate.matchupType === "direct-counter") {
      assert.ok(candidate.matchedEnemies.length > 0, candidate.name);
    } else {
      assert.deepEqual(candidate.matchedEnemies, [], candidate.name);
    }
    if (candidate.matchupType === "situational") {
      assert.match(candidate.reason, /ситуационн/i, candidate.name);
    }
  }
});

test("negative matchup evidence is exposed instead of being hidden by positive signals", () => {
  let observed = null;

  for (const lane of ["Лес", "Золото", "Опыт", "Мид", "Роум"]) {
    for (const profile of heroProfiles) {
      if (!(profile.lanes || []).some(value => ({
        "EXP-линия": "Опыт", "Линия опыта": "Опыт",
        "Золотая линия": "Золото", "Линия золота": "Золото",
        "Средняя линия": "Мид", "Центр": "Мид"
      })[value] || value === lane)) continue;
      const strong = profile.matchups?.strongAgainst || [];
      const weak = profile.matchups?.weakAgainst || [];
      if (!strong.length || !weak.length) continue;

      const enemyIds = [...new Set([...strong, weak[0]])];
      const enemyNames = enemyIds
        .map(id => heroProfiles.find(entry => entry.id === id)?.names?.ru)
        .filter(Boolean);
      const weakEnemyName = heroProfiles.find(entry => entry.id === weak[0])?.names?.ru;
      if (!weakEnemyName || !enemyNames.includes(weakEnemyName)) continue;

      const result = run({ lane, enemies: enemyNames });
      const candidate = result.counters.find(entry =>
        entry.name === profile.names?.ru &&
        entry.riskyEnemies.includes(weakEnemyName)
      );
      if (candidate) {
        observed = { lane, candidate, weakEnemyName };
        break;
      }
    }
    if (observed) break;
  }

  assert.ok(observed, "expected at least one returned candidate to retain a known negative matchup signal");
  assert.match(observed.candidate.reason, /риск/i);
  assert.ok(observed.candidate.riskyEnemies.includes(observed.weakEnemyName));
});

test("direct matchup evidence outranks team synergy and generic composition fit", () => {
  let comparisons = 0;
  for (const lane of ["Лес", "Золото", "Опыт", "Мид", "Роум"]) {
    for (const enemy of heroProfiles) {
      const result = run({ lane, enemies: [enemy.names.ru] });
      const directIndex = result.counters.findIndex(candidate => candidate.matchupType === "direct-counter");
      const secondaryIndexes = result.counters
        .map((candidate, index) => ({ candidate, index }))
        .filter(({ candidate }) => ["team-synergy", "situational"].includes(candidate.matchupType))
        .map(({ index }) => index);
      if (directIndex < 0 || !secondaryIndexes.length) continue;
      const bestSecondaryIndex = secondaryIndexes[0];
      const direct = result.counters[directIndex];
      const secondary = result.counters[bestSecondaryIndex];
      assert.ok(
        direct.score >= secondary.score,
        lane + " vs " + enemy.names.ru + ": direct matchup should not rank below a secondary-only option"
      );
      if (direct.score === secondary.score) {
        assert.ok(directIndex < bestSecondaryIndex, "direct matchup wins score ties");
      }
      comparisons += 1;
    }
  }
  assert.ok(comparisons > 0, "scenario matrix should contain direct-vs-secondary comparisons");
});

test("mixed matchup classification preserves both positive and negative signals", () => {
  let mixed = null;
  for (const lane of ["Лес", "Золото", "Опыт", "Мид", "Роум"]) {
    for (const profile of heroProfiles) {
      const strong = profile.matchups?.strongAgainst || [];
      const weak = profile.matchups?.weakAgainst || [];
      if (!strong.length || !weak.length) continue;
      const enemyIds = [...new Set([...strong, weak[0]])];
      const enemyNames = enemyIds
        .map(id => heroProfiles.find(entry => entry.id === id)?.names?.ru)
        .filter(Boolean);
      const weakEnemyName = heroProfiles.find(entry => entry.id === weak[0])?.names?.ru;
      const result = run({ lane, enemies: enemyNames });
      const candidate = result.counters.find(entry =>
        entry.name === profile.names?.ru &&
        entry.matchupType === "mixed-matchup" &&
        entry.matchedEnemies.length > 0 &&
        entry.riskyEnemies.includes(weakEnemyName)
      );
      if (candidate) {
        mixed = candidate;
        break;
      }
    }
    if (mixed) break;
  }
  assert.ok(mixed, "expected a returned mixed-matchup candidate with positive and negative signals");
  assert.match(mixed.reason, /неоднозначный/i);
});



test("ranked matchup evidence is scored separately from lane eligibility and static matchup links", () => {
  const enemy = heroProfiles.find(profile => profile.names.ru === "Эйдора");
  const candidate = heroProfiles.find(profile => profile.names.ru === "Кэрри");
  const result = run({
    lane: "Золото",
    enemies: ["Эйдора"],
    rankedMatchups: {
      [enemy.id]: {
        [candidate.id]: {
          opponentId: enemy.id,
          candidateId: candidate.id,
          source: "Rone Arena API",
          sourceUrl: "https://arena.rone.dev/api/heroes/eudora/counters?rank=legend&days=15",
          observedAt: "2026-11-24T12:00:00.000Z",
          rankBracket: "legend",
          windowDays: 15,
          lane: null,
          advantagePp: 4.2,
          sampleSize: null,
          direction: "candidate-favourable",
          evidenceKind: "measured-ranked-pair"
        }
      }
    },
    rankedMatchupMeta: {
      source: "Rone Arena API",
      rankBracket: "legend",
      windowDays: 15,
      laneScoped: false,
      sampleSizeAvailable: false,
      status: "available"
    }
  });
  const recommendation = result.counters.find(item => item.name === "Кэрри");
  assert.ok(recommendation, "Karrie remains eligible on Gold Lane");
  assert.equal(recommendation.matchupType, "ranked-advantage");
  assert.deepEqual(recommendation.matchedEnemies, ["Эйдора"]);
  assert.equal(recommendation.profileEvidence.rankedMatchups[0].advantagePp, 4.2);
  assert.equal(recommendation.profileEvidence.rankedMatchups[0].lane, null);
  assert.equal(recommendation.profileEvidence.rankedMatchups[0].sampleSize, null);
  assert.equal(result.rankedMatchupMeta.laneScoped, false);
});

test("ranked matchup risk remains visible alongside a positive ranked signal", () => {
  const enemy = heroProfiles.find(profile => profile.names.ru === "Эйдора");
  const secondEnemy = heroProfiles.find(profile => profile.names.ru === "Тигрил");
  const candidate = heroProfiles.find(profile => profile.names.ru === "Кэрри");
  const result = run({
    lane: "Золото",
    enemies: ["Эйдора", "Тигрил"],
    rankedMatchups: {
      [enemy.id]: {
        [candidate.id]: {
          opponentId: enemy.id, candidateId: candidate.id, source: "Rone Arena API",
          rankBracket: "legend", windowDays: 15, lane: null, advantagePp: 5,
          sampleSize: null, direction: "candidate-favourable"
        }
      },
      [secondEnemy.id]: {
        [candidate.id]: {
          opponentId: secondEnemy.id, candidateId: candidate.id, source: "Rone Arena API",
          rankBracket: "legend", windowDays: 15, lane: null, advantagePp: -0.1,
          sampleSize: null, direction: "opponent-favourable"
        }
      }
    },
    rankedMatchupMeta: { rankBracket: "legend", laneScoped: false }
  });
  const recommendation = result.counters.find(item => item.name === candidate.names.ru);
  assert.ok(recommendation);
  assert.equal(recommendation.matchupType, "mixed-matchup");
  assert.ok(recommendation.matchedEnemies.includes("Эйдора"));
  assert.ok(recommendation.riskyEnemies.includes("Тигрил"));
  assert.match(recommendation.reason, /неоднозначный/i);
});
