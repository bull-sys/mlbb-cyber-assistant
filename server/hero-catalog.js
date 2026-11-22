/**
 * MLBB hero catalog. Identity and localization remain pending unless explicitly
 * confirmed. Role/lane data is populated only after cross-source review;
 * tactical profiles require a separate, deeper gameplay and competitive review.
 */
const catalogEntry = (id, nameEn, displayNameRu, {
  identityStatus = "pending_review",
  localizationStatus = "pending_review",
  roleValues = [],
  roleStatus = "pending_review",
  primaryLane = null,
  flexibleLanes = [],
  laneStatus = "pending_review",
  tacticalProfileStatus = "missing",
  research = null
} = {}) => ({
  id,
  nameEn,
  displayNameRu,
  identity: { status: identityStatus },
  localization: { status: localizationStatus },
  role: { values: roleValues, status: roleStatus },
  lanes: { primary: primaryLane, flexible: flexibleLanes, status: laneStatus },
  tacticalProfile: { status: tacticalProfileStatus },
  ...(research ? { research } : {})
});

// Keep this catalog explicitly partial until an official-client roster
// snapshot has been enumerated and reviewed.
export const HERO_CATALOG_ROSTER_STATUS = "incomplete";

export const heroCatalog = [
  catalogEntry("helcurt", "Helcurt", "Хелкарт", {
    roleValues: ["Assassin"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: ["Roam"],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://mlbb.io/en/hero/helcurt",
        "https://mlbb-stats.com/counter/helcurt",
        "https://mlbbhub.com/ru/heroes/helcurt"
      ],
      mechanicsSources: [
        "https://liquipedia.net/mobilelegends/Helcurt",
        "https://mlbb.io/en/hero/helcurt"
      ],
      rankedMetaSources: [
        "https://mlbb.io/en/hero/helcurt",
        "https://mlbb-stats.com/counter/helcurt",
        "https://mlbbhub.com/ru/heroes/helcurt"
      ],
      competitiveReviewStatus: "pending",
      method: "Assassin role and Jungle/Roam usage cross-checked across independent hero references. Skill mechanics cross-checked against Liquipedia and MLBB.io. Ranked statistics are recorded separately from professional draft evidence; pro VOD review remains pending."
    }
  }),
  catalogEntry("hanzo", "Hanzo", "Ханзо", {
    roleValues: ["Assassin"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: [],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://metammo.com/mobile-legends-guide/heroes/hanzo",
        "https://www.mlbb.io/en/hero/hanzo",
        "https://mlbbhub.com/heroes/hanzo"
      ],
      mechanicsSources: [
        "https://metammo.com/mobile-legends-guide/heroes/hanzo",
        "https://www.mlbb.io/en/hero/hanzo",
        "https://mlbbhub.com/heroes/hanzo"
      ],
      rankedMetaSources: [
        "https://metammo.com/mobile-legends-guide/heroes/hanzo",
        "https://www.mlbb.io/en/hero/hanzo"
      ],
      professionalMetaSources: [
        "https://metammo.com/mobile-legends-guide/heroes/hanzo",
        "https://www.mlbbanalytics.com/heroes?search=Hanzo"
      ],
      competitiveReviewStatus: "partial",
      method: "Assassin role and Jungle lane cross-checked across three independent hero references. Skill mechanics compared against Moonton skill text reproduced by METAMMO and MLBB.io, with the current reworked Hanekage form and its penalties checked against MLBBHub. Ranked statistics, individual tournament samples, and professional VOD review are kept separate; VOD review remains pending."
    }
  }),
  catalogEntry("roger", "Roger", "Роджер", {
    roleValues: ["Fighter", "Marksman"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: [],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://mlbb.io/en/hero/roger",
        "https://mlbbhub.com/ru/heroes/roger",
        "https://liquipedia.net/mobilelegends/Roger"
      ],
      mechanicsSources: [
        "https://liquipedia.net/mobilelegends/Roger",
        "https://mlbb.io/en/hero/roger",
        "https://www.mlbbanalytics.com/heroes?search=Roger"
      ],
      rankedMetaSources: [
        "https://mlbb.io/en/hero/roger",
        "https://mlbb-stats.com/builds/roger",
        "https://mlbbhub.com/ru/heroes/roger"
      ],
      competitiveReviewStatus: "partial",
      method: "Fighter/Marksman identity and Jungle role cross-checked across three hero references. Skill descriptions compared between Liquipedia, MLBB.io and MLBB Analytics. Ranked statistics are kept separate from tournament samples; recent patch-specific professional VOD review remains pending."
    }
  }),
  catalogEntry("ling", "Ling", "Линг", {
    roleValues: ["Assassin"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: [],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://mlbbhub.com/heroes/ling",
        "https://www.mlbb.io/en/hero/ling",
        "https://mlbbdex.com/en/heroes/ling"
      ],
      mechanicsSources: [
        "https://www.mlbbguides.com/heroes/ling/skills/",
        "https://www.mlbbanalytics.com/heroes?hero=Ling",
        "https://mlbbdex.com/en/heroes/ling"
      ],
      rankedMetaSources: [
        "https://mlbbhub.com/heroes/ling",
        "https://www.mlbb.io/en/hero/ling",
        "https://metammo.com/mobile-legends-guide/heroes/ling"
      ],
      competitiveReviewStatus: "partial",
      method: "Assassin/Jungle identity cross-checked across MLBBHub, MLBB.io and MLBBdex. Skill mechanics compared across MLBB Guides and MLBB Analytics. Ranked aggregates are kept separate from tournament samples; current patch-specific professional VOD review remains pending."
    }
  }),
  catalogEntry("nolan", "Nolan", "Нолан", {
    roleValues: ["Assassin"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: [],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://mlbb.io/en/hero/nolan",
        "https://mlbbhub.com/heroes/nolan",
        "https://mlbbdex.com/en/heroes/nolan"
      ],
      mechanicsSources: [
        "https://mlbb.io/en/hero/nolan",
        "https://metammo.com/mobile-legends-guide/heroes/nolan",
        "https://mlbbdex.com/en/heroes/nolan"
      ],
      rankedMetaSources: [
        "https://mlbb.io/en/hero/nolan",
        "https://mlbbhub.com/heroes/nolan",
        "https://mlbbdex.com/en/heroes/nolan"
      ],
      competitiveReviewStatus: "partial",
      method: "Assassin/Jungle identity and ranked aggregates cross-checked across MLBB.io, MLBBHub and MLBBDex. Rift mechanics compared with METAMMO. Tournament samples are reported separately by competition and region; current patch-specific professional VOD review remains pending."
    }
  }),
  catalogEntry("suyou", "Suyou", "Су Ё", {
    roleValues: ["Assassin", "Fighter"], roleStatus: "verified",
    primaryLane: "Jungle", laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbbhub.com/ru/heroes/suyou", "https://mlbbdex.com/en/heroes/suyou", "https://mlbb.io/en/hero/suyou/build"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Suyou", "https://mlbbhub.com/ru/heroes/suyou"], rankedMetaSources: ["https://mlbbhub.com/ru/heroes/suyou", "https://mlbbdex.com/en/heroes/suyou"], competitiveReviewStatus: "pending", method: "Assassin/Fighter jungle classification and skill-form mechanics cross-checked across independent hero references. Ranked aggregates are kept separate; current-patch professional VOD review remains pending." }
  }),
  catalogEntry("jawhead", "Jawhead", "Кусака", {
    identityStatus: "user_confirmed", localizationStatus: "user_confirmed",
    roleValues: ["Fighter"], roleStatus: "verified", primaryLane: "Roam",
    flexibleLanes: ["EXP Lane"], laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbbhub.com/ru/heroes/jawhead", "https://mlbb-knowledge.vercel.app/heroes/54"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Jawhead", "https://mlbb-knowledge.vercel.app/heroes/54"], rankedMetaSources: ["https://mlbbhub.com/ru/heroes/jawhead"], competitiveReviewStatus: "pending", method: "Jawhead identity and Russian name «Кусака» are user-confirmed; Fighter role, Roam/EXP usage and mechanics cross-checked across independent references. Pro VOD review remains pending." }
  }),

  catalogEntry("karrie", "Karrie", "Кэрри", {
    roleValues: ["Marksman"], roleStatus: "verified", primaryLane: "Gold Lane",
    laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbbhub.com/ru/heroes/karrie", "https://www.mlbb.io/en/hero/karrie"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Karrie", "https://www.mlbb.io/en/hero/karrie"], rankedMetaSources: ["https://mlbbhub.com/ru/heroes/karrie"], competitiveReviewStatus: "pending", method: "Marksman/Gold Lane classification and Lightwheel Mark mechanics cross-checked across independent hero references. Ranked data is separate from professional tournament evidence." }
  }),
  catalogEntry("bruno", "Bruno", "Бруно", {
    roleValues: ["Marksman"], roleStatus: "verified", primaryLane: "Gold Lane",
    laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbbhub.com/heroes/bruno", "https://www.mlbbanalytics.com/heroes?hero=Bruno"], mechanicsSources: ["https://www.mlbbanalytics.com/heroes?hero=Bruno", "https://mlbb.tools/patch-notes/2.2.16"], rankedMetaSources: ["https://mlbbhub.com/heroes/bruno", "https://mlbbdex.com/en/heroes/bruno"], professionalMetaSources: ["https://www.mlbbanalytics.com/heroes?hero=Bruno"], competitiveReviewStatus: "partial", method: "Marksman/Gold Lane classification, patch 2.2.16 rework and ranked/pro evidence cross-checked. Tournament samples are reported separately; current-patch VOD review remains pending." }
  }),
  catalogEntry("layla", "Layla", "Лейла", {
    roleValues:["Marksman"], roleStatus:"verified", primaryLane:"Gold Lane", flexibleLanes:[], laneStatus:"verified", tacticalProfileStatus:"partial",
    research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbb-knowledge.vercel.app/heroes/18","https://mlbbhub.com/heroes/layla","https://www.mlbbguides.com/heroes/layla/"],mechanicsSources:["https://mlbb-knowledge.vercel.app/heroes/18","https://www.mlbbguides.com/heroes/layla/","https://mlbb.tools/heroes/layla"],rankedMetaSources:["https://mlbbhub.com/heroes/layla"],competitiveReviewStatus:"pending",method:"Marksman/Gold Lane identity cross-checked across MLBB Knowledge, MLBBHub and MLBBGuides. Range scaling and skill effects compared across three skill references. Ranked build reviewed for patch 2.2.23; available tournament samples are sparse or from separate events, so no current pro conclusion is made."}
  }),
  catalogEntry("miya", "Miya", "Мия", {
    roleValues:["Marksman"], roleStatus:"verified", primaryLane:"Gold Lane", flexibleLanes:[], laneStatus:"verified", tacticalProfileStatus:"partial",
    research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbb-knowledge.vercel.app/heroes/1","https://mlbbhub.com/ru/heroes/miya","https://mlbb.io/en/hero/miya"],mechanicsSources:["https://mlbb-knowledge.vercel.app/heroes/1","https://mlbb.io/en/hero/miya","https://mlbbhub.com/ru/heroes/miya"],rankedMetaSources:["https://mlbbhub.com/ru/heroes/miya","https://mlbb.io/en/hero/miya"],professionalMetaSources:["https://mldb.gg/hero/miya"],competitiveReviewStatus:"partial",method:"Marksman/Gold Lane identity and skill mechanics cross-checked across MLBB Knowledge, MLBBHub and MLBB.io. MPL ID/PH S18 samples recorded separately by event; these do not establish universal tournament strength and no specific VOD has yet been reviewed."}
  }),
  catalogEntry("granger", "Granger", "Грейнджер", {
    roleValues:["Marksman"], roleStatus:"verified", primaryLane:"Gold Lane", flexibleLanes:[], laneStatus:"verified", tacticalProfileStatus:"partial",
    research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbb-knowledge.vercel.app/heroes/79","https://mlbbhub.com/heroes/granger","https://mlbbdex.com/en/heroes/granger"],mechanicsSources:["https://liquipedia.net/mobilelegends/Granger","https://mlbb-knowledge.vercel.app/heroes/79","https://mlbbcore.com/heroes/granger/"],rankedMetaSources:["https://mlbbhub.com/heroes/granger","https://mlbbdex.com/en/heroes/granger"],competitiveReviewStatus:"pending",method:"Marksman/Gold Lane identity cross-checked across MLBB Knowledge, MLBBHub and MLBBDex. Current dual-energy mechanics compared across Liquipedia, MLBB Knowledge and MLBBcore. Ranked results recorded separately; no reliable current pro sample or VOD review claimed."}
  }),

  catalogEntry("terizla", "Terizla", "Теризла", {
    roleValues: ["Fighter", "Tank"], roleStatus: "verified", primaryLane: "EXP Lane",
    laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbbhub.com/ru/heroes/terizla", "https://mlbb.io/en/hero/terizla/build"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Terizla", "https://mlbbhub.com/ru/heroes/terizla"], rankedMetaSources: ["https://mlbbhub.com/ru/heroes/terizla", "https://mlbb.io/en/hero/terizla/build"], competitiveReviewStatus: "pending", method: "Fighter/Tank and EXP Lane classification cross-checked across independent hero references. Ranked aggregates are separated from professional evidence; VOD review remains pending." }
  }),
  catalogEntry("dyrroth", "Dyrroth", "Диррот", { identityStatus:"user_confirmed", localizationStatus:"user_confirmed", roleValues:["Fighter"], roleStatus:"verified", primaryLane:"EXP Lane", flexibleLanes:["Jungle"], laneStatus:"verified", tacticalProfileStatus:"partial", research:{ checkedAt:"2026-11-22", roleAndLaneSources:["https://liquipedia.net/mobilelegends/Dyrroth","https://mlbbhub.com/heroes/dyrroth","https://mlbb.io/en/hero/dyrroth"], mechanicsSources:["https://liquipedia.net/mobilelegends/Dyrroth","https://mlbbhub.com/heroes/dyrroth","https://www.oneesports.gg/mobile-legends/dyrroth-guide-best-build-emblem/"], rankedMetaSources:["https://mlbbhub.com/heroes/dyrroth","https://mlbbdex.com/en/heroes/dyrroth"], competitiveReviewStatus:"pending", method:"Fighter/EXP primary lane and Jungle flex placement cross-checked across three sources; Rage threshold, enhanced defense shred and missing-HP ultimate verified against Liquipedia and current hero guides." } }),
  catalogEntry("chou", "Chou", "Чу", { roleValues:["Fighter"], roleStatus:"verified", primaryLane:"EXP Lane", flexibleLanes:["Roam"], laneStatus:"verified", tacticalProfileStatus:"partial", research:{ checkedAt:"2026-11-22", roleAndLaneSources:["https://mlbbhub.com/heroes/chou","https://mlbb.io/en/hero/chou","https://mlbbdex.com/en/heroes/chou"], mechanicsSources:["https://mlbb.io/en/hero/chou","https://mlbbhub.com/heroes/chou","https://www.oneesports.gg/mobile-legends/chou-best-build-guide/"], rankedMetaSources:["https://mlbbhub.com/heroes/chou","https://mlbbdex.com/en/heroes/chou"], competitiveReviewStatus:"pending", method:"Fighter and EXP primary lane with Roam as flexible lane cross-checked across three sources; passive movement trigger, three-part first skill, control-immunity window and displacement ultimate checked independently." } }),
  catalogEntry("lukas", "Lukas", "Лукас", { roleValues:["Fighter"], roleStatus:"verified", primaryLane:"EXP Lane", flexibleLanes:["Jungle"], laneStatus:"verified", tacticalProfileStatus:"partial", research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbbhub.com/heroes/lukas","https://mlbbdex.com/en/heroes/lukas","https://www.mlbbguides.com/heroes/lukas/"],mechanicsSources:["https://mlbb.tools/heroes/lukas","https://www.mlbbguides.com/heroes/lukas/","https://mlbbanalytics.com/heroes?hero=Lukas"],rankedMetaSources:["https://mlbbhub.com/heroes/lukas","https://mlbbdex.com/en/heroes/lukas"],professionalMetaSources:["https://mlbbanalytics.com/heroes?hero=Lukas"],competitiveReviewStatus:"partial",method:"Fighter/EXP primary and Jungle flex cross-checked across three current hero databases. Patch 2.2.23 changes reviewed separately. MPL ID/PH S18 tournament snapshots recorded, but no specific VOD review completed."} }),
  catalogEntry("thamuz", "Thamuz", "Тамуз", { roleValues:["Fighter"], roleStatus:"verified", primaryLane:"EXP Lane", flexibleLanes:["Jungle"], laneStatus:"verified", tacticalProfileStatus:"partial", research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbbhub.com/heroes/thamuz","https://mlbb-knowledge.vercel.app/heroes/72","https://www.mlbbguides.com/heroes/thamuz/"],mechanicsSources:["https://liquipedia.net/mobilelegends/Thamuz","https://mlbb-knowledge.vercel.app/heroes/72","https://metammo.com/mobile-legends-guide/heroes/thamuz"],rankedMetaSources:["https://mlbbhub.com/heroes/thamuz","https://mlbb-stats.com/builds/thamuz"],competitiveReviewStatus:"pending",method:"Fighter/EXP primary with Jungle flex cross-checked across MLBBHub, MLBB Knowledge and MLBBGuides. Passive and scythe-return reset mechanics checked across Liquipedia and independent skill references. No current professional VOD review found."} }),

  catalogEntry("eudora", "Eudora", "Эйдора", { roleValues:["Mage"], roleStatus:"verified", primaryLane:"Mid Lane", flexibleLanes:[], laneStatus:"verified", tacticalProfileStatus:"partial", research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mobilelegends.com/hero/detail?heroid=15","https://mlbbhub.com/ru/heroes/eudora","https://www.mlbbguides.com/heroes/eudora/"],mechanicsSources:["https://mobilelegends.com/hero/detail?heroid=15","https://mlbbherometa.com/heroes/eudora","https://www.mlbbguides.com/heroes/eudora/"],rankedMetaSources:["https://mobilelegends.com/hero/detail?heroid=15","https://mlbbhub.com/ru/heroes/eudora"],competitiveReviewStatus:"pending",method:"Mage/Mid Lane confirmed across official Moonton page, MLBBHub and MLBBGuides. Superconductor conditional effects checked against official skill text and independent mechanics pages. Ranked statistics are kept separate; no current VOD review."} }),
  catalogEntry("kagura", "Kagura", "Кагура", {
    roleValues:["Mage"], roleStatus:"verified", primaryLane:"Mid Lane", flexibleLanes:[], laneStatus:"verified", tacticalProfileStatus:"partial",
    research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbb-knowledge.vercel.app/heroes/25","https://mlbbhub.com/heroes/kagura","https://mlbbdex.com/en/heroes/kagura"],mechanicsSources:["https://liquipedia.net/mobilelegends/Kagura","https://mlbb-knowledge.vercel.app/heroes/25","https://mlbb.io/en/hero/kagura"],rankedMetaSources:["https://mlbbhub.com/heroes/kagura","https://mlbbdex.com/en/heroes/kagura"],competitiveReviewStatus:"pending",method:"Mage/Mid Lane identity cross-checked across MLBB Knowledge, MLBBHub and MLBBDex. Umbrella-state mechanics compared across Liquipedia, MLBB Knowledge and MLBB.io. Ranked aggregates kept separate; current professional VOD review pending."}
  }),
  catalogEntry("pharsa", "Pharsa", "Фарса", { roleValues:["Mage"], roleStatus:"verified", primaryLane:"Mid Lane", flexibleLanes:[], laneStatus:"verified", tacticalProfileStatus:"partial", research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbbhub.com/heroes/pharsa","https://www.mlbbguides.com/heroes/pharsa/","https://mlbb.io/en/hero/pharsa"],mechanicsSources:["https://mlbb.io/en/hero/pharsa","https://mlbb.tools/heroes/pharsa","https://mlbbanalytics.com/heroes?hero=Pharsa"],rankedMetaSources:["https://mlbbhub.com/heroes/pharsa","https://mlbb-stats.com/builds/pharsa"],professionalMetaSources:["https://mlbbanalytics.com/heroes?hero=Pharsa"],competitiveReviewStatus:"partial",method:"Mage/Mid Lane identity and kit checked across three databases. Current ranked snapshot and separate tournament samples recorded; tournament samples span different events and patches and do not replace VOD review."} }),
  catalogEntry("cyclops", "Cyclops", "Циклоп", { roleValues:["Mage"], roleStatus:"verified", primaryLane:"Mid Lane", flexibleLanes:[], laneStatus:"verified", tacticalProfileStatus:"partial", research:{ checkedAt:"2026-11-22", roleAndLaneSources:["https://mlbbhub.com/heroes/cyclops","https://mlbb.io/en/hero/cyclops","https://mlbbdex.com/en/heroes/cyclops"], mechanicsSources:["https://liquipedia.net/mobilelegends/Cyclops","https://mlbbhub.com/heroes/cyclops","https://www.oneesports.gg/mobile-legends/cyclops-guide-best-build-emblem/"], rankedMetaSources:["https://mlbbhub.com/heroes/cyclops","https://mlbbdex.com/en/heroes/cyclops"], competitiveReviewStatus:"pending", method:"Mage/Mid classification cross-checked across three current hero databases; cooldown loop, orbiting spheres and target-lock ultimate checked against Liquipedia, MLBBHub and ONE Esports." } }),
  catalogEntry("nana", "Nana", "Нана", { roleValues:["Mage"], roleStatus:"verified", primaryLane:"Mid Lane", flexibleLanes:[], laneStatus:"verified", tacticalProfileStatus:"partial", research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbbhub.com/heroes/nana","https://mlbbdex.com/en/heroes/nana","https://www.mlbbguides.com/heroes/nana/"],mechanicsSources:["https://liquipedia.net/mobilelegends/Nana","https://mlbb.tools/heroes/nana","https://www.mlbbguides.com/heroes/nana/"],rankedMetaSources:["https://mlbbdex.com/en/heroes/nana","https://mlbb-stats.com/builds/nana"],competitiveReviewStatus:"pending",method:"Mage/Mid Lane identity checked across MLBBHub, MLBBDex and MLBBGuides. Molina's Gift, transformation and three-hit ultimate checked against Liquipedia and independent skill databases. Sparse older tournament use is not treated as current pro evidence."} }),
  catalogEntry("julian", "Julian", "Джулиан", { roleValues:["Assassin","Fighter"], roleStatus:"verified", primaryLane:"Jungle", flexibleLanes:["Mid Lane"], laneStatus:"verified", tacticalProfileStatus:"partial", research:{ checkedAt:"2026-11-22", roleAndLaneSources:["https://mlbbhub.com/heroes/julian","https://mlbb.io/en/hero/julian","https://mlbbdex.com/en/heroes/julian"], mechanicsSources:["https://www.mlbbguides.com/heroes/julian/passive-skill/","https://mlbbhub.com/heroes/julian","https://www.oneesports.gg/mobile-legends/julian-best-build-guide/"], rankedMetaSources:["https://mlbbhub.com/heroes/julian","https://mlbbdex.com/en/heroes/julian"], competitiveReviewStatus:"pending", method:"Assassin/Fighter and Jungle primary role cross-checked across three databases; enhanced third-skill sequence, post-combo reset and three enhanced outcomes cross-checked against independent skill references." } }),

  catalogEntry("tigreal", "Tigreal", "Тигрил", { roleValues:["Tank"], roleStatus:"verified", primaryLane:"Roam", flexibleLanes:[], laneStatus:"verified", tacticalProfileStatus:"partial", research:{ checkedAt:"2026-11-22", roleAndLaneSources:["https://liquipedia.net/mobilelegends/Tigreal","https://mlbbhub.com/heroes/tigreal","https://mlbb.io/en/hero/tigreal"], mechanicsSources:["https://liquipedia.net/mobilelegends/Tigreal","https://mlbbhub.com/heroes/tigreal","https://www.oneesports.gg/mobile-legends/tigreal-best-build-guide-combos/"], rankedMetaSources:["https://mlbbhub.com/heroes/tigreal","https://mlbbdex.com/en/heroes/tigreal"], competitiveReviewStatus:"pending", method:"Tank/Roam role verified across three sources; Fearless stacks, two-stage charge and interruptible opening of ultimate checked across Liquipedia, MLBBHub and ONE Esports." } }),
  catalogEntry("atlas", "Atlas", "Атлас", {
    roleValues:["Tank"], roleStatus:"verified", primaryLane:"Roam", flexibleLanes:["EXP Lane"], laneStatus:"verified", tacticalProfileStatus:"partial",
    research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbb-knowledge.vercel.app/heroes/93","https://mlbbhub.com/ru/heroes/atlas","https://liquipedia.net/mobilelegends/Atlas"],mechanicsSources:["https://mlbb-knowledge.vercel.app/heroes/93","https://liquipedia.net/mobilelegends/Atlas","https://liquipedia.net/mobilelegends/Patch_2.2.23"],rankedMetaSources:["https://mlbbhub.com/ru/heroes/atlas"],professionalMetaSources:["https://meta.mlbblab.com/tournaments/mpl-id-season-18/heroes/atlas"],competitiveReviewStatus:"partial",method:"Tank/Roam identity cross-checked across MLBB Knowledge, MLBBHub and Liquipedia; EXP Lane retained as a flexible role from MLBBHub. Current passive nerf checked against patch 2.2.23. MPL ID S18 pick/ban data recorded separately from ranked data; professional VOD review remains pending."}
  }),
  catalogEntry("franco", "Franco", "Франко", { roleValues:["Tank"], roleStatus:"verified", primaryLane:"Roam", laneStatus:"verified", tacticalProfileStatus:"partial", research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbbhub.com/ru/heroes/franco","https://mlbbdex.com/en/heroes/franco","https://mlbb-knowledge.vercel.app/heroes/10"],mechanicsSources:["https://liquipedia.net/mobilelegends/Franco","https://mlbb-knowledge.vercel.app/heroes/10","https://mlbb.io/en/hero/franco"],rankedMetaSources:["https://mlbbhub.com/ru/heroes/franco","https://mlbbdex.com/en/heroes/franco","https://mlbb.io/en/hero/franco"],competitiveReviewStatus:"pending",method:"Tank/Roam identity, hook, suppression and passive regeneration cross-checked across independent references. Ranked snapshots are separate from professional evidence; current-patch VOD review remains pending."} }),  catalogEntry("akai", "Akai", "Акай", { roleValues:["Tank"], roleStatus:"verified", primaryLane:"Roam", flexibleLanes:["Jungle"], laneStatus:"verified", tacticalProfileStatus:"partial", research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbbhub.com/heroes/akai","https://mlbbdex.com/en/heroes/akai","https://mlbb-knowledge.vercel.app/heroes/17"],mechanicsSources:["https://liquipedia.net/mobilelegends/Akai","https://mlbb-knowledge.vercel.app/heroes/17","https://mlbb.io/en/hero/akai"],rankedMetaSources:["https://mlbbhub.com/heroes/akai","https://mlbbdex.com/en/heroes/akai","https://mlbb.io/en/hero/akai"],competitiveReviewStatus:"pending",method:"Tank/Roam primary role with Jungle flexibility; shield, mark, charge and Heavy Spin cross-checked across independent references. Ranked and professional evidence remain separate; VOD review pending."} }),
  catalogEntry("aldous", "Aldous", "Олдос", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter"],
    roleStatus: "verified",
    primaryLane: "EXP Lane",
    flexibleLanes: [],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      mechanicsSources: ["https://mlbb-knowledge.vercel.app/heroes/64","https://liquipedia.net/mobilelegends/Aldous","https://mlbb.io/en/hero/aldous"],
      rankedMetaSources: ["https://mlbbhub.com/heroes/aldous","https://mlbbdex.com/en/heroes/aldous"],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("alpha", "Alpha", "Альфа", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: ["EXP Lane"],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: ["https://mlbbhub.com/heroes/alpha","https://mlbb.io/en/hero/alpha","https://mlbbdex.com/en/heroes/alpha"],
      competitiveReviewStatus: "pending",
      method: "Fighter role and Jungle primary lane with EXP flexibility cross-checked across MLBBHub, MLBB.io and MLBBDex."
    },
  }),
  catalogEntry("alucard", "Alucard", "Алукард", { roleValues:["Fighter","Assassin"], roleStatus:"verified", primaryLane:"Jungle", flexibleLanes:["EXP Lane"], laneStatus:"verified", tacticalProfileStatus:"partial", research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbbhub.com/ru/heroes/alucard","https://mlbbdex.com/en/heroes/alucard","https://mlbb.io/en/hero/alucard"],mechanicsSources:["https://liquipedia.net/mobilelegends/Alucard","https://mlbbhub.com/ru/heroes/alucard","https://mlbb.io/en/hero/alucard"],rankedMetaSources:["https://mlbbhub.com/ru/heroes/alucard","https://mlbbdex.com/en/heroes/alucard","https://mlbb.io/en/hero/alucard"],competitiveReviewStatus:"pending",method:"Fighter/Assassin and Jungle primary classification cross-checked across three databases; passive chase, skill-enhanced attacks, hybrid lifesteal and ultimate recast checked independently. VOD review pending."} }),
  catalogEntry("argus", "Argus", "Аргус", {
    roleValues: ["Fighter"], roleStatus: "verified",
    primaryLane: "EXP Lane", laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbbhub.com/ru/heroes/argus", "https://mlbb-knowledge.vercel.app/heroes/45", "https://www.mlbbguides.com/heroes/"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Argus", "https://mlbb-knowledge.vercel.app/heroes/45"], rankedMetaSources: ["https://mlbbhub.com/ru/heroes/argus", "https://mlbbdex.com/en/statistics"], competitiveReviewStatus: "pending", method: "Fighter/EXP role and current passive/skill mechanics cross-checked across independent databases; pro VOD and draft review remain pending." }
  }),
  catalogEntry("arlott", "Arlott", "Арлотт", { roleValues:["Fighter","Assassin"], roleStatus:"verified", primaryLane:"EXP Lane", flexibleLanes:["Roam"], laneStatus:"verified", tacticalProfileStatus:"partial", research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbbhub.com/ru/heroes/arlott","https://mlbbdex.com/en/heroes/arlott","https://mlbb.io/en/hero/arlott"],mechanicsSources:["https://liquipedia.net/mobilelegends/Arlott","https://mlbbdex.com/en/heroes/arlott","https://mlbb.io/en/hero/arlott"],rankedMetaSources:["https://mlbbhub.com/ru/heroes/arlott","https://mlbbdex.com/en/heroes/arlott","https://mlbb.io/en/hero/arlott"],competitiveReviewStatus:"pending",method:"Fighter/Assassin identity and EXP primary lane cross-checked across three databases; Demon Gaze marks, Vengeance resets and Final Slash displacement verified independently. Roam is flexible, not default. VOD review pending."} }),
  catalogEntry("aulus", "Aulus", "Аулус", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: ["EXP Lane"],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: ["https://liquipedia.net/mobilelegends/Aulus", "https://mlbb-knowledge.vercel.app/heroes/108", "https://mlbb.io/en/hero/aulus"],
      mechanicsSources: ["https://mlbb-knowledge.vercel.app/heroes/108", "https://liquipedia.net/mobilelegends/Aulus", "https://liquipedia.net/mobilelegends/Patch_2.1.67"],
      rankedMetaSources: ["https://mlbb.io/en/hero/aulus", "https://mlbbhub.com/heroes/aulus"],
      competitiveReviewStatus: "pending",
      method: "Fighter/Jungle role and EXP flexibility retained from prior cross-source verification. The post-rework skill kit is checked against current and rework references; pro VOD review remains pending."
    }
  }),
  catalogEntry("aurora", "Aurora", "Аврора", { roleValues:["Mage"], roleStatus:"verified", primaryLane:"Mid Lane", laneStatus:"verified", tacticalProfileStatus:"partial", research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbbhub.com/ru/heroes/aurora","https://mlbbdex.com/en/heroes/aurora","https://mlbb-knowledge.vercel.app/heroes/36"],mechanicsSources:["https://liquipedia.net/mobilelegends/Aurora","https://mlbb-knowledge.vercel.app/heroes/36","https://mlbb.io/en/hero/aurora"],rankedMetaSources:["https://mlbbhub.com/ru/heroes/aurora","https://mlbbdex.com/en/heroes/aurora","https://mlbb.io/en/hero/aurora"],competitiveReviewStatus:"pending",method:"Mage/Mid identity and freeze, glacier and death-prevention mechanics cross-checked across Liquipedia, MLBB Knowledge, MLBB.io and current guides. Ranked snapshot is separate; VOD review pending."} }),
  catalogEntry("badang", "Badang", "Баданг", {roleValues:["Fighter"],roleStatus:"verified",primaryLane:null,flexibleLanes:["EXP Lane","Roam"],laneStatus:"pending_review",tacticalProfileStatus:"partial",research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbbhub.com/ru/heroes/badang","https://mlbb-knowledge.vercel.app/heroes/77","https://www.mlbbguides.com/heroes/badang/"],mechanicsSources:["https://liquipedia.net/mobilelegends/Badang","https://mlbb-knowledge.vercel.app/heroes/77","https://www.mlbb.io/en/hero/badang"],rankedMetaSources:["https://mlbbhub.com/ru/heroes/badang","https://mlbb-stats.com/builds/badang","https://www.mlbbguides.com/heroes/badang/"],competitiveReviewStatus:"pending",method:"Fighter identity verified. EXP and Roam usage conflict across current references, so no single primary lane is asserted. Chivalry Fist, obstacle interaction and Fist Crack control immunity checked against independent skill references. Ranked samples remain separate from professional VOD review."} }),
  catalogEntry("balmond", "Balmond", "Бальмонд", {roleValues:["Fighter"],roleStatus:"verified",primaryLane:"Jungle",flexibleLanes:["EXP Lane"],laneStatus:"verified",tacticalProfileStatus:"partial",research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbbhub.com/heroes/balmond","https://www.mlbb.io/en/hero/balmond","https://www.mlbbguides.com/heroes/balmond/"],mechanicsSources:["https://liquipedia.net/mobilelegends/Balmond","https://metammo.com/mobile-legends-guide/heroes/balmond","https://www.mlbb.io/en/hero/balmond"],rankedMetaSources:["https://mlbbhub.com/heroes/balmond","https://mlbb-stats.com/builds/balmond","https://www.mlbb.io/en/hero/balmond"],competitiveReviewStatus:"pending",method:"Fighter identity and Jungle/EXP use cross-checked across three current guides. Bloodthirst sustain, Soul Lock, Cyclone Sweep and Lethal Counter execute damage verified across independent mechanics references. Ranked and professional evidence remain distinct."} }),
  catalogEntry("bane", "Bane", "Бейн", {roleValues:["Fighter","Mage"],roleStatus:"verified",primaryLane:"Jungle",flexibleLanes:["EXP Lane"],laneStatus:"verified",tacticalProfileStatus:"partial",research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbbhub.com/ru/heroes/bane","https://mlbb-knowledge.vercel.app/heroes/11","https://mlbbguides.com/heroes/bane/"],mechanicsSources:["https://liquipedia.net/mobilelegends/Bane","https://mlbb-knowledge.vercel.app/heroes/11","https://www.mlbbanalytics.com/heroes?search=Bane"],rankedMetaSources:["https://mlbbhub.com/ru/heroes/bane","https://mlbb-knowledge.vercel.app/heroes/11","https://mlbbdraft.com/en/hero/bane"],competitiveReviewStatus:"partial",method:"Fighter/Mage classification and Jungle/EXP usage cross-checked across three hero references. Shark Bite stacks, physical/magic skill split, self-heal and shark-wave ultimate checked independently. Historical tournament samples are not treated as current-patch VOD review."} }),
  catalogEntry("barats", "Barats", "Баратс", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Tank","Fighter"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: ["EXP Lane"],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: ["https://mlbbhub.com/ru/heroes/barats","https://mlbb.io/en/hero/barats/build","https://mlbbdex.com/en/heroes/barats"],
      competitiveReviewStatus: "pending",
      method: "Tank/Fighter role and Jungle primary lane with EXP flexibility cross-checked across three current hero databases."
    },
  }),
  catalogEntry("baxia", "Baxia", "Баксия", {roleValues:["Tank"],roleStatus:"verified",primaryLane:"Jungle",flexibleLanes:["Roam"],laneStatus:"verified",tacticalProfileStatus:"partial",research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://mlbbhub.com/ru/heroes/baxia","https://mlbb-knowledge.vercel.app/heroes/87","https://www.mlbbguides.com/heroes/baxia/"],mechanicsSources:["https://liquipedia.net/mobilelegends/Baxia","https://mlbb.tools/heroes/baxia","https://mlbb.io/en/hero/baxia"],rankedMetaSources:["https://mlbbhub.com/ru/heroes/baxia","https://www.mlbbguides.com/heroes/baxia/","https://mlbb-knowledge.vercel.app/heroes/87"],competitiveReviewStatus:"pending",method:"Tank identity and Jungle/Roam placements cross-checked across three current hero guides. Baxia Mark damage reduction and anti-heal/shield effect, rolling stun, shield throw and ultimate path checked across Liquipedia, mlbb.tools and MLBB.io. VOD review pending."} }),
  catalogEntry("beatrix", "Beatrix", "Беатрис", {roleValues:["Marksman"],roleStatus:"verified",primaryLane:"Gold Lane",laneStatus:"verified",tacticalProfileStatus:"partial",research:{checkedAt:"2026-11-22",roleAndLaneSources:["https://liquipedia.net/mobilelegends/Beatrix","https://www.mlbbguides.com/heroes/beatrix/","https://mlbbhub.com/ru/heroes/beatrix"],mechanicsSources:["https://liquipedia.net/mobilelegends/Beatrix","https://mlbbnexus.com/heroes/beatrix","https://www.mlbbguides.com/heroes/beatrix/"],rankedMetaSources:["https://mlbbhub.com/ru/heroes/beatrix","https://www.mlbbguides.com/heroes/beatrix/","https://liquipedia.net/mobilelegends/Beatrix"],competitiveReviewStatus:"pending",method:"Marksman/Gold Lane identity cross-checked across Liquipedia, MLBBGuides and MLBBHub. Four-weapon selection, reload dash and weapon-specific ultimates compared across current skill references. The May build page is explicitly treated as stale; current ranked evidence is used instead. VOD review pending."} }),
  catalogEntry("belerick", "Belerick", "Белерик", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Tank"],
    roleStatus: "verified",
    primaryLane: "Roam",
    flexibleLanes: [],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: ["https://mlbb-knowledge.vercel.app/heroes/70","https://mlbb.io/en/hero/belerick","https://mlbbdex.com/en/heroes/belerick"],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("benedetta", "Benedetta", "Бенедетта", {
    identityStatus: "verified", localizationStatus: "pending_review",
    roleValues: ["Assassin", "Fighter"], roleStatus: "verified", primaryLane: "EXP Lane", laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://liquipedia.net/mobilelegends/Benedetta", "https://www.mlbb.io/en/hero/benedetta", "https://mlbbdex.com/en/heroes/benedetta"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Benedetta", "https://www.mlbbguides.com/heroes/benedetta/"], rankedMetaSources: ["https://mlbbdex.com/en/heroes/benedetta"], competitiveReviewStatus: "pending", method: "Assassin/Fighter and EXP Lane cross-checked across three references. Sword Intent, passive dash, defensive control block and ultimate reviewed independently. Ranked patch 2.2.23 sample kept separate from pro evidence; VOD review pending." }
  }),
  catalogEntry("brody", "Brody", "Броди", {
    identityStatus: "verified", localizationStatus: "pending_review",
    roleValues: ["Marksman"], roleStatus: "verified", primaryLane: "Gold Lane", laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://liquipedia.net/mobilelegends/Brody", "https://mlbb-knowledge.vercel.app/heroes/100", "https://mlbbhub.com/ru/heroes/brody"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Brody", "https://mlbb-knowledge.vercel.app/heroes/100", "https://www.mlbbguides.com/heroes/brody/skills/"], rankedMetaSources: ["https://mlbb-knowledge.vercel.app/heroes/100"], competitiveReviewStatus: "pending", method: "Marksman/Gold Lane cross-checked across Liquipedia, MLBB Knowledge and MLBBHub. Abyss Mark stacking and movement/attack trade-off checked independently. MLBBHub build patch-label discrepancy noted; fixed build withheld. VOD review pending." }
  }),
  catalogEntry("carmilla", "Carmilla", "Кармилла", {
    identityStatus: "verified", localizationStatus: "pending_review",
    roleValues: ["Support", "Tank"], roleStatus: "verified", primaryLane: "Roam", laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbb-knowledge.vercel.app/heroes/92", "https://liquipedia.net/mobilelegends/Carmilla", "https://mlbbhub.com/ru/heroes/carmilla"], mechanicsSources: ["https://mlbb-knowledge.vercel.app/heroes/92", "https://liquipedia.net/mobilelegends/Carmilla", "https://mlbb.io/en/hero/carmilla"], rankedMetaSources: ["https://mlbbhub.com/ru/heroes/carmilla"], competitiveReviewStatus: "pending", method: "Support/Tank and Roam cross-checked across three references. Vampire Pact, Crimson Flower, Bloodbath and Curse of Blood compared across independent skill references; conflicting numeric values omitted. Ranked and historical tournament samples kept separate. VOD review pending." }
  }),
  catalogEntry("cecilion", "Cecilion", "Цицилион", {
    identityStatus: "verified", localizationStatus: "pending_review",
    roleValues: ["Mage"], roleStatus: "verified", primaryLane: "Mid Lane", laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://liquipedia.net/mobilelegends/Cecilion", "https://mlbbdex.com/en/heroes/cecilion", "https://mlbbhub.com/ru/heroes/cecilion"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Cecilion", "https://mlbb.tools/heroes/cecilion", "https://www.mlbbguides.com/heroes/cecilion/overview/"], rankedMetaSources: ["https://mlbbdex.com/en/heroes/cecilion", "https://mlbbhub.com/ru/heroes/cecilion"], competitiveReviewStatus: "pending", method: "Mage/Mid Lane cross-checked across three references. Overflowing mana stacking, Bat Impact repeated-cast cost, Sanguine Claws pull and Bats Feast sustain checked independently. Patch 2.2.23 ranked snapshot separated from professional evidence; VOD review pending." }
  }),
  catalogEntry("chang-e", "Chang'e", "Чан’Э", {
    identityStatus: "verified", localizationStatus: "verified",
    roleValues: ["Mage"], roleStatus: "verified", primaryLane: "Mid Lane", laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://liquipedia.net/mobilelegends/Chang%27e", "https://mlbb.io/en/hero/chang%27e", "https://www.mlbbanalytics.com/heroes?hero=Chang%27e"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Chang%27e", "https://mlbb.io/en/hero/chang%27e", "https://www.mlbbanalytics.com/heroes?hero=Chang%27e"], rankedMetaSources: ["https://mlbbdex.com/en/meta"], competitiveReviewStatus: "pending", method: "Mage/Mid Lane cross-checked across independent references. Trouble Maker, Starmoon Shockwave, Crescent Moon and Meteor Shower checked against skill data. Patch 2.2.23 did not list Chang'e among adjusted heroes; stale build-page patch labels prevent a fixed build recommendation. Historical pro samples are not treated as current VOD review." }
  }),
  catalogEntry("chip", "Chip", "Чип", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Support", "Tank"],
    roleStatus: "verified",
    primaryLane: "Roam",
    flexibleLanes: [],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://www.propublic.gg/heroes/stats?dir=asc&sort=name",
        "https://mlbbhub.com/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBBHub; lane placement checked against MLBB Guides and Propublic's Mythic+ 15-day lane table. Pro tournament usage is tracked separately and does not automatically determine ranked primary lane."
    },
  }),
  catalogEntry("cici", "Cici", "Сиси", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter"],
    roleStatus: "verified",
    primaryLane: "EXP Lane",
    flexibleLanes: [],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://www.propublic.gg/heroes/stats?dir=asc&sort=name",
        "https://mlbbhub.com/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBBHub; lane placement checked against MLBB Guides and Propublic's Mythic+ 15-day lane table. Pro tournament usage is tracked separately and does not automatically determine ranked primary lane."
    },
  }),
  catalogEntry("claude", "Claude", "Клод", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Marksman"],
    roleStatus: "verified",
    primaryLane: "Gold Lane",
    flexibleLanes: [],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://www.propublic.gg/heroes/stats?dir=asc&sort=name",
        "https://mlbbhub.com/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBBHub; lane placement checked against MLBB Guides and Propublic's Mythic+ 15-day lane table. Pro tournament usage is tracked separately and does not automatically determine ranked primary lane."
    },
  }),
  catalogEntry("clint", "Clint", "Клинт", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Marksman"],
    roleStatus: "verified",
    primaryLane: "Gold Lane",
    flexibleLanes: [],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://www.propublic.gg/heroes/stats?dir=asc&sort=name",
        "https://mlbbhub.com/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBBHub; lane placement checked against MLBB Guides and Propublic's Mythic+ 15-day lane table. Pro tournament usage is tracked separately and does not automatically determine ranked primary lane."
    },
  }),
  catalogEntry("edith", "Edith", "Эдит", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Tank","Marksman"],
    roleStatus: "verified",
    primaryLane: "EXP Lane",
    flexibleLanes: ["Roam"],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: ["https://mlbbhub.com/heroes/edith","https://mlbbdex.com/en/heroes/edith","https://metammo.com/mobile-legends-guide/heroes/edith"],
      competitiveReviewStatus: "pending",
      method: "Tank/Marksman role and EXP primary lane with Roam flexibility cross-checked across MLBBHub, MLBBDex and METAMMO."
    },
  }),
  catalogEntry("esmeralda", "Esmeralda", "Эсмеральда", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Tank", "Mage"],
    roleStatus: "verified",
    primaryLane: "EXP Lane",
    flexibleLanes: [],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://www.propublic.gg/heroes/stats?dir=asc&sort=name",
        "https://mlbbhub.com/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBBHub; lane placement checked against MLBB Guides and Propublic's Mythic+ 15-day lane table. Pro tournament usage is tracked separately and does not automatically determine ranked primary lane."
    },
  }),
  catalogEntry("fanny", "Fanny", "Фанни", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Assassin"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: [],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://metammo.com/mobile-legends-guide/heroes/fanny",
        "https://mlbbdex.com/en/heroes/fanny",
        "https://mlbb-knowledge.vercel.app/heroes/17"
      ],
      mechanicsSources: [
        "https://metammo.com/mobile-legends-guide/heroes/fanny",
        "https://mlbb-knowledge.vercel.app/heroes/17",
        "https://www.mlbbanalytics.com/heroes?hero=Fanny"
      ],
      rankedMetaSources: [
        "https://metammo.com/mobile-legends-guide/heroes/fanny",
        "https://mlbbdex.com/en/heroes/fanny"
      ],
      competitiveReviewStatus: "partial",
      method: "Assassin/Jungle identity, skill mechanics and official ranked aggregates cross-checked across METAMMO, MLBBDex and MLBB Knowledge. Community build frequency kept separate from measured win rates. Tournament samples are separated by competition and provider; patch-specific professional VOD review remains pending."
    },
  }),
  catalogEntry("faramis", "Faramis", "Фарамис", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Support", "Mage"],
    roleStatus: "verified",
    primaryLane: "Mid Lane",
    flexibleLanes: ["Roam"],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://www.propublic.gg/heroes/stats?dir=asc&sort=name",
        "https://mlbbhub.com/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBBHub; lane placement checked against MLBB Guides and Propublic's Mythic+ 15-day lane table. Pro tournament usage is tracked separately and does not automatically determine ranked primary lane."
    },
  }),
  catalogEntry("floryn", "Floryn", "Флорин", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Support"],
    roleStatus: "verified",
    primaryLane: "Roam",
    flexibleLanes: [],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://www.propublic.gg/heroes/stats?dir=asc&sort=name",
        "https://mlbbhub.com/heroes"
      ],
      mechanicsSources: ["https://mlbb-knowledge.vercel.app/heroes/112","https://liquipedia.net/mobilelegends/Floryn","https://mlbb.io/en/hero/floryn"],
      rankedMetaSources: ["https://mlbbhub.com/heroes/floryn","https://mlbbdex.com/en/heroes/floryn"],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBBHub; lane placement checked against MLBB Guides and Propublic's Mythic+ 15-day lane table. Pro tournament usage is tracked separately and does not automatically determine ranked primary lane."
    },
  }),
  catalogEntry("fredrinn", "Fredrinn", "Фредрин", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter","Tank"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: [],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbb.io/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBB Guides and MLBB Stats; lane placement cross-checked against MLBB Stats and MLBB.io. Professional tournament usage is reviewed separately from ranked lane prevalence."
    },
  }),  catalogEntry("freya", "Freya", "Фрея", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter"],
    roleStatus: "verified",
    primaryLane: "EXP Lane",
    flexibleLanes: ["Jungle"],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: ["https://mlbbhub.com/heroes/freya","https://mlbb.io/en/hero/freya","https://mlbb-knowledge.vercel.app/heroes/22"],
      competitiveReviewStatus: "pending",
      method: "Fighter role and EXP primary lane with Jungle flexibility cross-checked across three hero databases; 2.2.23 changes separately checked against patch notes."
    },
  }),  catalogEntry("gatotkaca", "Gatotkaca", "Гатоткача", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Tank","Fighter"],
    roleStatus: "verified",
    primaryLane: "Roam",
    flexibleLanes: ["EXP Lane"],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbb.io/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBB Guides and MLBB Stats; lane placement cross-checked against MLBB Stats and MLBB.io. Professional tournament usage is reviewed separately from ranked lane prevalence."
    },
  }),  catalogEntry("gloo", "Gloo", "Глу", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Tank"],
    roleStatus: "verified",
    primaryLane: "Roam",
    flexibleLanes: ["EXP Lane"],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbb.io/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBB Guides and MLBB Stats; lane placement cross-checked against MLBB Stats and MLBB.io. Professional tournament usage is reviewed separately from ranked lane prevalence."
    },
  }),  catalogEntry("gord", "Gord", "Горд", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Mage"],
    roleStatus: "verified",
    primaryLane: "Mid Lane",
    flexibleLanes: [],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbb.io/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBB Guides and MLBB Stats; lane placement cross-checked against MLBB Stats and MLBB.io. Professional tournament usage is reviewed separately from ranked lane prevalence."
    },
  }),  catalogEntry("grock", "Grock", "Грок", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Tank"],
    roleStatus: "verified",
    primaryLane: "Roam",
    flexibleLanes: [],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbb.io/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBB Guides and MLBB Stats; lane placement cross-checked against MLBB Stats and MLBB.io. Professional tournament usage is reviewed separately from ranked lane prevalence."
    },
  }),  catalogEntry("guinevere", "Guinevere", "Гвиневра", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter"],
    roleStatus: "verified",
    primaryLane: "EXP Lane",
    flexibleLanes: [],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbb.io/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBB Guides and MLBB Stats; lane placement cross-checked against MLBB Stats and MLBB.io. Professional tournament usage is reviewed separately from ranked lane prevalence."
    },
  }),  catalogEntry("gusion", "Gusion", "Госсен", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Assassin"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: ["Mid Lane"],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbb.io/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBB Guides and MLBB Stats; lane placement cross-checked against MLBB Stats and MLBB.io. Professional tournament usage is reviewed separately from ranked lane prevalence."
    },
  }),  catalogEntry("hanabi", "Hanabi", "Ханаби", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Marksman"],
    roleStatus: "verified",
    primaryLane: "Gold Lane",
    flexibleLanes: [],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: ["https://mlbb-knowledge.vercel.app/heroes/60","https://www.mlbbguides.com/heroes/hanabi/","https://mlbbhub.com/heroes/hanabi"],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBB Guides and MLBB Stats; lane placement cross-checked against MLBB Stats and MLBB.io. Professional tournament usage is reviewed separately from ranked lane prevalence."
    },
  }),  catalogEntry("harith", "Harith", "Харит", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("harley", "Harley", "Харли", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("hayabusa", "Hayabusa", "Хаябуса", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("hilda", "Hilda", "Хильда", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter", "Tank"],
    roleStatus: "verified",
    primaryLane: "Roam",
    flexibleLanes: ["EXP Lane"],
    laneStatus: "verified",
    tacticalProfileStatus: "partial",
    research: { checkedAt:"2026-11-22", roleAndLaneSources:["https://mlbbhub.com/ru/heroes/hilda","https://mlbb.io/en/hero/hilda","https://mlbbdex.com/en/heroes/hilda"], competitiveReviewStatus:"pending", method:"Fighter/Tank role and Roam primary lane with EXP flexibility cross-checked across three hero databases." },
  }),  catalogEntry("hirara", "Hirara", "Хирара", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("hylos", "Hylos", "Хилос", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("irithel", "Irithel", "Иритэль", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("ixia", "Ixia", "Иксия", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("johnson", "Johnson", "Джонсон", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("joy", "Joy", "Джой", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("kadita", "Kadita", "Кадита", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("kaja", "Kaja", "Каджа", {
    roleValues: ["Support"], roleStatus: "verified", primaryLane: "Roam",
    flexibleLanes: [], laneStatus: "verified", tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: ["https://liquipedia.net/mobilelegends/Kaja", "https://mlbb-knowledge.vercel.app/heroes/62", "https://mlbbhub.com/heroes/kaja"],
      mechanicsSources: ["https://liquipedia.net/mobilelegends/Kaja", "https://mlbb-knowledge.vercel.app/heroes/62", "https://liquipedia.net/mobilelegends/Patch_2.1.95"],
      rankedMetaSources: ["https://mlbbhub.com/heroes/kaja", "https://mlbb-knowledge.vercel.app/heroes/62"],
      competitiveReviewStatus: "pending",
      method: "Support/Roam identity and current post-rework area-control kit cross-checked across independent references. Ranked data is kept separate from professional draft evidence; pro VOD review remains pending."
    }
  }),
  catalogEntry("kalea", "Kalea", "Калеа", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("karina", "Karina", "Карина", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("khaleed", "Khaleed", "Халид", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("khufra", "Khufra", "Хуфра", {
    roleValues: ["Tank"], roleStatus: "verified",
    primaryLane: "Roam", laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbbhub.com/ru/heroes/khufra", "https://mlbb.io/en/hero/khufra"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Khufra", "https://metammo.com/mobile-legends-guide/heroes/khufra"], rankedMetaSources: ["https://mlbbhub.com/ru/heroes/khufra", "https://mlbbdex.com/en/statistics"], competitiveReviewStatus: "pending", method: "Tank/Roam role, anti-dash function and skill mechanics cross-checked across independent references; pro VOD review remains pending." }
  }),
  catalogEntry("kimmy", "Kimmy", "Кимми", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("lancelot", "Lancelot", "Ланселот", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("lapu-lapu", "Lapu-Lapu", "Лапу-Лапу", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("leomord", "Leomord", "Леоморд", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("lesley", "Lesley", "Лесли", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("lolita", "Lolita", "Лолита", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),

  catalogEntry("luo-yi", "Luo Yi", "Ло И", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("lylia", "Lylia", "Лилия", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("marcel", "Marcel", "Марсель", {
    roleValues: ["Support"], roleStatus: "verified",
    primaryLane: "Roam", laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://www.mobilelegends.com/en/hero/28", "https://mlbbhub.com/ru/heroes/marcel"], mechanicsSources: ["https://www.mobilelegends.com/en/hero/28", "https://liquipedia.net/mobilelegends/Marcel", "https://mlbb.io/en/hero/marcel"], rankedMetaSources: ["https://mlbbhub.com/ru/heroes/marcel", "https://mlbbdex.com/en/statistics"], competitiveReviewStatus: "pending", method: "Official Moonton hero description and two independent databases used for mechanics; support/roam classification cross-checked. Pro VOD review remains pending." }
  }),
  catalogEntry("martis", "Martis", "Мартис", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("masha", "Masha", "Маша", {
    roleValues: ["Fighter", "Tank"], roleStatus: "verified",
    primaryLane: "EXP Lane", laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbbhub.com/ru/heroes/masha", "https://mlbb.io/en/hero/masha"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Patch_2.2.16", "https://www.youtube.com/watch?v=glz0ubRP59g"], rankedMetaSources: ["https://mlbbhub.com/ru/heroes/masha", "https://mlbbdex.com/en/statistics"], competitiveReviewStatus: "pending", method: "Post-2.2.16 Masha rework and EXP Fighter/Tank role cross-checked against patch notes, official spotlight and independent hero references. Ranked stats kept separate from pro evidence." }
  }),
  catalogEntry("mathilda", "Mathilda", "Матильда", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("melissa", "Melissa", "Мелисса", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("minsitthar", "Minsitthar", "Минситтар", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("moskov", "Moskov", "Москов", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("natalia", "Natalia", "Наталья", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("natan", "Natan", "Натан", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("novaria", "Novaria", "Новария", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("aamon", "Aamon", "Аамон", {
    roleValues: ["Assassin"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: ["https://www.mlbbguides.com/heroes/", "https://mlbb-stats.com/heroes", "https://mlbb.io/en/heroes"],
      competitiveReviewStatus: "pending",
      method: "Role and primary lane cross-checked across three independent hero databases; competitive role review remains separate."
    }
  }),
  catalogEntry("alice", "Alice", "Алиса"),
  catalogEntry("angela", "Angela", "Ангела"),
  catalogEntry("diggie", "Diggie", "Дигги", {
    roleValues: ["Support"], roleStatus: "verified",
    primaryLane: "Roam", laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbbhub.com/ru/heroes/diggie", "https://mlbb-knowledge.vercel.app/heroes/48"], mechanicsSources: ["https://mlbb-knowledge.vercel.app/heroes/48", "https://www.mlbbguides.com/heroes/diggie/skills/"], rankedMetaSources: ["https://mlbbhub.com/ru/heroes/diggie", "https://mlbb.io/en/hero/diggie"], competitiveReviewStatus: "pending", method: "Support/Roam classification and anti-CC skill kit cross-checked across independent references; professional draft/VOD review remains pending." }
  }),


  catalogEntry("valir", "Valir", "Валир", {
    roleValues: ["Mage"], roleStatus: "verified", primaryLane: "Mid Lane",
    flexibleLanes: ["EXP Lane"], laneStatus: "verified", tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: ["https://mlbb.io/en/hero/valir", "https://mlbbhub.com/heroes/valir", "https://liquipedia.net/mobilelegends/Valir"],
      mechanicsSources: ["https://liquipedia.net/mobilelegends/Valir", "https://mlbb.io/en/hero/valir", "https://kazukiofficial.com/heroes/valir"],
      rankedMetaSources: ["https://mlbb.io/en/hero/valir", "https://mlbbhub.com/heroes/valir"],
      competitiveReviewStatus: "pending",
      method: "Mage/Mid identity and current skill mechanics cross-checked across independent hero references. Brawl-only patch modifiers are not treated as ranked balance changes; pro VOD review remains pending."
    }
  }),
  catalogEntry("obsidia", "Obsidia", "Обсидия", {
    roleValues: ["Marksman"], roleStatus: "verified", primaryLane: "Gold Lane",
    flexibleLanes: [], laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://www.mobilelegends.com/en/hero/15", "https://mlbbhub.com/heroes/obsidia", "https://mlbbdex.com/ru/heroes/obsidia"], mechanicsSources: ["https://www.mobilelegends.com/en/hero/15", "https://www.mlbb.io/en/hero/obsidia", "https://www.mlbbguides.com/heroes/obsidia/"], rankedMetaSources: ["https://mlbbdex.com/ru/heroes/obsidia", "https://mlbbhub.com/heroes/obsidia"], competitiveReviewStatus: "pending", method: "Marksman/Gold Lane identity cross-checked against the official Moonton hero page and two independent databases. Bone Shard and tether mechanics are cross-checked against official skill text and two hero guides; ranked and professional evidence are not conflated." }
  }),

  catalogEntry("odette", "Odette", "Одетта", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("paquito", "Paquito", "Пакито", {
    roleValues: ["Fighter", "Assassin"], roleStatus: "verified", primaryLane: "EXP Lane",
    flexibleLanes: ["Jungle"], laneStatus: "verified", tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: ["https://liquipedia.net/mobilelegends/Paquito", "https://mlbbhub.com/heroes/paquito", "https://mlbb-knowledge.vercel.app/heroes/103"],
      mechanicsSources: ["https://liquipedia.net/mobilelegends/Paquito", "https://mlbb-knowledge.vercel.app/heroes/103", "https://mlbbhub.com/heroes/paquito"],
      rankedMetaSources: ["https://mlbbhub.com/heroes/paquito", "https://mlbb-knowledge.vercel.app/heroes/103"],
      competitiveReviewStatus: "pending",
      method: "Fighter/Assassin role, EXP primary lane and Jungle flexibility cross-checked. Skill-cycle mechanics and ranked build evidence are separated from professional pick evidence; pro VOD review remains pending."
    }
  }),
  catalogEntry("phoveus", "Phoveus", "Фовеус", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("popol-and-kupa", "Popol and Kupa", "Пополь и Купа", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("rafaela", "Rafaela", "Рафаэль", {
    roleValues: ["Support"], roleStatus: "verified", primaryLane: "Roam",
    flexibleLanes: ["Mid Lane"], laneStatus: "verified", tacticalProfileStatus: "partial",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: ["https://liquipedia.net/mobilelegends/Rafaela", "https://mobilelegends.com/hero/detail?heroid=14", "https://mlbbhub.com/heroes/rafaela"],
      mechanicsSources: ["https://mobilelegends.com/hero/detail?heroid=14", "https://liquipedia.net/mobilelegends/Rafaela", "https://mlbb.io/en/hero/rafaela/build"],
      rankedMetaSources: ["https://mobilelegends.com/hero/detail?heroid=14", "https://mlbbhub.com/heroes/rafaela"],
      competitiveReviewStatus: "pending",
      method: "Support/Roam identity cross-checked against the official hero page and independent databases. The current official passive resurrection mechanic takes precedence over older third-party passive descriptions; pro VOD review remains pending."
    }
  }),
  catalogEntry("ruby", "Ruby", "Руби", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("saber", "Saber", "Сабер", {
    tacticalProfileStatus: "partial",
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("selena", "Selena", "Селена", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("silvanna", "Silvanna", "Сильванна", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("sora", "Sora", "Сора", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("sun", "Sun", "Сан", {
    roleValues: ["Fighter"], roleStatus: "verified", primaryLane: "EXP Lane",
    flexibleLanes: ["Jungle"], laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbb-knowledge.vercel.app/heroes/27", "https://mlbbhub.com/ru/heroes/sun", "https://mlbb.io/en/hero/sun"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Sun", "https://mlbb-knowledge.vercel.app/heroes/27", "https://mlbb.io/en/hero/sun"], rankedMetaSources: ["https://mlbbdex.com/en/statistics", "https://mlbbhub.com/ru/heroes/sun"], competitiveReviewStatus: "pending", method: "Fighter/EXP identity and Jungle flexibility cross-checked across three hero databases. Clone mechanics are compared across Liquipedia, MLBB Knowledge and MLBB.io; ranked aggregates are kept separate from professional evidence and patch-specific pro VOD review remains pending." }
  }),

  catalogEntry("uranus", "Uranus", "Уранус", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("vale", "Vale", "Вэйл", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("valentina", "Valentina", "Валентина", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("vexana", "Vexana", "Вексана", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("wanwan", "Wanwan", "Ванван", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("x-borg", "X.Borg", "Икс.Борг", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("xavier", "Xavier", "Ксавьер", {
    roleValues: ["Mage"], roleStatus: "verified", primaryLane: "Mid Lane",
    flexibleLanes: [], laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbb-knowledge.vercel.app/heroes/115", "https://mlbbhub.com/ru/heroes/xavier", "https://mlbb.io/en/hero/xavier"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Xavier", "https://mlbb.tools/heroes/xavier", "https://mlbbhub.com/patch-notes/original/2.2.23"], rankedMetaSources: ["https://mlbbhub.com/ru/heroes/xavier", "https://mlbbdex.com/en/heroes/xavier"], competitiveReviewStatus: "pending", method: "Mage/Mid identity and current skill mechanics cross-checked across independent hero databases. Patch 2.2.23 Xavier changes are explicitly included; ranked aggregates remain separate from professional samples and current-patch VOD review remains pending." }
  }),

  catalogEntry("yi-sun-shin", "Yi Sun-shin", "Ли Сун-Син", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("yin", "Yin", "Инь", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("yu-zhong", "Yu Zhong", "Юй Чжун", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("yve", "Yve", "Ив", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("zetian", "Zetian", "Цзэтянь", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("zhask", "Zhask", "Жаск", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("zhuxin", "Zhuxin", "Чжусин", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("zilong", "Zilong", "Зилонг", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),

  catalogEntry("estes", "Estes", "Эстес", { roleValues:["Support"], roleStatus:"verified", primaryLane:"Roam", flexibleLanes:[], laneStatus:"verified", tacticalProfileStatus:"partial", research:{ checkedAt:"2026-11-22", roleAndLaneSources:["https://mlbb-knowledge.vercel.app/heroes/34","https://mlbbhub.com/heroes/estes","https://mlbb.io/en/hero/estes"], mechanicsSources:["https://liquipedia.net/mobilelegends/Estes","https://mlbb-knowledge.vercel.app/heroes/34","https://metammo.com/mobile-legends-guide/heroes/estes"], rankedMetaSources:["https://mlbbhub.com/heroes/estes","https://mlbbdex.com/en/heroes/estes"], competitiveReviewStatus:"pending", method:"Support/Roam role cross-checked across three databases; healing, link and area slow checked across independent skill references. Ranked and pro evidence are kept separate." } }),
  catalogEntry("minotaur", "Minotaur", "Минотавр", { roleValues:["Tank","Support"], roleStatus:"verified", primaryLane:"Roam", flexibleLanes:["EXP Lane"], laneStatus:"verified", tacticalProfileStatus:"partial", research:{ checkedAt:"2026-11-22", roleAndLaneSources:["https://mlbbhub.com/heroes/minotaur","https://mlbb.io/en/hero/minotaur","https://mlbbdex.com/en/heroes/minotaur"], mechanicsSources:["https://mlbbhub.com/heroes/minotaur","https://liquipedia.net/mobilelegends/Minotaur","https://mlbb.io/en/hero/minotaur"], rankedMetaSources:["https://mlbbhub.com/heroes/minotaur","https://mlbbdex.com/en/heroes/minotaur"], competitiveReviewStatus:"pending", method:"Tank/Support and Roam primary role cross-checked across three databases; EXP retained as flexible lane. Rage-state control and healing reviewed separately from ranked aggregates." } }),
  catalogEntry("lunox", "Lunox", "Люнокс", { roleValues:["Mage"], roleStatus:"verified", primaryLane:"Mid Lane", flexibleLanes:[], laneStatus:"verified", tacticalProfileStatus:"partial", research:{ checkedAt:"2026-11-22", roleAndLaneSources:["https://mlbbhub.com/ru/heroes/lunox","https://mlbb.io/en/hero/lunox","https://mlbb-knowledge.vercel.app/heroes/"], mechanicsSources:["https://liquipedia.net/mobilelegends/Lunox","https://kazukiofficial.com/heroes/lunox","https://mlbb.tools/patch-notes/2.2.23"], rankedMetaSources:["https://mlbbhub.com/ru/heroes/lunox","https://mlbbdex.com/en/heroes/lunox"], competitiveReviewStatus:"pending", method:"Mage/Mid identity cross-checked across three databases; Order/Chaos forms and patch 2.2.23 adjustments checked against independent skill and patch references. Current-patch pro VOD review remains pending." } }),


];
