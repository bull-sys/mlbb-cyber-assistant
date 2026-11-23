
export const heroes = [
  {name:"Хелкарт",role:"Лес",type:"assassin",tags:["burst","pickoff","silence","ambush"],style:["hunt","backline"],strengths:["squishy-targets","isolated-targets"]},
  {name:"Ханзо",role:"Лес",type:"assassin",tags:["burst","split","poke"],style:["remote-pressure","farm"],strengths:["backline","map-pressure"]},
  {name:"Роджер",role:"Лес",type:"fighter",tags:["sustain","marksman","burst"],style:["duel","transform"],strengths:["extended-fight","squishy-targets"]},
  {name:"Линг",role:"Лес",type:"assassin",tags:["mobility","burst","pickoff"],style:["roam","hunt"],strengths:["backline","isolated-targets"]},
  {name:"Нолан",role:"Лес",type:"assassin",tags:["burst","mobility","pickoff"],style:["combo","hunt"],strengths:["squishy-targets","isolated-targets"]},
  {name:"Су Ё",role:"Лес",type:"fighter",tags:["burst","control","sustain"],style:["duel","engage"],strengths:["extended-fight","mobile-targets"]},
  {name:"Кусака",role:"Лес",type:"assassin",tags:["burst","pickoff"],style:["hunt","ambush"],strengths:["squishy-targets","isolated-targets"]},

  {name:"Кэрри",role:"Золото",type:"marksman",tags:["tank-shred","true-damage"],style:["anti-tank","dps"],strengths:["frontline","extended-fight"]},
  {name:"Бруно",role:"Золото",type:"marksman",tags:["crit","burst"],style:["poke","burst"],strengths:["squishy-targets"]},
  {name:"Лейла",role:"Золото",type:"marksman",tags:["range","scaling"],style:["range","late-game"],strengths:["siege","frontline"]},
  {name:"Мия",role:"Золото",type:"marksman",tags:["attack-speed","scaling"],style:["dps","late-game"],strengths:["extended-fight","frontline"]},
  {name:"Грейнджер",role:"Золото",type:"marksman",tags:["burst","physical"],style:["poke","burst"],strengths:["squishy-targets"]},

  {name:"Теризла",role:"Опыт",type:"fighter",tags:["frontline","control"],style:["engage","teamfight"],strengths:["grouped-enemies","frontline"]},
  {name:"Диррот",role:"Опыт",type:"fighter",tags:["sustain","armor-break"],style:["duel","anti-tank"],strengths:["frontline","extended-fight"]},
  {name:"Чу",role:"Опыт",type:"fighter",tags:["pickoff","control"],style:["catch","displacement"],strengths:["isolated-targets","backline"]},
  {name:"Лукас",role:"Опыт",type:"fighter",tags:["duel","sustain"],style:["duel","transform"],strengths:["isolated-targets","extended-fight"]},
  {name:"Тамуз",role:"Опыт",type:"fighter",tags:["sustain","frontline"],style:["engage","extended-fight"],strengths:["frontline","grouped-enemies"]},

  {name:"Эйдора",role:"Мид",type:"mage",tags:["burst","magic","control"],style:["pickoff","ambush"],strengths:["squishy-targets","isolated-targets"]},
  {name:"Кагура",role:"Мид",type:"mage",tags:["mobility","burst"],style:["pickoff","mobility"],strengths:["backline","isolated-targets"]},
  {name:"Фаша",role:"Мид",type:"mage",tags:["range","magic","burst"],style:["artillery","siege"],strengths:["grouped-enemies","backline"]},
  {name:"Циклоп",role:"Мид",type:"mage",tags:["dps","magic"],style:["chase","sustained-damage"],strengths:["mobile-targets","extended-fight"]},
  {name:"Нана",role:"Мид",type:"mage",tags:["control","magic"],style:["zone-control","anti-dive"],strengths:["engage","mobile-targets"]},
  {name:"Джулиан",role:"Мид",type:"mage",tags:["burst","control"],style:["combo","flexible"],strengths:["squishy-targets","isolated-targets"]},

  {name:"Тигрил",role:"Роум",type:"tank",tags:["engage","control","frontline"],style:["initiation","teamfight"],strengths:["grouped-enemies","squishy-targets"]},
  {name:"Атлас",role:"Роум",type:"tank",tags:["engage","control","frontline"],style:["initiation","teamfight"],strengths:["grouped-enemies","squishy-targets"]},
  {name:"Франко",role:"Роум",type:"tank",tags:["pickoff","control"],style:["catch","pickoff"],strengths:["isolated-targets","backline"]},
  {name:"Минотавр",role:"Роум",type:"tank",tags:["heal","engage","frontline"],style:["initiation","teamfight"],strengths:["grouped-enemies","extended-fight"]},
  {name:"Ангела",role:"Роум",type:"support",tags:["heal","protect"],style:["support","save"],strengths:["divers","allies"]},
  {name:"Эстес",role:"Роум",type:"support",tags:["heal","protect"],style:["healing","teamfight"],strengths:["extended-fight","grouped-allies"]},
  {name:"Дигги",role:"Роум",type:"support",tags:["anti-control","protect"],style:["counter-engage","save"],strengths:["control","engage"]},
  {name:"Валир",role:"Мид",type:"mage",tags:["anti-engage","magic","control"],style:["zone-control","counter-engage"],strengths:["engage","frontline"]},
  {name:"Алиса",role:"Мид",type:"mage",tags:["sustain","magic"],style:["dive","teamfight"],strengths:["backline","extended-fight"]}
];


