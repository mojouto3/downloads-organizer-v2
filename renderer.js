'use strict';

let currentFolder = null;
let lastMoves = [];
let lang = 'en';

const CATEGORY_ICONS = {
  Images: '🖼️', Videos: '🎬', Audio: '🎵', Documents: '📄',
  Archives: '📦', Code: '💻', Installers: '⚙️', Fonts: '🔤', Torrents: '🌊'
};

// ── Language ──────────────────────────────────────────────────────
function toggleLang() {
  lang = lang === 'en' ? 'gr' : 'en';
  document.getElementById('langBtn').textContent = lang === 'en' ? 'GR' : 'EN';
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.dataset[lang];
  });
  document.querySelectorAll('[data-placeholder-en]').forEach(el => {
    el.placeholder = lang === 'en' ? el.dataset['placeholderEn'] : el.dataset['placeholderGr'];
  });
}

// ── Navigation ────────────────────────────────────────────────────
function showPage(name) {
  document.getElementById('pageHome').style.display  = name === 'home'  ? 'flex' : 'none';
  document.getElementById('pageLog').style.display   = name === 'log'   ? 'flex' : 'none';
  document.getElementById('pageGroup').style.display = name === 'group' ? 'flex' : 'none';
  document.getElementById('navHome').classList.toggle('active',  name === 'home');
  document.getElementById('navLog').classList.toggle('active',   name === 'log');
  document.getElementById('navGroup').classList.toggle('active', name === 'group');
  if (name === 'log') loadLog();
}

// ── Folder selection ──────────────────────────────────────────────
async function pickFolder() {
  const folder = await window.api.pickFolder();
  if (folder) setFolder(folder);
}

async function useDownloads() {
  const folder = await window.api.getDownloads();
  if (folder) setFolder(folder);
}

async function setFolder(folder) {
  currentFolder = folder;
  document.getElementById('folderInput').value = folder;
  await showPreview(folder);
}

// ── Preview ───────────────────────────────────────────────────────
async function showPreview(folder) {
  const files = await window.api.preview(folder);

  if (files.length === 0) {
    showToast(lang === 'en' ? 'No sortable files found!' : 'Δεν βρέθηκαν αρχεία!');
    return;
  }

  const groups = {};
  for (const f of files) {
    if (!groups[f.category]) groups[f.category] = [];
    groups[f.category].push(f.name);
  }

  const grid = document.getElementById('categoryGrid');
  grid.innerHTML = '';

  for (const [cat, names] of Object.entries(groups)) {
    const card = document.createElement('div');
    card.className = 'cat-card';
    const preview = names.slice(0, 4).map(n =>
      `<div class="cat-file">${CATEGORY_ICONS[cat] || '📁'} ${n}</div>`
    ).join('');
    const more = names.length > 4 ? `<div class="cat-file" style="color:#666">+${names.length - 4} more...</div>` : '';
    card.innerHTML = `
      <div class="cat-name">${CATEGORY_ICONS[cat] || '📁'} ${cat}</div>
      <div class="cat-count">${names.length} file${names.length !== 1 ? 's' : ''}</div>
      <div class="cat-files">${preview}${more}</div>
    `;
    grid.appendChild(card);
  }

  document.getElementById('previewCount').textContent = `${files.length} files`;
  document.getElementById('previewCard').style.display = 'block';
  document.getElementById('resultsCard').style.display = 'none';
}

