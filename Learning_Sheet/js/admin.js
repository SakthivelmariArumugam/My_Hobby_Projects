/* ==========================================================================
   admin.js — admin panel: users, problems, global stats
   ========================================================================== */

const SESSION_KEY = "dsa_session";
const USERS_KEY = "dsa_users";

/* ---------- Admin guard ---------- */
const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
if (!session || session.role !== "admin") {
  window.location.href = "index.html";
}

document.getElementById("welcome").textContent = "Hi, " + (session.name || "Admin");

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
});

/* ---------- Helpers ---------- */
function esc(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
}
function saveUsers(u) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}
function getUserProgress(email) {
  return JSON.parse(localStorage.getItem("dsa_progress_" + email) || "{}");
}
function solvedCount(email) {
  const p = getUserProgress(email);
  return Object.values(p).filter((x) => x.status === "solved").length;
}

/* ---------- Tab switching ---------- */
const tabs = document.querySelectorAll(".admin-tab");
tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".admin-view").forEach((v) => v.classList.add("hidden"));
    document.getElementById("view-" + tab.dataset.view).classList.remove("hidden");
  })
);

/* ========================================================================
   OVERVIEW / STATS
   ======================================================================== */
function renderStats() {
  const users = getUsers();
  const emails = Object.keys(users);
  const problems = getProblems();
  const total = problems.length;

  let totalSolves = 0;
  let progressSum = 0;
  const solveByProblem = {}; // id -> count

  emails.forEach((email) => {
    const prog = getUserProgress(email);
    let mySolved = 0;
    Object.entries(prog).forEach(([id, st]) => {
      if (st.status === "solved") {
        mySolved++;
        solveByProblem[id] = (solveByProblem[id] || 0) + 1;
      }
    });
    totalSolves += mySolved;
    progressSum += total ? mySolved / total : 0;
  });

  const avg = emails.length ? Math.round((progressSum / emails.length) * 100) : 0;

  document.getElementById("mUsers").textContent = emails.length;
  document.getElementById("mProblems").textContent = total;
  document.getElementById("mSolved").textContent = totalSolves;
  document.getElementById("mAvg").textContent = avg + "%";

  // Most-solved ranking
  const ranked = problems
    .map((p) => ({ ...p, count: solveByProblem[p.id] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const maxCount = ranked[0] ? ranked[0].count : 0;
  const wrap = document.getElementById("topProblems");

  if (!maxCount) {
    wrap.innerHTML = '<p class="empty">No solves recorded yet.</p>';
    return;
  }

  wrap.innerHTML = ranked
    .map((p) => {
      const pct = maxCount ? Math.round((p.count / maxCount) * 100) : 0;
      return `
        <div class="rank-row">
          <span class="rank-name">${esc(p.name)}</span>
          <div class="rank-track"><div class="rank-fill" style="width:${pct}%"></div></div>
          <span class="rank-count">${p.count}</span>
        </div>`;
    })
    .join("");
}

/* ========================================================================
   USERS
   ======================================================================== */
function renderUsers() {
  const users = getUsers();
  const problems = getProblems();
  const total = problems.length;
  const tbody = document.querySelector("#usersTable tbody");
  const emails = Object.keys(users);

  if (emails.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No users have signed up yet.</td></tr>';
    return;
  }

  tbody.innerHTML = emails
    .map((email) => {
      const u = users[email];
      const solved = solvedCount(email);
      const pct = total ? Math.round((solved / total) * 100) : 0;
      return `
        <tr>
          <td>${esc(u.name)}</td>
          <td>${esc(email)}</td>
          <td>${solved}/${total}</td>
          <td>
            <div class="mini-track"><div class="mini-fill" style="width:${pct}%"></div></div>
            <span class="mini-pct">${pct}%</span>
          </td>
          <td><button class="icon-btn danger" data-del-user="${esc(email)}" title="Delete user">🗑</button></td>
        </tr>`;
    })
    .join("");

  tbody.querySelectorAll("[data-del-user]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const email = btn.dataset.delUser;
      if (!confirm(`Delete user "${email}" and all their progress?`)) return;
      const all = getUsers();
      delete all[email];
      saveUsers(all);
      localStorage.removeItem("dsa_progress_" + email);
      renderUsers();
      renderStats();
    })
  );
}

/* ========================================================================
   PROBLEMS
   ======================================================================== */
function renderProblems() {
  const problems = getProblems();
  const tbody = document.querySelector("#problemsTable tbody");

  if (problems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No problems yet. Add one!</td></tr>';
  } else {
    tbody.innerHTML = problems
      .map(
        (p) => `
        <tr>
          <td>${esc(p.name)}</td>
          <td>${esc(p.topic)}</td>
          <td><span class="badge ${esc(p.difficulty)}">${esc(p.difficulty)}</span></td>
          <td><a href="${esc(p.link)}" target="_blank" rel="noopener" class="tbl-link">open ↗</a></td>
          <td class="row-actions">
            <button class="icon-btn" data-edit="${esc(p.id)}" title="Edit">✎</button>
            <button class="icon-btn danger" data-del="${esc(p.id)}" title="Delete">🗑</button>
          </td>
        </tr>`
      )
      .join("");
  }

  // Refresh topic suggestions
  const topics = [...new Set(problems.map((p) => p.topic))];
  document.getElementById("topicList").innerHTML = topics
    .map((t) => `<option value="${esc(t)}">`)
    .join("");

  tbody.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", () => openProblemModal(btn.dataset.edit))
  );
  tbody.querySelectorAll("[data-del]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = btn.dataset.del;
      const list = getProblems();
      const p = list.find((x) => x.id === id);
      if (!confirm(`Delete "${p ? p.name : id}"?`)) return;
      saveProblems(list.filter((x) => x.id !== id));
      renderProblems();
      renderStats();
    })
  );
}

