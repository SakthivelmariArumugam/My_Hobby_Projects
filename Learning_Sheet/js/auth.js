/* ==========================================================================
   auth.js — mock authentication using localStorage
   NOTE: This is a client-side demo. Passwords are lightly hashed, not secure.
   For real security you'd need a backend. Fine for a learning project.
   ========================================================================== */

const USERS_KEY = "dsa_users";
const SESSION_KEY = "dsa_session";

/* Simple non-cryptographic hash (djb2). Keeps plain passwords out of storage,
   but is NOT secure — do not use for real apps. */
function hashPassword(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* If already logged in, skip straight to the right home page. */
const existing = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
if (existing) {
  window.location.href = existing.role === "admin" ? "admin.html" : "dashboard.html";
}

/* ---------- Tab switching ---------- */
const tabs = document.querySelectorAll(".tab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const isLogin = tab.dataset.tab === "login";
    loginForm.classList.toggle("hidden", !isLogin);
    signupForm.classList.toggle("hidden", isLogin);
    clearErrors();
  });
});

function clearErrors() {
  document.getElementById("loginError").textContent = "";
  document.getElementById("signupError").textContent = "";
}

/* ---------- Sign up ---------- */
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const errEl = document.getElementById("signupError");
  const name = signupForm.name.value.trim();
  const email = signupForm.email.value.trim().toLowerCase();
  const password = signupForm.password.value;
  const confirm = signupForm.confirm.value;

  if (password.length < 6) {
    errEl.textContent = "Password must be at least 6 characters.";
    return;
  }
  if (password !== confirm) {
    errEl.textContent = "Passwords do not match.";
    return;
  }

  if (email === ADMIN_EMAIL) {
    errEl.textContent = "This email is reserved. Please use another.";
    return;
  }

  const users = getUsers();
  if (users[email]) {
    errEl.textContent = "An account with this email already exists.";
    return;
  }

  users[email] = { name, email, password: hashPassword(password) };
  saveUsers(users);
  startSession(email, name, "user");
});

/* ---------- Login ---------- */
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const errEl = document.getElementById("loginError");
  const email = loginForm.email.value.trim().toLowerCase();
  const password = loginForm.password.value;

  // Preset admin account
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    startSession(email, "Admin", "admin");
    return;
  }

  const users = getUsers();
  const user = users[email];
  if (!user || user.password !== hashPassword(password)) {
    errEl.textContent = "Invalid email or password.";
    return;
  }
  startSession(email, user.name, "user");
});

function startSession(email, name, role) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, name, role }));
  window.location.href = role === "admin" ? "admin.html" : "dashboard.html";
}
