
const $ = id => document.getElementById(id);
const STORAGE = "mlbb_cyber_preview_v01";

let data = {
  heroes: [],
  items: [],
  talents: [],
  emblems: [],
  roles: [],
  ranks: [],
  styles: []
};

let enemies = [];
let allies = [];
let history = [];
let profile = {};

const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) || "{}");
  } catch {
    return {};
  }
};

const saveLocal = () => {
  localStorage.setItem(STORAGE, JSON.stringify({
    enemies,
    allies,
    history,
    profile
  }));
};

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[c]));

function notify(message) {
  const pill = $("statusPill");
  if (pill) pill.textContent = message;
}

function showPage(name) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("hidden", page.id !== `page-${name}`);
  });

  document.querySelectorAll("[data-page]").forEach(button => {
    button.classList.toggle("active", button.dataset.page === name);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function fillSelect(id, values, placeholder) {
  const el = $(id);
  if (!el) return;

  el.innerHTML =
    `<option value="">${esc(placeholder)}</option>` +
    values.map(value =>
      `<option value="${esc(value)}">${esc(value)}</option>`
    ).join("");
}

function populateSelectors() {
  const names = data.heroes.map(hero => hero.name);

  ["myHero", "enemyPick", "allyPick", "profileHero"].forEach(id => {
    fillSelect(id, names, "Выбери героя");
  });

  fillSelect("lane", data.roles, "Выбери линию");
  fillSelect("profileRole", data.roles, "Основная линия");
  fillSelect("profileRank", data.ranks, "Текущий ранг");
  fillSelect("profileStyle", data.styles, "Стиль игры");

  const filter = $("heroRoleFilter");
  if (filter) {
    filter.innerHTML =
      '<option value="">Все линии</option>' +
      data.roles.map(role =>
        `<option value="${esc(role)}">${esc(role)}</option>`
      ).join("");
  }
}

function drawTeams() {
  const draw = (id, list, type) => {
    const container = $(id);
    if (!container) return;

    container.innerHTML = list.map((name, index) => `
      <div class="slot">
        <span>${esc(name)}</span>
        <button class="btn secondary"
          data-remove="${type}"
          data-index="${index}">Убрать</button>
      </div>
    `).join("") || '<p class="hint">Пока никого нет.</p>';
  };

  draw("enemies", enemies, "enemy");
  draw("allies", allies, "ally");
}

function addHero(type) {
  const isEnemy = type === "enemy";
  const select = $(isEnemy ? "enemyPick" : "allyPick");
  const list = isEnemy ? enemies : allies;
  const name = select.value;

  if (!name) return notify("Сначала выбери героя");
  if (list.includes(name)) return notify("Этот герой уже добавлен");
  if (list.length >= 5) return notify("Максимум пять героев");

  list.push(name);
  select.value = "";
  drawTeams();
  saveLocal();
  notify("Состав обновлён");
}

function renderHeroes() {
  const query = ($("heroSearch")?.value || "").toLowerCase();
  const role = $("heroRoleFilter")?.value || "";

  const filtered = data.heroes.filter(hero => {
    const text = [
      hero.name,
      hero.role,
      hero.type,
      ...(hero.tags || [])
    ].join(" ").toLowerCase();

    return text.includes(query) && (!role || hero.role === role);
  });

  $("heroCount").textContent = `${filtered.length} героев`;

  $("heroList").innerHTML = filtered.map(hero => `
    <article class="player">
      <h3>${esc(hero.name)}</h3>
      <small>${esc(hero.role)} · ${esc(hero.type)}</small>
      <p>${esc((hero.tags || []).join(" · "))}</p>
      <button class="btn secondary" data-hero="${esc(hero.name)}">
        Подробнее
      </button>
    </article>
  `).join("") || '<p class="hint">Ничего не найдено.</p>';
}

function showHero(name) {
  const hero = data.heroes.find(item => item.name === name);
  if (!hero) return;

  $("heroDetails").classList.remove("hidden");
  $("heroDetails").innerHTML = `
    <h2>${esc(hero.name)}</h2>
    <p><b>Линия:</b> ${esc(hero.role)}</p>
    <p><b>Тип:</b> ${esc(hero.type)}</p>
    <p><b>Особенности:</b> ${esc((hero.tags || []).join(", ") || "Пока не заполнены")}</p>
    <p><b>Стиль:</b> ${esc((hero.style || []).join(", ") || "Пока не заполнен")}</p>
    <p><b>Сильные стороны:</b> ${esc((hero.strengths || []).join(", ") || "Пока не заполнены")}</p>
  `;
}

function renderAnalysis(result) {
  const counters = (result.counters || []).map((item, index) => `
    <div class="result">
      <b>#${index + 1} ${esc(item.name)}</b>
      <p>${esc(item.reason)}</p>
    </div>
  `).join("") || '<p class="hint">Пока недостаточно данных для контрпиков.</p>';

  const build = (result.build || []).map((item, index) => `
    <div class="slot">
      <span>${index + 1}. ${esc(item)}</span>
    </div>
  `).join("");

  const timing = result.timing || {};

  $("draftResult").innerHTML = `
    <small>DEMO ANALYSIS · PREVIEW 0.1</small>
    <h2>Анализ состава</h2>
    <p>${esc((result.threats || []).join(" · ") || "Явных угроз по тегам не выявлено")}</p>

    <h3>Контрпики</h3>
    ${counters}

    <h3>Рекомендуемая сборка</h3>
    ${build || '<p class="hint">Нет данных о сборке.</p>'}

    <h3>Эмблема и таланты</h3>
    <div class="result">
      <b>${esc(result.emblem || "Не определена")}</b>
      <p>
        Тир 1: ${esc(result.talentTiers?.[0] || "—")}<br>
        Тир 2: ${esc(result.talentTiers?.[1] || "—")}<br>
        Тир 3: ${esc(result.talentTiers?.[2] || "—")}<br>
        Заклинание: ${esc(result.spell || "—")}
      </p>
    </div>

    <h3>План на игру</h3>
    <div class="result"><b>Ранняя стадия</b><p>${esc(timing.early || "—")}</p></div>
    <div class="result"><b>Средняя стадия</b><p>${esc(timing.mid || "—")}</p></div>
    <div class="result"><b>Поздняя стадия</b><p>${esc(timing.late || "—")}</p></div>

    <p>${esc(result.note || "Результат основан на локальной базе проекта.")}</p>
    <p class="hint">Это демонстрационный анализ, а не гарантированный прогноз матча.</p>
  `;

  $("draftResult").classList.remove("hidden");
}

async function runDraft() {
  const lane = $("lane").value;
  const myHero = $("myHero").value;

  if (!lane) return notify("Выбери линию");
  if (!enemies.length) return notify("Добавь хотя бы одного врага");

  $("draftStatus").textContent = "Анализируем состав…";
  $("analyze").disabled = true;

  try {
    const response = await fetch("/api/draft/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lane, myHero, enemies, allies })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Ошибка анализа");

    renderAnalysis(result);

    history.unshift({
      date: new Date().toLocaleString("ru-RU"),
      lane,
      hero: myHero || "Не выбран",
      enemies: [...enemies],
      allies: [...allies],
      result
    });

    history = history.slice(0, 30);
    saveLocal();
    renderHistory();
    $("draftStatus").textContent = "Анализ готов";
    notify("Анализ завершён");
  } catch (error) {
    $("draftStatus").textContent = error.message;
    notify("Не удалось выполнить анализ");
  } finally {
    $("analyze").disabled = false;
  }
}

function renderHistory() {
  $("historyCount").textContent = `${history.length} записей`;

  $("historyList").innerHTML = history.map((entry, index) => `
    <article class="player">
      <small>${esc(entry.date)}</small>
      <h3>${esc(entry.hero)}</h3>
      <p>Линия: ${esc(entry.lane)}</p>
      <p>Противники: ${esc(entry.enemies.join(", "))}</p>
      <button class="btn secondary" data-history="${index}">
        Открыть анализ
      </button>
    </article>
  `).join("") || '<p class="hint">Здесь появятся твои первые анализы.</p>';

  $("dashboardRecent").innerHTML = history.slice(0, 3).map(entry => `
    <div class="slot">
      <span>${esc(entry.hero)} · ${esc(entry.lane)}</span>
      <small>${esc(entry.date)}</small>
    </div>
  `).join("") || '<p class="hint">Пока нет сохранённых анализов.</p>';
}

function loadProfile() {
  $("profileNickname").value = profile.nickname || "";
  $("profileHero").value = profile.hero || "";
  $("profileRole").value = profile.role || "";
  $("profileRank").value = profile.rank || "";
  $("profileStyle").value = profile.style || "";
}

function saveProfile() {
  profile = {
    nickname: $("profileNickname").value.trim(),
    hero: $("profileHero").value,
    role: $("profileRole").value,
    rank: $("profileRank").value,
    style: $("profileStyle").value
  };

  saveLocal();
  $("profileStatus").textContent = "Профиль сохранён на этом устройстве";
  notify("Профиль сохранён");
}

function bindEvents() {
  document.addEventListener("click", event => {
    const pageButton = event.target.closest("[data-page]");
    if (pageButton) showPage(pageButton.dataset.page);

    const removeButton = event.target.closest("[data-remove]");
    if (removeButton) {
      const list = removeButton.dataset.remove === "enemy" ? enemies : allies;
      list.splice(Number(removeButton.dataset.index), 1);
      drawTeams();
      saveLocal();
    }

    const heroButton = event.target.closest("[data-hero]");
    if (heroButton) showHero(heroButton.dataset.hero);

    const historyButton = event.target.closest("[data-history]");
    if (historyButton) {
      const entry = history[Number(historyButton.dataset.history)];
      if (!entry) return;

      $("lane").value = entry.lane;
      $("myHero").value = data.heroes.some(h => h.name === entry.hero) ? entry.hero : "";
      enemies = [...entry.enemies];
      allies = [...entry.allies];
      drawTeams();
      renderAnalysis(entry.result);
      showPage("draft");
    }
  });

  $("addEnemy").onclick = () => addHero("enemy");
  $("addAlly").onclick = () => addHero("ally");
  $("analyze").onclick = runDraft;

  $("newDraft").onclick = () => {
    enemies = [];
    allies = [];
    $("myHero").value = "";
    $("draftResult").classList.add("hidden");
    $("draftStatus").textContent = "";
    drawTeams();
    saveLocal();
    showPage("draft");
  };

  $("testDraft").onclick = () => {
    const sampleEnemies = ["Тигрил", "Эудора", "Кэрри", "Диррот", "Атлас"];
    const sampleAllies = ["Ангела", "Линг", "Теризла"];

    enemies = sampleEnemies.filter(name => data.heroes.some(h => h.name === name));
    allies = sampleAllies.filter(name => data.heroes.some(h => h.name === name));

    $("lane").value = data.roles.includes("Лес") ? "Лес" : data.roles[0] || "";
    $("myHero").value = data.heroes.some(h => h.name === "Хелкарт") ? "Хелкарт" : "";

    drawTeams();
    saveLocal();
    notify("Тестовый состав загружен");
  };

  $("heroSearch").oninput = renderHeroes;
  $("heroRoleFilter").onchange = renderHeroes;
  $("saveProfile").onclick = saveProfile;

  $("clearLocalData").onclick = () => {
    if (!confirm("Удалить локальный профиль, историю и сохранённый состав?")) return;

    localStorage.removeItem(STORAGE);
    enemies = [];
    allies = [];
    history = [];
    profile = {};

    drawTeams();
    renderHistory();
    loadProfile();
    $("profileStatus").textContent = "Локальные данные очищены";
    notify("Данные очищены");
  };
}

async function init() {
  const saved = readLocal();

  enemies = saved.enemies || [];
  allies = saved.allies || [];
  history = saved.history || [];
  profile = saved.profile || {};

  bindEvents();

  try {
    const response = await fetch("/api/data");
    if (!response.ok) throw new Error("Не удалось загрузить базу героев");

    data = await response.json();

    populateSelectors();
    loadProfile();
    drawTeams();
    renderHeroes();
    renderHistory();

    notify("PREVIEW 0.1 · DEMO MODE");
  } catch (error) {
    notify("Ошибка загрузки данных");
    console.error(error);
  }
}

init();
