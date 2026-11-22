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
  catalogEntry("layla", "Layla", "Лейла"),
  catalogEntry("miya", "Miya", "Мия"),
  catalogEntry("granger", "Granger", "Грейнджер"),

  catalogEntry("terizla", "Terizla", "Теризла", {
    roleValues: ["Fighter", "Tank"], roleStatus: "verified", primaryLane: "EXP Lane",
    laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbbhub.com/ru/heroes/terizla", "https://mlbb.io/en/hero/terizla/build"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Terizla", "https://mlbbhub.com/ru/heroes/terizla"], rankedMetaSources: ["https://mlbbhub.com/ru/heroes/terizla", "https://mlbb.io/en/hero/terizla/build"], competitiveReviewStatus: "pending", method: "Fighter/Tank and EXP Lane classification cross-checked across independent hero references. Ranked aggregates are separated from professional evidence; VOD review remains pending." }
  }),
  catalogEntry("dyrroth", "Dyrroth", "Диррот", {
    identityStatus: "user_confirmed",
    localizationStatus: "user_confirmed"
  }),
  catalogEntry("chou", "Chou", "Чу"),
  catalogEntry("lukas", "Lukas", "Лукас"),
  catalogEntry("thamuz", "Thamuz", "Тамуз"),

  catalogEntry("eudora", "Eudora", "Эйдора"),
  catalogEntry("kagura", "Kagura", "Кагура"),
  catalogEntry("pharsa", "Pharsa", "Фарса"),
  catalogEntry("cyclops", "Cyclops", "Циклоп"),
  catalogEntry("nana", "Nana", "Нана"),
  catalogEntry("julian", "Julian", "Джулиан"),

  catalogEntry("tigreal", "Tigreal", "Тигрил"),
  catalogEntry("atlas", "Atlas", "Атлас"),
  catalogEntry("franco", "Franco", "Франко", {
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
  }),  catalogEntry("akai", "Akai", "Акай", {
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
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("aldous", "Aldous", "Олдос", {
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
        "https://mlbbdex.com/en/heroes"
      ],
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
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("alucard", "Alucard", "Алукард", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter", "Assassin"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: [],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("argus", "Argus", "Аргус", {
    roleValues: ["Fighter"], roleStatus: "verified",
    primaryLane: "EXP Lane", laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://mlbbhub.com/ru/heroes/argus", "https://mlbb-knowledge.vercel.app/heroes/45", "https://www.mlbbguides.com/heroes/"], mechanicsSources: ["https://liquipedia.net/mobilelegends/Argus", "https://mlbb-knowledge.vercel.app/heroes/45"], rankedMetaSources: ["https://mlbbhub.com/ru/heroes/argus", "https://mlbbdex.com/en/statistics"], competitiveReviewStatus: "pending", method: "Fighter/EXP role and current passive/skill mechanics cross-checked across independent databases; pro VOD and draft review remain pending." }
  }),
  catalogEntry("arlott", "Arlott", "Арлотт", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter", "Assassin"],
    roleStatus: "verified",
    primaryLane: "EXP Lane",
    flexibleLanes: [],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("aulus", "Aulus", "Аулус", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: ["EXP Lane"],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("aurora", "Aurora", "Аврора", {
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
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("badang", "Badang", "Баданг", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter"],
    roleStatus: "verified",
    primaryLane: "EXP Lane",
    flexibleLanes: ["Roam"],
    laneStatus: "pending_review",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("balmond", "Balmond", "Балмонд", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: ["EXP Lane"],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("bane", "Bane", "Бэйн", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Fighter", "Mage"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: ["EXP Lane"],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("barats", "Barats", "Баратс", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Tank", "Fighter"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: ["EXP Lane"],
    laneStatus: "pending_review",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("baxia", "Baxia", "Баксия", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Tank"],
    roleStatus: "verified",
    primaryLane: "Jungle",
    flexibleLanes: ["Roam"],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("beatrix", "Beatrix", "Беатрис", {
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
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("belerick", "Belerick", "Белерик", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Tank"],
    roleStatus: "verified",
    primaryLane: "Roam",
    flexibleLanes: [],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: ["https://mlbb-knowledge.vercel.app/heroes/70","https://mlbb.io/en/hero/belerick","https://mlbbdex.com/en/heroes/belerick"],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("benedetta", "Benedetta", "Бенедетта", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review",
    roleValues: ["Assassin", "Fighter"],
    roleStatus: "verified",
    primaryLane: "EXP Lane",
    flexibleLanes: [],
    laneStatus: "verified",
    research: {
      checkedAt: "2026-11-22",
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("brody", "Brody", "Броди", {
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
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("carmilla", "Carmilla", "Кармилла", {
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
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("cecilion", "Cecilion", "Сесилион", {
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
        "https://mlbbdex.com/en/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role and lane tags cross-checked across independent hero databases; pro-draft usage and player VODs are reviewed separately before tactical recommendations are marked complete."
    },
  }),
  catalogEntry("chang-e", "Chang'e", "Чан’Э", {
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
        "https://www.propublic.gg/heroes/stats?dir=asc&sort=name",
        "https://mlbbhub.com/heroes"
      ],
      competitiveReviewStatus: "pending",
      method: "Role tags cross-checked against MLBBHub; lane placement checked against MLBB Guides and Propublic's Mythic+ 15-day lane table. Pro tournament usage is tracked separately and does not automatically determine ranked primary lane."
    },
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
    roleValues: ["Tank", "Marksman"],
    roleStatus: "verified",
    primaryLane: "EXP Lane",
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
    localizationStatus: "pending_review"
  }),
  catalogEntry("hirara", "Hirara", "Хирара", {
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
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
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
  catalogEntry("lunox", "Lunox", "Люнокс", {
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
  catalogEntry("estes", "Estes", "Эстес"),
  catalogEntry("minotaur", "Minotaur", "Минотавр"),
  catalogEntry("valir", "Valir", "Валир"),
  catalogEntry("obsidia", "Obsidia", "Обсидия", {
    roleValues: ["Marksman"], roleStatus: "verified", primaryLane: "Gold Lane",
    flexibleLanes: [], laneStatus: "verified", tacticalProfileStatus: "partial",
    research: { checkedAt: "2026-11-22", roleAndLaneSources: ["https://www.mobilelegends.com/en/hero/15", "https://mlbbhub.com/heroes/obsidia", "https://mlbbdex.com/ru/heroes/obsidia"], mechanicsSources: ["https://www.mobilelegends.com/en/hero/15", "https://www.mlbb.io/en/hero/obsidia", "https://www.mlbbguides.com/heroes/obsidia/"], rankedMetaSources: ["https://mlbbdex.com/ru/heroes/obsidia", "https://mlbbhub.com/heroes/obsidia"], competitiveReviewStatus: "pending", method: "Marksman/Gold Lane identity cross-checked against the official Moonton hero page and two independent databases. Bone Shard and tether mechanics are cross-checked against official skill text and two hero guides; ranked and professional evidence are not conflated." }
  })
  catalogEntry("odette", "Odette", "Одетта", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("paquito", "Paquito", "Пакито", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
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
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
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
  })
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
  })
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
];
