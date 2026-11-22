
"use strict";

/* ==========================================
   MLBB CYBER ASSISTANT — PREVIEW 0.1
   Guest mode / Local storage / Mobile first
========================================== */

const STORAGE = "mlbb_cyber_preview_v01";

const $ = (id) => document.getElementById(id);

const state = {
  data: {
    heroes: [],
    heroProfiles: [],
    roles: [],
    ranks: [],
    styles: []
  },
  enemies: [],
  allies: [],
  history: [],
  profile: {},
  currentHero: null
};

const DEFAULT_PROFILE = {
  nickname: "",
  hero: "",
  role: "",
  rank: "",
  style: ""
};

/* ---------- STORAGE ---------- */

function loadLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || "{}");

    state.enemies = Array.isArray(saved.enemies) ? saved.enemies : [];
    state.allies = Array.isArray(saved.allies) ? saved.allies : [];
    state.history = Array.isArray(saved.history) ? saved.history : [];
    state.profile = { ...DEFAULT_PROFILE, ...(saved.profile || {}) };
  } catch {
    state.enemies = [];
    state.allies = [];
    state.history = [];
    state.profile = { ...DEFAULT_PROFILE };
  }
}

function saveLocal() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify({
      enemies: state.enemies,
      allies: state.allies,
      history: state.history,
      profile: state.profile
    }));
  } catch {
    toast("Не удалось сохранить данные на устройстве");
  }
}

