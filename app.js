/* ============================================================
   Production Line Planner — App Logic
   - State persisted to localStorage (auto-save)
   - Editable spreadsheet-like table per project
   - Gantt chart rendered from same data
   ============================================================ */

const STORAGE_KEY = "plp_state_v1";

let STATE = null;          // full app state (all projects + tasks)
let ACTIVE_PROJECT = null; // id of currently selected project
let SORT_COL = null;
let SORT_DIR = 1;          // 1 asc, -1 desc
let FILTERS = {};          // per-project filter state, keyed by project id
let saveTimer = null;
let pendingDeleteAction = null;

/* ---------------- Init / persistence ---------------- */

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.projects && parsed.projects.length) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not parse saved state, falling back to seed data.", e);
  }
  // Build fresh state from seed
  return {
    projects: SEED_PROJECTS.map(p => ({
      id: p.id,
      name: p.name,
      color: p.color,
      description: p.description,
      tasks: p.tasks.map(t => ({ ...t }))
    })),
    activeProject: SEED_PROJECTS[0].id,
    lastSaved: null
  };
}

function persist(showToast) {
  STATE.lastSaved = new Date().toISOString();
  STATE.activeProject = ACTIVE_PROJECT;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
    flashSaveIndicator();
    if (showToast) showToastMsg("Changes saved");
  } catch (e) {
    showToastMsg("Could not save — storage may be full");
    console.error(e);
  }
}

function scheduleSave(showToast) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => persist(showToast), 220);
}

function resetAllData() {
  localStorage.removeItem(STORAGE_KEY);
  STATE = loadState();
  ACTIVE_PROJECT = STATE.activeProject;
  FILTERS = {};
  SORT_COL = null;
  render();
  showToastMsg("Reset to default plan");
}

/* ---------------- Helpers ---------------- */

function getProject(id) {
  return STATE.projects.find(p => p.id === id);
}

function uid(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 8);
}

