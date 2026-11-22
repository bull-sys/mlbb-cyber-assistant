
const $ = id => document.getElementById(id);

const STORAGE = {
  profile: "mlbb_preview_profile",
  history: "mlbb_preview_history",
  draft: "mlbb_preview_draft"
};

let data = {
  heroes: [],
  items: [],
  roles: [],
  talents: [],
  emblems: []
};

let enemies = [];
let allies = [];
let selectedHero = null;
let currentResult = null;
let history = [];
let profile = {};

const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    toast("Не удалось сохранить данные на устройстве");
    return false;
  }
};

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function toast(message) {
  const element = document.createElement("div");
  element.textContent = message;
  element.style.cssText =
    "position:fixed;bottom:85px;left:50%;transform:translateX(-50%);" +
    "background:#18384a;border:1px solid #39e5ff;color:white;" +
    "padding:12px 17px;border-radius:10px;z-index:999;" +
    "font-size:12px;max-width:90%;text-align:center";

  document.body.append(element);
  setTimeout(() => element.remove(), 2500);
}

async function api(path, options = {}) {
  const response = await fetch("/api" + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Ошибка сервера");
  }

  return result;
}

function setOptions(element, values, placeholder = "Выбери...") {
  if (!element) return;

  const previous = element.value;

  element.innerHTML =
    (placeholder ? `<option value="">${esc(placeholder)}</option>` : "") +
    values.map(value => {
      const name = typeof value === "string" ? value : value.name;
      return `<option value="${esc(name)}">${esc(name)}</option>`;
    }).join("");

  if ([...element.options].some(option => option.value === previous)) {
    element.value = previous;
  }
}

function navigate(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.toggle("hidden", section.id !== "page-" + page);
  });

  document.querySelectorAll("#nav [data-page]").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function saveDraftState() {
  write(STORAGE.draft, {
    enemies,
    allies,
    lane: $("lane")?.value || "",
    myHero: $("myHero")?.value || ""
  });
}

function drawTeams() {
  for (const [side, heroes] of [
    ["enemies", enemies],
    ["allies", allies]
  ]) {
    const container = $(side);
    if (!container) continue;

    container.innerHTML = heroes.length
      ? heroes.map((hero, index) => `
          <button class="chip active"
            data-side="${side}"
            data-index="${index}">
            ${esc(hero)} ×
          </button>
        `).join("")
      : '<span class="hint">Пока пусто</span>';
  }

  saveDraftState();
}

function addHero(side) {
  const isEnemy = side === "enemies";
  const select = $(isEnemy ? "enemyPick" : "allyPick");
  const list = isEnemy ? enemies : allies;
  const hero = select?.value;

  if (!hero) return toast("Сначала выбери героя");
  if (list.length >= 5) return toast("Максимум 5 героев");
  if (list.includes(hero)) return toast("Этот герой уже добавлен");

  list.push(hero);
  drawTeams();

  if (select) select.value = "";
}

