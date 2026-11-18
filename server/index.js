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
 const enemy=heroes.filter(h=>enemies.includes(h.name));const tags=enemy.flatMap(h=>h.tags);const magic=enemy.filter(h=>h.type==="mage").length;
 const threats=[];if(tags.includes("heal")||tags.includes("sustain"))threats.push("Отхил / устойчивость");if(magic>=2)threats.push("Несколько магов");if(tags.includes("attack-speed"))threats.push("Скорость атаки");if(enemy.some(h=>h.type==="tank"))threats.push("Фронтлайн");if(tags.includes("control"))threats.push("Контроль");if(tags.includes("burst"))threats.push("Взрывной урон");
 const candidates=heroes.filter(h=>h.role===lane&&!enemies.includes(h.name));const ranked=candidates.map(h=>({hero:h,score:(h.tags.includes("anti-control")&&tags.includes("control")?3:0)+(h.tags.includes("tank-shred")&&enemy.some(e=>e.type==="tank")?3:0)+(h.tags.includes("burst")&&enemy.some(e=>e.type==="marksman")?2:0)+(h.tags.includes("mobility")?1:0)})).sort((a,b)=>b.score-a.score).slice(0,3);
 const build=lane==="Мид"?["Пылающий жезл","Палочка гения","Божественный меч","Зимняя корона","Щит Афины","Бессмертие"]:lane==="Золото"?["Ярость берсерка","Ветер природы","Клинок отчаяния","Злобный рык","Бессмертие","Господство льда"]:lane==="Роум"?["Прочные сапоги","Господство льда","Щит Афины","Древняя кираса","Бессмертие","Сияющая броня"]:lane==="Опыт"?["Сапоги воина","Топор войны","Господство льда","Древняя кираса","Злобный рык","Бессмертие"]:["Сапоги воина","Топор войны","Клинок отчаяния","Злобный рык","Бессмертие","Зимняя корона"];
 if(threats.some(x=>x.includes("Отхил")))build[2]="Господство льда";if(threats.includes("Несколько магов"))build[3]="Щит Афины";
 return {threats,counters:ranked.map(x=>({name:x.hero.name,role:x.hero.role,reason:"Подбор по роли и тегам матчапа; проверьте навыки и текущий патч."})),build,emblem:lane==="Мид"?"Мага":lane==="Золото"?"Стрелка":lane==="Роум"?"Танка":lane==="Опыт"?"Бойца":"Убийцы",talentTiers:["Разрыв","Мастер-убийца","Серия убийств"],spell:lane==="Лес"?"Возмездие":"Вспышка",timing:{early:"Ищи изолированную цель без мобильности. Не форсируй заход без информации о вражеском леснике.",mid:"После первого ключевого предмета оценивай дуэли и выбирай цели без защитных навыков.",late:"В первую очередь угроза задней линии и ключевой контроль; не трать весь прокаст на танка."},note:"Эвристический анализ, не live-статистика и не гарантия победы."};
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
