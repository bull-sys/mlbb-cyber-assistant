window.__MLBB_APP_DIAGNOSTICS={stage:"script-started",error:null};
window.addEventListener("error",event=>{if(window.__MLBB_APP_DIAGNOSTICS){window.__MLBB_APP_DIAGNOSTICS.stage="runtime-error";window.__MLBB_APP_DIAGNOSTICS.error=event.message||"Неизвестная ошибка";}});
const $=id=>document.getElementById(id);
const LEGACY_DRAFT_STORAGE_KEY="mlbb_draft_state_v1";
const GUEST_DRAFT_STORAGE_KEY="mlbb_draft_state_v1_guest";
let draftStorageKey=GUEST_DRAFT_STORAGE_KEY;
try{if(!localStorage.getItem(GUEST_DRAFT_STORAGE_KEY)&&localStorage.getItem(LEGACY_DRAFT_STORAGE_KEY))localStorage.setItem(GUEST_DRAFT_STORAGE_KEY,localStorage.getItem(LEGACY_DRAFT_STORAGE_KEY));localStorage.removeItem(LEGACY_DRAFT_STORAGE_KEY)}catch{}
let draftSyncTimer=null,draftSyncInFlight=false,draftSyncAgain=false;
let token="";try{token=localStorage.getItem("mlbb_token")||""}catch{};let activeUserId=null,data={heroes:[],draftHeroOptions:[],heroCatalog:[],heroProfiles:[],items:[],talents:[],emblems:[],roles:[],ranks:[],styles:[]},enemies=[],allies=[],threats=new Set(),encyFilter="all",ocrWorker=null,encyRemoteAssets=null,encyRemoteKnowledge=new Map(),encyKnowledgeRequest=0;
const threatDefs=[["heal","💚 Отхил / вампиризм"],["magic","🔮 2+ мага / прокаст"],["speed","⚡ Скорость атаки"],["tank","🛡 Жирные танки"],["cc","⛓ Тяжёлый контроль"],["physical","⚔ Много физического урона"],["burst","💥 Взрывной урон"]];
const $api=async(path,opts={})=>{let r=await fetch("/api"+path,{...opts,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{}),...(opts.headers||{})}});let d=await r.json().catch(()=>({error:"Ошибка сервера"}));if(!r.ok){if(r.status===401&&token&&!path.startsWith("/auth/"))logout();throw Error(d.error||"Ошибка")}return d};
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
async function init(){if(window.__MLBB_APP_DIAGNOSTICS)window.__MLBB_APP_DIAGNOSTICS.stage="loading-data";try{data=await $api("/data")}catch(e){if(window.__MLBB_APP_DIAGNOSTICS){window.__MLBB_APP_DIAGNOSTICS.stage="data-error";window.__MLBB_APP_DIAGNOSTICS.error=e.message}toast(e.message);return}
for(let id of ["enemyPick","allyPick","myHero"])draftOptions($(id));
for(let id of ["profileHero","filterHero"])options($(id),data.heroes);
for(let id of ["lane","profileRole","filterRole"])options($(id),data.roles);
for(let id of ["profileRank","filterRank"])options($(id),data.ranks);
for(let id of ["profileStyle","filterStyle"])options($(id),data.styles);
$("threats").innerHTML=threatDefs.map(([id,name])=>`<button class="chip" data-threat="${id}">${name}</button>`).join("");
restoreDraft();drawTeams();renderEncy();$api("/game-assets").then(result=>{if(result?.ok){encyRemoteAssets=result;renderEncy()}}).catch(()=>{});if(token)await refreshMe();
 if(window.__MLBB_APP_DIAGNOSTICS)window.__MLBB_APP_DIAGNOSTICS.stage="ready";
}
function drawTeams(){for(let [side,arr] of [["enemies",enemies],["allies",allies]])$(side).innerHTML=arr.map((x,i)=>`<button class="chip active" data-side="${side}" data-i="${i}">${esc(draftHeroLabel(x))} ×</button>`).join("")||""}
function draftSnapshot(){return {version:1,enemies:[...enemies],allies:[...allies],lane:$("lane").value,myHero:$("myHero").value,threats:[...threats],savedAt:Date.now()}}
function setDraftStatus(message){const el=$("draftSaveStatus");if(el)el.textContent=message}
function saveDraft(){
 const snapshot=draftSnapshot();
 try{localStorage.setItem(draftStorageKey,JSON.stringify(snapshot));setDraftStatus("✓ Сохранено на этом устройстве")}
 catch{setDraftStatus("Не удалось сохранить локально. Проверь свободное место в браузере.");return}
 if(token){clearTimeout(draftSyncTimer);draftSyncTimer=setTimeout(syncDraftState,900)}
}
function readLocalDraft(){try{return JSON.parse(localStorage.getItem(draftStorageKey)||"null")}catch{return null}}
function applyDraftState(saved){
 if(!saved||saved.version!==1)return;
 const names=new Set([...data.heroes.map(h=>h.name),...(data.draftHeroOptions||[]).map(h=>h.id)]);
 enemies=Array.isArray(saved.enemies)?saved.enemies.filter(x=>names.has(x)).slice(0,5):[];
 allies=Array.isArray(saved.allies)?saved.allies.filter(x=>names.has(x)).slice(0,5):[];
 if(data.roles.includes(saved.lane))$("lane").value=saved.lane;
 if(names.has(saved.myHero)){$("myHero").value=saved.myHero;$("myHeroChoice").textContent=draftHeroLabel(saved.myHero)}else $("myHeroChoice").textContent="Не выбран";
 const allowed=new Set(threatDefs.map(([id])=>id));
 threats=new Set(Array.isArray(saved.threats)?saved.threats.filter(x=>allowed.has(x)):[]);
 document.querySelectorAll("#threats [data-threat]").forEach(b=>b.classList.toggle("active",threats.has(b.dataset.threat)));
 drawTeams();
}
function accountDraftKey(userId){return "mlbb_draft_state_v1_user_"+String(userId)}
function clearDraftUI(){enemies=[];allies=[];threats.clear();$("lane").value="";$("myHero").value="";$("myHeroChoice").textContent="Не выбран";document.querySelectorAll("#threats [data-threat]").forEach(b=>b.classList.remove("active"));drawTeams()}
function selectDraftStorage(userId){const nextKey=userId===null?GUEST_DRAFT_STORAGE_KEY:accountDraftKey(userId);if(nextKey===draftStorageKey)return;draftStorageKey=nextKey;clearDraftUI();restoreDraft()}
function restoreDraft(){
 const saved=readLocalDraft();
 if(!saved)return;
 try{applyDraftState(saved);setDraftStatus("Черновик восстановлен с этого устройства")}
 catch{try{localStorage.removeItem(draftStorageKey)}catch{}}
}
async function syncDraftState(){
 if(!token||activeUserId===null)return;
 if(draftSyncInFlight){draftSyncAgain=true;return}
 if(!navigator.onLine){setDraftStatus("Офлайн: черновик сохранён на устройстве, синхронизация будет позже");return}
 draftSyncInFlight=true;
 try{
  const remote=await $api("/draft-state");
  const local=readLocalDraft();
  if(remote.state&&(!local||Number(remote.state.savedAt)>Number(local.savedAt))){
   applyDraftState(remote.state);
   localStorage.setItem(draftStorageKey,JSON.stringify(remote.state));
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
function restoreDraft(){const saved=readLocalDraft();if(!saved)return;try{applyDraftState(saved);setDraftStatus("Черновик восстановлен с этого устройства")}catch{try{localStorage.removeItem(draftStorageKey)}catch{}}}
let pickerTarget="enemies",pickerFilter="all",pickerRoleFilter="all";
function pickerEntries(){
 const profiles=data.heroProfiles||[],catalog=data.heroCatalog||[];
 const profileFor=(id,name)=>profiles.find(p=>p.id===id||p.names?.ru===name||p.names?.en===name)||null;
 const catalogFor=name=>catalog.find(h=>h.displayNameRu===name||h.nameEn===name)||null;
 const legacy=data.heroes.map(h=>{
  const linked=catalogFor(h.name),profile=profileFor(linked?.id,h.name);
  const roles=profile?.roles||linked?.role?.values||[];
  const lanes=profile?.lanes||[linked?.lanes?.primary,...(linked?.lanes?.flexible||[])].filter(Boolean);
  return {value:h.name,name:h.name,nameEn:linked?.nameEn||"",supported:true,catalog:false,roles,lanes,profile};
 });
 const options=(data.draftHeroOptions||[]).map(h=>{
  const linked=catalog.find(x=>x.id===h.id),profile=profileFor(h.id,h.name);
  const roles=profile?.roles||linked?.role?.values||[];
  const lanes=profile?.lanes||[linked?.lanes?.primary,...(linked?.lanes?.flexible||[])].filter(Boolean);
  return {value:h.id,name:h.name,nameEn:h.nameEn,supported:Boolean(h.analysisSupported),catalog:true,roles,lanes,profile};
 });
 return [...legacy,...options];
}
function pickerRecent(){
 try{return JSON.parse(localStorage.getItem("mlbb_recent_draft_heroes")||"[]").filter(x=>pickerEntries().some(h=>h.value===x)).slice(0,6)}catch{return []}
}
function rememberPickerHero(value){
 try{localStorage.setItem("mlbb_recent_draft_heroes",JSON.stringify([value,...pickerRecent().filter(x=>x!==value)].slice(0,6)))}catch{}
}
function heroPortraitUrl(hero){
 const aliases={"Эудора":"eudora"};
 const catalog=(data.draftHeroOptions||[]).find(h=>
  h.id===hero.value||h.displayNameRu===hero.name||h.name===hero.name||
  (aliases[hero.name]&&h.id===aliases[hero.name])||
  (hero.nameEn&&h.nameEn===hero.nameEn)
 );
 const id=(catalog&&catalog.id)||hero.id||(hero.nameEn||"").toLocaleLowerCase("en").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
 const filenames={
  "chang-e":"chang27e",
  "luo-yi":"luo_yi",
  "popol-and-kupa":"popol_and_kupa",
  "yi-sun-shin":"yi_sun-shin",
  "yu-zhong":"yu_zhong"
 };
 const filename=filenames[id]||id;
 return "https://raw.githubusercontent.com/Ceplin03/database-mlbb.Mobile-Legends-Bang-Bang/master/images-hero/"+encodeURIComponent(filename)+".png";
}
function setPickerAccent(hero){
 const panel=$("heroPicker").querySelector(".picker-panel");
 if(!hero){panel.style.removeProperty("--picker-hero-image");return}
 panel.style.setProperty("--picker-hero-image",'url("'+heroPortraitUrl(hero)+'")');
}
function heroTileMarkup(h,extra=""){
 const url=heroPortraitUrl(h),role=h.roles?.[0]||h.lanes?.[0]||"Роль уточняется";
 const strength=h.profile?.strengths?.[0]||"",weakness=h.profile?.weaknesses?.[0]||"";
 const facts=(strength||weakness)
  ?'<span class="hero-card-fact positive"><i>＋</i>'+esc(strength)+'</span><span class="hero-card-fact negative"><i>−</i>'+esc(weakness)+'</span>'
  :'<span class="hero-card-fact muted">Тактический профиль уточняется</span>';
 const status=h.supported?'<span class="hero-status ready">АНАЛИЗ</span>':'<span class="hero-status pending">КАТАЛОГ</span>';
 const selected=pickerTarget==="enemies"?enemies.includes(h.value):pickerTarget==="allies"?allies.includes(h.value):$("myHero").value===h.value;
 return '<button class="hero-tile '+extra+(selected?" selected":"")+'" style="--hero-portrait-glow:url(&quot;'+url+'&quot;)" aria-pressed="'+selected+'" data-picker-value="'+esc(h.value)+'"><span class="hero-portrait-wrap"><img class="hero-portrait" src="'+url+'" alt="" loading="lazy" decoding="async" onerror="this.hidden=true;this.parentElement.classList.add(\'portrait-missing\')"><span class="portrait-fallback">✦</span></span><span class="hero-card-copy"><span class="hero-card-title"><b>'+esc(h.name)+'</b>'+status+'</span><small class="hero-role">'+esc(role)+'</small>'+facts+'</span></button>';
}
function renderHeroPicker(){
 const q=$("heroPickerSearch").value.trim().toLocaleLowerCase("ru"),entries=pickerEntries();
 const current=pickerTarget==="enemies"?enemies:pickerTarget==="allies"?allies:[];
 const accentValue=pickerTarget==="myHero"?$("myHero").value:(current[current.length-1]||current[0]);
 setPickerAccent(entries.find(h=>h.value===accentValue)||null);
 $("pickerSelectionStatus").textContent=pickerTarget==="myHero"?"Выбери своего героя":("Выбрано "+current.length+" из 5 · можно добавить несколько подряд");
 const recent=pickerRecent().map(value=>entries.find(h=>h.value===value)).filter(Boolean);
 $("recentHeroes").innerHTML=recent.length?'<small>НЕДАВНО ВЫБРАННЫЕ</small><div class="picker-recent-grid">'+recent.map(h=>heroTileMarkup(h,"recent")).join("")+'</div>':"";
 const roleOptions=["Убийца","Маг","Стрелок","Боец","Танк","Поддержка","Лес","Золото","Опыт","Мид","Роум"];
 const available=roleOptions.filter(role=>entries.some(h=>[...(h.roles||[]),...(h.lanes||[])].includes(role)));
 $("pickerRoles").innerHTML=['Все роли',...available].map((role,i)=>'<button class="picker-role-chip '+((pickerRoleFilter===(i===0?"all":role))?"active":"")+'" data-picker-role="'+(i===0?"all":esc(role))+'">'+esc(role)+'</button>').join("");
 const filtered=entries.filter(h=>{
  const match=(h.name+" "+h.nameEn).toLocaleLowerCase("ru").includes(q);
  const roleMatch=pickerRoleFilter==="all"||[...(h.roles||[]),...(h.lanes||[])].includes(pickerRoleFilter);
  return match&&roleMatch&&(pickerFilter==="all"||(pickerFilter==="supported"&&h.supported)||(pickerFilter==="catalog"&&h.catalog));
 });
 $("heroPickerGrid").innerHTML=filtered.map(h=>heroTileMarkup(h)).join("")||'<p class="hint">Ничего не найдено. Попробуй другую роль или написание.</p>';
}
function openHeroPicker(target){
 pickerTarget=target;pickerFilter="all";pickerRoleFilter="all";$("heroPickerSearch").value="";
 document.querySelectorAll("[data-picker-filter]").forEach(b=>b.classList.toggle("active",b.dataset.pickerFilter==="all"));
 $("pickerTitle").textContent=target==="enemies"?"Выбери героя противника":target==="allies"?"Выбери союзного героя":"Выбери своего героя";
 $("heroPicker").classList.remove("hidden");renderHeroPicker();$("heroPickerSearch").focus();
}
function choosePickerHero(value){
 const entries=pickerEntries(),hero=entries.find(h=>h.value===value);if(!hero)return;
 if(pickerTarget==="myHero"){
  $("myHero").value=value;$("myHeroChoice").textContent=hero.name;saveDraft();rememberPickerHero(value);$("heroPicker").classList.add("hidden");return;
 }
 const arr=pickerTarget==="enemies"?enemies:allies;
 if(arr.length>=5)return toast("Команда уже заполнена");
 if(arr.includes(value))return toast("Этот герой уже выбран");
 arr.push(value);drawTeams();saveDraft();rememberPickerHero(value);renderHeroPicker();
 if(arr.length>=5){$("heroPicker").classList.add("hidden");toast("Команда заполнена");}
}
$("openEnemyPicker").onclick=()=>openHeroPicker("enemies");
$("openAllyPicker").onclick=()=>openHeroPicker("allies");
$("openMyHeroPicker").onclick=()=>openHeroPicker("myHero");
$("closeHeroPicker").onclick=()=>$("heroPicker").classList.add("hidden");
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("heroPicker").classList.add("hidden")});
$("heroPicker").onclick=e=>{if(e.target===$("heroPicker"))$("heroPicker").classList.add("hidden")};
$("heroPickerGrid").onclick=e=>{const tile=e.target.closest("button[data-picker-value]");if(tile)choosePickerHero(tile.dataset.pickerValue)};
$("heroPickerSearch").addEventListener("input",renderHeroPicker);
$("heroPicker").querySelector(".picker-tabs").onclick=e=>{const b=e.target.closest("[data-picker-filter]");if(!b)return;pickerFilter=b.dataset.pickerFilter;document.querySelectorAll("[data-picker-filter]").forEach(x=>x.classList.toggle("active",x===b));renderHeroPicker()};
$("pickerRoles").onclick=e=>{const b=e.target.closest("[data-picker-role]");if(!b)return;pickerRoleFilter=b.dataset.pickerRole;renderHeroPicker()};

document.addEventListener("click",e=>{let b=e.target.closest("[data-side]");if(b){(b.dataset.side==="enemies"?enemies:allies).splice(+b.dataset.i,1);drawTeams();saveDraft()}});
document.addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(!b)return;const page=b.dataset.page;if(!document.getElementById("page-"+page))return;document.querySelectorAll("#nav [data-page]").forEach(x=>x.classList.toggle("active",x.dataset.page===page));document.querySelectorAll(".page").forEach(x=>x.classList.toggle("hidden",x.id!=="page-"+page));window.scrollTo({top:0,behavior:"smooth"})});
$("testDraft").onclick=()=>{enemies=["Тигрил","Эудора","Кэрри","Диррот","Атлас"];allies=["Ангела","Линг","Теризла"];$("lane").value="Лес";$("myHero").value="Хелкарт";drawTeams();saveDraft();runDraft()};
$("analyze").onclick=runDraft;$("lane").addEventListener("change",saveDraft);$("myHero").addEventListener("change",()=>{$("myHeroChoice").textContent=$("myHero").value?draftHeroLabel($("myHero").value):"Не выбран";saveDraft()});
async function runDraft(){
 if(!enemies.length)return toast("Добавь врагов");
 saveDraft();
 const button=$("analyze"),originalLabel=button.textContent;
 button.disabled=true;button.textContent="Анализирую состав…";
 $("draftResult").classList.remove("hidden");
 $("draftResult").innerHTML='<div class="report-loading"><span class="report-loader"></span><div><b>Собираю тактический отчёт</b><small>Проверяю угрозы и доступные контрпики</small></div></div>';
 try{
  const d=await $api("/ai/draft",{method:"POST",body:JSON.stringify({lane:$("lane").value,enemies,allies,myHero:$("myHero").value})});
  if(d.analysisStatus==="limited"){
   const unsupported=(d.unsupportedHeroes||[]).map(hero=>'<div class="report-hero-row"><b>'+esc(hero.name)+'</b><small>'+esc(hero.id)+'</small></div>').join("");
   $("draftResult").innerHTML='<div class="report-eyebrow">ОТЧЁТ · ОГРАНИЧЕННЫЙ АНАЛИЗ</div><div class="report-heading"><div><h2>Нужна проверка данных</h2><p>Для части выбранных героев пока нет подтверждённой тактической базы.</p></div><span class="report-status limited">ОГРАНИЧЕНО</span></div><div class="report-note"><b>Почему нет контрпиков?</b><p>'+esc(d.note)+'</p></div><h3 class="report-section-title">Герои, ожидающие исследования</h3><div class="report-hero-list">'+unsupported+'</div>';
   return;
  }
  const threats=(d.threats||[]).map(item=>'<span class="threat-tag">'+esc(item)+'</span>').join("")||'<span class="report-muted">Явные угрозы по базе не определены</span>';
  const counters=(d.counters||[]).map((item,index)=>'<article class="counter-card"><div class="counter-rank">'+String(index+1).padStart(2,"0")+'</div><div class="counter-copy"><div class="counter-title"><b>'+esc(item.name)+'</b><span>'+esc(item.role||"Роль не указана")+'</span></div><p>'+esc(item.reason)+'</p></div><div class="counter-score"><b>'+esc(item.score)+'</b><small>оценка</small></div></article>').join("")||'<div class="report-empty">В текущей базе пока нет подтверждённых контрпиков для этого состава.</div>';
  const build=(d.buildDetails||[]).map((item,index)=>'<article class="build-card"><span class="build-number">'+(index+1)+'</span><div><b>'+esc(item.name)+'</b><small>'+(index===0?"Стартовый слот":index>=4?"Ситуативный слот":"Основной слот")+'</small><p>'+esc((item.reasons||[]).join(" · ")||"Подбор по архетипу и угрозам")+'</p></div></article>').join("")||'<div class="report-empty">Нет подтверждённого порядка предметов.</div>';
  const timing=d.timing||{};
  const phases=[["РАННЯЯ ИГРА",timing.early],["СРЕДНЯЯ ИГРА",timing.mid],["ПОЗДНЯЯ ИГРА",timing.late]].filter(x=>x[1]).map(x=>'<article class="phase-card"><small>'+x[0]+'</small><p>'+esc(x[1])+'</p></article>').join("");
  const talents=(d.talentTiers||[]).map((item,index)=>'<div class="talent-row"><small>ТИР '+(index+1)+'</small><b>'+esc(item)+'</b></div>').join("");
  $("draftResult").innerHTML='<div class="report-eyebrow">MLBB CYBER · ТАКТИЧЕСКИЙ ОТЧЁТ</div><div class="report-heading"><div><h2>План на этот драфт</h2><p>Линия: '+esc($("lane").value)+' · Врагов: '+enemies.length+' · Союзников: '+allies.length+'</p></div><span class="report-status complete">АНАЛИЗ ГОТОВ</span></div><section class="report-block"><div class="report-block-heading"><h3>Угрозы состава</h3><small>ЧТО УЧЕСТЬ</small></div><div class="threat-list">'+threats+'</div></section><section class="report-block"><div class="report-block-heading"><h3>Контрпики</h3><small>ПО ПРИОРИТЕТУ</small></div><div class="counter-list">'+counters+'</div></section><section class="report-block"><div class="report-block-heading"><h3>Порядок предметов</h3><small>6 СЛОТОВ</small></div><div class="build-list">'+build+'</div></section><section class="report-block"><div class="report-block-heading"><h3>Эмблема и заклинание</h3><small>НАСТРОЙКА</small></div><div class="loadout-card"><div><small>ЭМБЛЕМА</small><b>'+esc(d.emblem||"Не определена")+'</b></div><div><small>ЗАКЛИНАНИЕ</small><b>'+esc(d.spell||"Не определено")+'</b></div></div>'+talents+'</section><section class="report-block"><div class="report-block-heading"><h3>План по времени</h3><small>ТРИ ЭТАПА</small></div><div class="phase-list">'+phases+'</div></section><div class="report-footnote">'+esc(d.aiExplanation||d.note||"Рекомендации рассчитаны по локальной тактической базе.")+'</div>';
 }catch(e){
  $("draftResult").innerHTML='<div class="report-error"><b>Не удалось завершить анализ</b><p>'+esc(e.message||"Проверь соединение и попробуй ещё раз.")+'</p><button id="retryDraft" class="btn secondary">Повторить анализ</button></div>';
  $("retryDraft").onclick=runDraft;
 }finally{button.disabled=false;button.textContent=originalLabel}
}
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
async function auth(action){let body={email:$("email").value,password:$("password").value,nickname:$("nickname").value};try{let d=await $api("/auth/"+action,{method:"POST",body:JSON.stringify(body)});token=d.token;localStorage.setItem("mlbb_token",token);const restored=await refreshMe();$("authMessage").textContent=restored?"Успешный вход":"Не удалось подтвердить сессию. Войди ещё раз."}catch(e){$("authMessage").textContent=e.message}}
$("login").onclick=()=>auth("login");$("register").onclick=()=>auth("register");
async function refreshMe(){try{let d=await $api("/me"),u=d.user;activeUserId=u.id;selectDraftStorage(u.id);$("authBadge").textContent="● "+u.nickname;$("authPanel").classList.add("hidden");$("logout").classList.remove("hidden");if(u.hero){$("profileHero").value=u.hero;$("profileRole").value=u.role;$("profileRank").value=u.rank;$("profileStyle").value=u.style;$("gameId").value=u.game_id||"";$("bio").value=u.bio||""}await syncDraftState();return true}catch{logout();return false}}
function logout(){clearTimeout(draftSyncTimer);token="";activeUserId=null;localStorage.removeItem("mlbb_token");selectDraftStorage(null);$("authPanel").classList.remove("hidden");$("authBadge").textContent="● DEMO MODE";$("logout").classList.add("hidden");setDraftStatus("Черновик сохранён на устройстве; синхронизация доступна после входа")}
$("logout").onclick=logout;
$("saveProfile").onclick=async()=>{try{let d=await $api("/profile",{method:"PUT",body:JSON.stringify({hero:$("profileHero").value,role:$("profileRole").value,rank:$("profileRank").value,style:$("profileStyle").value,game_id:$("gameId").value,bio:$("bio").value})});$("profileStatus").textContent="Анкета сохранена: "+d.user.nickname;toast("Профиль обновлён")}catch(e){toast(e.message)}};
async function searchPlayers(ideal=false){try{let q=new URLSearchParams();for(let k of ["hero","role","rank","style"]){let el=$("filter"+k[0].toUpperCase()+k.slice(1));if(el.value)q.set(k,el.value)}if(ideal){let role=$("profileRole").value;let partner=({Лес:"Роум",Золото:"Роум",Опыт:"Лес",Мид:"Лес",Роум:"Лес"})[role];q.set("role",partner)}let d=await $api("/players?"+q);$("players").innerHTML=d.players.map(p=>`<article class="player"><h3>${esc(p.nickname)}</h3><small>${esc(p.hero)} · ${p.role} · ${p.rank} · ${p.style}</small><p>${esc(p.bio||"Без описания")}</p><button class="btn" data-like="${p.id}">♥ Пригласить / лайк</button></article>`).join("")||'<p class="hint">Пока нет игроков с такими фильтрами. Пригласи друзей зарегистрироваться.</p>'}catch(e){toast(e.message)}}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("searchPlayers").onclick=()=>searchPlayers(false);$("findDuo").onclick=()=>searchPlayers(true);
$("players").onclick=async e=>{let b=e.target.closest("[data-like]");if(!b)return;try{let d=await $api("/players/"+b.dataset.like+"/like",{method:"POST",body:"{}"});toast(d.mutual?"Взаимный матч!":"Лайк отправлен");b.disabled=true;b.textContent=d.mutual?"✓ Матч":"✓ Отправлено"}catch(e){toast(e.message)}};
$("loadMatches").onclick=async()=>{try{let d=await $api("/matches");$("matches").innerHTML=d.matches.map(p=>`<div class="slot"><span>${esc(p.nickname)} · ${esc(p.hero)} · ${p.role}</span><b>${esc(p.game_id||"ID не указан")}</b></div>`).join("")||'<p class="hint">Взаимных совпадений пока нет.</p>'}catch(e){toast(e.message)}};
function encyHeroPortrait(hero){
 return heroPortraitUrl({value:hero.id,name:hero.displayNameRu||hero.nameEn,nameEn:hero.nameEn});
}
const EMBLEM_IMAGE_KEYS={
 "Общая":"common","Танк":"tank","Убийцы":"assassin","Мага":"mage","Бойца":"fighter","Стрелка":"marksman","Поддержки":"support"
};
const ITEM_IMAGE_NAMES={
 "Господство льда":"Dominance Ice","Щит Афины":"Athena's Shield","Сияющая броня":"Radiant Armor",
 "Древняя кираса":"Antique Cuirass","Шипованная броня":"Blade Armor","Бессмертие":"Immortality",
 "Зимняя корона":"Winter Crown","Топор войны":"War Axe","Пылающий жезл":"Glowing Wand",
 "Ожерелье заточения":"Necklace of Durance","Трезубец":"Sea Halberd","Злобный рык":"Malefic Roar",
 "Палочка гения":"Genius Wand","Божественный меч":"Divine Glaive","Ветер природы":"Wind of Nature",
 "Ярость берсерка":"Berserker's Fury","Клинок отчаяния":"Blade of Despair"
};
function itemAssetKey(value){
 return String(value||"").normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g,"");
}
function encyItemImage(item){
 const wanted=ITEM_IMAGE_NAMES[item?.name]||item?.name||"";
 const key=itemAssetKey(wanted);
 const assets=encyRemoteAssets?.items||[];
 const match=assets.find(asset=>[asset.name,asset.nameEn,asset.title,asset.slug,asset.id,asset.key].some(value=>itemAssetKey(value)===key));
 return match?.image||match?.icon||item?.image||null;
}
function renderEncy(){
 const q=$("encySearch").value.toLowerCase();
 const items=data.items.map(x=>({...x,image:encyItemImage(x),type:"item",category:x.category||"Предмет"}));
 const talents=(encyRemoteAssets?.talents?.length?encyRemoteAssets.talents:data.talents).map(x=>({...x,category:"Талант эмблемы",type:"talent",image:x.image||x.icon||null}));
 const emblems=(encyRemoteAssets?.emblems?.length?encyRemoteAssets.emblems:data.emblems).map(x=>{
  if(typeof x==="string"){
   const key=EMBLEM_IMAGE_KEYS[x]||itemAssetKey(x);
   const asset=(encyRemoteAssets?.emblems||[]).find(a=>[a.name,a.nameEn,a.slug,a.id].some(v=>itemAssetKey(v)===key));
   return {name:"Эмблема "+x,category:"Эмблема",description:"Описание эмблемы уточняется.",image:asset?.image||asset?.icon||null,type:"emblem"};
  }
  return {...x,image:x.image||x.icon||null,name:x.name||("Эмблема "+x.role),category:"Эмблема",description:x.description||x.bestFor||"",type:"emblem"};
 });
 const heroEntries=(data.heroCatalog||[]).map(hero=>{
  const profile=(data.heroProfiles||[]).find(entry=>entry.id===hero.id);
  const name=hero.displayNameRu||hero.nameEn||hero.id;
  const roles=Array.isArray(hero.role?.values)?hero.role.values.join(", "):"Роль уточняется";
  const lanes=[hero.lanes?.primary,...(hero.lanes?.flexible||[])].filter(Boolean).join(", ")||"Линия уточняется";
  return {name,category:hero.nameEn||hero.id,type:"hero",hero,profile,roles,lanes};
 });
 const all=[...items,...talents,...emblems,...heroEntries];
 const list=all.filter(x=>(encyFilter==="all"||x.type===encyFilter)&&(x.name+" "+x.category+" "+(x.description||"")+" "+(x.roles||"")+" "+(x.lanes||"")).toLowerCase().includes(q));
 $("encyList").innerHTML=list.map(x=>{
  if(x.type==="hero"){
   const url=encyHeroPortrait(x.hero),p=x.profile;
   const status=p?(p.confidence==="complete"?"Профиль проверен": "Профиль частичный"):"Профиль в работе";
   const fact=p?.strengths?.[0]||"Тактические данные пополняются";
   return '<button class="ency-hero-card" type="button" data-open-hero="'+esc(x.hero.id)+'" style="--ency-portrait:url(&quot;'+url+'&quot;)"><span class="ency-hero-image"><img src="'+url+'" alt="" loading="lazy" onerror="this.parentElement.classList.add(\'missing\');this.remove()"></span><span class="ency-hero-copy"><b>'+esc(x.name)+'</b><small>'+esc(x.category)+'</small><span class="ency-hero-meta">'+esc(x.roles)+' · '+esc(x.lanes)+'</span><span class="ency-hero-status">'+esc(status)+'</span><span class="ency-hero-fact">'+esc(fact)+'</span><span class="ency-hero-open">Открыть профиль ↗</span></span></button>';
  }
  const visual=x.image?'<img class="ency-info-icon" src="'+esc(x.image)+'" alt="" loading="lazy" decoding="async" onerror="this.remove()">':'<span class="ency-info-icon placeholder">✦</span>';
  const details=x.description||x.summary||x.bonus||"Описание уточняется";
  const meta=x.price?'<small class="ency-item-price">'+esc(String(x.price))+' золота</small>':"";
  return '<article class="ency-info-card visual"><div class="ency-info-visual">'+visual+'</div><div class="ency-info-copy"><b>'+esc(x.name)+'</b><small>'+esc(x.category||"")+'</small><p>'+esc(details)+'</p>'+meta+'</div></article>';
 }).join("")||"<p>Ничего не найдено</p>";
}
let encySkillRequestId=0;
function encySkillSlotLabel(index){
 return ["ПАССИВКА","НАВЫК 1","НАВЫК 2","УЛЬТИМЕЙТ"][index]||("ДОПОЛНИТЕЛЬНАЯ СПОСОБНОСТЬ "+(index-3));
}
function encySkillRussianDescription(skill){
  return skill.description?{text:skill.description,language:"en"}:{text:"Описание навыка пока не опубликовано в проверенном источнике.",language:"unknown"};
}
function encySkillFallback(){
  return '<p class="ency-unverified">Проверенные описания навыков временно недоступны. Попробуй открыть профиль позже.</p>';
}
async function loadEncyHeroSkills(id){
 const requestId=++encySkillRequestId;
 const host=$("encyHeroSkills");
 if(!host)return;
 try{
  const result=await $api("/hero-skills/"+encodeURIComponent(id));
  if(requestId!==encySkillRequestId||!host.isConnected)return;
  if(!result.skills?.length){
   host.innerHTML=encySkillFallback();
   return;
  }
  host.innerHTML=result.skills.map((skill,index)=>{
   const desc=encySkillRussianDescription(skill);
   const icon=skill.iconUrl?'<img src="'+esc(skill.iconUrl)+'" alt="" loading="lazy" decoding="async" onerror="this.remove()">':'<span>✦</span>';
   const meta=skill.cooldownAndCost?'<small class="ency-skill-meta">'+esc(skill.cooldownAndCost)+'</small>':'';
   const lang=desc.language==="en"?' <span class="ency-skill-language">ОРИГИНАЛ EN</span>':"";
   return '<article class="ency-skill-row"><div class="ency-skill-icon">'+icon+'</div><div class="ency-skill-content"><div class="ency-skill-heading"><span class="ency-skill-slot">'+encySkillSlotLabel(index)+'</span><b>'+esc(skill.name)+'</b>'+lang+'</div><p>'+esc(desc.text)+'</p>'+meta+'</div></article>';
  }).join("")+'<p class="ency-skill-credit">Иконки навыков загружены из данных игрового клиента Moonton. Изображения и игровые материалы принадлежат правообладателю.</p>';
 }catch(error){
  if(requestId!==encySkillRequestId||!host.isConnected)return;
  host.innerHTML=encySkillFallback();
 }
}
function encySlug(value){
 return String(value||"").normalize("NFKD").replace(/[\\u0300-\\u036f]/gu,"").toLowerCase().replace(/&/g,"and").replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
function renderEncyHeroRemoteProfile(remote){
  const host=$("encyHeroRemoteProfile");if(!host)return;
  const profile=remote?.profile||{},stats=profile.stats||{},ratings=profile.ratings||{};
  const labels={hp:"Здоровье",hpRegen:"Восстановление здоровья",mana:"Мана",manaRegen:"Восстановление маны",physicalAttack:"Физическая атака",magicPower:"Магическая сила",physicalDefense:"Физическая защита",magicDefense:"Магическая защита",attackSpeed:"Скорость атаки",movementSpeed:"Скорость передвижения",attackRange:"Дальность атаки"};
  const values=Object.entries(labels).filter(([key])=>stats[key]!==undefined&&stats[key]!==null).map(([key,label])=>'<div class="ency-stat-chip"><small>'+esc(label)+'</small><b>'+esc(String(stats[key]))+'</b></div>');
  const ratingNames={offense:"Атака",durability:"Живучесть",abilityEffects:"Эффекты навыков",difficulty:"Сложность"};
  const ratingValues=Object.entries(ratingNames).filter(([key])=>Number.isFinite(Number(ratings[key]))).map(([key,label])=>'<div class="ency-stat-chip"><small>'+esc(label)+'</small><b>'+esc(String(ratings[key]))+'/10</b></div>');
  const sections=[];
  if(values.length)sections.push('<h4>Базовые характеристики</h4><div class="ency-stat-grid">'+values.join("")+'</div>');
  if(ratingValues.length)sections.push('<h4>Оценки из справочника</h4><div class="ency-stat-grid">'+ratingValues.join("")+'</div>');
  if(profile.resource)sections.push('<p><b>Ресурс:</b> '+esc(String(profile.resource))+'</p>');
  if(profile.range)sections.push('<p><b>Тип атаки:</b> '+esc(String(profile.range))+'</p>');
  if(profile.patch)sections.push('<small class="ency-data-credit">Версия данных источника: '+esc(String(profile.patch))+'</small>');
  if(remote?.source?.url)sections.push('<small class="ency-data-credit">Источник: MLBBDex / Mobile Legends Wiki. Изображения принадлежат правообладателям.</small>');
  host.innerHTML=sections.join("")||'<p class="ency-unverified">Дополнительные базовые характеристики пока не опубликованы.</p>';
}
async function loadEncyHeroKnowledge(id){
  const request=++encyKnowledgeRequest;
  try{
   let remote=encyRemoteKnowledge.get(id);
   if(!remote){remote=await $api("/hero-knowledge/"+encodeURIComponent(id));encyRemoteKnowledge.set(id,remote)}
   if(request!==encyKnowledgeRequest||!$("encyHeroModal")||$("encyHeroModal").classList.contains("hidden"))return;
   renderEncyHeroRemoteProfile(remote);
   const badge=$("encyHeroProfileBadge");if(badge&&remote.profile)badge.textContent="Справочные данные загружены";
   const portrait=remote.profile?.images?.portrait;
   if(portrait){
    const cover=$("encyHeroModalContent").querySelector(".ency-hero-cover");
    const image=cover?.querySelector(":scope > img");
    if(cover)cover.style.setProperty("--ency-portrait",'url("'+portrait+'")');
    if(image){image.src=portrait;image.style.display=""}
   }
   const source=remote.source;
   if(source?.url){
    const credits=$("encyHeroModalContent").querySelector(".ency-profile-grid");
    if(credits&&!credits.querySelector(".ency-remote-credit")){
     const note=document.createElement("p");
     note.className="ency-remote-credit";
     note.textContent="Источник данных: MLBBDex / Mobile Legends Wiki (CC BY-SA). Игровые изображения © Moonton.";
     credits.append(note);
    }
   }
  }catch(error){
   if(request!==encyKnowledgeRequest)return;
   const host=$("encyHeroRemoteProfile");if(host)host.innerHTML='<p class="ency-unverified">Не удалось загрузить характеристики. Попробуй позже.</p>';
  }
}
function renderEncyHeroModal(id){
 const hero=(data.heroCatalog||[]).find(x=>x.id===id);
 if(!hero)return;
 const p=(data.heroProfiles||[]).find(x=>x.id===id);
 const root=$("encyHeroModalContent"),name=hero.displayNameRu||hero.nameEn||hero.id,url=encyHeroPortrait(hero);
 const sources=Array.isArray(p?.sources)?p.sources:[];
  const reviewed=p?.patch?.reviewedAt||hero.research?.checkedAt||"Дата проверки не указана";
  const status=p?(p.confidence==="complete"?"Полный справочный профиль":"Частичный справочный профиль"):"Справочный профиль загружается";
  root.innerHTML='<div class="ency-hero-cover" style="--ency-portrait:url(&quot;'+url+'&quot;)"><img src="'+url+'" alt="'+esc(name)+'" onerror="this.style.display=\'none\'"><div class="ency-hero-heading"><small>HERO DATABASE / '+esc(hero.nameEn)+'</small><h2 id="encyHeroTitle">'+esc(name)+'</h2><p>'+esc(hero.nameEn)+' · '+esc((hero.role?.values||[]).join(", ")||"Роль уточняется")+' · '+esc([hero.lanes?.primary,...(hero.lanes?.flexible||[])].filter(Boolean).join(" / ")||"Линия уточняется")+'</p><span id="encyHeroProfileBadge" class="ency-profile-badge">'+esc(status)+'</span></div></div>'+
  '<div class="ency-profile-grid">'+
  '<section class="ency-profile-section wide"><h3>Пассивка и навыки</h3><div id="encyHeroSkills" class="ency-skill-list"><p class="ency-unverified">Загружаем описания навыков...</p></div></section>'+
  '<section class="ency-profile-section wide"><h3>Базовые характеристики</h3><div id="encyHeroRemoteProfile" class="ency-remote-panel"><p class="ency-unverified">Загружаем характеристики...</p></div></section>'+
  '<section class="ency-profile-section wide"><h3>Проверка данных</h3><p>Статус: '+esc(status)+' · Последняя отметка: '+esc(reviewed)+'. Сведения могут изменяться после обновлений игры.</p>'+(sources.length?'<div class="ency-source-list">'+sources.map((source,i)=>'<a href="'+esc(source)+'" target="_blank" rel="noopener">Источник '+(i+1)+' ↗</a>').join("")+'</div>':"")+'</section></div>';
  $("encyHeroModal").classList.remove("hidden");
 document.body.classList.add("ency-modal-open");
 loadEncyHeroSkills(id);
  loadEncyHeroKnowledge(id);
}
$("encyList").addEventListener("click",e=>{
 const card=e.target.closest("[data-open-hero]");
 if(card)renderEncyHeroModal(card.dataset.openHero);
});
$("encyHeroModal").addEventListener("click",e=>{
 if(e.target=== $("encyHeroModal")||e.target.closest("[data-ency-close]")){
  $("encyHeroModal").classList.add("hidden");
  document.body.classList.remove("ency-modal-open");
 }
});
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&!$("encyHeroModal").classList.contains("hidden")){
  $("encyHeroModal").classList.add("hidden");
  document.body.classList.remove("ency-modal-open");
 }
});
$("encySearch").oninput=renderEncy;$("encyFilters").onclick=e=>{let b=e.target.closest("[data-filter]");if(!b)return;encyFilter=b.dataset.filter;document.querySelectorAll("#encyFilters .chip").forEach(x=>x.classList.toggle("active",x===b));renderEncy()};
$("ocr").onclick=async()=>{let f=$("screenshot").files[0];if(!f)return toast("Выбери скриншот");$("ocrStatus").textContent="Загружаю OCR-движок и распознаю текст...";try{if(!window.Tesseract){await new Promise((ok,no)=>{let s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";s.onload=ok;s.onerror=no;document.head.append(s)})}let result=await Tesseract.recognize(f,"eng+rus");let text=result.data.text.toLowerCase();let found=data.heroes.map(h=>h.name).filter(n=>text.includes(n.toLowerCase()));$("ocrStatus").textContent=found.length?"Кандидаты распознавания: "+found.join(", ")+". Добавь проверенных героев вручную.":"Не удалось уверенно распознать названия. Попробуй более чёткий скриншот или добавь героев вручную.";if(found.length)found.forEach(h=>{if(enemies.length<5&&!enemies.includes(h))enemies.push(h)});drawTeams();saveDraft()}catch(e){$("ocrStatus").textContent="OCR не загрузился. Проверь подключение к интернету и попробуй ещё раз."}};
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")syncDraftState()});
window.addEventListener("online",syncDraftState);
init();
