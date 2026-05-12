// ===== APP.JS — Logjika globale =====

// ---- THEME ----
function initTheme() {
  const saved = localStorage.getItem('eKonkursiTheme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = saved === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const curr = document.documentElement.getAttribute('data-theme');
  const next = curr === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('eKonkursiTheme', next);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

// ---- TOAST ----
function showToast(msg, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(50px)'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ---- ANIMATED COUNTER ----
function animateCounter(el, target, duration = 1200) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target; clearInterval(timer); return; }
    el.textContent = Math.floor(start);
  }, 16);
}

function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'));
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { animateCounter(el, target); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(el);
  });
}

// ---- COUNTDOWN ----
function getCountdown(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return { text: 'Mbyllur', cls: 'urgent' };
  const days = Math.floor(diff / 86400000);
  if (days <= 3) return { text: `${days}d mbetur`, cls: 'urgent' };
  if (days <= 10) return { text: `${days} ditë`, cls: 'soon' };
  return { text: `${days} ditë`, cls: 'ok' };
}

// ---- HAMBURGER ----
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  if (btn && sidebar) {
    btn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

// ---- MODAL ----
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ---- NAVBAR ACTIVE ----
function setNavActive() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-nav a, .nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.includes(page)) a.classList.add('active');
  });
}

// ---- NOTIFICATION BADGE ----
function updateNotifBadge() {
  if (!Auth.isLoggedIn()) return;
  const unread = DB.njoftimet.filter(n => !n.lexuar).length;
  const badge = document.getElementById('notifBadge');
  if (badge) badge.textContent = unread || '';
}

// ---- SIDEBAR USER INFO ----
function renderSidebarUser() {
  const user = Auth.getUser();
  if (!user) return;
  const nameEl = document.getElementById('sidebarName');
  const roleEl = document.getElementById('sidebarRole');
  const avatarEl = document.getElementById('sidebarAvatar');
  const roleMap = { kandidat: 'Kandidat', admin: 'Administrator', komision: 'Komisioner' };
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl)  roleEl.textContent  = roleMap[user.role] || user.role;
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
}

// ---- FORMAT DATE ----
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('sq-AL', { day:'numeric', month:'long', year:'numeric' });
}

// ---- STATUS BADGE ----
function statusBadge(statusi) {
  const map = {
    aktiv:     { cls: 'badge-green',  label: 'Aktiv' },
    mbyllur:   { cls: 'badge-red',    label: 'Mbyllur' },
    shqyrtim:  { cls: 'badge-yellow', label: 'Në shqyrtim' },
    pranuar:   { cls: 'badge-green',  label: 'Pranuar' },
    refuzuar:  { cls: 'badge-red',    label: 'Refuzuar' },
    kaloi:     { cls: 'badge-green',  label: 'Kaloi' },
    pritje:    { cls: 'badge-yellow', label: 'Në pritje' },
    publikuar: { cls: 'badge-blue',   label: 'Publikuar' },
  };
  const s = map[statusi] || { cls: 'badge-gray', label: statusi };
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCounters();
  initHamburger();
  setNavActive();
  renderSidebarUser();
  updateNotifBadge();

  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => Auth.logout());
});