function parseDate(s) {
  // expects YYYY-MM-DD
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtDateShort(s) {
  if (!s) return "—";
  const d = parseDate(s);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function daysBetween(a, b) {
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function statusLabel(val) {
  const found = STATUS_OPTIONS.find(s => s.value === val);
  return found ? found.label : val;
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToastMsg(msg) {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  toastMsg.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("show"), 1900);
}

function flashSaveIndicator() {
  const dot = document.getElementById("saveDot");
  const label = document.getElementById("saveLabel");
  if (!dot) return;
  dot.classList.remove("pulsing");
  void dot.offsetWidth; // restart animation
  dot.classList.add("pulsing");
  if (label) {
    const t = new Date();
    label.textContent = "Saved " + t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
}

/* ---------------- Confirm modal ---------------- */

function openConfirm(title, text, onOk) {
  const overlay = document.getElementById("confirmModal");
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmText").textContent = text;
  pendingDeleteAction = onOk;
  overlay.classList.add("show");
}

function closeConfirm() {
  document.getElementById("confirmModal").classList.remove("show");
  pendingDeleteAction = null;
}

document.getElementById("confirmCancel").addEventListener("click", closeConfirm);
document.getElementById("confirmOk").addEventListener("click", () => {
  if (pendingDeleteAction) pendingDeleteAction();
  closeConfirm();
});
document.getElementById("confirmModal").addEventListener("click", (e) => {
  if (e.target.id === "confirmModal") closeConfirm();
});

/* ---------------- Image lightbox ---------------- */

function openImageLightbox() {
  const img = document.getElementById("layoutImg");
  if (!img || img.closest(".layout-image-wrap").classList.contains("layout-image-missing")) return;
  const overlay = document.getElementById("lightboxOverlay");
  const lbImg = document.getElementById("lightboxImg");
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  overlay.classList.add("show");
}

function closeImageLightbox() {
  document.getElementById("lightboxOverlay").classList.remove("show");
}

document.getElementById("lightboxClose").addEventListener("click", closeImageLightbox);
document.getElementById("lightboxOverlay").addEventListener("click", (e) => {
  if (e.target.id === "lightboxOverlay") closeImageLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeImageLightbox();
    closeConfirm();
  }
});

/* ---------------- Render: Sidebar ---------------- */

function renderSidebar() {
  const lastSavedLabel = STATE.lastSaved
    ? new Date(STATE.lastSaved).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const navItems = STATE.projects.map(p => {
    const total = p.tasks.length;
    const active = p.id === ACTIVE_PROJECT ? "active" : "";
    return `
      <button class="project-btn ${active}" data-project="${p.id}">
        <span class="project-dot" style="background:${p.color}"></span>
        <span class="project-btn-label">${escapeHtml(p.name)}</span>
        <span class="project-btn-count">${total}</span>
      </button>
    `;
  }).join("");

  return `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">PL</div>
        <div class="brand-text">Production Line<br>Planner</div>
      </div>
      <div class="brand-sub">Development Projects</div>

      <div class="nav-label">Projects</div>
      <nav class="project-nav">${navItems}</nav>

      <div class="sidebar-foot">
        <div class="save-indicator">
          <span class="save-dot" id="saveDot"></span>
          <span id="saveLabel">Saved ${lastSavedLabel}</span>
        </div>
        <button class="reset-btn" id="resetBtn">Reset to default plan</button>
      </div>
    </aside>
  `;
}

/* ---------------- Render: KPIs ---------------- */

function computeKpis(project) {
  const tasks = project.tasks;
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const atRisk = tasks.filter(t => t.status === "at-risk").length;
  const delayed = tasks.filter(t => t.status === "delayed").length;
  const avgProgress = total ? Math.round(tasks.reduce((s, t) => s + Number(t.progress || 0), 0) / total) : 0;

  let earliestStart = null, latestEnd = null;
  tasks.forEach(t => {
    const s = parseDate(t.start), e = parseDate(t.end);
    if (!earliestStart || s < earliestStart) earliestStart = s;
    if (!latestEnd || e > latestEnd) latestEnd = e;
  });
  const durationDays = earliestStart && latestEnd ? daysBetween(earliestStart, latestEnd) : 0;
  const today = new Date();
  today.setHours(0,0,0,0);
  let daysRemaining = null;
  if (latestEnd) daysRemaining = daysBetween(today, latestEnd);

  return { total, completed, atRisk, delayed, avgProgress, earliestStart, latestEnd, durationDays, daysRemaining };
}

function renderKpis(project) {
  const k = computeKpis(project);
  const overallColor = k.avgProgress >= 70 ? "var(--sage)" : k.avgProgress >= 35 ? "var(--blue)" : "var(--amber)";
  const riskTotal = k.atRisk + k.delayed;
  const riskColor = riskTotal === 0 ? "var(--sage)" : k.delayed > 0 ? "var(--red)" : "var(--amber)";

  let dueLabel, dueSub;
  if (k.daysRemaining === null) {
    dueLabel = "—"; dueSub = "No tasks yet";
  } else if (k.daysRemaining < 0) {
    dueLabel = Math.abs(k.daysRemaining) + "d"; dueSub = "Past planned finish";
  } else {
    dueLabel = k.daysRemaining + "d"; dueSub = "Until planned finish";
  }

  return `
    <div class="kpi-strip">
      <div class="kpi-card">
        <div class="kpi-label">Total Tasks</div>
        <div class="kpi-value">${k.total}</div>
        <div class="kpi-sub">${k.completed} completed</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Overall Progress</div>
        <div class="kpi-value">${k.avgProgress}%</div>
        <div class="kpi-bar-track"><div class="kpi-bar-fill" style="width:${k.avgProgress}%; background:${overallColor}"></div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Needs Attention</div>
        <div class="kpi-value" style="color:${riskColor}">${riskTotal}</div>
        <div class="kpi-sub">${k.atRisk} at risk &middot; ${k.delayed} delayed</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Timeline Span</div>
        <div class="kpi-value">${k.durationDays}d</div>
        <div class="kpi-sub">${k.earliestStart ? fmtDateShort(toIso(k.earliestStart)) : "—"} &rarr; ${k.latestEnd ? fmtDateShort(toIso(k.latestEnd)) : "—"}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Time Remaining</div>
        <div class="kpi-value">${dueLabel}</div>
        <div class="kpi-sub">${dueSub}</div>
      </div>
    </div>
  `;
}

function toIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}

/* ---------------- Render: Gantt Chart ---------------- */

const DAY_WIDTH = 11; // px per day in gantt timeline

function getGanttRange(tasks) {
  if (!tasks.length) {
    const today = new Date(); today.setHours(0,0,0,0);
    return { start: addDays(today, -7), end: addDays(today, 30) };
  }
  let min = null, max = null;
  tasks.forEach(t => {
    const s = parseDate(t.start), e = parseDate(t.end);
    if (!min || s < min) min = s;
    if (!max || e > max) max = e;
  });
  // pad with a bit of breathing room
  min = addDays(min, -4);
  max = addDays(max, 6);
  return { start: min, end: max };
}

function renderMonthHeader(range) {
  const months = [];
  let cursor = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
  const endCursor = new Date(range.end.getFullYear(), range.end.getMonth(), 1);
  while (cursor <= endCursor) {
    const monthStart = new Date(Math.max(cursor, range.start));
    const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const monthEnd = new Date(Math.min(nextMonth - 1, range.end));
    const widthDays = daysBetween(monthStart, monthEnd) + 1;
    months.push({
      label: cursor.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      width: widthDays * DAY_WIDTH
    });
    cursor = nextMonth;
  }
  return months.map(m => `<div class="gantt-month" style="width:${m.width}px">${m.label}</div>`).join("");
}

function renderGanttGridlines(range) {
  const totalDays = daysBetween(range.start, range.end) + 1;
  let html = "";
  // weekly gridlines for a cleaner look
  for (let i = 0; i < totalDays; i += 7) {
    html += `<div class="gantt-gridline" style="width:${7 * DAY_WIDTH}px"></div>`;
  }
  return html;
}

function renderGantt(project, filteredTasks) {
  const tasks = filteredTasks;
  const range = getGanttRange(tasks.length ? tasks : project.tasks);
  const totalWidth = (daysBetween(range.start, range.end) + 1) * DAY_WIDTH;
  const today = new Date(); today.setHours(0,0,0,0);
  const todayOffset = daysBetween(range.start, today) * DAY_WIDTH;
  const showToday = today >= range.start && today <= range.end;

  const rowLabels = tasks.map(t => `
    <div class="gantt-rowlabel" title="${escapeHtml(t.name)}">
      <span class="swatch dot-${t.status}"></span>
      <span class="rl-text">${escapeHtml(t.name)}</span>
    </div>
  `).join("");

  const bars = tasks.map((t, i) => {
    const s = parseDate(t.start), e = parseDate(t.end);
    const left = daysBetween(range.start, s) * DAY_WIDTH;
    const widthDays = Math.max(1, daysBetween(s, e) + 1);
    const width = widthDays * DAY_WIDTH;
    const top = i * 46 + 9;
    const tinyClass = width < 70 ? "tiny" : "";
    const progress = Math.min(100, Math.max(0, Number(t.progress || 0)));
    return `
      <div class="gantt-bar status-${t.status} ${tinyClass}"
           style="left:${left}px; width:${width}px; top:${top}px;"
           title="${escapeHtml(t.name)} • ${fmtDateShort(t.start)} – ${fmtDateShort(t.end)} • ${progress}%">
        <div class="bar-progress" style="width:${progress}%"></div>
        <span class="bar-label">${escapeHtml(t.name)}</span>
      </div>
    `;
  });

  const rows = tasks.map((t, i) => `
    <div class="gantt-row">
      <div class="gantt-gridlines">${renderGanttGridlines(range)}</div>
    </div>
  `).join("");

  const todayLine = showToday ? `<div class="gantt-today" style="left:${todayOffset}px; height:${tasks.length * 46}px"></div>` : "";

  const emptyMsg = tasks.length === 0
    ? `<div class="empty-state">No tasks match the current filter. Try adjusting filters above.</div>`
    : "";

  return `
    <div class="gantt-scroll">
      <div class="gantt">
        <div class="gantt-rowlabels">
          <div class="gantt-corner">Task</div>
          ${rowLabels}
        </div>
        <div class="gantt-chart-area" style="min-width:${totalWidth}px">
          <div class="gantt-months" style="width:${totalWidth}px">${renderMonthHeader(range)}</div>
          <div class="gantt-rows" style="width:${totalWidth}px; height:${tasks.length * 46}px; position:relative;">
            ${rows}
            ${todayLine}
            ${bars.join("")}
          </div>
        </div>
      </div>
      ${emptyMsg}
    </div>
  `;
}

function renderLegend() {
  return `
    <div class="legend">
      <div class="legend-item"><span class="legend-swatch" style="background:var(--slate)"></span>Not Started</div>
      <div class="legend-item"><span class="legend-swatch" style="background:var(--blue)"></span>On Track</div>
      <div class="legend-item"><span class="legend-swatch" style="background:var(--amber)"></span>At Risk</div>
      <div class="legend-item"><span class="legend-swatch" style="background:var(--red)"></span>Delayed</div>
      <div class="legend-item"><span class="legend-swatch" style="background:var(--sage)"></span>Completed</div>
    </div>
  `;
}

/* ---------------- Render: Layout Image ---------------- */

function renderLayoutImage(project) {
  // Image file is expected to sit in the same repo/folder as index.html,
  // named exactly after the project, e.g. "Chanachur Line.png"
  const fileName = project.name + ".png";
  const src = encodeURIComponent(fileName).replace(/%20/g, "%20");

  return `
    <div class="layout-image-wrap">
      <img
        src="${src}"
        alt="${escapeHtml(project.name)} layout"
        class="layout-image"
        id="layoutImg"
        onerror="this.closest('.layout-image-wrap').classList.add('layout-image-missing')"
      >
      <div class="layout-image-fallback">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
        <div class="layout-image-fallback-title">Layout image not found</div>
        <div class="layout-image-fallback-sub">Add a file named <code>${escapeHtml(fileName)}</code> in the same folder as index.html in the GitHub repo.</div>
      </div>
    </div>
  `;
}


/* ---------------- Filtering & Sorting ---------------- */

function getFilterState(projectId) {
  if (!FILTERS[projectId]) {
    FILTERS[projectId] = { status: "all", priority: "all", owner: "all", search: "" };
  }
  return FILTERS[projectId];
}

function applyFiltersAndSort(project) {
  const f = getFilterState(project.id);
  let tasks = project.tasks.slice();

  if (f.status !== "all") tasks = tasks.filter(t => t.status === f.status);
  if (f.priority !== "all") tasks = tasks.filter(t => t.priority === f.priority);
  if (f.owner !== "all") tasks = tasks.filter(t => t.owner === f.owner);
  if (f.search && f.search.trim()) {
    const q = f.search.trim().toLowerCase();
    tasks = tasks.filter(t => t.name.toLowerCase().includes(q) || (t.owner || "").toLowerCase().includes(q));
  }

  if (SORT_COL) {
    tasks.sort((a, b) => {
      let av = a[SORT_COL], bv = b[SORT_COL];
      if (SORT_COL === "start" || SORT_COL === "end") {
        av = parseDate(av).getTime(); bv = parseDate(bv).getTime();
      } else if (SORT_COL === "progress") {
        av = Number(av); bv = Number(bv);
      } else {
        av = String(av).toLowerCase(); bv = String(bv).toLowerCase();
      }
      if (av < bv) return -1 * SORT_DIR;
      if (av > bv) return 1 * SORT_DIR;
      return 0;
    });
  }

  return tasks;
}

function getUniqueOwners(project) {
  return [...new Set(project.tasks.map(t => t.owner))].sort();
}

/* ---------------- Render: Toolbar ---------------- */

function renderToolbar(project, visibleCount) {
  const f = getFilterState(project.id);
  const owners = getUniqueOwners(project);

  const statusOpts = STATUS_OPTIONS.map(s => `<option value="${s.value}" ${f.status===s.value?"selected":""}>${s.label}</option>`).join("");
  const priorityOpts = PRIORITY_OPTIONS.map(p => `<option value="${p}" ${f.priority===p?"selected":""}>${p}</option>`).join("");
  const ownerOpts = owners.map(o => `<option value="${escapeHtml(o)}" ${f.owner===o?"selected":""}>${escapeHtml(o)}</option>`).join("");

  return `
    <div class="toolbar">
      <div class="toolbar-group">
        <label for="filterSearch">Search</label>
        <input type="text" class="text-input" id="filterSearch" placeholder="Task or owner…" value="${escapeHtml(f.search)}">
      </div>
      <div class="toolbar-group">
        <label for="filterStatus">Status</label>
        <select id="filterStatus">
          <option value="all" ${f.status==="all"?"selected":""}>All</option>
          ${statusOpts}
        </select>
      </div>
      <div class="toolbar-group">
        <label for="filterPriority">Priority</label>
        <select id="filterPriority">
          <option value="all" ${f.priority==="all"?"selected":""}>All</option>
          ${priorityOpts}
        </select>
      </div>
      <div class="toolbar-group">
        <label for="filterOwner">Owner</label>
        <select id="filterOwner">
          <option value="all" ${f.owner==="all"?"selected":""}>All</option>
          ${ownerOpts}
        </select>
      </div>
      <button class="btn" id="clearFiltersBtn">Clear filters</button>
      <div class="toolbar-spacer"></div>
      <div class="result-count">${visibleCount} of ${project.tasks.length} tasks</div>
    </div>
  `;
}

/* ---------------- Render: Editable Table ---------------- */

function sortArrow(col) {
  if (SORT_COL !== col) return "";
  return SORT_DIR === 1 ? '<span class="sort-arrow">&#9650;</span>' : '<span class="sort-arrow">&#9660;</span>';
}

function renderTable(project, tasks) {
  if (!tasks.length) {
    return `
      <div class="table-wrap">
        <div class="empty-state">No tasks to show. Clear filters or add a new task below.</div>
      </div>
      <div class="add-row-bar">
        <button class="add-row-btn" id="addTaskBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          Add task
        </button>
      </div>
    `;
  }

  const rows = tasks.map(t => {
    const statusOpts = STATUS_OPTIONS.map(s => `<option value="${s.value}" ${t.status===s.value?"selected":""}>${s.label}</option>`).join("");
    const priorityOpts = PRIORITY_OPTIONS.map(p => `<option value="${p}" ${t.priority===p?"selected":""}>${p}</option>`).join("");
    const progress = Math.min(100, Math.max(0, Number(t.progress || 0)));
    const progColor = t.status === "delayed" ? "var(--red)" : t.status === "at-risk" ? "var(--amber)" : t.status === "completed" ? "var(--sage)" : "var(--blue)";

    return `
      <tr data-task-id="${t.id}">
        <td class="task-name-cell">
          <input type="text" class="cell-input" data-field="name" value="${escapeHtml(t.name)}" placeholder="Task name">
        </td>
        <td class="owner-cell">
          <input type="text" class="cell-input" data-field="owner" value="${escapeHtml(t.owner)}" placeholder="Owner">
        </td>
        <td>
          <input type="date" class="cell-input" data-field="start" value="${t.start}">
        </td>
        <td>
          <input type="date" class="cell-input" data-field="end" value="${t.end}">
        </td>
        <td>
          <select class="cell-input" data-field="status">${statusOpts}</select>
        </td>
        <td>
          <select class="cell-input" data-field="priority">${priorityOpts}</select>
        </td>
        <td>
          <div class="progress-cell">
            <div class="kpi-bar-track"><div class="kpi-bar-fill" style="width:${progress}%; background:${progColor}"></div></div>
            <input type="number" class="cell-input" data-field="progress" min="0" max="100" value="${progress}">
          </div>
        </td>
        <td>
          <button class="row-del-btn" data-action="delete-task" title="Delete task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6h12Z"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join("");

  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th class="sortable" data-sort="name">Task ${sortArrow("name")}</th>
            <th class="sortable" data-sort="owner">Owner ${sortArrow("owner")}</th>
            <th class="sortable" data-sort="start">Start ${sortArrow("start")}</th>
            <th class="sortable" data-sort="end">End ${sortArrow("end")}</th>
            <th class="sortable" data-sort="status">Status ${sortArrow("status")}</th>
            <th class="sortable" data-sort="priority">Priority ${sortArrow("priority")}</th>
            <th class="sortable" data-sort="progress">Progress ${sortArrow("progress")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="add-row-bar">
      <button class="add-row-btn" id="addTaskBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Add task
      </button>
    </div>
  `;
}

/* ---------------- Main Render ---------------- */

function render() {
  const project = getProject(ACTIVE_PROJECT);
  const visibleTasks = applyFiltersAndSort(project);

  const html = `
    ${renderSidebar()}
    <main class="main">
      <div class="topbar">
        <div>
          <h1 class="topbar-title">${escapeHtml(project.name)}</h1>
          <div class="topbar-meta">
            <span>${escapeHtml(project.description)}</span>
          </div>
        </div>
        <div class="topbar-actions">
          <button class="btn" id="exportCsvBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
            Export CSV
          </button>
          <button class="btn primary" id="addTaskBtnTop">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Add task
          </button>
        </div>
      </div>

      ${renderKpis(project)}

      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">Layout <span class="tag">Reference Image</span></div>
        </div>
        <div class="panel-body">
          ${renderLayoutImage(project)}
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">Timeline <span class="tag">Gantt</span></div>
          ${renderLegend()}
        </div>
        <div class="panel-body">
          ${renderGantt(project, visibleTasks)}
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">Task Data <span class="tag">Editable</span></div>
        </div>
        ${renderToolbar(project, visibleTasks.length)}
        <div class="panel-body">
          ${renderTable(project, visibleTasks)}
        </div>
      </div>

      <div class="footer-note">All changes are saved automatically to this browser. Use Export CSV to back up or share a snapshot.</div>
    </main>
  `;

  document.getElementById("app").innerHTML = html;
  bindEvents();
}

/* ---------------- Event binding ---------------- */

function bindEvents() {
  // Sidebar project switch
  document.querySelectorAll(".project-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      ACTIVE_PROJECT = btn.dataset.project;
      SORT_COL = null;
      persist(false);
      render();
    });
  });

  // Reset
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      openConfirm(
        "Reset all projects?",
        "This will erase every edit you've made and restore the original default plan for all 5 projects. This cannot be undone.",
        resetAllData
      );
    });
  }

  // Toolbar filters
  bindIfExists("filterSearch", "input", (e) => {
    getFilterState(ACTIVE_PROJECT).search = e.target.value;
    renderTableAndGanttOnly();
  });
  bindIfExists("filterStatus", "change", (e) => {
    getFilterState(ACTIVE_PROJECT).status = e.target.value;
    renderTableAndGanttOnly();
  });
  bindIfExists("filterPriority", "change", (e) => {
    getFilterState(ACTIVE_PROJECT).priority = e.target.value;
    renderTableAndGanttOnly();
  });
  bindIfExists("filterOwner", "change", (e) => {
    getFilterState(ACTIVE_PROJECT).owner = e.target.value;
    renderTableAndGanttOnly();
  });
  bindIfExists("clearFiltersBtn", "click", () => {
    FILTERS[ACTIVE_PROJECT] = { status: "all", priority: "all", owner: "all", search: "" };
    render();
  });

  // Sortable headers
  document.querySelectorAll("th.sortable").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.sort;
      if (SORT_COL === col) {
        SORT_DIR *= -1;
      } else {
        SORT_COL = col;
        SORT_DIR = 1;
      }
      render();
    });
  });

  // Add task
  bindIfExists("addTaskBtn", "click", addTask);
  bindIfExists("addTaskBtnTop", "click", addTask);

  // Export
  bindIfExists("exportCsvBtn", "click", exportCsv);

  // Layout image zoom
  bindIfExists("layoutImg", "click", openImageLightbox);

  // Table cell edits
  document.querySelectorAll(".data-table tbody tr").forEach(row => {
    const taskId = row.dataset.taskId;
    row.querySelectorAll("[data-field]").forEach(input => {
      const evt = (input.tagName === "SELECT" || input.type === "date" || input.type === "number") ? "change" : "input";
      input.addEventListener(evt, () => updateTaskField(taskId, input.dataset.field, input.value));
    });
    const delBtn = row.querySelector('[data-action="delete-task"]');
    if (delBtn) {
      delBtn.addEventListener("click", () => {
        const project = getProject(ACTIVE_PROJECT);
        const task = project.tasks.find(t => t.id === taskId);
        openConfirm(
          "Delete this task?",
          `"${task ? task.name : "This task"}" will be permanently removed from ${project.name}.`,
          () => deleteTask(taskId)
        );
      });
    }
  });
}