function renderDraftResult(result) {
  const container = $("draftResult");
  if (!container) return;

  container.classList.remove("hidden");

  const counters = (result.counters || []).map((item, index) => `
    <div class="result">
      <b>#${index + 1} ${esc(item.name)}</b>
      <p>${esc(item.reason)}</p>
      <small>Роль: ${esc(item.role)} · Баллы: ${esc(item.score)}</small>
    </div>
  `).join("");

  const build = (result.build || []).map((item, index) => `
    <div class="slot">
      <span>${index + 1}. ${esc(item)}</span>
      <small>${index < 2 ? "Основа" : "Ситуация"}</small>
    </div>
  `).join("");

  const timing = result.timing || {};

  container.innerHTML = `
    <small>DEMO ANALYSIS REPORT</small>
    <h2>Анализ состава</h2>

    <p class="hint">
      Это демонстрационный анализ на основе локальной базы.
      Точные показатели текущего патча не используются.
    </p>

    <h3>Угрозы противника</h3>
    <p>${(result.threats || []).map(esc).join(" · ") || "Явных угроз не выявлено"}</p>

    <h3>Рекомендуемые контрпики</h3>
    ${counters || '<p class="hint">Подходящих контрпиков не найдено</p>'}

    <h3>Рекомендуемая сборка</h3>
    ${build || '<p class="hint">Нет данных о сборке</p>'}

    <h3>Эмблема и таланты</h3>
    <div class="result">
      <b>${esc(result.emblem || "Не определена")}</b>
      <p>
        ${(result.talentTiers || []).map((x, i) =>
          `Тир ${i + 1}: ${esc(x)}`
        ).join("<br>")}
      </p>
      <p>Заклинание: ${esc(result.spell || "Не определено")}</p>
    </div>

    <h3>Тактика по времени игры</h3>
    <div class="result"><b>Ранняя игра</b><p>${esc(timing.early || "Нет данных")}</p></div>
    <div class="result"><b>Средняя игра</b><p>${esc(timing.mid || "Нет данных")}</p></div>
    <div class="result"><b>Поздняя игра</b><p>${esc(timing.late || "Нет данных")}</p></div>

    <p class="hint">${esc(result.aiExplanation || result.note || "")}</p>

    <button class="btn" id="saveDraftHistory">Сохранить анализ</button>
  `;

  $("saveDraftHistory")?.addEventListener("click", saveHistory);
}

async function runDraft() {
  if (!enemies.length) {
    return toast("Добавь хотя бы одного противника");
  }

  const lane = $("lane")?.value;

  if (!lane) return toast("Выбери свою линию");

  const button = $("analyze");
  if (button) {
    button.disabled = true;
    button.textContent = "Анализирую...";
  }

  try {
    const result = await api("/draft/demo", {
      method: "POST",
      body: JSON.stringify({
        lane,
        enemies,
        allies,
        myHero: $("myHero")?.value || ""
      })
    });

    currentResult = result;
    renderDraftResult(result);
    toast("Анализ готов");
  } catch (error) {
    toast(error.message);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Анализировать состав";
    }
  }
}

function saveHistory() {
  if (!currentResult) return;

  const entry = {
    id: Date.now(),
    date: new Date().toLocaleString("ru-RU"),
    lane: $("lane")?.value || "",
    myHero: $("myHero")?.value || "",
    enemies: [...enemies],
    allies: [...allies],
    result: currentResult
  };

  history.unshift(entry);
  history = history.slice(0, 50);

  write(STORAGE.history, history);
  renderHistory();
  toast("Драфт сохранён в историю");
}

function renderHistory() {
  const count = $("historyCount");
  const list = $("historyList");

  if (count) count.textContent = history.length;

  if (!list) return;

  list.innerHTML = history.length
    ? history.map(entry => `
        <article class="card">
          <small>${esc(entry.date)}</small>
          <h3>${esc(entry.myHero || "Герой не выбран")}</h3>
          <p>Линия: ${esc(entry.lane)}</p>
          <p>Противники: ${entry.enemies.map(esc).join(", ")}</p>
          <button class="btn secondary" data-history="${entry.id}">
            Открыть анализ
          </button>
        </article>
      `).join("")
    : '<p class="hint">Здесь появятся сохранённые анализы драфтов.</p>';
}

function openHistory(id) {
  const entry = history.find(item => item.id === Number(id));
  if (!entry) return;

  enemies = [...entry.enemies];
  allies = [...entry.allies];
  currentResult = entry.result;

  if ($("lane")) $("lane").value = entry.lane;
  if ($("myHero")) $("myHero").value = entry.myHero;

  drawTeams();
  renderDraftResult(currentResult);
  navigate("draft");
}

