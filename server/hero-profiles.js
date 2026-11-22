/**
 * MLBB Cyber Assistant
 * Structured Hero Knowledge Base
 */

export const HERO_DB_VERSION = "0.1.0";
export const HERO_DB_PATCH = "2.2.23";

export const heroProfiles = [
  {
    id: "helcurt",
    names: {
      ru: "Хелкарт",
      en: "Helcurt",
      aliases: []
    },
    roles: ["Убийца"],
    lanes: ["Лес", "Роум"],
    combat: {
      damage: "physical",
      range: "melee",
      mobility: "high",
      burst: "high",
      dps: "medium",
      durability: "low",
      sustain: "medium",
      control: "fear_and_slow",
      engage: "high",
      disengage: "high",
      waveClear: "medium",
      objectiveDamage: "unknown"
    },
    mechanics: [
      "Пассивный эффект «Тень Стикса»: пока Хелкарт не обнаружен и не наносит урон, он находится в состоянии Prowler, получает бонус к скорости передвижения и восстанавливает здоровье. После обнаружения временно получает ускорение атаки и передвижения.",
      "После убийства героя, которому Хелкарт нанёс урон, появляется тёмный туман. Внутри него Хелкарт получает маскировку; туман может дать окно для смены позиции после первого устранения.",
      "Навык 1 «Скрытый ужас»: мгновенное перемещение к точке и замедление попавших противников. Из состояния Prowler навык дополнительно пугает и кратко раскрывает цель; перезарядка в этом состоянии ускоряется.",
      "Навык 2 «Смертоносные шипы»: накапливает до пяти зарядов во время Prowler или от базовых атак, затем выпускает накопленные шипы. Навык считается базовой атакой, но не может критовать.",
      "Ультимейт «Наступление тёмной ночи»: временно ограничивает обзор противников и мешает им видеть расположение союзников; сам Хелкарт получает бонус к скорости передвижения."
    ],
    strengths: [
      "Сильный выбор для поиска изолированной цели и давления на заднюю линию.",
      "Ультимейт нарушает визуальную координацию противника и помогает команде начать размен на своих условиях.",
      "Связка Prowler, первого навыка и тумана после устранения позволяет менять угол атаки и выходить из опасной зоны."
    ],
    weaknesses: [
      "Плохо переносит затяжной прямой бой с плотной передней линией, если не может быстро добраться до приоритетной цели.",
      "Контроль и своевременное обнаружение могут сорвать вход и не дать реализовать преимущество мобильности.",
      "Пассивное восстановление здоровья требует не наносить урон; постоянные атаки во время перемещения лишают Хелкарта этого окна восстановления."
    ],
    matchups: {
      strongAgainst: [],
      weakAgainst: []
    },
    synergies: [],
    itemNotes: [
      "Не фиксировать один универсальный билд: текущие рекомендации по предметам расходятся между источниками и зависят от того, играет ли Хелкарт через разовый пик-офф или через более продолжительный урон шипами.",
      "Для следующего этапа требуется повторная проверка актуальных предметов, эмблем и заклинаний по патчу 2.2.23 и игровым матчам."
    ],
    teamfight: {
      preferredPlan: "Перед командным столкновением определить цель для первого устранения и путь отхода. Ультимейт использовать для нарушения обзора, а не автоматически по перезарядке. После входа приоритет — изолированная уязвимая цель; заранее учитывать, где появится тёмный туман для смены позиции.",
      targetPriority: ["Уязвимый стрелок или маг без готового средства спасения", "Изолированная цель, которую команда может быстро поддержать"],
      avoid: [
        "Не начинать бой в плотную группу, если команда не может продолжить атаку.",
        "Не входить первым в заранее подготовленный контроль противника.",
        "Не тратить ультимейт только ради перемещения, если скоро ожидается важная командная борьба за объект."
      ]
    },
    sources: [
      "https://liquipedia.net/mobilelegends/Helcurt",
      "https://mlbb.io/en/hero/helcurt",
      "https://mlbb-stats.com/counter/helcurt",
      "https://mlbbhub.com/ru/heroes/helcurt",
      "https://mlbbdex.com/en/esports"
    ],
    patch: {
      version: HERO_DB_PATCH,
      notes: [
        "Профиль сверён с данными живого патча 2.2.23 на 2026-11-22.",
        "Механики сверены по двум справочникам; точные числовые значения намеренно не закреплены без проверки в актуальном клиенте.",
        "В срезах рейтинговой статистики на 2026-11-21/22 Хелкарт находится примерно на уровне 47.8–48.0% побед при низкой частоте выбора. Это не является самостоятельной оценкой силы в конкретном драфте.",
        "В доступной сводке 667 профессиональных игр Хелкарт не попал в опубликованные списки лидеров по выборам и банам. Это не доказывает полного отсутствия пиков; разбор конкретных VOD ещё не выполнен."
      ],
      reviewedAt: "2026-11-22"
    },
    confidence: "partial"
  },
  {
    id: "jawhead",
    names: {
      ru: "Кусака",
      en: "Jawhead",
      aliases: []
    },
    roles: ["Боец"],
    lanes: ["Роум", "Опыт"],
    combat: {
      damage: "physical",
      range: "melee",
      mobility: "high",
      burst: "high",
      dps: "medium",
      durability: "medium",
      sustain: "unknown",
      control: "displacement",
      engage: "high",
      disengage: "medium",
      waveClear: "unknown",
      objectiveDamage: "unknown"
    },
    mechanics: [],
    strengths: [],
    weaknesses: [],
    matchups: {
      strongAgainst: [],
      weakAgainst: []
    },
    synergies: [],
    itemNotes: [],
    teamfight: {
      preferredPlan: null,
      targetPriority: [],
      avoid: []
    },
    sources: [],
    patch: {
      version: HERO_DB_PATCH,
      notes: [],
      reviewedAt: null
    },
    confidence: "partial"
  },

  {
    id: "saber",
    names: {
      ru: "Сабер",
      en: "Saber",
      aliases: []
    },
    roles: ["Убийца"],
    lanes: ["Лес", "Роум"],
    combat: {
      damage: "physical",
      range: "melee",
      mobility: "medium",
      burst: "high",
      dps: "low",
      durability: "low",
      sustain: "unknown",
      control: "single_target",
      engage: "high",
      disengage: "medium",
      waveClear: "unknown",
      objectiveDamage: "unknown"
    },
    mechanics: [],
    strengths: [],
    weaknesses: [],
    matchups: {
      strongAgainst: [],
      weakAgainst: []
    },
    synergies: [],
    itemNotes: [],
    teamfight: {
      preferredPlan: null,
      targetPriority: [],
      avoid: []
    },
    sources: [],
    patch: {
      version: HERO_DB_PATCH,
      notes: [],
      reviewedAt: null
    },
    confidence: "partial"
  }
];

export function validateHeroProfiles(profiles = heroProfiles) {
  const errors = [];
  const ids = new Set();

  for (const hero of profiles) {
    if (!hero.id) {
      errors.push("Missing hero ID");
      continue;
    }

    if (ids.has(hero.id)) {
      errors.push("Duplicate ID: " + hero.id);
    }

    ids.add(hero.id);

    if (!hero.names?.ru) {
      errors.push(hero.id + ": missing Russian name");
    }

    if (!hero.matchups?.strongAgainst ||
        !hero.matchups?.weakAgainst) {
      errors.push(hero.id + ": missing matchup data");
    }
  }

  return {
    ok: errors.length === 0,
    count: profiles.length,
    errors
  };
}