function bindIfExists(id, evt, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(evt, handler);
}

// Lighter re-render used while typing in filters, to avoid losing focus on the search box.
function renderTableAndGanttOnly() {
  const project = getProject(ACTIVE_PROJECT);
  const visibleTasks = applyFiltersAndSort(project);
  const ganttPanelBody = document.querySelectorAll(".panel-body")[0];
  const tablePanelBody = document.querySelectorAll(".panel-body")[1];
  if (ganttPanelBody) ganttPanelBody.innerHTML = renderGantt(project, visibleTasks);
  if (tablePanelBody) tablePanelBody.innerHTML = renderTable(project, visibleTasks);
  const resultCount = document.querySelector(".result-count");
  if (resultCount) resultCount.textContent = `${visibleTasks.length} of ${project.tasks.length} tasks`;
  // rebind only table/gantt-related events (add task, sort headers, row edits)
  rebindDynamicEvents();
}

function rebindDynamicEvents() {
  bindIfExists("addTaskBtn", "click", addTask);
  document.querySelectorAll("th.sortable").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.sort;
      if (SORT_COL === col) { SORT_DIR *= -1; } else { SORT_COL = col; SORT_DIR = 1; }
      render();
    });
  });
  document.querySelectorAll(".data-table tbody tr").forEach(row => {
    const taskId = row.dataset.taskId;
    row.querySelectorAll("[data-field]").forEach(input => {
      const evt = (input.tagName === "SELECT" || input.type === "date" || input.type === "number") ? "change" : "input";
      input.addEventListener(evt, () => updateTaskField(taskId, input.dataset.field, input.value));
    });
    const delBtn = row.querySelector('[data-action="delete-task"]');
    if (delBtn) {
      delBtn.addEventListener("click", () => {
        const project = getProject(ACTIVE_PROJECT);
        const task = project.tasks.find(t => t.id === taskId);
        openConfirm(
          "Delete this task?",
          `"${task ? task.name : "This task"}" will be permanently removed from ${project.name}.`,
          () => deleteTask(taskId)
        );
      });
    }
  });
}