export const items = [
 {name:"Господство льда",category:"Защита",tags:["anti-heal","anti-attack-speed"],description:"Ситуационный защитный предмет против восстановления здоровья и быстрых базовых атак. Проверяйте актуальную механику пассивного эффекта."},
 {name:"Щит Афины",category:"Защита",tags:["magic-burst"],description:"Защитный ответ на сильный магический взрывной урон."},
 {name:"Сияющая броня",category:"Защита",tags:["magic-dps"],description:"Вариант защиты против повторяющегося магического урона."},
 {name:"Древняя кираса",category:"Защита",tags:["physical"],description:"Защитный предмет против физического урона; особенно полезен в затяжных разменах."},
 {name:"Шипованная броня",category:"Защита",tags:["attack-speed","physical"],description:"Ситуативная защита против частых физических базовых атак."},
 {name:"Бессмертие",category:"Защита",tags:["survival"],description:"Дополнительная возможность пережить позднюю командную драку."},
 {name:"Зимняя корона",category:"Магия / защита",tags:["survival","active"],description:"Активный защитный эффект, позволяющий пережить опасный момент. Сверяйте текущую версию предмета."},
 {name:"Топор войны",category:"Атака",tags:["fighter","sustain"],description:"Предмет для подходящих бойцов и продолжительных сражений."},
 {name:"Пылающий жезл",category:"Магия",tags:["magic","burn"],description:"Усиление магического урона с эффектом горения."},
 {name:"Ожерелье заточения",category:"Магия",tags:["anti-heal"],description:"Магический вариант антихила."},
 {name:"Трезубец",category:"Атака",tags:["anti-heal"],description:"Физический вариант антихила."},
 {name:"Злобный рык",category:"Атака",tags:["penetration","tank"],description:"Физическое пробивание против защищённых целей."},
 {name:"Палочка гения",category:"Магия",tags:["penetration","magic"],description:"Магическое пробивание для подходящих магов."},
 {name:"Божественный меч",category:"Магия",tags:["penetration","magic"],description:"Магическое пробивание против высокой магической защиты."},
 {name:"Ветер природы",category:"Атака",tags:["survival","marksman"],description:"Активная защитная опция для стрелков против физического урона."},
 {name:"Ярость берсерка",category:"Атака",tags:["critical","marksman"],description:"Усиление критической сборки."},
 {name:"Клинок отчаяния",category:"Атака",tags:["physical","burst"],description:"Высокий физический урон для подходящих героев."}
];

export const talents = [
 {name:"Нечистая ярость",tier:3,description:"Следующий навык наносит дополнительный урон и восстанавливает ману."},
 {name:"Квантовый заряд",tier:3,description:"Урон от навыков даёт скорость передвижения и лечение."},
 {name:"Мастер оружия",tier:3,description:"Увеличивает все бонусы атаки, полученные от предметов."},
 {name:"Смертельное воспламенение",tier:3,description:"Наносит дополнительный урон сильно раненой цели."},
 {name:"Сокрушительный взрыв",tier:3,description:"Наносит урон по области в зависимости от максимального запаса здоровья."},
 {name:"Благословение дикой природы",tier:3,description:"Увеличивает скорость передвижения вне боя и в кустах."},
 {name:"Метка концентрации",tier:3,description:"Поражённые цели получают больше урона от союзников."},
 {name:"Храбрый удар",tier:3,description:"Попадание навыком по врагу восстанавливает HP."},
 {name:"Серия убийств",tier:3,description:"Устранение противника или содействие восстанавливает HP и даёт скорость передвижения."},
 {name:"Фестиваль крови",tier:3,description:"Урон от навыков даёт вампиризм."},
 {name:"Охотник за скидками",tier:3,description:"Снижает стоимость предметов."},
 {name:"Соберись с силами",tier:3,description:"Уменьшает перезарядку боевых заклинаний и активных предметов."},
 {name:"Ловкость",tier:1,description:"Увеличивает скорость передвижения."},
 {name:"Стремительность",tier:1,description:"Увеличивает скорость атаки."},
 {name:"Живучесть",tier:1,description:"Увеличивает максимальный запас HP."},
 {name:"Роковой удар",tier:1,description:"Увеличивает шанс критического удара."},
 {name:"Твёрдость",tier:1,description:"Увеличивает физическую и магическую защиту."},
 {name:"Воодушевление",tier:1,description:"Увеличивает урон от атаки и магическую силу."},
 {name:"Упорство",tier:2,description:"Увеличивает защиту при низком запасе HP."},
 {name:"Опытный охотник",tier:2,description:"Увеличивает урон, наносимый монстрам леса."},
 {name:"Мастер-убийца",tier:2,description:"Увеличивает урон по изолированной цели."},
 {name:"Поиск слабости",tier:2,description:"Базовые атаки замедляют цель."}
];

export const spells = ["Возмездие","Вспышка","Очищение","Вдохновение","Пламя","Исцеление","Спринт"];
export const emblems = ["Танк","Убийцы","Мага","Бойца","Стрелка","Поддержки"];
