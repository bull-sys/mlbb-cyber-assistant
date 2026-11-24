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
import { getRankedMatchupEvidence, normalizeRankedMatchupRank } from "./ranked-matchup-adapter.js";
import { getDraftHeroAnalysisProfiles, getDraftHeroOptions, isCatalogHeroId, resolveDraftHeroSelection } from "./draft-hero-selection.js";
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
const draftAnalysisProfiles=getDraftHeroAnalysisProfiles();
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

function analyze({lane, enemies = [], allies = [], myHero = "", rankedMatchups = {}, rankedMatchupMeta = null}) {
  const normalizeLane = value => ({
    "Лес": "Лес", "Jungle": "Лес",
    "Роум": "Роум", "Roam": "Роум",
    "Опыт": "Опыт", "EXP": "Опыт", "EXP Lane": "Опыт",
    "Линия опыта": "Опыт", "EXP-линия": "Опыт",
    "Золото": "Золото", "Gold Lane": "Золото",
    "Золотая линия": "Золото", "Линия золота": "Золото",
    "Мид": "Мид", "Mid Lane": "Мид", "Центр": "Мид",
    "Средняя линия": "Мид"
  })[value] || null;
  const laneTypes = {
    "Убийца": "assassin", "Боец": "fighter", "Стрелок": "marksman",
    "Маг": "mage", "Танк": "tank", "Поддержка": "support"
  };
  const legacyByName = new Map(heroes.map(hero => [hero.name, hero]));
  const profileByName = new Map(draftAnalysisProfiles.map(profile => [profile.names?.ru, profile]).filter(([name]) => name));
    const heroByName = new Map(draftAnalysisProfiles.map(profile => {
    const legacy = legacyByName.get(profile.names?.ru);
    const combat = profile.combat || {};
    const tags = new Set(legacy?.tags || []);
    const type = legacy?.type || (profile.roles || []).map(role => laneTypes[role]).find(Boolean) || "fighter";
    if (["high", "very_high"].includes(combat.burst)) tags.add("burst");
    if (["high", "very_high"].includes(combat.mobility)) tags.add("mobility");
    if (["high", "very_high"].includes(combat.sustain)) tags.add("sustain");
    if (["high", "very_high"].includes(combat.engage)) tags.add("engage");
    if (combat.control && !["none", "low", "unknown"].includes(combat.control)) tags.add("control");
    if (combat.damage === "magic" || type === "mage") tags.add("magic");
    if (type === "marksman") tags.add("marksman");
    if (type === "tank") tags.add("frontline");
    const profileText = [
      ...(profile.strengths || []),
      ...(profile.mechanics || [])
    ].join(" ").toLocaleLowerCase("ru");
    if (/лечени|восстановлени|вампир/.test(profileText)) tags.add("heal");
    if (/задн.{0,12}лини|уязвим.{0,12}цели/.test(profileText)) tags.add("backline");
    if (/изолированн.{0,12}цел/.test(profileText)) tags.add("isolated-targets");
    if (/мобильн.{0,12}противник/.test(profileText)) tags.add("mobile-targets");
    if (/передн.{0,12}лини|плотн.{0,12}противник/.test(profileText)) tags.add("frontline");
    const lanes = new Set((profile.lanes || []).map(normalizeLane).filter(Boolean));
    return [profile.names.ru, {
      name: profile.names.ru,
      role: legacy?.role || normalizeLane(profile.lanes?.[0]) || "",
      type,
      tags: [...tags],
      style: legacy?.style || [],
      strengths: legacy?.strengths || [],
      lanes,
      profile
    }];
  }));
  const uniqueNames = values => [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
  const enemy = uniqueNames(enemies).map(name => heroByName.get(name)).filter(Boolean);
  const team = uniqueNames(allies).map(name => heroByName.get(name)).filter(Boolean);
  const selected = heroByName.get(myHero) || null;

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

  // Контрпики строятся по всем 133 профилям, а не по старому списку из 32 героев.
  // Статистический матчап — сигнал для ранжирования, а не гарантия победы.
  const candidates = !enemy.length ? [] : draftAnalysisProfiles
    .filter(profile => {
      const hero = heroByName.get(profile.names?.ru);
      return hero &&
        hero.lanes.has(normalizeLane(lane)) &&
        !enemy.some(opponent => opponent.profile.id === profile.id) &&
        !team.some(ally => ally.profile.id === profile.id) &&
        profile.id !== selected?.profile.id;
    })
    .map(profile => {
      let rawScore = 0;
      const reasons = [];
      const matchedEnemies = [];
      const riskyEnemies = [];
      const staticMatchedEnemies = [];
      const rankedEvidenceList = [];
      const synergies = [];
      const add = (points, reason) => {
        rawScore += points;
        if (reason && !reasons.includes(reason)) reasons.push(reason);
      };

      for (const opponent of enemy) {
        const enemyProfile = opponent.profile;
        const rankedEvidence = rankedMatchups?.[enemyProfile.id]?.[profile.id] || null;

        if (rankedEvidence && Number.isFinite(Number(rankedEvidence.advantagePp))) {
          const advantagePp = Number(rankedEvidence.advantagePp);
          const points = Math.max(-5, Math.min(5, advantagePp));
          rankedEvidenceList.push({
            opponent: opponent.name,
            advantagePp,
            rankBracket: rankedEvidence.rankBracket || rankedMatchupMeta?.rankBracket || "all",
            windowDays: rankedEvidence.windowDays || rankedMatchupMeta?.windowDays || null,
            lane: null,
            sampleSize: null,
            source: rankedEvidence.source || "Rone Arena API",
            sourceUrl: rankedEvidence.sourceUrl || null,
            observedAt: rankedEvidence.observedAt || rankedMatchupMeta?.observedAt || null
          });
          if (advantagePp > 0) {
            add(points, "Ранговое преимущество против " + opponent.name + ": +" + advantagePp.toFixed(1) + " п.п.");
            matchedEnemies.push(opponent.name);
          } else if (advantagePp < 0) {
            add(points, "Ранговый риск против " + opponent.name + ": " + advantagePp.toFixed(1) + " п.п.");
            riskyEnemies.push(opponent.name);
          }
        } else {
          const ownStrongRank = (profile.matchups?.strongAgainst || []).indexOf(enemyProfile.id);
          const enemyWeakRank = (enemyProfile.matchups?.weakAgainst || []).indexOf(profile.id);
          const ownWeakRank = (profile.matchups?.weakAgainst || []).indexOf(enemyProfile.id);
          const enemyStrongRank = (enemyProfile.matchups?.strongAgainst || []).indexOf(profile.id);
          const positiveRanks = [ownStrongRank, enemyWeakRank].filter(rank => rank >= 0);
          const negativeRanks = [ownWeakRank, enemyStrongRank].filter(rank => rank >= 0);

          if (positiveRanks.length) {
            const rank = Math.min(...positiveRanks);
            const points = Math.max(2, 6 - rank);
            add(points, "Статистический сигнал матчапа из тактической базы против " + opponent.name);
            matchedEnemies.push(opponent.name);
            staticMatchedEnemies.push(opponent.name);
            if (positiveRanks.length > 1) {
              add(2, "Преимущество подтверждается данными обеих сторон матчапа");
            }
          }
          if (negativeRanks.length) {
            const rank = Math.min(...negativeRanks);
            const points = Math.max(2, 6 - rank);
            add(-points, "Есть статистический риск в матчапе против " + opponent.name);
            riskyEnemies.push(opponent.name);
          }
        }
      }

      let secondaryScore = 0;
      const noteSecondary = (points, reason) => {
        secondaryScore += points;
        if (!reasons.includes(reason)) reasons.push(reason);
      };

      for (const ally of team) {
        const candidateSynergy = (profile.synergies || []).includes(ally.profile.id);
        const allySynergy = (ally.profile.synergies || []).includes(profile.id);
        if (candidateSynergy || allySynergy) {
          noteSecondary(candidateSynergy && allySynergy ? 2 : 1,
            "Есть статистический сигнал синергии с союзником " + ally.name);
          synergies.push(ally.name);
        }
      }

      const combat = profile.combat || {};
      const enemyCombat = enemy.map(opponent => opponent.profile.combat || {});
      const enemyHasMobile = enemyCombat.some(value =>
        ["high", "very_high"].includes(value.mobility)
      );
      const enemyHasBurst = enemyCombat.some(value =>
        ["high", "very_high"].includes(value.burst)
      );
      const enemyHasLowDurability = enemyCombat.some(value =>
        ["low"].includes(value.durability)
      );
      const enemyHasDurableFrontline = enemy.filter(opponent =>
        ["high", "very_high"].includes(opponent.profile.combat?.durability) ||
        opponent.type === "tank"
      ).length >= 2;

      if (enemyHasMobile && combat.control && !["none", "low", "unknown"].includes(combat.control)) {
        noteSecondary(2, "Контроль помогает останавливать мобильных противников");
      }
      if (enemyHasDurableFrontline && ["high", "very_high"].includes(combat.dps)) {
        noteSecondary(2, "Высокий постоянный урон полезен против плотной передней линии");
      }
      if (enemyHasBurst) {
        if (combat.disengage === "high" || combat.disengage === "very_high") {
          noteSecondary(3, "Есть надёжные инструменты выхода из опасного взрывного урона");
        } else if (combat.disengage === "medium") {
          noteSecondary(1, "Есть ограниченные инструменты для выхода из взрывного урона");
        }
        if (combat.durability === "high" || combat.durability === "very_high") {
          noteSecondary(2, "Повышенная устойчивость помогает переживать вражеский прокаст");
        }
        if (combat.sustain === "high" || combat.sustain === "very_high") {
          noteSecondary(1, "Восстановление помогает переживать повторные размены");
        }
      }
      if (enemyHasLowDurability && ["high", "very_high"].includes(combat.burst)) {
        noteSecondary(2, "Взрывной урон может наказывать уязвимых противников");
      }
      if (enemy.some(opponent => opponent.type === "mage") &&
          combat.range === "ranged" &&
          ["high", "very_high"].includes(combat.dps)) {
        noteSecondary(1, "Дальняя атака и постоянный урон дают возможность безопаснее отвечать на мага");
      }

      if (secondaryScore > 0) {
        add(Math.min(2, secondaryScore),
          "Синергия с союзниками и ситуационное соответствие учитываются как вторичные сигналы");
      }

      const hasPositiveMatchup = matchedEnemies.length > 0;
      const hasRisk = riskyEnemies.length > 0;
      const hasRankedPositive = rankedEvidenceList.some(entry => entry.advantagePp > 0);
      const hasRankedNegative = rankedEvidenceList.some(entry => entry.advantagePp < 0);
      const matchupType = hasPositiveMatchup && hasRisk
        ? "mixed-matchup"
        : hasRankedPositive
          ? "ranked-advantage"
          : hasRankedNegative
            ? "ranked-risk"
            : staticMatchedEnemies.length
              ? "direct-counter"
              : synergies.length
                ? "team-synergy"
                : "situational";
      if (!reasons.length) {
        reasons.push("Подходит для выбранной линии; подтверждённого преимущества против введённых героев в доступных матчап-данных не найдено.");
      } else if (!hasPositiveMatchup && !hasRisk) {
        reasons.push("Это ситуационная альтернатива, а не подтверждённая прямая контра.");
      } else if (hasPositiveMatchup && hasRisk) {
        reasons.push("Матчап неоднозначный: есть и положительные, и отрицательные статистические сигналы.");
      } else if (hasRisk) {
        reasons.push("В ранговых или профильных данных обнаружен неблагоприятный сигнал; учитывай риск этого матчапа.");
      }

      const matchupEvidence = profile.matchupEvidence || null;
      const evidenceSource = matchupEvidence?.source ||
        profile.sources?.find(source => source.includes("mlbb.io")) || null;
      return {
        hero: heroByName.get(profile.names.ru),
        score: Math.max(0, rawScore),
        rawScore,
        reason: [...new Set(reasons)].join("; "),
        matchupType,
        matchedEnemies: uniqueNames(matchedEnemies),
        riskyEnemies: uniqueNames(riskyEnemies),
        profileEvidence: {
          identity: profile.mechanics?.[0] || null,
          strength: profile.strengths?.[0] || null,
          caution: profile.weaknesses?.[0] || null,
          confidence: profile.confidence || "partial",
          matchupSource: evidenceSource,
          matchupCheckedAt: matchupEvidence?.checkedAt || profile.matchupsReviewedAt || null,
          matchupMethod: matchupEvidence?.method || profile.matchupsMethod || null,
          rankedMatchups: rankedEvidenceList
        }
      };
    })
    .sort((a, b) => {
      const priority = { "ranked-advantage": 4, "mixed-matchup": 3, "direct-counter": 2, "ranked-risk": 1, "team-synergy": 1, "situational": 0 };
      return b.rawScore - a.rawScore ||
        priority[b.matchupType] - priority[a.matchupType] ||
        a.hero.name.localeCompare(b.hero.name, "ru");
    })
    .slice(0, 3);

  // Контрсборка: совместимость с выбранным героем + подтверждённые угрозы врагов.
  const selectedProfile = profileByName.get(myHero) || null;
  const enemyProfileByName = new Map(enemy.map(hero => [hero.name, profileByName.get(hero.name)]));
  let hasBurstThreat = false;
  for (const hero of enemy) {
    const profile = enemyProfileByName.get(hero.name);
    const damage = profile?.combat?.damage || (hero.type === "mage" ? "magic" : ["assassin","fighter","marksman"].includes(hero.type) ? "physical" : "unknown");
    const burst = profile?.combat?.burst || ((hero.tags || []).includes("burst") ? "high" : "unknown");
    if (burst === "high") hasBurstThreat = true;
  }

  const physicalBuild = ["assassin","fighter","marksman"].includes(selected?.type);
  const magicBuild = selected?.type === "mage" || selectedProfile?.combat?.damage === "magic";
  const canUseItem = item => {
    const tags = new Set(item.tags || []);
    if (item.category === "Защита") return true;
    if (item.category === "Атака") {
      if (tags.has("marksman") && selected?.type !== "marksman") return false;
      return physicalBuild;
    }
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

    const magicDamageTargets = enemy.filter(hero => {
      const profile = enemyProfileByName.get(hero.name);
      return profile?.combat?.damage === "magic" || hero.type === "mage" ||
        (hero.tags || []).includes("magic");
    }).map(hero => hero.name);

    const magicBurstTargets = enemy.filter(hero => {
      const profile = enemyProfileByName.get(hero.name);
      const burst = profile?.combat?.burst;
      return (profile?.combat?.damage === "magic" || hero.type === "mage" ||
        (hero.tags || []).includes("magic")) &&
        (burst === "high" || burst === "very_high" || (hero.tags || []).includes("burst"));
    }).map(hero => hero.name);
    if ((tags.has("magic-burst") || tags.has("anti-magic-burst")) && magicBurstTargets.length) {
      add(9, "Защищает от сильного магического взрывного урона", magicBurstTargets);
    }
    if (tags.has("magic-defense") && magicDamageTargets.length) {
      add(7, "Добавляет магическую защиту против магических героев", magicDamageTargets);
    }

    const magicDpsTargets = enemy.filter(hero => {
      const profile = enemyProfileByName.get(hero.name);
      const burst = profile?.combat?.burst;
      return (profile?.combat?.damage === "magic" || hero.type === "mage") &&
        burst !== "high" && burst !== "very_high" && !(hero.tags || []).includes("burst");
    }).map(hero => hero.name);
    if (tags.has("magic-dps") && magicDpsTargets.length) add(7, "Полезен против повторяющегося магического урона", magicDpsTargets);

    const speedTargets = enemy.filter(hero => (hero.tags || []).includes("attack-speed")).map(hero => hero.name);
    if (tags.has("anti-attack-speed") && speedTargets.length) add(9, "Ослабляет героев, зависящих от частых базовых атак", speedTargets);
    if (tags.has("attack-speed") && speedTargets.length && item.name === "Шипованная броня") add(7, "Даёт защитный ответ против частых физических атак", speedTargets);

    const physicalTargets = enemy.filter(hero => {
      const profile = enemyProfileByName.get(hero.name);
      return profile?.combat?.damage === "physical" || ["assassin","fighter","marksman"].includes(hero.type);
    }).map(hero => hero.name);
    if (tags.has("physical") && item.category === "Защита" &&
        (!tags.has("attack-speed") || speedTargets.length) && physicalTargets.length) {
      add(5, "Добавляет защиту против физического урона", physicalTargets);
    }

    const tankTargets = enemy.filter(hero => hero.type === "tank").map(hero => hero.name);
    if (tags.has("penetration") && tankTargets.length &&
        ((physicalBuild && item.category === "Атака" && item.name === "Злобный рык") ||
         (magicBuild && item.category === "Магия" && item.name === "Божественный меч"))) {
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
    .filter(item => item.score > 0 && item.targets.length > 0 && canUseItem(items.find(source => source.name === item.name)))
    .sort((a,b) => b.score - a.score)
    .filter((item,index,array) => !item.tags.includes("anti-heal") || array.findIndex(candidate => candidate.tags.includes("anti-heal")) === index)
    .slice(0,5)
    .map((item,index) => ({
      name:item.name,category:item.category,description:item.description,reasons:item.reasons,against:item.targets,
      priority:item.score>=10?"Высокий приоритет":item.score>=8?"Ключевой контрпредмет":"Ситуативный выбор",
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

  // Boots and roam blessings are selected separately from the six main item slots.
  const magicEnemyCount = enemy.filter(hero => {
    const profile = enemyProfileByName.get(hero.name);
    return profile?.combat?.damage === "magic" || hero.type === "mage";
  }).length;
  const physicalEnemyCount = enemy.filter(hero => {
    const profile = enemyProfileByName.get(hero.name);
    return profile?.combat?.damage === "physical" || ["assassin","fighter","marksman"].includes(hero.type);
  }).length;
  const controlEnemyCount = enemy.filter(hero =>
    (hero.tags || []).some(tag => ["control","engage","silence"].includes(tag))
  ).length;
  let bootName = "Ботинки";
  let bootReason = "Базовая обувь для ранней игры; финальный вариант зависит от фактической угрозы и контроля противника.";
  if (controlEnemyCount > 0 || magicEnemyCount >= 2) {
    bootName = "Ботинки стойкости";
    bootReason = "Сокращают длительность контроля и дают магическую защиту; особенно полезны против нескольких магов или героев с контролем.";
  } else if (physicalEnemyCount >= 2) {
    bootName = "Ботинки воина";
    bootReason = "Добавляют физическую защиту и накапливают её при получении физического урона.";
  }
  const bootRecommendation = {
    name: bootName,
    reason: bootReason,
    against: enemy.filter(hero => {
      const profile = enemyProfileByName.get(hero.name);
      return bootName === "Ботинки стойкости"
        ? (profile?.combat?.damage === "magic" || hero.type === "mage" || (hero.tags || []).some(tag => ["control","engage","silence"].includes(tag)))
        : bootName === "Ботинки воина"
          ? profile?.combat?.damage === "physical" || ["assassin","fighter","marksman"].includes(hero.type)
          : false;
    }).map(hero => hero.name),
    source: "https://metammo.com/mobile-legends-guide/items",
    checkedAt: "2026-10-30"
  };

  let roamRecommendation = null;
  if (lane === "Роум") {
    const ownTags = new Set(selected?.tags || []);
    const roamName = ownTags.has("heal") || ownTags.has("protect")
      ? "Благословение"
      : ownTags.has("engage") || ownTags.has("control")
        ? "Скрытность"
        : ownTags.has("pickoff")
          ? "Удар по слабому месту"
          : "Поддержка";
    const roamItem = items.find(item => item.name === roamName);
    roamRecommendation = roamItem ? {
      name: roamItem.name,
      englishName: roamItem.englishName,
      reason: roamItem.description,
      passive: roamItem.passive,
      source: roamItem.source,
      checkedAt: roamItem.checkedAt
    } : null;
  }

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
      role: lane,
      reason: x.reason,
      score: x.score,
      matchupType: x.matchupType,
      matchedEnemies: x.matchedEnemies,
      riskyEnemies: x.riskyEnemies,
      profileEvidence: x.profileEvidence
    })),
    rankedMatchupMeta,
    build: buildDetails.map(x => x.name),
    buildDetails,
    itemCatalogCount: items.length,
    bootRecommendation,
    roamRecommendation,
    emblem,
    talentTiers: ["Разрыв", "Мастер-убийца", "Серия убийств"],
    spell: lane === "Лес" ? "Возмездие" : "Вспышка",
    timing: {
      early: "Контролируй ключевые участки карты и отслеживай перемещения противника.",
      mid: "Используй преимущество после покупки основных предметов и участвуй в борьбе за объекты.",
      late: "Выбирай момент для командного боя с учётом расположения главных угроз."
    },
    note: "Рекомендации учитывают локальные тактические профили и, если источник доступен, ранговые матчап-данные за 15 дней. Статистика пары не является доказательством контры на выбранной линии."
  };
}

app.post("/api/ai/draft",guestDraftRateLimit,optionalAuth,async(req,res)=>{
 const b=req.body||{};
 if(!isValidDraftRequest(b,roles,isLegacyHeroName,isCatalogHeroId))return res.status(400).json({error:"Некорректный состав или линия"});

 const selectedValues=[...b.enemies,...(b.allies||[]),...(b.myHero?[b.myHero]:[])];
 const selections=selectedValues.map(resolveDraftHeroSelection);
 const unresolved=selectedValues.filter((value,index)=>!selections[index]);
 if(unresolved.length){
  return res.status(400).json({error:"Не удалось сопоставить героев: "+unresolved.join(", ")});
 }
 const legacyName=value=>resolveDraftHeroSelection(value).legacyName;
 const resolvedDraft={
  ...b,
  enemies:b.enemies.map(legacyName),
  allies:(b.allies||[]).map(legacyName),
  myHero:b.myHero?legacyName(b.myHero):""
 };
 const requestedRank = normalizeRankedMatchupRank(b.rank) ||
  normalizeRankedMatchupRank(req.user ? safeUser(req.user.id)?.rank : null) || "all";
 const enemyProfilesForStats = b.enemies
  .map(value => resolveDraftHeroSelection(value))
  .map(selection => heroProfiles.find(profile => profile.id === selection?.id))
  .filter(Boolean);
 const rankedEvidence = await getRankedMatchupEvidence(enemyProfilesForStats, requestedRank, heroProfiles);
 const result=analyze({
  ...resolvedDraft,
  rankedMatchups: rankedEvidence.byOpponent,
  rankedMatchupMeta: rankedEvidence.metadata
 });
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
