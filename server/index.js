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
import { heroCatalog } from "./hero-catalog.js";
import { getHeroSkillAssets } from "./hero-skill-assets.js";
import { getHeroKnowledge, getGameAssets } from "./mlbbdex-adapter.js";
import { getHeroGrowthData } from "./hero-growth-adapter.js";
import { getDraftHeroOptions, isCatalogHeroId, resolveDraftHeroSelection } from "./draft-hero-selection.js";
import { heroProfiles, validateHeroProfiles } from "./hero-profiles.js";
import { normalizeRegistration } from "./registration.js";
import { getOptionalUser } from "./auth.js";
import { isValidDraftRequest } from "./draft-validation.js";
import { normalizeDraftState } from "./draft-state.js";

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
CREATE TABLE IF NOT EXISTS draft_states(user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,state_json TEXT NOT NULL,updated_at INTEGER NOT NULL);
`);
const app=express();
app.set("trust proxy", 1);
app.use(helmet({contentSecurityPolicy:false,crossOriginEmbedderPolicy:false}));
app.use(cors({origin:process.env.APP_URL||true}));
app.use(express.json({limit:"1mb"}));
app.use(rateLimit({windowMs:15*60*1000,limit:process.env.NODE_ENV==="test"?1000:300,standardHeaders:true,legacyHeaders:false}));
const authRateLimit=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:true,legacyHeaders:false,message:{error:"Слишком много попыток. Попробуй позже."}});
const guestDraftRateLimit=rateLimit({windowMs:15*60*1000,limit:process.env.NODE_ENV==="test"?300:60,standardHeaders:true,legacyHeaders:false,message:{error:"Слишком много запросов к анализу. Попробуй позже."}});
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
  draftHeroOptions: getDraftHeroOptions(),
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
app.get("/api/hero-knowledge/:id",async(req,res)=>{
 const id=String(req.params.id||"").toLowerCase();
 const hero=heroCatalog.find(entry=>entry.id===id);
 if(!hero)return res.status(404).json({ok:false,error:"Герой не найден в каталоге"});
 const result=await getHeroKnowledge(hero);
 if(!result.ok)return res.status(503).json(result);
 res.set("Cache-Control","public, max-age=300, stale-while-revalidate=3600");
 res.json(result);
});
app.get("/api/hero-growth/:id",async(req,res)=>{
 const id=String(req.params.id||"").toLowerCase();
 const hero=heroCatalog.find(entry=>entry.id===id);
 if(!hero)return res.status(404).json({ok:false,error:"Герой не найден в каталоге"});
 const result=await getHeroGrowthData(hero);
 if(!result)return res.status(503).json({ok:false,error:"Дополнительный источник роста временно недоступен"});
 res.set("Cache-Control","public, max-age=21600, stale-while-revalidate=43200");
 res.json(result);
});
app.get("/api/game-assets",async(req,res)=>{
 const result=await getGameAssets();
 if(!result.ok)return res.status(503).json(result);
 res.set("Cache-Control","public, max-age=1800, stale-while-revalidate=21600");
 res.json(result);
});
app.get("/api/hero-skills/:id",async(req,res)=>{
 const id=String(req.params.id||"").toLowerCase();
 const hero=heroCatalog.find(entry=>entry.id===id);
 if(!hero)return res.status(404).json({ok:false,error:"Герой не найден в каталоге"});
 const result=await getHeroSkillAssets(hero.nameEn,hero.displayNameRu);
 if(!result.ok)return res.status(503).json(result);
 res.set("Cache-Control","public, max-age=300, stale-while-revalidate=3600");
 res.json(result);
});
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
app.get("/api/draft-state",auth,(req,res)=>{
 const row=db.prepare("SELECT state_json,updated_at FROM draft_states WHERE user_id=?").get(req.user.id);
 if(!row)return res.json({state:null,updatedAt:null});
 try{return res.json({state:JSON.parse(row.state_json),updatedAt:row.updated_at})}
 catch{return res.status(500).json({error:"Не удалось прочитать сохранённый драфт"})}
});
app.put("/api/draft-state",auth,(req,res)=>{
 const allowedHeroes=new Set([...heroes.map(hero=>hero.name),...getDraftHeroOptions().map(hero=>hero.id)]);
 const state=normalizeDraftState(req.body?.state,{heroes:allowedHeroes,lanes:roles});
 if(!state)return res.status(400).json({error:"Некорректный черновик драфта"});
 db.prepare("INSERT INTO draft_states(user_id,state_json,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET state_json=excluded.state_json,updated_at=excluded.updated_at").run(req.user.id,JSON.stringify(state),state.savedAt);
 res.json({state,updatedAt:state.savedAt});
});
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
  const profileByName = new Map(heroProfiles.map(profile => [profile.names?.ru, profile]).filter(([name]) => name));
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

  
  // Персональная тактика против каждого выбранного героя.
  const enemyMatchups = enemy.map(hero => {
    const profile = profileByName.get(hero.name) || null;
    if (!profile) return {
      name: hero.name, role: hero.role, confidence: "unverified",
      mechanics: [], weaknesses: [],
      note: "Для этого героя пока нет проверенного тактического паспорта."
    };
    return {
      name: hero.name,
      role: profile.roles?.[0] || hero.role,
      confidence: profile.confidence || "partial",
      damage: profile.combat?.damage || "unknown",
      burst: profile.combat?.burst || "unknown",
      mobility: profile.combat?.mobility || "unknown",
      control: profile.combat?.control || "unknown",
      durability: profile.combat?.durability || "unknown",
      mechanics: (profile.mechanics || []).slice(0, 3),
      weaknesses: (profile.weaknesses || []).slice(0, 3),
      reviewedAt: profile.patch?.reviewedAt || null,
      patch: profile.patch?.version || null,
      sources: (profile.sources || []).slice(0, 3)
    };
  });

  // Тактические правила против сочетаний угроз — без выдуманных процентов и винрейтов.
  const teamPlan = [];
  if (has("burst") || has("pickoff") || has("ambush")) {
    teamPlan.push({
      title: "Защити уязвимую заднюю линию",
      detail: "Не отдавай мага и стрелка по одному. Держите дистанцию друг от друга, заранее определите, кто встречает вражеского убийцу, и не тратьте все защитные навыки до его входа."
    });
  }
  if (has("control") || has("engage")) {
    teamPlan.push({
      title: "Не собирайтесь в одну точку до инициации",
      detail: "Следите за углом входа танка и контролёра. Не начинайте бой в узком проходе без обзора; после потраченной ключевой инициации используйте окно для ответного входа."
    });
  }
  if (has("heal") || has("sustain")) {
    teamPlan.push({
      title: "Срежь восстановление и фокусируйте одну цель",
      detail: "Антихил должен купить герой, который стабильно попадает по противникам. Не размазывайте урон по всей команде: сначала выберите приоритетную цель и доведите размен до конца."
    });
  }
  if (enemyHas("tank")) {
    teamPlan.push({
      title: "Играй через переднюю линию",
      detail: "Не пытайся каждый раз обойти танка и добраться до задней линии ценой собственной позиции. Сначала вынуждай переднюю линию потратить защитные навыки, затем продавливай открывшуюся цель."
    });
  }
  if (has("mobility")) {
    teamPlan.push({
      title: "Сохраняй контроль для момента входа",
      detail: "Не отдавай надёжное замедление или оглушение в пустоту. Дождись рывка или момента, когда мобильный герой уже вошёл в бой и ему сложнее сменить направление."
    });
  }
  if (!teamPlan.length) {
    teamPlan.push({
      title: "Играй от информации и численного преимущества",
      detail: "Проверяй кусты перед заходом на объект, не начинай бой без понимания позиций противников и используй численное преимущество после ухода одного из врагов с линии."
    });
  }

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

      const profile = profileByName.get(h.name) || null;
      return {
        hero: h,
        score,
        reason: [...new Set(reasons)].join("; "),
        profileEvidence: profile ? {
          identity: profile.mechanics?.[0] || null,
          strength: profile.strengths?.[0] || null,
          caution: profile.weaknesses?.[0] || null,
          confidence: profile.confidence || "partial"
        } : null
      };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);


  // Контрсборка: совместимость с выбранным героем + подтверждённые угрозы врагов.
  const selectedProfile = profileByName.get(myHero) || null;
  const enemyProfileByName = new Map(enemy.map(hero => [hero.name, profileByName.get(hero.name)]));
  let hasMagicBurst = false, hasPhysicalBurst = false, hasBurstThreat = false;
  for (const hero of enemy) {
    const profile = enemyProfileByName.get(hero.name);
    const damage = profile?.combat?.damage || (hero.type === "mage" ? "magic" : ["assassin","fighter","marksman"].includes(hero.type) ? "physical" : "unknown");
    const burst = profile?.combat?.burst || ((hero.tags || []).includes("burst") ? "high" : "unknown");
    if (damage === "magic" && burst === "high") hasMagicBurst = true;
    if (damage === "physical" && burst === "high") hasPhysicalBurst = true;
    if (burst === "high") hasBurstThreat = true;
  }

  const physicalBuild = ["assassin","fighter","marksman"].includes(selected?.type);
  const magicBuild = selected?.type === "mage" || selectedProfile?.combat?.damage === "magic";
  const canUseItem = item => {
    if (item.category === "Защита") return true;
    if (item.category === "Атака") return physicalBuild;
    if (item.category === "Магия" || item.category === "Магия / защита") return magicBuild || selected?.type === "support";
    return false;
  };

  const itemScores = items.map(item => {
    const tags = new Set(item.tags || []);
    let score = 0;
    const reasons = [];
    const targets = [];
    const add = (points, reason, against = []) => {
      score += points;
      reasons.push(reason);
      for (const name of against) if (!targets.includes(name)) targets.push(name);
    };
    if (physicalBuild && item.category === "Атака" &&
        (tags.has("burst") || tags.has("physical") || tags.has("penetration") ||
         (selected?.type === "marksman" && (tags.has("marksman") || tags.has("critical"))))) {
      add(3, "Совместим с физической сборкой выбранного героя");
    }
    if (magicBuild && item.category === "Магия" && tags.has("magic")) {
      add(3, "Совместим с магической сборкой выбранного героя");
    }
    if (selected?.type === "fighter" && tags.has("fighter")) add(3, "Подходит бойцу для продолжительных разменов");
    if (selected?.type === "marksman" && tags.has("marksman")) add(3, "Подходит стрелку");

    const antiHealTargets = enemy.filter(hero => (hero.tags || []).some(tag => ["heal","sustain"].includes(tag))).map(hero => hero.name);
    if (tags.has("anti-heal") && antiHealTargets.length) add(10, "Снижает эффективность лечения и восстановления здоровья", antiHealTargets);

    const magicTargets = enemy.filter(hero => {
      const profile = enemyProfileByName.get(hero.name);
      return (profile?.combat?.damage === "magic" || hero.type === "mage") &&
        (profile?.combat?.burst === "high" || (hero.tags || []).includes("burst"));
    }).map(hero => hero.name);
    if (tags.has("magic-burst") && magicTargets.length) add(9, "Защищает от сильного магического взрывного урона", magicTargets);

    const magicDpsTargets = enemy.filter(hero => {
      const profile = enemyProfileByName.get(hero.name);
      return profile?.combat?.damage === "magic" || hero.type === "mage";
    }).map(hero => hero.name);
    if (tags.has("magic-dps") && magicDpsTargets.length) add(7, "Полезен против повторяющегося магического урона", magicDpsTargets);

    const speedTargets = enemy.filter(hero => (hero.tags || []).includes("attack-speed")).map(hero => hero.name);
    if (tags.has("anti-attack-speed") && speedTargets.length) add(9, "Ослабляет героев, зависящих от частых базовых атак", speedTargets);
    if (tags.has("attack-speed") && speedTargets.length && item.name === "Шипованная броня") add(7, "Даёт защитный ответ против частых физических атак", speedTargets);

    const physicalTargets = enemy.filter(hero => {
      const profile = enemyProfileByName.get(hero.name);
      return profile?.combat?.damage === "physical" || ["assassin","fighter","marksman"].includes(hero.type);
    }).map(hero => hero.name);
    if (tags.has("physical") && physicalTargets.length) add(5, "Добавляет защиту против физического урона", physicalTargets);

    const tankTargets = enemy.filter(hero => hero.type === "tank").map(hero => hero.name);
    if (tags.has("penetration") && tankTargets.length &&
        ((physicalBuild && item.category === "Атака") || (magicBuild && item.category === "Магия"))) {
      add(8, "Помогает пробивать защиту плотной передней линии", tankTargets);
    }

    if (tags.has("survival") && hasBurstThreat) {
      const burstTargets = enemy.filter(hero => {
        const profile = enemyProfileByName.get(hero.name);
        return profile?.combat?.burst === "high" || (hero.tags || []).includes("burst");
      }).map(hero => hero.name);
      add(5, "Повышает шанс пережить вражеский взрывной урон", burstTargets);
    }

    return {name:item.name,category:item.category,description:item.description,tags:[...tags],score,reasons:[...new Set(reasons)],targets};
  });

  const buildDetails = itemScores
    .filter(item => item.score > 0 && canUseItem(items.find(source => source.name === item.name)))
    .sort((a,b) => b.score - a.score)
    .filter((item,index,array) => !item.tags.includes("anti-heal") || array.findIndex(candidate => candidate.tags.includes("anti-heal")) === index)
    .slice(0,5)
    .map((item,index) => ({
      name:item.name,category:item.category,description:item.description,reasons:item.reasons,against:item.targets,
      priority:index===0?"Высокий приоритет":item.score>=8?"Ключевой контрпредмет":"Ситуативный выбор",
      timing:item.tags.includes("anti-heal")?"Покупай, когда противники начинают активно восстанавливать здоровье"
        :item.tags.includes("magic-burst")?"Рассмотри до крупных командных боёв против магического прокаста"
        :item.tags.includes("anti-attack-speed")?"Покупай по мере усиления вражеского стрелка или бойца"
        :item.tags.includes("penetration")?"Добавляй, когда передняя линия противника набирает защиту"
        :item.tags.includes("survival")?"Ситуативно, если регулярно погибаешь от взрывного урона"
        :"Подбирай под фактическую угрозу в матче"
    }));

  const enemyMatchupsWithItems = enemyMatchups.map(matchup => ({
    ...matchup,
    counterItems:buildDetails.filter(item=>item.against.includes(matchup.name))
      .map(item=>({name:item.name,reason:item.reasons.join("; "),priority:item.priority}))
  }));

  const emblem = selected?.type === "mage" ? "Мага"
    : selected?.type === "marksman" ? "Стрелка"
    : selected?.type === "tank" ? "Танка"
    : selected?.type === "support" ? "Поддержки"
    : selected?.type === "fighter" ? "Бойца"
    : "Убийцы";

  return {
    threats,
    enemyMatchups: enemyMatchupsWithItems,
    teamPlan,
    counters: candidates.map(x => ({
      name: x.hero.name,
      role: x.hero.role,
      reason: x.reason,
      score: x.score,
      profileEvidence: x.profileEvidence
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
 const b=req.body||{};
 if(!isValidDraftRequest(b,roles,isLegacyHeroName,isCatalogHeroId))return res.status(400).json({error:"Некорректный состав или линия"});

 const selectedValues=[...b.enemies,...(b.allies||[]),...(b.myHero?[b.myHero]:[])];
 const selections=selectedValues.map(resolveDraftHeroSelection);
 const unsupported=[...new Map(selections
  .filter(selection=>!selection?.analysisSupported)
  .map(selection=>[selection.id,selection.name])).entries()]
  .map(([id,name])=>({id,name}));

 if(unsupported.length){
  return res.json({
   analysisStatus:"limited",
   unsupportedHeroes:unsupported,
   threats:[],
   counters:[],
   build:[],
   buildDetails:[],
   emblem:null,
   talentTiers:[],
   spell:null,
   timing:null,
   note:"Полный анализ не рассчитан: для выбранных героев ещё нет подтверждённой связи с проверенной тактической базой. Чтобы не выдавать выдуманные контрпики, рекомендации временно скрыты."
  });
 }

 const legacyName=value=>resolveDraftHeroSelection(value).legacyName;
 const resolvedDraft={
  ...b,
  enemies:b.enemies.map(legacyName),
  allies:(b.allies||[]).map(legacyName),
  myHero:b.myHero?legacyName(b.myHero):""
 };
 const result=analyze(resolvedDraft);
 result.analysisStatus="complete";
 if(openai&&req.user){try{const response=await openai.chat.completions.create({model:process.env.OPENAI_MODEL||"gpt-4.1-mini",messages:[{role:"system",content:"Ты тактический помощник MLBB. Не выдумывай live статистику и точные параметры патча. Используй только переданные варианты. Кратко объясни тактику на русском."},{role:"user",content:JSON.stringify({lane:b.lane,enemies:b.enemies,allies:b.allies||[],myHero:b.myHero||"",rulesResult:result})}],max_tokens:450,temperature:.3});result.aiExplanation=response.choices[0]?.message?.content||""}catch{result.aiExplanation="AI-сервис временно недоступен; показан базовый анализ."}}
 res.json(result);
});
app.post("/api/draft/ocr-upload",auth,upload.single("image"),(req,res)=>{if(req.file)fs.unlink(req.file.path,()=>{});res.status(410).json({error:"Серверный OCR не используется: распознавание скриншота выполняется локально в браузере."})});
app.post("/api/diagnostics",(req,res)=>{
 const b=req.body||{};
 const allowed=new Set(["runtime-error","unhandled-rejection","script-load-error","startup-timeout"]);
 const kind=String(b.kind||"").slice(0,40);
 if(!allowed.has(kind))return res.status(400).json({error:"Unsupported diagnostic event"});
 const clean=(value,max)=>String(value||"").replace(/[\r\n\t]/g," ").slice(0,max);
 const entry={
  build:clean(b.build,40),kind,stage:clean(b.stage,40),message:clean(b.message,240),
  file:clean(b.file,80).replace(/[^a-zA-Z0-9._-]/g,""),
  line:Number.isFinite(Number(b.line))?Math.max(0,Math.min(100000,Number(b.line))):0,
  column:Number.isFinite(Number(b.column))?Math.max(0,Math.min(10000,Number(b.column))):0
 };
 console.warn("[browser-diagnostic]",JSON.stringify(entry));
 res.status(204).end();
});
app.use(express.static(path.join(root,"public")));
app.get("*",(req,res)=>res.sendFile(path.join(root,"public","index.html")));
const port=Number(process.env.PORT)||3000;
app.listen(port,()=>console.log(`MLBB Cyber Assistant listening on ${port}`));
