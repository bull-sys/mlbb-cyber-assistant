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
  catalogEntry("roger", "Roger", "Роджер"),
  catalogEntry("ling", "Ling", "Линг"),
  catalogEntry("nolan", "Nolan", "Нолан"),
  catalogEntry("suyou", "Suyou", "Су Ё"),
  catalogEntry("jawhead", "Jawhead", "Кусака", {
    identityStatus: "user_confirmed",
    localizationStatus: "user_confirmed"
  }),

  catalogEntry("karrie", "Karrie", "Кэрри"),
  catalogEntry("bruno", "Bruno", "Бруно"),
  catalogEntry("layla", "Layla", "Лейла"),
  catalogEntry("miya", "Miya", "Мия"),
  catalogEntry("granger", "Granger", "Грейнджер"),

  catalogEntry("terizla", "Terizla", "Теризла"),
  catalogEntry("dyrroth", "Dyrroth", "Диррот", {
    identityStatus: "user_confirmed",
    localizationStatus: "user_confirmed"
  }),
  catalogEntry("chou", "Chou", "Чу"),
  catalogEntry("lukas", "Lukas", "Лукас"),
  catalogEntry("thamuz", "Thamuz", "Тамуз"),

  catalogEntry("eudora", "Eudora", "Эудора"),
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
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbbdex.com/en/heroes"
      ],
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
      roleAndLaneSources: [
        "https://www.mlbbguides.com/heroes/",
        "https://mlbb-stats.com/heroes",
        "https://mlbb.io/en/heroes"
      ],
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
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
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
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("martis", "Martis", "Мартис", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
  catalogEntry("masha", "Masha", "Маша", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
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
  catalogEntry("diggie", "Diggie", "Дигги"),
  catalogEntry("estes", "Estes", "Эстес"),
  catalogEntry("minotaur", "Minotaur", "Минотавр"),
  catalogEntry("valir", "Valir", "Валир"),
  catalogEntry("obsidia", "Obsidia", "Обсидия", {
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
  }),
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
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
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
    identityStatus: "pending_review",
    localizationStatus: "pending_review"
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
];