/* ---------------- CRUD operations ---------------- */

function updateTaskField(taskId, field, value) {
  const project = getProject(ACTIVE_PROJECT);
  const task = project.tasks.find(t => t.id === taskId);
  if (!task) return;

  if (field === "progress") {
    let v = Number(value);
    if (isNaN(v)) v = 0;
    v = Math.min(100, Math.max(0, v));
    task.progress = v;
    // auto-flip status to completed at 100%, and out of completed if dropped below 100
    if (v === 100 && task.status !== "completed") task.status = "completed";
    if (v < 100 && task.status === "completed") task.status = "on-track";
  } else if (field === "start" || field === "end") {
    task[field] = value;
    // keep end >= start
    if (task.start && task.end && parseDate(task.end) < parseDate(task.start)) {
      if (field === "start") task.end = task.start;
      else task.start = task.end;
    }
  } else {
    task[field] = value;
  }

  scheduleSave(false);

  // Only the gantt + KPIs need a refresh for date/status/progress changes;
  // for text fields like name/owner we avoid a full re-render to keep input focus stable.
  if (["start", "end", "status", "progress"].includes(field)) {
    refreshGanttAndKpis();
  }
  flashSaveIndicator();
}

function refreshGanttAndKpis() {
  const project = getProject(ACTIVE_PROJECT);
  const visibleTasks = applyFiltersAndSort(project);
  const ganttPanelBody = document.querySelectorAll(".panel-body")[0];
  if (ganttPanelBody) ganttPanelBody.innerHTML = renderGantt(project, visibleTasks);
  const kpiStrip = document.querySelector(".kpi-strip");
  if (kpiStrip) kpiStrip.outerHTML = renderKpis(project);
  // re-render table to reflect possible status auto-changes (progress -> completed)
  const tablePanelBody = document.querySelectorAll(".panel-body")[1];
  if (tablePanelBody) tablePanelBody.innerHTML = renderTable(project, visibleTasks);
  rebindDynamicEvents();
}

