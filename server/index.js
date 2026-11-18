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
app.use(helmet({contentSecurityPolicy:false,crossOriginEmbedderPolicy:false}));
app.use(cors({origin:process.env.APP_URL||true}));
app.use(express.json({limit:"1mb"}));
app.use(rateLimit({windowMs:15*60*1000,limit:300,standardHeaders:true,legacyHeaders:false}));
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
function issue(id){return jwt.sign({id},tokenSecret,{expiresIn:"14d"})}
app.get("/api/health",(req,res)=>res.json({ok:true,service:"MLBB Cyber Assistant",version:"1.0.0"}));
app.get("/api/data",(req,res)=>res.json({heroes,items,talents,spells,emblems,roles,ranks,styles,disclaimer:"Справочник — стартовый фанатский набор. Сверяйте данные с текущим клиентом MLBB."}));
app.post("/api/auth/register",async(req,res)=>{
 const {email,password,nickname}=req.body||{};
 if(typeof email!=="string"||!/^.+@.+\..+$/.test(email)||typeof password!=="string"||password.length<10||password.length>100||typeof nickname!=="string"||nickname.trim().length<2||nickname.trim().length>24)return res.status(400).json({error:"Укажи email, ник 2–24 символа и пароль от 10 символов"});
 try{const info=db.prepare("INSERT INTO users(email,password_hash,nickname) VALUES(?,?,?)").run(email.toLowerCase().trim(),await bcrypt.hash(password,12),nickname.trim());db.prepare("INSERT INTO profiles(user_id) VALUES(?)").run(info.lastInsertRowid);res.json({token:issue(info.lastInsertRowid),user:safeUser(info.lastInsertRowid)})}catch(e){res.status(409).json({error:"Этот email уже зарегистрирован"})}
});
app.post("/api/auth/login",async(req,res)=>{const {email,password}=req.body||{};const u=db.prepare("SELECT * FROM users WHERE email=?").get(String(email||"").toLowerCase().trim());if(!u||!await bcrypt.compare(String(password||""),u.password_hash))return res.status(401).json({error:"Неверный email или пароль"});res.json({token:issue(u.id),user:safeUser(u.id)})});
app.get("/api/me",auth,(req,res)=>{const u=safeUser(req.user.id);if(!u)return res.status(404).json({error:"Пользователь не найден"});res.json({user:u})});
app.put("/api/profile",auth,(req,res)=>{
 const b=req.body||{};const hero=String(b.hero||"");const role=String(b.role||"");const rank=String(b.rank||"");const style=String(b.style||"");
 if(!heroes.some(h=>h.name===hero)||!roles.includes(role)||!ranks.includes(rank)||!styles.includes(style))return res.status(400).json({error:"Проверь героя, роль, ранг и стиль"});
 db.prepare("UPDATE profiles SET hero=?,role=?,rank=?,style=?,game_id=?,bio=? WHERE user_id=?").run(hero,role,rank,style,String(b.game_id||"").slice(0,40),String(b.bio||"").slice(0,240),req.user.id);res.json({user:safeUser(req.user.id)});
});
app.get("/api/players",auth,(req,res)=>{
 const {hero="",role="",rank="",style=""}=req.query;let sql=`SELECT u.id,u.nickname,p.hero,p.role,p.rank,p.style,p.bio FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.id<>? AND p.hero<>''`;const args=[req.user.id];
 for(const [k,v] of Object.entries({hero,role,rank,style})){if(v){sql+=` AND p.${k}=?`;args.push(String(v).slice(0,60))}}
 const rows=db.prepare(sql+" ORDER BY u.created_at DESC LIMIT 80").all(...args);res.json({players:rows});
});
app.post("/api/players/:id/like",auth,(req,res)=>{const target=Number(req.params.id);if(!Number.isInteger(target)||target===req.user.id||!safeUser(target))return res.status(400).json({error:"Некорректный игрок"});db.prepare("INSERT OR IGNORE INTO likes(from_user,to_user) VALUES(?,?)").run(req.user.id,target);const mutual=!!db.prepare("SELECT 1 FROM likes WHERE from_user=? AND to_user=?").get(target,req.user.id);res.json({liked:true,mutual})});
app.get("/api/matches",auth,(req,res)=>{const rows=db.prepare(`SELECT u.id,u.nickname,p.hero,p.role,p.rank,p.style,p.game_id FROM likes l JOIN users u ON u.id=l.to_user JOIN profiles p ON p.user_id=u.id WHERE l.from_user=? AND EXISTS(SELECT 1 FROM likes x WHERE x.from_user=l.to_user AND x.to_user=l.from_user)`).all(req.user.id);res.json({matches:rows})});
function analyze({lane,enemies=[],allies=[],myHero=""}){
  const enemy = heroes.filter(h => enemies.includes(h.name));
  const team = heroes.filter(h => allies.includes(h.name));
  const selected = heroes.find(h => h.name === myHero);

  const enemyTags = new Set(enemy.flatMap(h => h.tags || []));
  const enemyTypes = enemy.map(h => h.type);
  const has = tag => enemyTags.has(tag);

  const threats = [];
  if (has("heal") || has("sustain")) threats.push("Отхил и устойчивость");
  if (enemyTypes.filter(t => t === "mage").length >= 2) threats.push("Много магического урона");
  if (has("attack-speed")) threats.push("Высокая скорость атаки");
  if (enemy.some(h => h.type === "tank")) threats.push("Плотный фронтлайн");
  if (has("control")) threats.push("Много контроля");
  if (has("burst")) threats.push("Взрывной урон");
  if (has("mobility")) threats.push("Высокая мобильность");

  const allyTags = new Set(team.flatMap(h => h.tags || []));
  const hasFrontline = team.some(h =>
    h.type === "tank" || (h.tags || []).includes("frontline")
  );

  const candidates = heroes
    .filter(h => h.role === lane && !enemies.includes(h.name))
    .map(h => {
      const tags = new Set(h.tags || []);
      let score = 0;
      const reasons = [];

      if (has("control") && tags.has("anti-control")) {
        score += 3;
        reasons.push("полезен против контроля");
      }

      if (enemy.some(e => e.type === "tank") && tags.has("tank-shred")) {
        score += 3;
        reasons.push("хорош против плотных целей");
      }

      if (enemy.some(e => e.type === "marksman") &&
          (tags.has("burst") || tags.has("pickoff"))) {
        score += 2;
        reasons.push("может угрожать задней линии");
      }

      if (has("mobility") && tags.has("control")) {
        score += 2;
        reasons.push("имеет инструменты против мобильных целей");
      }

      if (allyTags.has("engage") &&
          (tags.has("burst") || tags.has("pickoff"))) {
        score += 2;
        reasons.push("сочетается с инициацией союзников");
      }

      if ((allyTags.has("heal") || allyTags.has("protect")) &&
          (tags.has("frontline") || tags.has("sustain"))) {
        score += 1;
        reasons.push("получает пользу от поддержки");
      }

      if (!hasFrontline && tags.has("frontline")) {
        score += 2;
        reasons.push("помогает команде с передней линией");
      }

      if (h.name === myHero) score += 1;

      return {
        hero: h,
        score,
        reason: reasons.length
          ? reasons.join("; ")
          : "подходит по выбранной роли и составу"
      };
    })
    .sort((a,b) => b.score - a.score)
    .slice(0,3);


  const physicalAssassin = selected?.type === "assassin";
  const physicalFighter = selected?.type === "fighter";
  const magicMage = selected?.type === "mage";

  const itemScores = items.map(item => {
    const tags = new Set(item.tags || []);
    let score = 0;
    const reasons = [];

    // Базовая совместимость с героем
    if (physicalAssassin && (tags.has("physical") || tags.has("burst"))) {
      score += 4;
      reasons.push("подходит физическому убийце");
    }

    if (physicalFighter && tags.has("fighter")) {
      score += 4;
      reasons.push("подходит бойцу");
    }

    if (magicMage && tags.has("magic")) {
      score += 4;
      reasons.push("подходит магу");
    }

    // Ответы на угрозы противника
    if ((has("heal") || has("sustain")) && tags.has("anti-heal")) {
      score += 5;
      reasons.push("против восстановления здоровья");
    }

    if (enemyTypes.filter(t => t === "mage").length >= 2 &&
        tags.has("magic-burst")) {
      score += 5;
      reasons.push("против магического взрывного урона");
    }

    if (has("attack-speed") && tags.has("anti-attack-speed")) {
      score += 4;
      reasons.push("против высокой скорости атаки");
    }

    if (enemy.some(h => h.type === "tank") && tags.has("penetration")) {
      score += 4;
      reasons.push("пробивание защиты");
    }

    if (has("burst") && tags.has("survival")) {
      score += 3;
      reasons.push("повышает выживаемость");
    }

    return {name:item.name, score, reasons};
  });

  // Не допускаем несколько предметов с одинаковой функцией антихила
  const antiHealItems = itemScores
    .filter(x => items.find(i => i.name === x.name)?.tags.includes("anti-heal"))
    .sort((a,b) => b.score - a.score);

  const chosen = [];
  const usedRoles = new Set();

  
  for (const item of itemScores.sort((a,b) => b.score - a.score)) {
    const data = items.find(i => i.name === item.name);
    if (!data || item.score <= 0) continue;

    const isMagicItem =
      data.category === "Магия" ||
      data.category === "Магия / защита";

    const isPhysicalItem = data.category === "Атака";

    if (physicalAssassin && isMagicItem) continue;
    if (magicMage && isPhysicalItem) continue;


    if (data.tags.includes("anti-heal")) {
      if (usedRoles.has("anti-heal")) continue;
      usedRoles.add("anti-heal");
    }

    if (chosen.length < 6) chosen.push(item);
  }

  const build = chosen.map(x => x.name);

  
  while (build.length < 6) {
    const fallback = items.find(i => {
      if (build.includes(i.name)) return false;

      const isMagic =
        i.category === "Магия" ||
        i.category === "Магия / защита";

      const isPhysical = i.category === "Атака";

      if (physicalAssassin && isMagic) return false;
      if (magicMage && isPhysical) return false;

      if (physicalAssassin) {
        return i.tags.includes("physical") ||
          i.tags.includes("burst") ||
          i.tags.includes("survival");
      }

      if (physicalFighter) {
        return i.tags.includes("fighter") ||
          i.tags.includes("physical") ||
          i.tags.includes("survival");
      }

      if (magicMage) {
        return i.tags.includes("magic") ||
          i.tags.includes("survival");
      }

      return i.tags.includes("survival");
    });

    if (!fallback) break;
    build.push(fallback.name);
  }

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
      name:x.hero.name,
      role:x.hero.role,
      reason:x.reason,
      score:x.score
    })),
    build,
    emblem,
    talentTiers:["Разрыв","Мастер-убийца","Серия убийств"],
    spell:lane === "Лес" ? "Возмездие" : "Вспышка",
    timing:{
      early:"Оценивай расположение врагов и не начинай рискованный бой без информации о леснике.",
      mid:"Используй преимущество после ключевого предмета и помогай союзникам на объектах.",
      late:"Следи за позициями задней линии и не расходуй ключевые навыки до начала командной драки."
    },
    note:"Анализ состава на основе локального справочника и тегов. Не является live-статистикой или гарантией победы."
  };
}
app.post("/api/ai/draft",auth,async(req,res)=>{
 const b=req.body||{};if(!roles.includes(b.lane)||!Array.isArray(b.enemies)||b.enemies.length>5||!b.enemies.every(x=>heroes.some(h=>h.name===x)))return res.status(400).json({error:"Некорректный состав или линия"});
 const result=analyze(b);
 if(openai){try{const response=await openai.chat.completions.create({model:process.env.OPENAI_MODEL||"gpt-4.1-mini",messages:[{role:"system",content:"Ты тактический помощник MLBB. Не выдумывай live статистику и точные параметры патча. Используй только переданные варианты. Кратко объясни тактику на русском."},{role:"user",content:JSON.stringify({lane:b.lane,enemies:b.enemies,allies:b.allies||[],myHero:b.myHero||"",rulesResult:result})}],max_tokens:450,temperature:.3});result.aiExplanation=response.choices[0]?.message?.content||""}catch{result.aiExplanation="AI-сервис временно недоступен; показан базовый анализ."}}
 res.json(result);
});
app.post("/api/draft/ocr-upload",auth,upload.single("image"),(req,res)=>{if(req.file)fs.unlink(req.file.path,()=>{});res.status(410).json({error:"Серверный OCR не используется: распознавание скриншота выполняется локально в браузере."})});
app.use(express.static(path.join(root,"public")));
app.get("*",(req,res)=>res.sendFile(path.join(root,"public","index.html")));
const port=Number(process.env.PORT)||3000;
app.listen(port,()=>console.log(`MLBB Cyber Assistant listening on ${port}`));