function renderHeroes() {
  const list = $("heroList");
  const count = $("heroCount");

  if (!list) return;

  const query = ($("heroSearch")?.value || "").toLowerCase();
  const role = $("heroRoleFilter")?.value || "";

  const filtered = data.heroes.filter(hero => {
    const matchesName = hero.name.toLowerCase().includes(query);
    const matchesRole = !role || hero.role === role;
    return matchesName && matchesRole;
  });

  if (count) count.textContent = filtered.length;

  list.innerHTML = filtered.map(hero => `
    <button class="card" data-hero="${esc(hero.name)}"
      style="text-align:left;width:100%;color:inherit;cursor:pointer">
      <b>${esc(hero.name)}</b>
      <p>${esc(hero.role || "Роль уточняется")} · ${esc(hero.type || "Тип уточняется")}</p>
    </button>
  `).join("") || '<p class="hint">Герои не найдены</p>';
}

function showHero(name) {
  const hero = data.heroes.find(item => item.name === name);
  if (!hero) return;

  selectedHero = hero;

  const details = $("heroDetails");
  if (!details) return;

  details.classList.remove("hidden");
  details.innerHTML = `
    <div class="card">
      <small>HERO PROFILE</small>
      <h2>${esc(hero.name)}</h2>
      <p>Роль: ${esc(hero.role || "Уточняется")}</p>
      <p>Тип: ${esc(hero.type || "Уточняется")}</p>
      <h3>Особенности</h3>
      <p>${(hero.tags || []).map(esc).join(" · ") || "Данные уточняются"}</p>
      <h3>Стиль игры</h3>
      <p>${(hero.style || []).map(esc).join(" · ") || "Данные уточняются"}</p>
      <h3>Сильные стороны</h3>
      <p>${(hero.strengths || []).map(esc).join(" · ") || "Данные уточняются"}</p>
      <button class="btn" id="useHero">Выбрать для драфта</button>
    </div>
  `;

  $("useHero")?.addEventListener("click", () => {
    if ($("myHero")) $("myHero").value = hero.name;
    navigate("draft");
    saveDraftState();
  });
}

function loadProfile() {
  profile = read(STORAGE.profile, {});

  const fields = {
    profileNickname: "nickname",
    profileHero: "hero",
    profileRole: "role",
    profileRank: "rank",
    profileStyle: "style"
  };

  for (const [id, key] of Object.entries(fields)) {
    if ($(id) && profile[key]) $(id).value = profile[key];
  }
}

function saveProfile() {
  profile = {
    nickname: $("profileNickname")?.value || "",
    hero: $("profileHero")?.value || "",
    role: $("profileRole")?.value || "",
    rank: $("profileRank")?.value || "",
    style: $("profileStyle")?.value || ""
  };

  write(STORAGE.profile, profile);

  if ($("profileStatus")) {
    $("profileStatus").textContent = "Профиль сохранён на устройстве";
  }

  toast("Профиль сохранён");
}

function restoreDraft() {
  const saved = read(STORAGE.draft, null);
  if (!saved) return;

  enemies = Array.isArray(saved.enemies) ? saved.enemies : [];
  allies = Array.isArray(saved.allies) ? saved.allies : [];

  if ($("lane") && saved.lane) $("lane").value = saved.lane;
  if ($("myHero") && saved.myHero) $("myHero").value = saved.myHero;

  drawTeams();
}

async function init() {
  try {
    data = await api("/data");

    setOptions($("enemyPick"), data.heroes);
    setOptions($("allyPick"), data.heroes);
    setOptions($("myHero"), data.heroes);
    setOptions($("profileHero"), data.heroes);

    setOptions($("lane"), data.roles);
    setOptions($("profileRole"), data.roles);
    setOptions($("profileRank"), data.ranks || []);
    setOptions($("profileStyle"), data.styles || []);

    const roleFilter = $("heroRoleFilter");
    if (roleFilter) {
      setOptions(roleFilter, data.roles, "Все линии");
    }

    history = read(STORAGE.history, []);

    restoreDraft();
    loadProfile();
    renderHeroes();
    renderHistory();

    if ($("dashboardRecent")) {
      $("dashboardRecent").innerHTML = history.length
        ? `<p>Последний анализ: ${esc(history[0].date)}</p>
           <p>Герой: ${esc(history[0].myHero || "Не выбран")}</p>`
        : '<p class="hint">Пока нет сохранённых анализов. Создай свой первый драфт!</p>';
    }

    toast("MLBB Cyber Assistant готов");
  } catch (error) {
    toast("Не удалось загрузить базу: " + error.message);
  }
}