/* ---------- HELPERS ---------- */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function toast(message) {
  const old = $("cyberToast");
  if (old) old.remove();

  const el = document.createElement("div");
  el.id = "cyberToast";
  el.textContent = message;
  el.style.cssText = `
    position:fixed;
    left:50%;
    bottom:25px;
    transform:translateX(-50%);
    z-index:9999;
    max-width:90%;
    padding:13px 18px;
    border-radius:12px;
    background:#18384a;
    color:#fff;
    border:1px solid #39e5ff;
    box-shadow:0 5px 25px #0008;
    font-size:13px;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

async function api(path, options = {}) {
  const response = await fetch("/api" + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const result = await response.json().catch(() => ({
    error: "Сервер вернул некорректный ответ"
  }));

  if (!response.ok) {
    throw new Error(result.error || "Ошибка запроса");
  }

  return result;
}

function setOptions(element, values, placeholder = "Выбери...") {
  if (!element) return;

  const options = values.map(value => {
    const name = typeof value === "string" ? value : value.name;
    return `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`;
  }).join("");

  element.innerHTML =
    (placeholder ? `<option value="">${escapeHTML(placeholder)}</option>` : "") +
    options;
}

function getHero(name) {
  return state.data.heroes.find(hero => hero.name === name);
}

function getRole(hero) {
  return hero?.role || hero?.lane || "Роль не указана";
}

/* ---------- NAVIGATION ---------- */

function showPage(page) {
  const allowed = ["dashboard", "draft", "heroes", "history", "profile"];

  if (!allowed.includes(page)) return;

  document.querySelectorAll(".page").forEach(element => {
    element.classList.add("hidden");
  });

  const target = $("page-" + page);
  if (target) target.classList.remove("hidden");

  document.querySelectorAll("[data-page]").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  if (page === "heroes") renderHeroes();
  if (page === "history") renderHistory();
  if (page === "profile") renderProfile();
}

function initNavigation() {
  document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.page);
    });
  });

  if ($("newDraft")) {
    $("newDraft").addEventListener("click", () => showPage("draft"));
  }
}

/* ---------- SELECTS ---------- */

function initSelects() {
  const heroes = state.data.heroes || [];
  const roles = state.data.roles || [];
  const ranks = state.data.ranks || [];
  const styles = state.data.styles || [];

  setOptions($("myHero"), heroes);
  setOptions($("enemyPick"), heroes);
  setOptions($("allyPick"), heroes);
  setOptions($("profileHero"), heroes);

  setOptions($("lane"), roles);
  setOptions($("profileRole"), roles);
  setOptions($("heroRoleFilter"), roles, "Все роли");

  setOptions($("profileRank"), ranks);
  setOptions($("profileStyle"), styles);

  restoreSelectValues();
}

function restoreSelectValues() {
  if ($("profileNickname")) {
    $("profileNickname").value = state.profile.nickname || "";
  }

  if ($("profileHero")) {
    $("profileHero").value = state.profile.hero || "";
  }

  if ($("profileRole")) {
    $("profileRole").value = state.profile.role || "";
  }

  if ($("profileRank")) {
    $("profileRank").value = state.profile.rank || "";
  }

  if ($("profileStyle")) {
    $("profileStyle").value = state.profile.style || "";
  }
}

/* ---------- DRAFT ---------- */

function renderTeam(containerId, team, type) {
  const container = $(containerId);
  if (!container) return;

  if (!team.length) {
    container.innerHTML = `<p class="muted">Пока никто не выбран</p>`;
    return;
  }

  container.innerHTML = team.map((name, index) => {
    const hero = getHero(name);

    return `
      <div class="result">
        <div>
          <b>${escapeHTML(name)}</b>
          <small>${escapeHTML(getRole(hero))}</small>
        </div>
        <button type="button"
          data-remove-team="${type}"
          data-index="${index}">
          Удалить
        </button>
      </div>
    `;
  }).join("");

  container.querySelectorAll("[data-remove-team]").forEach(button => {
    button.addEventListener("click", () => {
      const team = button.dataset.removeTeam === "enemy"
        ? state.enemies
        : state.allies;

      team.splice(Number(button.dataset.index), 1);
      saveLocal();
      renderDraftTeams();
    });
  });
}

function renderDraftTeams() {
  renderTeam("enemies", state.enemies, "enemy");
  renderTeam("allies", state.allies, "ally");
}

function addHeroToTeam(selectId, teamName) {
  const select = $(selectId);
  if (!select || !select.value) {
    toast("Сначала выбери героя");
    return;
  }

  const team = teamName === "enemy" ? state.enemies : state.allies;

  if (team.length >= 5) {
    toast("В команде уже 5 героев");
    return;
  }

  if (team.includes(select.value)) {
    toast("Этот герой уже добавлен");
    return;
  }

  team.push(select.value);
  select.value = "";

  saveLocal();
  renderDraftTeams();
}

function setDraftStatus(message) {
  if ($("draftStatus")) {
    $("draftStatus").textContent = message;
  }
}

function renderDraftResult(result) {
  const container = $("draftResult");
  if (!container) return;

  const threats = Array.isArray(result.threats) ? result.threats : [];
  const counters = Array.isArray(result.counters) ? result.counters : [];
  const build = Array.isArray(result.build) ? result.build : [];
  const tiers = Array.isArray(result.talentTiers) ? result.talentTiers : [];
  const timing = result.timing || {};

  container.classList.remove("hidden");

  container.innerHTML = `
    <div class="card">
      <small>PREVIEW 0.1 / DEMO ANALYSIS</small>
      <h2>Результат анализа</h2>
      <p>Это базовый анализ по локальной базе данных. Он не использует статистику матча в реальном времени.</p>

      <h3>Угрозы состава</h3>
      <p>${threats.length
        ? threats.map(escapeHTML).join(" · ")
        : "Явных угроз по доступным данным не выявлено"}</p>

      <h3>Рекомендуемые контрпики</h3>
      ${counters.length ? counters.map((item, index) => `
        <div class="result">
          <b>#${index + 1} ${escapeHTML(item.name)}</b>
          <p>${escapeHTML(item.reason || "")}</p>
        </div>
      `).join("") : "<p>Нет подходящих рекомендаций</p>"}

      <h3>Сборка предметов</h3>
      ${build.length ? build.map((item, index) => `
        <div class="slot">
          ${index + 1}. ${escapeHTML(typeof item === "string" ? item : item.name)}
        </div>
      `).join("") : "<p>Нет данных о сборке</p>"}

      <h3>Эмблема и таланты</h3>
      <div class="result">
        <b>${escapeHTML(result.emblem || "Не указано")}</b>
        <p>
          Тир 1: ${escapeHTML(tiers[0] || "—")}<br>
          Тир 2: ${escapeHTML(tiers[1] || "—")}<br>
          Тир 3: ${escapeHTML(tiers[2] || "—")}<br>
          Заклинание: ${escapeHTML(result.spell || "—")}
        </p>
      </div>

      <h3>Тайминг</h3>
      <div class="result">
        <b>Ранняя игра</b>
        <p>${escapeHTML(timing.early || "—")}</p>
      </div>
      <div class="result">
        <b>Средняя игра</b>
        <p>${escapeHTML(timing.mid || "—")}</p>
      </div>
      <div class="result">
        <b>Поздняя игра</b>
        <p>${escapeHTML(timing.late || "—")}</p>
      </div>

      <p>${escapeHTML(result.aiExplanation || result.note || "")}</p>
      <small>Демонстрационный режим. Рекомендации не гарантируют победу.</small>
    </div>
  `;
}

async function runDraft() {
  if (!state.enemies.length) {
    toast("Добавь хотя бы одного вражеского героя");
    return;
  }

  const button = $("analyze");
  if (button) button.disabled = true;

  setDraftStatus("Анализируем состав...");

  try {
    const result = await api("/draft/demo", {
      method: "POST",
      body: JSON.stringify({
        lane: $("lane")?.value || "",
        enemies: state.enemies,
        allies: state.allies,
        myHero: $("myHero")?.value || ""
      })
    });

    renderDraftResult(result);
    saveDraftToHistory(result);
    setDraftStatus("Анализ завершён");
  } catch (error) {
    setDraftStatus("Не удалось выполнить анализ");
    toast(error.message);
  } finally {
    if (button) button.disabled = false;
  }
}

function testDraft() {
  const heroes = state.data.heroes;

  if (heroes.length < 3) {
    toast("Недостаточно героев для теста");
    return;
  }

  state.enemies = heroes.slice(0, Math.min(3, heroes.length)).map(hero => hero.name);
  state.allies = heroes.slice(3, Math.min(5, heroes.length)).map(hero => hero.name);

  if ($("lane") && state.data.roles.length) {
    $("lane").value = state.data.roles[0];
  }

  saveLocal();
  renderDraftTeams();
  toast("Тестовый состав добавлен");
}

/* ---------- HISTORY ---------- */

function saveDraftToHistory(result) {
  const record = {
    id: Date.now(),
    date: new Date().toISOString(),
    lane: $("lane")?.value || "",
    myHero: $("myHero")?.value || "",
    enemies: [...state.enemies],
    allies: [...state.allies],
    result
  };

  state.history.unshift(record);
  state.history = state.history.slice(0, 50);

  saveLocal();
  renderHistory();
  renderDashboardRecent();
}

function renderHistory() {
  const container = $("historyList");
  if (!container) return;

  if ($("historyCount")) {
    $("historyCount").textContent = String(state.history.length);
  }

  if (!state.history.length) {
    container.innerHTML = `<p>История пока пуста. Проведи первый анализ драфта!</p>`;
    return;
  }

  container.innerHTML = state.history.map(record => `
    <article class="card">
      <small>${escapeHTML(new Date(record.date).toLocaleString("ru-RU"))}</small>
      <h3>${escapeHTML(record.myHero || "Без выбранного героя")}</h3>
      <p>Линия: ${escapeHTML(record.lane || "—")}</p>
      <p>Враги: ${record.enemies.map(escapeHTML).join(", ")}</p>
      <button type="button" data-open-history="${record.id}">
        Посмотреть состав
      </button>
    </article>
  `).join("");

  container.querySelectorAll("[data-open-history]").forEach(button => {
    button.addEventListener("click", () => {
      const record = state.history.find(item =>
        item.id === Number(button.dataset.openHistory)
      );

      if (!record) return;

      state.enemies = [...record.enemies];
      state.allies = [...record.allies];

      if ($("lane")) $("lane").value = record.lane || "";
      if ($("myHero")) $("myHero").value = record.myHero || "";

      saveLocal();
      renderDraftTeams();
      renderDraftResult(record.result);
      showPage("draft");
    });
  });
}

function renderDashboardRecent() {
  const container = $("dashboardRecent");
  if (!container) return;

  const recent = state.history.slice(0, 3);

  container.innerHTML = recent.length
    ? recent.map(record => `
      <div class="result">
        <b>${escapeHTML(record.myHero || "Анализ драфта")}</b>
        <small>${escapeHTML(new Date(record.date).toLocaleDateString("ru-RU"))}</small>
      </div>
    `).join("")
    : "<p>Здесь появятся твои последние анализы</p>";
}

/* ---------- HEROES ---------- */

function renderHeroes() {
  const container = $("heroList");
  if (!container) return;

  const query = ($("heroSearch")?.value || "").trim().toLowerCase();
  const role = $("heroRoleFilter")?.value || "";

  const heroes = state.data.heroes.filter(hero => {
    const matchesSearch = [
      hero.name,
      hero.role,
      hero.lane,
      ...(hero.tags || [])
    ].join(" ").toLowerCase().includes(query);

    const matchesRole = !role ||
      hero.role === role ||
      hero.lane === role;

    return matchesSearch && matchesRole;
  });

  if ($("heroCount")) {
    $("heroCount").textContent = String(heroes.length);
  }

  container.innerHTML = heroes.map(hero => `
    <button type="button" class="card hero-card"
      data-hero="${escapeHTML(hero.name)}">
      <b>${escapeHTML(hero.name)}</b>
      <small>${escapeHTML(getRole(hero))}</small>
    </button>
  `).join("") || "<p>Герои не найдены</p>";

  container.querySelectorAll("[data-hero]").forEach(button => {
    button.addEventListener("click", () => {
      showHeroDetails(button.dataset.hero);
    });
  });
}

function showHeroDetails(name) {
  const hero = getHero(name);
  const container = $("heroDetails");

  if (!hero || !container) return;

  state.currentHero = name;

  const profile = (state.data.heroProfiles || []).find(item =>
    item.name === name || item.hero === name || item.id === hero.id
  );

  const tags = Array.isArray(hero.tags) ? hero.tags : [];
  const strengths = profile?.strengths || hero.strengths || [];
  const weaknesses = profile?.weaknesses || hero.weaknesses || [];

  container.classList.remove("hidden");

  container.innerHTML = `
    <div class="card">
      <h2>${escapeHTML(hero.name)}</h2>
      <p>Роль: ${escapeHTML(getRole(hero))}</p>
      <p>Тип: ${escapeHTML(hero.type || "Не указан")}</p>
      <h3>Особенности</h3>
      <p>${tags.map(escapeHTML).join(" · ") || "Нет описания тегов"}</p>
      <h3>Сильные стороны</h3>
      <p>${Array.isArray(strengths) ? strengths.map(escapeHTML).join(" · ") : escapeHTML(strengths || "Нет данных")}</p>
      <h3>Слабые стороны</h3>
      <p>${Array.isArray(weaknesses) ? weaknesses.map(escapeHTML).join(" · ") : escapeHTML(weaknesses || "Нет данных")}</p>
      <button type="button" id="heroUseInDraft">Выбрать для драфта</button>
    </div>
  `;

  $("heroUseInDraft")?.addEventListener("click", () => {
    if ($("myHero")) $("myHero").value = name;
    showPage("draft");
    toast("Герой выбран");
  });
}

/* ---------- PROFILE ---------- */

function renderProfile() {
  restoreSelectValues();

  if ($("profileTitle")) {
    $("profileTitle").textContent =
      state.profile.nickname || "Игрок";
  }
}

function saveProfile() {
  state.profile = {
    nickname: $("profileNickname")?.value.trim() || "",
    hero: $("profileHero")?.value || "",
    role: $("profileRole")?.value || "",
    rank: $("profileRank")?.value || "",
    style: $("profileStyle")?.value || ""
  };

  saveLocal();
  renderProfile();

  if ($("profileStatus")) {
    $("profileStatus").textContent = "Профиль сохранён на устройстве";
  }

  toast("Профиль сохранён");
}

/* ---------- EVENTS ---------- */

function initEvents() {
  $("addEnemy")?.addEventListener("click", () => {
    addHeroToTeam("enemyPick", "enemy");
  });

  $("addAlly")?.addEventListener("click", () => {
    addHeroToTeam("allyPick", "ally");
  });

  $("analyze")?.addEventListener("click", runDraft);
  $("testDraft")?.addEventListener("click", testDraft);

  $("heroSearch")?.addEventListener("input", renderHeroes);
  $("heroRoleFilter")?.addEventListener("change", renderHeroes);

  $("saveProfile")?.addEventListener("click", saveProfile);

  $("clearLocalData")?.addEventListener("click", () => {
    const confirmed = confirm(
      "Удалить локальную историю, профиль и сохранённый драфт?"
    );

    if (!confirmed) return;

    localStorage.removeItem(STORAGE);

    state.enemies = [];
    state.allies = [];
    state.history = [];
    state.profile = { ...DEFAULT_PROFILE };

    renderDraftTeams();
    renderHistory();
    renderDashboardRecent();
    renderProfile();

    if ($("draftResult")) {
      $("draftResult").classList.add("hidden");
      $("draftResult").innerHTML = "";
    }

    toast("Локальные данные очищены");
  });

  $("myHero")?.addEventListener("change", saveLocal);
  $("lane")?.addEventListener("change", saveLocal);
}

/* ---------- START ---------- */

async function init() {
  loadLocal();

  try {
    const data = await api("/data");
    state.data = {
      ...state.data,
      ...data
    };

    initSelects();
    initNavigation();
    initEvents();

    renderDraftTeams();
    renderHeroes();
    renderHistory();
    renderDashboardRecent();
    renderProfile();

    if ($("statusPill")) {
      $("statusPill").textContent = "PREVIEW 0.1 · ONLINE";
    }

    showPage("dashboard");
  } catch (error) {
    console.error("MLBB Cyber Assistant:", error);

    if ($("statusPill")) {
      $("statusPill").textContent = "ОШИБКА ПОДКЛЮЧЕНИЯ";
    }

    toast("Не удалось загрузить базу данных: " + error.message);
  }
}

document.addEventListener("DOMContentLoaded", init);