/* ---------- Problem modal (add / edit) ---------- */
const pm = {
  modal: document.getElementById("problemModal"),
  title: document.getElementById("pmTitle"),
  name: document.getElementById("pmName"),
  topic: document.getElementById("pmTopic"),
  difficulty: document.getElementById("pmDifficulty"),
  link: document.getElementById("pmLink"),
  error: document.getElementById("pmError"),
  save: document.getElementById("pmSave"),
  cancel: document.getElementById("pmCancel"),
};
let editingId = null;

document.getElementById("addProblemBtn").addEventListener("click", () => openProblemModal(null));

function openProblemModal(id) {
  editingId = id;
  pm.error.textContent = "";
  if (id) {
    const p = getProblems().find((x) => x.id === id);
    pm.title.textContent = "Edit problem";
    pm.name.value = p.name;
    pm.topic.value = p.topic;
    pm.difficulty.value = p.difficulty;
    pm.link.value = p.link || "";
  } else {
    pm.title.textContent = "Add problem";
    pm.name.value = "";
    pm.topic.value = "";
    pm.difficulty.value = "Easy";
    pm.link.value = "";
  }
  pm.modal.classList.remove("hidden");
  pm.name.focus();
}
function closeProblemModal() {
  editingId = null;
  pm.modal.classList.add("hidden");
}
pm.cancel.addEventListener("click", closeProblemModal);
pm.modal.addEventListener("click", (e) => {
  if (e.target === pm.modal) closeProblemModal();
});

pm.save.addEventListener("click", () => {
  const name = pm.name.value.trim();
  const topic = pm.topic.value.trim();
  const difficulty = pm.difficulty.value;
  const link = pm.link.value.trim();

  if (!name || !topic) {
    pm.error.textContent = "Name and topic are required.";
    return;
  }

  const list = getProblems();
  if (editingId) {
    const p = list.find((x) => x.id === editingId);
    Object.assign(p, { name, topic, difficulty, link });
  } else {
    const id = "p" + Date.now().toString(36) + Math.floor(Math.random() * 1000);
    list.push({ id, name, topic, difficulty, link });
  }
  saveProblems(list);
  closeProblemModal();
  renderProblems();
  renderStats();
});

/* ---------- Init ---------- */
renderStats();
renderUsers();
renderProblems();