// Навигация
$("nav")?.addEventListener("click", event => {
  const button = event.target.closest("[data-page]");
  if (button) navigate(button.dataset.page);
});

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    if (button.closest("#nav")) return;
    navigate(button.dataset.page);
  });
});

// Драфт
$("addEnemy")?.addEventListener("click", () => addHero("enemies"));
$("addAlly")?.addEventListener("click", () => addHero("allies"));
$("analyze")?.addEventListener("click", runDraft);

$("newDraft")?.addEventListener("click", () => {
  enemies = [];
  allies = [];
  currentResult = null;

  if ($("lane")) $("lane").value = "";
  if ($("myHero")) $("myHero").value = "";

  if ($("draftResult")) {
    $("draftResult").innerHTML = "";
    $("draftResult").classList.add("hidden");
  }

  drawTeams();
  navigate("draft");
});

$("testDraft")?.addEventListener("click", () => {
  const names = ["Тигрил", "Эудора", "Кэрри", "Диррот", "Атлас"];

  enemies = names.filter(name =>
    data.heroes.some(hero => hero.name === name)
  );

  allies = ["Ангела", "Линг", "Теризла"].filter(name =>
    data.heroes.some(hero => hero.name === name)
  );

  if ($("lane")) $("lane").value = "Лес";
  if ($("myHero")) {
    $("myHero").value = data.heroes.some(hero => hero.name === "Хелкарт")
      ? "Хелкарт"
      : "";
  }

  drawTeams();
  runDraft();
});

document.addEventListener("click", event => {
  const button = event.target.closest("[data-side]");
  if (!button) return;

  const list = button.dataset.side === "enemies" ? enemies : allies;
  list.splice(Number(button.dataset.index), 1);
  drawTeams();
});

// Герои
$("heroSearch")?.addEventListener("input", renderHeroes);
$("heroRoleFilter")?.addEventListener("change", renderHeroes);

$("heroList")?.addEventListener("click", event => {
  const button = event.target.closest("[data-hero]");
  if (button) showHero(button.dataset.hero);
});

// История
$("historyList")?.addEventListener("click", event => {
  const button = event.target.closest("[data-history]");
  if (button) openHistory(button.dataset.history);
});

// Профиль
$("saveProfile")?.addEventListener("click", saveProfile);

$("clearLocalData")?.addEventListener("click", () => {
  if (!confirm("Удалить сохранённые драфты, историю и профиль на этом устройстве?")) {
    return;
  }

  Object.values(STORAGE).forEach(key => localStorage.removeItem(key));

  enemies = [];
  allies = [];
  history = [];
  profile = {};
  currentResult = null;

  if ($("profileNickname")) $("profileNickname").value = "";
  if ($("profileHero")) $("profileHero").value = "";
  if ($("profileRole")) $("profileRole").value = "";
  if ($("profileRank")) $("profileRank").value = "";
  if ($("profileStyle")) $("profileStyle").value = "";

  if ($("draftResult")) {
    $("draftResult").innerHTML = "";
    $("draftResult").classList.add("hidden");
  }

  drawTeams();
  renderHistory();
  renderHeroes();

  if ($("profileStatus")) {
    $("profileStatus").textContent = "Локальные данные очищены";
  }

  toast("Локальные данные очищены");
});

init();