function addTask() {
  const project = getProject(ACTIVE_PROJECT);
  const today = new Date(); today.setHours(0,0,0,0);
  const newTask = {
    id: uid("task"),
    name: "New task",
    owner: "Unassigned",
    start: toIso(today),
    end: toIso(addDays(today, 7)),
    progress: 0,
    status: "not-started",
    priority: "Medium"
  };
  project.tasks.push(newTask);
  scheduleSave(true);
  render();
  // focus the new row's name field for immediate editing
  setTimeout(() => {
    const row = document.querySelector(`tr[data-task-id="${newTask.id}"] input[data-field="name"]`);
    if (row) { row.focus(); row.select(); }
  }, 30);
}

function deleteTask(taskId) {
  const project = getProject(ACTIVE_PROJECT);
  project.tasks = project.tasks.filter(t => t.id !== taskId);
  scheduleSave(true);
  render();
}

/* ---------------- CSV Export ---------------- */

function exportCsv() {
  const project = getProject(ACTIVE_PROJECT);
  const headers = ["Task", "Owner", "Start", "End", "Status", "Priority", "Progress (%)"];
  const rows = project.tasks.map(t => [
    t.name, t.owner, t.start, t.end, statusLabel(t.status), t.priority, t.progress
  ]);

  const csvLines = [headers, ...rows].map(row =>
    row.map(cell => {
      const s = String(cell ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(",")
  );
  const csvContent = csvLines.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, "_")}_plan.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToastMsg("CSV exported");
}

/* ---------------- Init ---------------- */

function init() {
  STATE = loadState();
  ACTIVE_PROJECT = STATE.activeProject || STATE.projects[0].id;
  if (!getProject(ACTIVE_PROJECT)) ACTIVE_PROJECT = STATE.projects[0].id;
  render();
}

document.addEventListener("DOMContentLoaded", init);