// ── Organize ──────────────────────────────────────────────────────
async function organize() {
  if (!currentFolder) return;
  const btn = document.getElementById('organizeBtn');
  btn.disabled = true;
  btn.textContent = lang === 'en' ? 'Organizing...' : 'Γίνεται οργάνωση...';

  const result = await window.api.organize(currentFolder);
  lastMoves = result.moved;

  const groups = {};
  for (const m of result.moved) {
    if (!groups[m.category]) groups[m.category] = 0;
    groups[m.category]++;
  }

  const grid = document.getElementById('resultsGrid');
  grid.innerHTML = '';
  for (const [cat, count] of Object.entries(groups)) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="result-cat">${CATEGORY_ICONS[cat] || '📁'} ${cat}</div>
      <div class="result-count">${count}</div>
      <div class="result-label">file${count !== 1 ? 's' : ''} moved</div>
    `;
    grid.appendChild(card);
  }

  document.getElementById('movedCount').textContent = `${result.moved.length} moved`;
  document.getElementById('previewCard').style.display = 'none';
  document.getElementById('resultsCard').style.display = 'block';
  btn.disabled = false;
  btn.textContent = lang === 'en' ? 'Organize Now' : 'Οργάνωση Τώρα';

  if (result.errors.length > 0) showToast(`${result.errors.length} error(s) occurred`);
}

// ── Undo ──────────────────────────────────────────────────────────
async function undo() {
  if (!lastMoves.length) {
    showToast(lang === 'en' ? 'Nothing to undo!' : 'Δεν υπάρχει κάτι για αναίρεση!');
    return;
  }
  const result = await window.api.undo(lastMoves);
  lastMoves = [];
  showToast(lang === 'en'
    ? `Restored ${result.restored.length} file(s)`
    : `Επαναφορά ${result.restored.length} αρχείων`);
  resetView();
}

// ── Reset ─────────────────────────────────────────────────────────
function resetView() {
  currentFolder = null;
  lastMoves = [];
  document.getElementById('folderInput').value = '';
  document.getElementById('previewCard').style.display = 'none';
  document.getElementById('resultsCard').style.display = 'none';
}

// ── Scheduler ─────────────────────────────────────────────────────
async function scheduleTask() {
  if (!currentFolder) {
    showToast(lang === 'en' ? 'Please select a folder first!' : 'Επιλέξτε φάκελο πρώτα!');
    return;
  }
  const result = await window.api.schedule(currentFolder);
  const el = document.getElementById('scheduleMsg');
  el.className = result.ok ? 'schedule-msg ok' : 'schedule-msg err';
  el.textContent = result.ok
    ? (lang === 'en' ? '✅ Scheduled! Runs every Monday at 9:00 AM' : '✅ Ενεργοποιήθηκε!')
    : (lang === 'en' ? '❌ Failed. Try running as Administrator.' : '❌ Αποτυχία. Δοκιμάστε ως Διαχειριστής.');
}

async function unscheduleTask() {
  const result = await window.api.unschedule();
  const el = document.getElementById('scheduleMsg');
  el.className = result.ok ? 'schedule-msg ok' : 'schedule-msg err';
  el.textContent = result.ok
    ? (lang === 'en' ? '✅ Auto-run disabled.' : '✅ Απενεργοποιήθηκε.')
    : (lang === 'en' ? '❌ No scheduled task found.' : '❌ Δεν βρέθηκε προγραμματισμένη εργασία.');
}

// ── Log Viewer ────────────────────────────────────────────────────
async function loadLog() {
  const sessions = await window.api.getLog();
  const list = document.getElementById('logList');
  const empty = document.getElementById('logEmpty');
  const count = document.getElementById('logCount');

  list.innerHTML = '';
  count.textContent = `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`;

  if (sessions.length === 0) {
    empty.style.display = 'block';
    list.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  list.style.display = 'flex';

  for (const session of sessions) {
    const date = new Date(session.timestamp);
    const dateStr = date.toLocaleDateString('el-GR', { day:'2-digit', month:'2-digit', year:'numeric' });
    const timeStr = date.toLocaleTimeString('el-GR', { hour:'2-digit', minute:'2-digit' });

    // Group files by category
    const groups = {};
    for (const f of session.moved) {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f.name);
    }

    const groupsHTML = Object.entries(groups).map(([cat, names]) => `
      <div class="log-category-group">
        <div class="log-category-label">${CATEGORY_ICONS[cat] || '📁'} ${cat} (${names.length})</div>
        <div class="log-file-list">
          ${names.map(n => `<span class="log-file-chip" title="${n}">${n}</span>`).join('')}
        </div>
      </div>
    `).join('');

    const hasErrors = session.errors && session.errors.length > 0;

    const el = document.createElement('div');
    el.className = 'log-session';
    el.innerHTML = `
      <div class="log-session-header" onclick="toggleSession(this)">
        <div class="log-session-date">${dateStr} ${timeStr}</div>
        <div class="log-session-folder" title="${session.folder}">${session.folder}</div>
        <span class="log-session-badge ${hasErrors ? 'error' : ''}">${session.total} moved${hasErrors ? ` · ${session.errors.length} err` : ''}</span>
        <button class="log-session-delete" title="Delete" onclick="deleteSession(event, ${session.id})">✕</button>
        <span class="log-chevron">▼</span>
      </div>
      <div class="log-session-body">
        ${groupsHTML}
        ${hasErrors ? `<div class="log-category-group">
          <div class="log-category-label" style="color:var(--danger)">⚠️ Errors (${session.errors.length})</div>
          <div class="log-file-list">${session.errors.map(e => `<span class="log-file-chip" style="border-color:var(--danger)">${e.name}</span>`).join('')}</div>
        </div>` : ''}
      </div>
    `;
    list.appendChild(el);
  }
}

function toggleSession(header) {
  const session = header.closest('.log-session');
  session.classList.toggle('open');
}

async function deleteSession(e, id) {
  e.stopPropagation();
  await window.api.deleteSession(id);
  loadLog();
  showToast(lang === 'en' ? 'Session deleted' : 'Η συνεδρία διαγράφηκε');
}

async function clearLog() {
  if (!confirm(lang === 'en' ? 'Clear all history?' : 'Διαγραφή όλου του ιστορικού;')) return;
  await window.api.clearLog();
  loadLog();
  showToast(lang === 'en' ? 'History cleared' : 'Το ιστορικό καθαρίστηκε');
}

// ── Toast ─────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Smart Group ───────────────────────────────────────────────────
let groups = [];
let currentGroupFolder = null;
let lastGroupMoves = [];

async function initGroups() {
  groups = await window.api.getGroups();
  renderGroupChips();
}

function renderGroupChips() {
  const list = document.getElementById('groupList');
  const count = document.getElementById('groupCount');
  count.textContent = `${groups.length} group${groups.length !== 1 ? 's' : ''}`;
  list.innerHTML = groups.map((g, i) => `
    <div class="group-chip">
      &#127981; ${g.name}
      <button class="group-chip-delete" onclick="removeGroup(${i})">✕</button>
    </div>
  `).join('');
}

async function addGroup() {
  const input = document.getElementById('groupNameInput');
  const name = input.value.trim();
  if (!name) return;
  if (groups.find(g => g.name.toLowerCase() === name.toLowerCase())) {
    showToast(lang === 'en' ? 'Group already exists!' : 'Υπάρχει ήδη!');
    return;
  }
  groups.push({ name });
  await window.api.saveGroups(groups);
  renderGroupChips();
  input.value = '';
  showToast(lang === 'en' ? `"${name}" added!` : `Προστέθηκε το "${name}"!`);
}

async function removeGroup(index) {
  const name = groups[index].name;
  groups.splice(index, 1);
  await window.api.saveGroups(groups);
  renderGroupChips();
  showToast(lang === 'en' ? `"${name}" removed` : `Αφαιρέθηκε το "${name}"`);
}

async function pickGroupFolder() {
  const folder = await window.api.pickFolder();
  if (folder) setGroupFolder(folder);
}

async function useDownloadsGroup() {
  const folder = await window.api.getDownloads();
  if (folder) setGroupFolder(folder);
}

async function setGroupFolder(folder) {
  currentGroupFolder = folder;
  document.getElementById('groupFolderInput').value = folder;
  await showGroupPreview(folder);
}

async function showGroupPreview(folder) {
  if (!groups.length) {
    showToast(lang === 'en' ? 'Add at least one group first!' : 'Προσθέστε τουλάχιστον μία ομάδα!');
    return;
  }

  const files = await window.api.previewGroups(folder);
  if (files.length === 0) {
    showToast(lang === 'en' ? 'No matching files found!' : 'Δεν βρέθηκαν αρχεία!');
    return;
  }

  const list = document.getElementById('groupPreviewList');
  list.innerHTML = files.map(f => `
    <div class="group-preview-item">
      <span class="group-preview-filename" title="${f.name}">${f.name}</span>
      <span class="group-preview-arrow">&#8594;</span>
      <span class="group-preview-dest">&#128193; ${f.group.charAt(0).toUpperCase() + f.group.slice(1)}/</span>
    </div>
  `).join('');

  document.getElementById('groupPreviewCount').textContent = `${files.length} files`;
  document.getElementById('groupPreviewCard').style.display = 'block';
  document.getElementById('groupResultsCard').style.display = 'none';
}

async function organizeGroups() {
  if (!currentGroupFolder) return;
  const btn = document.getElementById('groupOrganizeBtn');
  btn.disabled = true;
  btn.textContent = lang === 'en' ? 'Organizing...' : 'Γίνεται οργάνωση...';

  const result = await window.api.organizeGroups(currentGroupFolder);
  lastGroupMoves = result.moved;

  const grouped = {};
  for (const m of result.moved) {
    if (!grouped[m.group]) grouped[m.group] = 0;
    grouped[m.group]++;
  }

  const grid = document.getElementById('groupResultsGrid');
  grid.innerHTML = '';
  for (const [grp, count] of Object.entries(grouped)) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="result-cat">&#127981; ${grp}</div>
      <div class="result-count">${count}</div>
      <div class="result-label">file${count !== 1 ? 's' : ''} moved</div>
    `;
    grid.appendChild(card);
  }

  document.getElementById('groupMovedCount').textContent = `${result.moved.length} moved`;
  document.getElementById('groupPreviewCard').style.display = 'none';
  document.getElementById('groupResultsCard').style.display = 'block';
  btn.disabled = false;
  btn.textContent = lang === 'en' ? 'Organize Now' : 'Οργάνωση Τώρα';
}

async function undoGroups() {
  if (!lastGroupMoves.length) {
    showToast(lang === 'en' ? 'Nothing to undo!' : 'Δεν υπάρχει κάτι για αναίρεση!');
    return;
  }
  const result = await window.api.undo(lastGroupMoves);
  lastGroupMoves = [];
  showToast(lang === 'en'
    ? `Restored ${result.restored.length} file(s)`
    : `Επαναφορά ${result.restored.length} αρχείων`);
  resetGroupView();
}

function resetGroupView() {
  currentGroupFolder = null;
  lastGroupMoves = [];
  document.getElementById('groupFolderInput').value = '';
  document.getElementById('groupPreviewCard').style.display = 'none';
  document.getElementById('groupResultsCard').style.display = 'none';
}

// Allow Enter key to add group
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('groupNameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addGroup();
  });
});

// ── Init ──────────────────────────────────────────────────────────
showPage('home');
initGroups();
