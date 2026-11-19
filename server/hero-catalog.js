/**
 * Partial catalog seed derived only from the 32 legacy hero names in data.js.
 * This is not a complete MLBB roster; identity/name mappings not explicitly
 * confirmed by the user remain pending review. No gameplay data is included.
 */
const catalogEntry = (id, nameEn, displayNameRu, {
  identityStatus = "pending_review",
  localizationStatus = "pending_review"
} = {}) => ({
  id,
  nameEn,
  displayNameRu,
  identity: { status: identityStatus },
  localization: { status: localizationStatus },
  role: { values: [], status: "pending_review" },
  lanes: { primary: null, flexible: [], status: "pending_review" },
  tacticalProfile: { status: "missing" }
});

// Keep this catalog explicitly partial until an official-client roster
// snapshot has been enumerated and reviewed.
export const HERO_CATALOG_ROSTER_STATUS = "incomplete";

export const heroCatalog = [
  catalogEntry("helcurt", "Helcurt", "Хелкарт"),
  catalogEntry("hanzo", "Hanzo", "Ханзо"),
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
  catalogEntry("dyrroth", "Dyrroth", "Дариус", {
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
  catalogEntry("franco", "Franco", "Франко"),
  catalogEntry("minotaur", "Minotaur", "Минотавр"),
  catalogEntry("angela", "Angela", "Ангела"),
  catalogEntry("estes", "Estes", "Эстес"),
  catalogEntry("diggie", "Diggie", "Дигги"),
  catalogEntry("valir", "Valir", "Валир"),
  catalogEntry("alice", "Alice", "Алиса")
];
