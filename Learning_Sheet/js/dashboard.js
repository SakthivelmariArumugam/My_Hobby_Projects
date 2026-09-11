/* ==========================================================================
   dashboard.js — the DSA sheet app (status, filters, progress, notes)
   Per-user progress is saved in localStorage keyed by the logged-in email.
   ========================================================================== */

const SESSION_KEY = "dsa_session";

/* ---------- Auth guard ---------- */
const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
if (!session) {
  window.location.href = "index.html";
}

const PROGRESS_KEY = "dsa_progress_" + session.email;

/* Problems come from the shared store (admin edits show up here). */
const DSA_SHEET = getProblems();

/* progress = { [problemId]: { status: "solved"|"revisit"|"unsolved", notes: "" } } */
let progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}
function getState(id) {
  return progress[id] || { status: "unsolved", notes: "" };
}

/* Cycle order when the status dot is clicked */
const STATUS_CYCLE = { unsolved: "solved", solved: "revisit", revisit: "unsolved" };

/* ---------- Elements ---------- */
const els = {
  welcome: document.getElementById("welcome"),
  logout: document.getElementById("logoutBtn"),
  sheet: document.getElementById("sheet"),
  search: document.getElementById("searchInput"),
  topic: document.getElementById("topicFilter"),
  difficulty: document.getElementById("difficultyFilter"),
  status: document.getElementById("statusFilter"),
  statTotal: document.getElementById("statTotal"),
  statSolved: document.getElementById("statSolved"),
  statRevisit: document.getElementById("statRevisit"),
  statPending: document.getElementById("statPending"),
  statPercent: document.getElementById("statPercent"),
  progressFill: document.getElementById("progressFill"),
  // modal
  modal: document.getElementById("notesModal"),
  notesTitle: document.getElementById("notesTitle"),
  notesArea: document.getElementById("notesArea"),
  notesSave: document.getElementById("notesSave"),
  notesCancel: document.getElementById("notesCancel"),
};

els.welcome.textContent = "Hi, " + session.name.split(" ")[0];

/* ---------- Logout ---------- */
els.logout.addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
});

/* ---------- Populate topic filter ---------- */
const topics = [...new Set(DSA_SHEET.map((p) => p.topic))];
els.topic.innerHTML =
  '<option value="">All Topics</option>' +
  topics.map((t) => `<option value="${t}">${t}</option>`).join("");

/* ---------- Filters trigger re-render ---------- */
[els.search, els.topic, els.difficulty, els.status].forEach((el) =>
  el.addEventListener("input", render)
);

/* ---------- Escape helper (avoid HTML injection from notes/names) ---------- */
function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

/* ---------- Render ---------- */
function render() {
  updateStats();

  const q = els.search.value.trim().toLowerCase();
  const fTopic = els.topic.value;
  const fDiff = els.difficulty.value;
  const fStatus = els.status.value;

  const filtered = DSA_SHEET.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (fTopic && p.topic !== fTopic) return false;
    if (fDiff && p.difficulty !== fDiff) return false;
    if (fStatus && getState(p.id).status !== fStatus) return false;
    return true;
  });

  if (filtered.length === 0) {
    els.sheet.innerHTML = '<p class="empty">No problems match your filters.</p>';
    return;
  }

  // Group by topic
  const groups = {};
  filtered.forEach((p) => {
    (groups[p.topic] = groups[p.topic] || []).push(p);
  });

  els.sheet.innerHTML = Object.entries(groups)
    .map(([topic, problems]) => {
      const solved = problems.filter((p) => getState(p.id).status === "solved").length;
      const pct = Math.round((solved / problems.length) * 100);
      const rows = problems.map(renderProblem).join("");
      return `
        <div class="topic-group">
          <div class="topic-header" data-toggle>
            <span class="chev">▾</span>
            <h2>${esc(topic)}</h2>
            <span class="topic-count">${solved}/${problems.length}</span>
            <div class="topic-mini-track"><div class="topic-mini-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="problem-list">${rows}</div>
        </div>`;
    })
    .join("");

  attachRowEvents();
}

function renderProblem(p) {
  const st = getState(p.id);
  const dotMark = st.status === "solved" ? "✓" : st.status === "revisit" ? "↻" : "";
  const done = st.status === "solved" ? "done" : "";
  const hasNotes = st.notes && st.notes.trim() ? "has-notes" : "";
  return `
    <div class="problem ${done}" data-id="${p.id}">
      <button class="status-dot ${st.status}" data-status title="Click to change status">${dotMark}</button>
      <span class="problem-name">
        <a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.name)}</a>
      </span>
      <span class="badge ${p.difficulty}">${p.difficulty}</span>
      <button class="icon-btn ${hasNotes}" data-notes title="Notes">✎</button>
    </div>`;
}

/* ---------- Row interactions ---------- */
function attachRowEvents() {
  // Collapse / expand topics
  els.sheet.querySelectorAll("[data-toggle]").forEach((h) =>
    h.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      h.closest(".topic-group").classList.toggle("collapsed");
    })
  );

  // Status cycle
  els.sheet.querySelectorAll("[data-status]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = btn.closest(".problem").dataset.id;
      const cur = getState(id);
      cur.status = STATUS_CYCLE[cur.status];
      progress[id] = cur;
      saveProgress();
      render();
    })
  );

  // Notes
  els.sheet.querySelectorAll("[data-notes]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = btn.closest(".problem").dataset.id;
      openNotes(id);
    })
  );
}

/* ---------- Stats ---------- */
function updateStats() {
  const total = DSA_SHEET.length;
  let solved = 0, revisit = 0;
  DSA_SHEET.forEach((p) => {
    const s = getState(p.id).status;
    if (s === "solved") solved++;
    else if (s === "revisit") revisit++;
  });
  const pending = total - solved - revisit;
  const pct = total ? Math.round((solved / total) * 100) : 0;

  els.statTotal.textContent = total;
  els.statSolved.textContent = solved;
  els.statRevisit.textContent = revisit;
  els.statPending.textContent = pending;
  els.statPercent.textContent = pct + "%";
  els.progressFill.style.width = pct + "%";
}

/* ---------- Notes modal ---------- */
let activeNoteId = null;

function openNotes(id) {
  activeNoteId = id;
  const p = DSA_SHEET.find((x) => x.id === id);
  els.notesTitle.textContent = "Notes — " + p.name;
  els.notesArea.value = getState(id).notes || "";
  els.modal.classList.remove("hidden");
  els.notesArea.focus();
}
function closeNotes() {
  activeNoteId = null;
  els.modal.classList.add("hidden");
}
els.notesCancel.addEventListener("click", closeNotes);
els.modal.addEventListener("click", (e) => {
  if (e.target === els.modal) closeNotes();
});
els.notesSave.addEventListener("click", () => {
  if (activeNoteId) {
    const cur = getState(activeNoteId);
    cur.notes = els.notesArea.value;
    progress[activeNoteId] = cur;
    saveProgress();
    closeNotes();
    render();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !els.modal.classList.contains("hidden")) closeNotes();
});

/* ---------- Go ---------- */
render();
