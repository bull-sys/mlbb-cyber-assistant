import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("draft UI exposes both the legacy analyzer roster and canonical catalog IDs", async () => {
  const source = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  assert.match(source, /function draftOptions\(el\)/);
  assert.match(source, /data\.draftHeroOptions/);
  assert.match(source, /Старая база · анализ доступен/);
  assert.match(source, /Каталог героев · полный список/);
  assert.match(source, /analysisSupported/);
  assert.match(source, /filter\(hero=>hero\.analysisSupported\)/);
});

test("draft UI restores catalog IDs and renders their visible names", async () => {
  const source = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  assert.match(source, /data\.draftHeroOptions\|\|\[\]\)\.map\(h=>h\.id\)/);
  assert.match(source, /function draftHeroLabel\(value\)/);
  assert.match(source, /const name=draftHeroLabel\(value\)/);
  assert.match(source, /esc\(name\)/);
});

test("limited analysis never renders empty or fabricated counter recommendations", async () => {
  const source = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  const limited = source.indexOf('if(d.analysisStatus==="limited")');
  assert.ok(limited >= 0);
  const limitedEnd = source.indexOf("return;", limited);
  assert.ok(limitedEnd > limited);
  const limitedBranch = source.slice(limited, limitedEnd);
  assert.match(limitedBranch, /ОГРАНИЧЕННЫЙ АНАЛИЗ/);
  assert.match(limitedBranch, /d\.unsupportedHeroes/);
  assert.match(limitedBranch, /esc\(d\.note\)/);
  assert.doesNotMatch(limitedBranch, /d\.counters\.map/);
});

test("server resolves every selected catalog hero to a tactical profile without legacy mapping", async () => {
  const source = await readFile(new URL("../server/index.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /if\(unsupported\.length\)/);
  assert.match(source, /const draftAnalysisProfiles=getDraftHeroAnalysisProfiles\(\)/);
  assert.match(source, /const unresolved=selectedValues\.filter/);
  assert.match(source, /const legacyName=value=>resolveDraftHeroSelection\(value\)\.legacyName/);
  assert.match(source, /const result=analyze\(\{/);
});

test("draft picker renders a live selected-hero strip with portraits and team capacity", async () => {
  const source = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  assert.match(source, /const selectedValues=pickerTarget==="myHero"/);
  assert.match(source, /picker-selection-slots/);
  assert.match(source, /heroPortraitUrl\(hero\)/);
  assert.match(source, /current\.length\+" \/ 5"/);
  assert.match(source, /Добавь героев в состав/);
});

test("draft picker uses a circular neon selection grid and respects reduced motion", async () => {
  const css = await readFile(new URL("../public/style.css", import.meta.url), "utf8");
  assert.match(css, /CYBER ARENA · draft selection stage polish/);
  assert.match(css, /\.hero-tile\.selected\s*\{/);
  assert.match(css, /border-radius:50%/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /\.picker-selection-slots/);
});

 
test("CYBER ARENA draft stage renders ten interactive team slots and a separate signature pick", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../public/style.css", import.meta.url), "utf8");
  assert.match(html, /class="arena-draft-stage"/);
  assert.match(html, /id="enemies" class="arena-slots enemy-slots"/);
  assert.match(html, /id="allies" class="arena-slots ally-slots"/);
  assert.match(html, /id="arenaMyHeroPortrait"/);
  assert.match(app, /function drawTeams\(\)[\s\S]*?Array\.from\(\{length:5\}/);
  assert.ok(app.includes(`data-side="'+side+'" data-i="'+slot+'"`));
  assert.match(app, /arenaMyHeroName/);
  assert.match(css, /\.arena-slots\{display:grid;grid-template-columns:repeat\(5/);
  assert.match(css, /\.enemy-team\{--arena-accent:#ff5eae/);
  assert.match(css, /\.ally-team\{--arena-accent:#51eaff/);
});


test("manual draft selection animates only the chosen slot and marks both full teams", async () => {
  const app = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  assert.match(app, /let draftEntrance=null/);
  assert.match(app, /draftEntrance=\{side:pickerTarget,value\}/);
  assert.match(app, /arena-slot-enter/);
  assert.match(app, /enemyCount===5&&allyCount===4/);
  assert.match(app, /ПИК СОБРАН/);
  assert.match(html, /data-arena-completion/);
});

test("draft report entrance and hero materialization respect reduced motion", async () => {
  const app = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../public/style.css", import.meta.url), "utf8");
  assert.match(app, /function animateDraftReport\(\)/);
  assert.match(app, /animateDraftReport\(\)/);
  assert.match(css, /@keyframes arena-slot-materialize/);
  assert.match(css, /@keyframes arena-report-arrive/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\.arena-slot-enter/);
  assert.doesNotMatch(app, /lastPick|last-pick|последнего пика/i);
});


test("tactical report starts with a scan-first composition and decision overview", async () => {
  const app = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../public/style.css", import.meta.url), "utf8");
  assert.match(app, /const reportRoster=\(values,side\)=>values\.map/);
  assert.match(app, /report-rosters/);
  assert.match(app, /reportRoster\(enemies,"enemy"\)/);
  assert.match(app, /priorityCounter=d\.counters\?\.\[0\]/);
  assert.match(app, /priorityPlan=d\.teamPlan\?\.\[0\]/);
  assert.match(app, /ПО ДАННЫМ АНАЛИЗА/);
  assert.match(css, /\.report-overview\{/);
  assert.match(css, /\.report-decision-grid/);
  assert.match(css, /@media\(max-width:650px\)\{\.report-overview/);
});


test("counter recommendations distinguish direct matchup evidence from situational options", async () => {
  const app = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../public/style.css", import.meta.url), "utf8");
  assert.match(app, /item\.matchupType==="direct-counter"/);
  assert.match(app, /item\.matchupType==="mixed-matchup"/);
  assert.match(app, /item\.matchupType==="ranked-advantage"/);
  assert.match(app, /item\.matchupType==="ranked-risk"/);
  assert.match(app, /rankedMatchupMeta/);
  assert.match(app, /не статистика выбранной линии/);
  assert.match(app, /counter-ranked-evidence/);
  assert.match(css, /\.counter-ranked-evidence/);
  assert.match(app, /СМЕШАННЫЙ МАТЧАП/);
  assert.match(app, /item\.matchedEnemies/);
  assert.match(app, /counter-matchup-signal/);
  assert.match(app, /counter-matchup-risk/);
  assert.match(app, /counter-method-note/);
  assert.match(app, /не гарантирует победу/);
  assert.doesNotMatch(app, /counter-score/);
  assert.match(css, /\.counter-kind/);
  assert.match(css, /\.counter-method-note/);
});


test("draft places three lane-filtered recommendations inside the player pick slot", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  const validation = await readFile(new URL("../server/draft-validation.js", import.meta.url), "utf8");
  assert.match(html, /id="arenaMyHeroRecommendations"/);
  assert.doesNotMatch(html, /id="openMyHeroPicker"/);
  assert.match(app, /draftRecommendations=\(d\.counters\|\|\[\]\)\.slice\(0,3\)/);
  assert.match(app, /data-own-recommendation/);
  assert.match(app, /arenaMyHeroRecommendations.*runDraft\(\)/);
  assert.match(validation, /allies\.length > 4/);
});
