const $=id=>document.getElementById(id);
const DRAFT_STORAGE_KEY="mlbb_draft_state_v1";
let draftSyncTimer=null,draftSyncInFlight=false,draftSyncAgain=false;
let token=localStorage.getItem("mlbb_token")||"",data={heroes:[],draftHeroOptions:[],heroCatalog:[],heroProfiles:[],items:[],talents:[],emblems:[],roles:[],ranks:[],styles:[]},enemies=[],allies=[],threats=new Set(),encyFilter="all",ocrWorker=null;
const threatDefs=[["heal","💚 Отхил / вампиризм"],["magic","🔮 2+ мага / прокаст"],["speed","⚡ Скорость атаки"],["tank","🛡 Жирные танки"],["cc","⛓ Тяжёлый контроль"],["physical","⚔ Много физического урона"],["burst","💥 Взрывной урон"]];
const $api=async(path,opts={})=>{let r=await fetch("/api"+path,{...opts,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{}),...(opts.headers||{})}});let d=await r.json().catch(()=>({error:"Ошибка сервера"}));if(!r.ok)throw Error(d.error||"Ошибка");return d};
function toast(s){let el=document.createElement("div");el.textContent=s;el.style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#18384a;border:1px solid #39e5ff;padding:12px 17px;border-radius:10px;z-index:99;font-size:12px";document.body.append(el);setTimeout(()=>el.remove(),2500)}
function options(el,arr,placeholder="Выбери..."){el.innerHTML=(placeholder?`<option value="">${placeholder}</option>`:"")+arr.map(x=>`<option>${typeof x==="string"?x:x.name}</option>`).join("")}
function draftOptions(el){
 const legacy=data.heroes.map(hero=>({value:hero.name,label:hero.name+" · проверенная старая база"}));
 const catalog=(data.draftHeroOptions||[]).filter(hero=>!hero.analysisSupported).map(hero=>({
  value:hero.id,
  label:(hero.localizationStatus==="user_confirmed"||hero.localizationStatus==="source_verified"?"":"⚠ ")+hero.name+" ("+hero.nameEn+") · анализ пока недоступен"
 }));
 el.innerHTML='<option value="">Выбери...</option><optgroup label="Старая база · анализ доступен">'+legacy.map(x=>'<option value="'+esc(x.value)+'">'+esc(x.label)+'</option>').join("")+'</optgroup><optgroup label="Каталог героев · проверка продолжается">'+catalog.map(x=>'<option value="'+esc(x.value)+'">'+esc(x.label)+'</option>').join("")+'</optgroup>';
}
function draftHeroLabel(value){
 const legacy=data.heroes.find(hero=>hero.name===value);
 if(legacy)return legacy.name;
 const catalog=(data.draftHeroOptions||[]).find(hero=>hero.id===value);
 return catalog?catalog.name+" ("+catalog.nameEn+")":value;
}
async function init(){try{data=await $api("/data")}catch(e){toast(e.message);return}
for(let id of ["enemyPick","allyPick","myHero"])draftOptions($(id));
for(let id of ["profileHero","filterHero"])options($(id),data.heroes);
for(let id of ["lane","profileRole","filterRole"])options($(id),data.roles);
for(let id of ["profileRank","filterRank"])options($(id),data.ranks);
for(let id of ["profileStyle","filterStyle"])options($(id),data.styles);
$("threats").innerHTML=threatDefs.map(([id,name])=>`<button class="chip" data-threat="${id}">${name}</button>`).join("");
restoreDraft();drawTeams();renderEncy();if(token)await refreshMe();
}
function drawTeams(){for(let [side,arr] of [["enemies",enemies],["allies",allies]])$(side).innerHTML=arr.map((x,i)=>`<button class="chip active" data-side="${side}" data-i="${i}">${esc(draftHeroLabel(x))} ×</button>`).join("")||""}
function draftSnapshot(){return {version:1,enemies:[...enemies],allies:[...allies],lane:$("lane").value,myHero:$("myHero").value,threats:[...threats],savedAt:Date.now()}}
function setDraftStatus(message){const el=$("draftSaveStatus");if(el)el.textContent=message}
function saveDraft(){
 const snapshot=draftSnapshot();
 try{localStorage.setItem(DRAFT_STORAGE_KEY,JSON.stringify(snapshot));setDraftStatus("✓ Сохранено на этом устройстве")}
 catch{setDraftStatus("Не удалось сохранить локально. Проверь свободное место в браузере.");return}
 if(token){clearTimeout(draftSyncTimer);draftSyncTimer=setTimeout(syncDraftState,900)}
}
function readLocalDraft(){try{return JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)||"null")}catch{return null}}
function applyDraftState(saved){
 if(!saved||saved.version!==1)return;
 const names=new Set([...data.heroes.map(h=>h.name),...(data.draftHeroOptions||[]).map(h=>h.id)]);
 enemies=Array.isArray(saved.enemies)?saved.enemies.filter(x=>names.has(x)).slice(0,5):[];
 allies=Array.isArray(saved.allies)?saved.allies.filter(x=>names.has(x)).slice(0,5):[];
 if(data.roles.includes(saved.lane))$("lane").value=saved.lane;
 if(names.has(saved.myHero))$("myHero").value=saved.myHero;
 const allowed=new Set(threatDefs.map(([id])=>id));
 threats=new Set(Array.isArray(saved.threats)?saved.threats.filter(x=>allowed.has(x)):[]);
 document.querySelectorAll("#threats [data-threat]").forEach(b=>b.classList.toggle("active",threats.has(b.dataset.threat)));
 drawTeams();
}
function restoreDraft(){
 const saved=readLocalDraft();
 if(!saved)return;
 try{applyDraftState(saved);setDraftStatus("Черновик восстановлен с этого устройства")}
 catch{try{localStorage.removeItem(DRAFT_STORAGE_KEY)}catch{}}
}
async function syncDraftState(){
 if(!token)return;
 if(draftSyncInFlight){draftSyncAgain=true;return}
 if(!navigator.onLine){setDraftStatus("Офлайн: черновик сохранён на устройстве, синхронизация будет позже");return}
 draftSyncInFlight=true;
 try{
  const remote=await $api("/draft-state");
  const local=readLocalDraft();
  if(remote.state&&(!local||Number(remote.state.savedAt)>Number(local.savedAt))){
   applyDraftState(remote.state);
   localStorage.setItem(DRAFT_STORAGE_KEY,JSON.stringify(remote.state));
   setDraftStatus("✓ Более свежий черновик восстановлен с сервера");
  }else if(local&&(!remote.state||Number(local.savedAt)>Number(remote.state.savedAt))){
   await $api("/draft-state",{method:"PUT",body:JSON.stringify({state:local})});
   setDraftStatus("✓ Черновик синхронизирован с аккаунтом");
  }else if(local&&remote.state){
   setDraftStatus("✓ Черновик синхронизирован");
  }else{
   setDraftStatus("Черновик пока сохраняется только на устройстве");
  }
 }catch(error){setDraftStatus("Серверная синхронизация отложена; локальная копия сохранена")}
 finally{draftSyncInFlight=false;if(draftSyncAgain){draftSyncAgain=false;clearTimeout(draftSyncTimer);draftSyncTimer=setTimeout(syncDraftState,250)}}
}
function restoreDraft(){const saved=readLocalDraft();if(!saved)return;try{applyDraftState(saved);setDraftStatus("Черновик восстановлен с этого устройства")}catch{try{localStorage.removeItem(DRAFT_STORAGE_KEY)}catch{}}}
function addHero(side){let id=side==="enemies"?"enemyPick":"allyPick",arr=side==="enemies"?enemies:allies,v=$(id).value;if(!v)return;if(arr.length>=5)return toast("Максимум 5 героев");if(arr.includes(v))return toast("Уже добавлен");arr.push(v);drawTeams();saveDraft()}
$("addEnemy").onclick=()=>addHero("enemies");$("addAlly").onclick=()=>addHero("allies");
document.addEventListener("click",e=>{let b=e.target.closest("[data-side]");if(b){(b.dataset.side==="enemies"?enemies:allies).splice(+b.dataset.i,1);drawTeams();saveDraft()}});
$("nav").onclick=e=>{let b=e.target.closest("[data-page]");if(!b)return;document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".page").forEach(x=>x.classList.toggle("hidden",x.id!=="page-"+b.dataset.page))};
$("testDraft").onclick=()=>{enemies=["Тигрил","Эудора","Кэрри","Диррот","Атлас"];allies=["Ангела","Линг","Теризла"];$("lane").value="Лес";$("myHero").value="Хелкарт";drawTeams();saveDraft();runDraft()};
$("analyze").onclick=runDraft;$("lane").addEventListener("change",saveDraft);$("myHero").addEventListener("change",saveDraft);
async function runDraft(){if(!enemies.length)return toast("Добавь врагов");saveDraft();try{let d=await $api("/ai/draft",{method:"POST",body:JSON.stringify({lane:$("lane").value,enemies,allies,myHero:$("myHero").value})});$("draftResult").classList.remove("hidden");if(d.analysisStatus==="limited"){$("draftResult").innerHTML=`<small>ANALYSIS STATUS / LIMITED</small><h2>Тактические рекомендации пока недоступны</h2><p>Для этих героев ещё нет подтверждённой связи с проверенной тактической базой. Я не буду подставлять случайные контрпики или сборки.</p><h3>Герои, требующие исследования</h3>${d.unsupportedHeroes.map(hero=>`<div class="result"><b>${esc(hero.name)}</b><small>${esc(hero.id)}</small></div>`).join("")}<p class="hint">${esc(d.note)}</p>`;return}$("draftResult").innerHTML=`<small>ANALYSIS REPORT</small><h2>Угрозы состава</h2><p>${d.threats.join(" · ")||"Явных угроз по тегам не выявлено"}</p><h3>Топ контрпиков</h3>${d.counters.map((x,i)=>`<div class="result"><b>#${i+1} ${x.name}</b><p>${x.reason}</p></div>`).join("")}<h3>Сборка · 6 слотов</h3>${d.build.map((x,i)=>`<div class="slot"><span>${i+1}. ${x}</span><small>${i===0?"Старт":i>3?"Ситуационный":"Основной"}</small></div>`).join("")}<h3>Эмблема и таланты</h3><div class="result"><b>${d.emblem}</b><p>Тир 1: ${d.talentTiers[0]}<br>Тир 2: ${d.talentTiers[1]}<br>Тир 3: ${d.talentTiers[2]}<br>Заклинание: ${d.spell}</p></div><h3>Тайминг</h3>${Object.entries({Ранняя:d.timing.early,"Первый предмет":d.timing.mid,"Поздняя":d.timing.late}).map(([k,v])=>`<div class="result"><b>${k}</b><p>${v}</p></div>`).join("")}<p>${esc(d.aiExplanation||d.note)}</p>`}catch(e){toast(e.message)}}
$("threats").onclick=e=>{let b=e.target.closest("[data-threat]");if(!b)return;let k=b.dataset.threat;threats.has(k)?threats.delete(k):threats.add(k);b.classList.toggle("active",threats.has(k));saveDraft()};
function recommendBuild({items,archetype,threats=[]}){
 const profiles={
  "Убийца / физический урон":{categories:["Атака","Защита"],preferred:["burst","physical","penetration"]},
  "Маг / взрывной урон":{categories:["Магия","Магия / защита","Защита"],preferred:["magic","penetration"]},
  "Стрелок / скорость атаки":{categories:["Атака","Защита"],preferred:["marksman","critical","attack-speed"]},
  "Боец / длительный бой":{categories:["Атака","Защита"],preferred:["fighter","sustain","physical"]},
  "Танк / инициатор":{categories:["Защита","Магия / защита"],preferred:["survival","physical","magic-burst","anti-attack-speed"]},
  "Поддержка / хилер":{categories:["Защита","Магия","Магия / защита"],preferred:["survival","anti-heal","magic"]}
 };
 const threatRules={
  heal:{tags:["anti-heal"],reason:"Ответ на восстановление здоровья"},
  magic:{tags:["magic-burst","magic-dps"],reason:"Защита от магического урона"},
  speed:{tags:["anti-attack-speed"],reason:"Снижает эффективность быстрых базовых атак"},
  tank:{tags:["penetration","tank-shred","armor-break"],reason:"Помогает пробивать плотных противников"},
  cc:{tags:["survival"],reason:"Дополнительная выживаемость под контроль"},
  physical:{tags:["physical","survival"],reason:"Ответ на физический урон"},
  burst:{tags:["survival"],reason:"Помогает пережить взрывной урон"}
 };
 const profile=profiles[archetype];
 if(!profile||!Array.isArray(items))return [];
 return items.map((item,index)=>{
  const tags=new Set(item.tags||[]);
  if(!profile.categories.includes(item.category))return null;
  let score=0;const reasons=[];
  for(const tag of profile.preferred)if(tags.has(tag)){score+=2;reasons.push("Подходит выбранному архетипу");}
  for(const key of threats){
   const rule=threatRules[key];if(!rule)continue;
   if(rule.tags.some(tag=>tags.has(tag))){score+=6;reasons.push(rule.reason);}
  }
  return score?{name:item.name,category:item.category,description:item.description,score,reasons:[...new Set(reasons)],index}:null;
 }).filter(Boolean).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,6);
}
$("buildBtn").onclick=()=>{
 const result=recommendBuild({items:data.items,archetype:$("archetype").value,threats:[...threats]});
 $("buildResult").innerHTML=result.length
  ?`<h3>Рекомендованный порядок</h3>${result.map((item,i)=>`<div class="result"><b>${i+1}. ${esc(item.name)}</b><small> · ${esc(item.category)}</small><p>${esc(item.reasons.join(" · "))}</p><p class="hint">${esc(item.description||"Ситуативный предмет")}</p></div>`).join("")}<p class="hint">Учитываются архетип и отмеченные угрозы. Это рекомендация по тегам каталога, а не расчёт винрейта или точных параметров текущего патча.</p>`
  :'<p class="hint">Для этого сочетания архетипа и угроз в каталоге пока нет подходящих предметов.</p>';
};
async function auth(action){let body={email:$("email").value,password:$("password").value,nickname:$("nickname").value};try{let d=await $api("/auth/"+action,{method:"POST",body:JSON.stringify(body)});token=d.token;localStorage.setItem("mlbb_token",token);$("authMessage").textContent="Успешный вход";await refreshMe()}catch(e){$("authMessage").textContent=e.message}}
$("login").onclick=()=>auth("login");$("register").onclick=()=>auth("register");
async function refreshMe(){try{let d=await $api("/me"),u=d.user;$("authBadge").textContent="● "+u.nickname;$("authPanel").classList.add("hidden");$("logout").classList.remove("hidden");if(u.hero){$("profileHero").value=u.hero;$("profileRole").value=u.role;$("profileRank").value=u.rank;$("profileStyle").value=u.style;$("gameId").value=u.game_id||"";$("bio").value=u.bio||""}await syncDraftState()}catch{logout()}}
function logout(){clearTimeout(draftSyncTimer);token="";localStorage.removeItem("mlbb_token");$("authPanel").classList.remove("hidden");$("authBadge").textContent="● DEMO MODE";$("logout").classList.add("hidden");setDraftStatus("Черновик сохранён на устройстве; синхронизация доступна после входа")}
$("logout").onclick=logout;
$("saveProfile").onclick=async()=>{try{let d=await $api("/profile",{method:"PUT",body:JSON.stringify({hero:$("profileHero").value,role:$("profileRole").value,rank:$("profileRank").value,style:$("profileStyle").value,game_id:$("gameId").value,bio:$("bio").value})});$("profileStatus").textContent="Анкета сохранена: "+d.user.nickname;toast("Профиль обновлён")}catch(e){toast(e.message)}};
async function searchPlayers(ideal=false){try{let q=new URLSearchParams();for(let k of ["hero","role","rank","style"]){let el=$("filter"+k[0].toUpperCase()+k.slice(1));if(el.value)q.set(k,el.value)}if(ideal){let role=$("profileRole").value;let partner=({Лес:"Роум",Золото:"Роум",Опыт:"Лес",Мид:"Лес",Роум:"Лес"})[role];q.set("role",partner)}let d=await $api("/players?"+q);$("players").innerHTML=d.players.map(p=>`<article class="player"><h3>${esc(p.nickname)}</h3><small>${esc(p.hero)} · ${p.role} · ${p.rank} · ${p.style}</small><p>${esc(p.bio||"Без описания")}</p><button class="btn" data-like="${p.id}">♥ Пригласить / лайк</button></article>`).join("")||'<p class="hint">Пока нет игроков с такими фильтрами. Пригласи друзей зарегистрироваться.</p>'}catch(e){toast(e.message)}}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("searchPlayers").onclick=()=>searchPlayers(false);$("findDuo").onclick=()=>searchPlayers(true);
$("players").onclick=async e=>{let b=e.target.closest("[data-like]");if(!b)return;try{let d=await $api("/players/"+b.dataset.like+"/like",{method:"POST",body:"{}"});toast(d.mutual?"Взаимный матч!":"Лайк отправлен");b.disabled=true;b.textContent=d.mutual?"✓ Матч":"✓ Отправлено"}catch(e){toast(e.message)}};
$("loadMatches").onclick=async()=>{try{let d=await $api("/matches");$("matches").innerHTML=d.matches.map(p=>`<div class="slot"><span>${esc(p.nickname)} · ${esc(p.hero)} · ${p.role}</span><b>${esc(p.game_id||"ID не указан")}</b></div>`).join("")||'<p class="hint">Взаимных совпадений пока нет.</p>'}catch(e){toast(e.message)}};
function renderEncy(){
 const q=$("encySearch").value.toLowerCase();
 const items=data.items.map(x=>({...x,type:"item"}));
 const talents=data.talents.map(x=>({...x,category:"Тир "+x.tier,type:"talent"}));
 const emblems=data.emblems.map(x=>({name:"Эмблема "+x,category:"Эмблема",description:"Система характеристик и трёх тиров талантов для соответствующего архетипа.",type:"emblem"}));
 const heroEntries=(data.heroCatalog||[]).map(hero=>{
  const roles=Array.isArray(hero.role?.values)?hero.role.values.join(", "):"Не проверено";
  const lanes=[hero.lanes?.primary,...(hero.lanes?.flexible||[])].filter(Boolean).join(", ")||"Не проверено";
  const profile=(data.heroProfiles||[]).find(entry=>entry.id===hero.id);
  const tactical=profile?[
   profile.mechanics?.length?"Механики: "+profile.mechanics.join(" "):"",
   profile.strengths?.length?"Сильные стороны: "+profile.strengths.join(" "):"",
   profile.weaknesses?.length?"Ограничения: "+profile.weaknesses.join(" "):"",
   profile.teamfight?.preferredPlan?"План боя: "+profile.teamfight.preferredPlan:""
  ].filter(Boolean).join(" "):"";
  const description="Роль: "+roles+" · Линия: "+lanes+" · Тактический профиль: "+(hero.tacticalProfile?.status||"missing")+(tactical?" · "+tactical:"");
  return {name:hero.displayNameRu||hero.nameEn||hero.id,category:hero.nameEn||hero.id,description,type:"hero",status:"Локализация: "+(hero.localization?.status||"pending_review")+" · Роль: "+(hero.role?.status||"pending_review")+" · Линия: "+(hero.lanes?.status||"pending_review")+(profile?" · Уровень профиля: "+profile.confidence:"")};
 });
 const all=[...items,...talents,...emblems,...heroEntries];
 const list=all.filter(x=>(encyFilter==="all"||x.type===encyFilter)&&(x.name+" "+x.category+" "+x.description+" "+(x.status||"")).toLowerCase().includes(q));
 $("encyList").innerHTML=list.map(x=>`<article><b>${esc(x.name)}</b><small style="display:block;color:#39e5ff;margin-top:5px">${esc(x.category)}</small>${x.status?`<small class="hint">${esc(x.status)}</small>`:""}<p>${esc(x.description)}</p></article>`).join("")||"<p>Ничего не найдено</p>";
}
$("encySearch").oninput=renderEncy;$("encyFilters").onclick=e=>{let b=e.target.closest("[data-filter]");if(!b)return;encyFilter=b.dataset.filter;document.querySelectorAll("#encyFilters .chip").forEach(x=>x.classList.toggle("active",x===b));renderEncy()};
$("ocr").onclick=async()=>{let f=$("screenshot").files[0];if(!f)return toast("Выбери скриншот");$("ocrStatus").textContent="Загружаю OCR-движок и распознаю текст...";try{if(!window.Tesseract){await new Promise((ok,no)=>{let s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";s.onload=ok;s.onerror=no;document.head.append(s)})}let result=await Tesseract.recognize(f,"eng+rus");let text=result.data.text.toLowerCase();let found=data.heroes.map(h=>h.name).filter(n=>text.includes(n.toLowerCase()));$("ocrStatus").textContent=found.length?"Кандидаты распознавания: "+found.join(", ")+". Добавь проверенных героев вручную.":"Не удалось уверенно распознать названия. Попробуй более чёткий скриншот или добавь героев вручную.";if(found.length)found.forEach(h=>{if(enemies.length<5&&!enemies.includes(h))enemies.push(h)});drawTeams();saveDraft()}catch(e){$("ocrStatus").textContent="OCR не загрузился. Проверь подключение к интернету и попробуй ещё раз."}};
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")syncDraftState()});
window.addEventListener("online",syncDraftState);
init();
