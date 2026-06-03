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
  document.getElementById('langBtn').textContent = lang === 'en' ? '🇬🇷 GR' : '🇬🇧 EN';
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.dataset[lang];
  });
  document.querySelectorAll('[data-placeholder-en]').forEach(el => {
    el.placeholder = lang === 'en' ? el.dataset['placeholderEn'] : el.dataset['placeholderGr'];
  });
}

// ── Folder selection ──────────────────────────────────────────────
async function pickFolder() {
  const folder = await window.api.pickFolder();
  if (folder) setFolder(folder);
}

function useDownloads() {
  window.api.getDownloads().then(f => { if (f) setFolder(f); });
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

  // Group by category
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

  document.querySelector('#previewCard .btn-green').disabled = true;
  document.querySelector('#previewCard .btn-green').textContent =
    lang === 'en' ? 'Organizing...' : 'Γίνεται οργάνωση...';

  const result = await window.api.organize(currentFolder);
  lastMoves = result.moved;

  // Group results
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

  if (result.errors.length > 0) {
    showToast(`${result.errors.length} error(s) occurred`);
  }
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

// ── Log ───────────────────────────────────────────────────────────
async function openLog() {
  const msg = await window.api.openLog();
  if (msg) showToast(msg);
}

// ── Scheduler ─────────────────────────────────────────────────────
async function scheduleTask() {
  if (!currentFolder) {
    showToast(lang === 'en' ? 'Please select a folder first!' : 'Επιλέξτε φάκελο πρώτα!');
    return;
  }
  const result = await window.api.schedule(currentFolder);
  const el = document.getElementById('scheduleMsg');
  if (result.ok) {
    el.className = 'schedule-msg ok';
    el.textContent = lang === 'en' ? '✅ Scheduled! Runs every Monday at 9:00 AM' : '✅ Ενεργοποιήθηκε! Κάθε Δευτέρα στις 9:00 πμ';
  } else {
    el.className = 'schedule-msg err';
    el.textContent = lang === 'en' ? '❌ Failed. Try running as Administrator.' : '❌ Αποτυχία. Δοκιμάστε ως Διαχειριστής.';
  }
}

async function unscheduleTask() {
  const result = await window.api.unschedule();
  const el = document.getElementById('scheduleMsg');
  el.className = result.ok ? 'schedule-msg ok' : 'schedule-msg err';
  el.textContent = result.ok
    ? (lang === 'en' ? '✅ Auto-run disabled.' : '✅ Απενεργοποιήθηκε.')
    : (lang === 'en' ? '❌ No scheduled task found.' : '❌ Δεν βρέθηκε προγραμματισμένη εργασία.');
}

// ── Reset ─────────────────────────────────────────────────────────
function resetView() {
  currentFolder = null;
  lastMoves = [];
  document.getElementById('folderInput').value = '';
  document.getElementById('previewCard').style.display = 'none';
  document.getElementById('resultsCard').style.display = 'none';
  const btn = document.querySelector('#previewCard .btn-green');
  if (btn) { btn.disabled = false; btn.textContent = lang === 'en' ? 'Organize Now' : 'Οργάνωση Τώρα'; }
}

// ── Toast ─────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
