import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import multer from "multer";
import OpenAI from "openai";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { heroes, items, talents, spells, emblems } from "./data.js";
import { getHeroCatalogApiFields, isLegacyHeroName } from "./hero-catalog-adapter.js";
import { heroProfiles, validateHeroProfiles } from "./hero-profiles.js";
import { normalizeRegistration } from "./registration.js";
import { getOptionalUser } from "./auth.js";
import { isValidDraftRequest } from "./draft-validation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(dataDir,{recursive:true}); fs.mkdirSync(uploadDir,{recursive:true});
const db = new Database(path.join(dataDir,"mlbb.sqlite"));
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,nickname TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS profiles(user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,hero TEXT NOT NULL DEFAULT '',role TEXT NOT NULL DEFAULT 'Лес',rank TEXT NOT NULL DEFAULT 'Легенда',style TEXT NOT NULL DEFAULT 'Поднятие рейтинга',game_id TEXT DEFAULT '',bio TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS likes(from_user INTEGER NOT NULL,to_user INTEGER NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(from_user,to_user));
`);
const app=express();
app.set("trust proxy", 1);
app.use(helmet({contentSecurityPolicy:false,crossOriginEmbedderPolicy:false}));
app.use(cors({origin:process.env.APP_URL||true}));
app.use(express.json({limit:"1mb"}));
app.use(rateLimit({windowMs:15*60*1000,limit:300,standardHeaders:true,legacyHeaders:false}));
const authRateLimit=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:true,legacyHeaders:false,message:{error:"Слишком много попыток. Попробуй позже."}});
const guestDraftRateLimit=rateLimit({windowMs:15*60*1000,limit:60,standardHeaders:true,legacyHeaders:false,message:{error:"Слишком много запросов к анализу. Попробуй позже."}});
const upload=multer({dest:uploadDir,limits:{fileSize:(Number(process.env.MAX_UPLOAD_MB)||8)*1024*1024},fileFilter:(req,file,cb)=>cb(null,/^image\/(png|jpeg|webp)$/.test(file.mimetype))});
const secret=process.env.JWT_SECRET;
if(!secret && process.env.NODE_ENV==="production") throw new Error("JWT_SECRET is required in production");
const tokenSecret=secret||"development-only-change-me";
const openai=process.env.OPENAI_API_KEY?new OpenAI({apiKey:process.env.OPENAI_API_KEY}):null;
const roles=["Лес","Золото","Опыт","Мид","Роум"];
const ranks=["Эпик","Легенда","Мифик","Мифическая слава","Мифическая бессмертие"];
const styles=["Поднятие рейтинга","По фану","Кастомки"];
const safeUser=id=>db.prepare("SELECT u.id,u.email,u.nickname,p.hero,p.role,p.rank,p.style,p.game_id,p.bio FROM users u LEFT JOIN profiles p ON p.user_id=u.id WHERE u.id=?").get(id);
function auth(req,res,next){const h=req.headers.authorization||"";try{if(!h.startsWith("Bearer "))throw 0;req.user=jwt.verify(h.slice(7),tokenSecret);next()}catch{return res.status(401).json({error:"Требуется авторизация"})}}
function optionalAuth(req,res,next){req.user=getOptionalUser(req.headers.authorization,token=>jwt.verify(token,tokenSecret));next()}
function issue(id){return jwt.sign({id},tokenSecret,{expiresIn:"14d"})}
app.get("/api/health",(req,res)=>res.json({ok:true,service:"MLBB Cyber Assistant",version:"1.0.0"}));
app.get("/api/data",(req,res)=>res.json({
  heroes,
  ...getHeroCatalogApiFields(),
  heroProfiles,
  heroProfilesValidation: validateHeroProfiles(),
  items,
  talents,
  spells,
  emblems,
  roles,
  ranks,
  styles,
  disclaimer:"Справочник — стартовый фанатский набор. Сверяйте данные с текущим клиентом MLBB."
}));
app.post("/api/auth/register",authRateLimit,async(req,res)=>{
 const input=normalizeRegistration(req.body||{});
 if(!input.ok)return res.status(400).json({error:input.error});
 try{
  const passwordHash=await bcrypt.hash(input.password,12);
  const createUser=db.transaction(()=>{
   const result=db.prepare("INSERT INTO users(email,password_hash,nickname) VALUES(?,?,?)").run(input.email,passwordHash,input.nickname);
   const id=Number(result.lastInsertRowid);
   db.prepare("INSERT INTO profiles(user_id) VALUES(?)").run(id);
   return id;
  });
  const id=createUser();
  res.status(201).json({token:issue(id),user:safeUser(id)});
 }catch(error){
  if(String(error.code||"").includes("CONSTRAINT_UNIQUE"))return res.status(409).json({error:"Аккаунт с таким email уже существует"});
  res.status(500).json({error:"Не удалось создать аккаунт"});
 }
});
app.post("/api/auth/login",authRateLimit,async(req,res)=>{const {email,password}=req.body||{};const u=db.prepare("SELECT * FROM users WHERE email=?").get(String(email||"").toLowerCase().trim());if(!u||!await bcrypt.compare(String(password||""),u.password_hash))return res.status(401).json({error:"Неверный email или пароль"});res.json({token:issue(u.id),user:safeUser(u.id)})});
app.get("/api/me",auth,(req,res)=>{const u=safeUser(req.user.id);if(!u)return res.status(404).json({error:"Пользователь не найден"});res.json({user:u})});
app.put("/api/profile",auth,(req,res)=>{
 const b=req.body||{};const hero=String(b.hero||"");const role=String(b.role||"");const rank=String(b.rank||"");const style=String(b.style||"");
 if(!isLegacyHeroName(hero)||!roles.includes(role)||!ranks.includes(rank)||!styles.includes(style))return res.status(400).json({error:"Проверь героя, роль, ранг и стиль"});
 db.prepare("UPDATE profiles SET hero=?,role=?,rank=?,style=?,game_id=?,bio=? WHERE user_id=?").run(hero,role,rank,style,String(b.game_id||"").slice(0,40),String(b.bio||"").slice(0,240),req.user.id);res.json({user:safeUser(req.user.id)});
});
app.get("/api/players",auth,(req,res)=>{
 const {hero="",role="",rank="",style=""}=req.query;let sql=`SELECT u.id,u.nickname,p.hero,p.role,p.rank,p.style,p.bio FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.id<>? AND p.hero<>''`;const args=[req.user.id];
 for(const [k,v] of Object.entries({hero,role,rank,style})){if(v){sql+=` AND p.${k}=?`;args.push(String(v).slice(0,60))}}
 const rows=db.prepare(sql+" ORDER BY u.created_at DESC LIMIT 80").all(...args);res.json({players:rows});
});
app.post("/api/players/:id/like",auth,(req,res)=>{const target=Number(req.params.id);if(!Number.isInteger(target)||target===req.user.id||!safeUser(target))return res.status(400).json({error:"Некорректный игрок"});db.prepare("INSERT OR IGNORE INTO likes(from_user,to_user) VALUES(?,?)").run(req.user.id,target);const mutual=!!db.prepare("SELECT 1 FROM likes WHERE from_user=? AND to_user=?").get(target,req.user.id);res.json({liked:true,mutual})});
app.get("/api/matches",auth,(req,res)=>{const rows=db.prepare(`SELECT u.id,u.nickname,p.hero,p.role,p.rank,p.style,p.game_id FROM likes l JOIN users u ON u.id=l.to_user JOIN profiles p ON p.user_id=u.id WHERE l.from_user=? AND EXISTS(SELECT 1 FROM likes x WHERE x.from_user=l.to_user AND x.to_user=l.from_user)`).all(req.user.id);res.json({matches:rows})});

function analyze({lane, enemies = [], allies = [], myHero = ""}) {
  const enemy = heroes.filter(h => enemies.includes(h.name));
  const team = heroes.filter(h => allies.includes(h.name));
  const selected = heroes.find(h => h.name === myHero);

  const enemyTags = new Set(enemy.flatMap(h => h.tags || []));
  const allyTags = new Set(team.flatMap(h => h.tags || []));
  const enemyTypes = enemy.map(h => h.type);

  const has = tag => enemyTags.has(tag);
  const enemyHas = type => enemy.some(h => h.type === type);
  const hasFrontline = team.some(h =>
    h.type === "tank" || (h.tags || []).includes("frontline")
  );

  // Угрозы вражеского состава
  const threats = [];

  if (has("heal") || has("sustain"))
    threats.push("Восстановление здоровья и устойчивость");

  if (enemyTypes.filter(t => t === "mage").length >= 2)
    threats.push("Высокая магическая угроза");

  if (has("attack-speed"))
    threats.push("Высокая скорость атаки");

  if (enemyHas("tank"))
    threats.push("Плотная передняя линия");

  if (has("control"))
    threats.push("Много контроля");

  if (has("burst"))
    threats.push("Высокий взрывной урон");

  if (has("mobility"))
    threats.push("Высокая мобильность");

  
  // Подбор контрпиков с учётом состава
  const candidates = heroes
    .filter(h =>
      h.role === lane &&
      !enemies.includes(h.name) &&
      h.name !== myHero
    )
    .map(h => {
      const tags = new Set(h.tags || []);
      const strengths = new Set(h.strengths || []);
      const style = new Set(h.style || []);
      let score = 0;
      const reasons = [];

      const add = (points, reason) => {
        score += points;
        reasons.push(reason);
      };

      // Давление на стрелков и магов
      if (
        (enemyHas("marksman") || enemyHas("mage")) &&
        (strengths.has("backline") ||
         strengths.has("squishy-targets"))
      ) {
        add(4, "Имеет инструменты для давления на стрелков и магов");
      }

      // Охота на одиночные цели
      if (
        strengths.has("isolated-targets") &&
        (has("burst") || has("mobility"))
      ) {
        add(4, "Эффективен против изолированных противников");
      }

      // Ответ на мобильных героев
      if (
        has("mobility") &&
        (tags.has("control") ||
         strengths.has("mobile-targets"))
      ) {
        add(4, "Может сдерживать мобильных противников");
      }

      // Ответ на плотную переднюю линию
      if (
        enemyHas("tank") &&
        (tags.has("tank-shred") ||
         tags.has("armor-break") ||
         strengths.has("frontline"))
      ) {
        add(4, "Полезен против плотной передней линии");
      }

      // Контроль и защита от инициации
      if (
        has("control") &&
        (tags.has("anti-control") ||
         style.has("counter-engage") ||
         style.has("anti-dive"))
      ) {
        add(4, "Помогает переживать вражескую инициацию");
      }

      // Ответ на затяжные сражения
      if (
        (has("heal") || has("sustain")) &&
        (tags.has("anti-heal") ||
         strengths.has("extended-fight"))
      ) {
        add(3, "Полезен в затяжных боях против устойчивых целей");
      }

      // Командная синергия
      if (
        allyTags.has("engage") &&
        (style.has("teamfight") ||
         style.has("burst") ||
         tags.has("burst"))
      ) {
        add(2, "Хорошо сочетается с инициацией союзников");
      }

      // Недостаток передней линии
      if (!hasFrontline && tags.has("frontline")) {
        add(3, "Укрепляет переднюю линию команды");
      }

      // Специализация на подборе целей
      if (
        style.has("pickoff") ||
        style.has("hunt") ||
        style.has("catch")
      ) {
        if (enemyHas("marksman") || enemyHas("mage")) {
          add(2, "Может создавать давление на ключевые цели");
        }
      }

      return {
        hero: h,
        score,
        reason: [...new Set(reasons)].join("; ")
      };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);


  // Подбор предметов
  const physicalAssassin = selected?.type === "assassin";
  const physicalFighter = selected?.type === "fighter";
  const magicMage = selected?.type === "mage";
  const marksman = selected?.type === "marksman";

  const itemScores = items.map(item => {
    const tags = new Set(item.tags || []);
    let score = 0;
    const reasons = [];

    // Совместимость с выбранным героем
    if (physicalAssassin && item.category === "Атака" &&
        (tags.has("burst") || tags.has("penetration"))) {
      score += 4;
      reasons.push("Подходит физическому убийце");
    }

    if (physicalFighter && tags.has("fighter")) {
      score += 4;
      reasons.push("Подходит бойцу");
    }

    if (magicMage && tags.has("magic")) {
      score += 4;
      reasons.push("Усиливает магический урон");
    }

    if (marksman && tags.has("marksman")) {
      score += 4;
      reasons.push("Подходит стрелку");
    }

    // Ответы на угрозы
    if ((has("heal") || has("sustain")) &&
        tags.has("anti-heal")) {
      score += 6;
      reasons.push("Снижает эффективность восстановления здоровья");
    }

    if (enemyTypes.filter(t => t === "mage").length >= 2 &&
        tags.has("magic-burst")) {
      score += 5;
      reasons.push("Защищает от магического взрывного урона");
    }

    if (has("attack-speed") &&
        tags.has("anti-attack-speed")) {
      score += 5;
      reasons.push("Ослабляет героев с частыми автоатаками");
    }

    if (enemyHas("tank") && tags.has("penetration")) {
      score += 4;
      reasons.push("Помогает пробивать защиту противников");
    }

    if (has("burst") && tags.has("survival")) {
      score += 3;
      reasons.push("Повышает шансы пережить взрывной урон");
    }

    if (has("attack-speed") && tags.has("attack-speed")) {
      score += 3;
      reasons.push("Даёт дополнительную защиту от физических атак");
    }

    return {
      name: item.name,
      score,
      reasons,
      category: item.category,
      tags: [...tags]
    };
  });

  const compatible = itemScores.filter(item => {
    if (item.score <= 0) return false;

    if (physicalAssassin &&
        (item.category === "Магия" ||
         item.category === "Магия / защита")) return false;

    if (magicMage && item.category === "Атака") return false;

    return true;
  });

  // Не более одного предмета с антихилом
  const buildDetails = [];
  const usedTags = new Set();

  compatible.sort((a, b) => b.score - a.score);

  for (const item of compatible) {
    if (buildDetails.length >= 6) break;

    if (item.tags.includes("anti-heal")) {
      if (usedTags.has("anti-heal")) continue;
      usedTags.add("anti-heal");
    }

    buildDetails.push({
      name: item.name,
      reasons: item.reasons
    });
  }

  // Заполняем оставшиеся слоты подходящими защитными предметами
  const fallbacks = items.filter(item => {
    if (buildDetails.some(x => x.name === item.name)) return false;

    if (physicalAssassin &&
        (item.category === "Магия" ||
         item.category === "Магия / защита")) return false;

    if (magicMage && item.category === "Атака") return false;

    return item.tags.includes("survival");
  });

  for (const item of fallbacks) {
    if (buildDetails.length >= 6) break;

    buildDetails.push({
      name: item.name,
      reasons: ["Дополнительная выживаемость"]
    });
  }

  const emblem = selected?.type === "mage" ? "Мага"
    : selected?.type === "marksman" ? "Стрелка"
    : selected?.type === "tank" ? "Танка"
    : selected?.type === "support" ? "Поддержки"
    : selected?.type === "fighter" ? "Бойца"
    : "Убийцы";

  return {
    threats,
    counters: candidates.map(x => ({
      name: x.hero.name,
      role: x.hero.role,
      reason: x.reason,
      score: x.score
    })),
    build: buildDetails.map(x => x.name),
    buildDetails,
    emblem,
    talentTiers: ["Разрыв", "Мастер-убийца", "Серия убийств"],
    spell: lane === "Лес" ? "Возмездие" : "Вспышка",
    timing: {
      early: "Контролируй ключевые участки карты и отслеживай перемещения противника.",
      mid: "Используй преимущество после покупки основных предметов и участвуй в борьбе за объекты.",
      late: "Выбирай момент для командного боя с учётом расположения главных угроз."
    },
    note: "Рекомендации основаны на локальной базе героев и предметов. Точные показатели текущего патча не используются."
  };
}

app.post("/api/ai/draft",guestDraftRateLimit,optionalAuth,async(req,res)=>{
 const b=req.body||{};if(!isValidDraftRequest(b,roles,isLegacyHeroName))return res.status(400).json({error:"Некорректный состав или линия"});
 const result=analyze(b);
 if(openai&&req.user){try{const response=await openai.chat.completions.create({model:process.env.OPENAI_MODEL||"gpt-4.1-mini",messages:[{role:"system",content:"Ты тактический помощник MLBB. Не выдумывай live статистику и точные параметры патча. Используй только переданные варианты. Кратко объясни тактику на русском."},{role:"user",content:JSON.stringify({lane:b.lane,enemies:b.enemies,allies:b.allies||[],myHero:b.myHero||"",rulesResult:result})}],max_tokens:450,temperature:.3});result.aiExplanation=response.choices[0]?.message?.content||""}catch{result.aiExplanation="AI-сервис временно недоступен; показан базовый анализ."}}
 res.json(result);
});
app.post("/api/draft/ocr-upload",auth,upload.single("image"),(req,res)=>{if(req.file)fs.unlink(req.file.path,()=>{});res.status(410).json({error:"Серверный OCR не используется: распознавание скриншота выполняется локально в браузере."})});
app.use(express.static(path.join(root,"public")));
app.get("*",(req,res)=>res.sendFile(path.join(root,"public","index.html")));
const port=Number(process.env.PORT)||3000;
app.listen(port,()=>console.log(`MLBB Cyber Assistant listening on ${port}`));
