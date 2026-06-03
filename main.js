const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    minWidth: 750,
    minHeight: 580,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    frame: false,
    backgroundColor: '#1a1a1a',
    show: false
  });

  mainWindow.loadFile('index.html');
  mainWindow.once('ready-to-show', () => mainWindow.show());
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ── File categories ──────────────────────────────────────────────
const CATEGORIES = {
  Images:     ['.jpg','.jpeg','.png','.gif','.bmp','.webp','.svg','.ico','.tiff','.heic','.raw'],
  Videos:     ['.mp4','.mkv','.avi','.mov','.wmv','.flv','.webm','.m4v','.mpg','.mpeg'],
  Audio:      ['.mp3','.wav','.flac','.aac','.ogg','.m4a','.wma','.opus','.aiff'],
  Documents:  ['.pdf','.doc','.docx','.xls','.xlsx','.ppt','.pptx','.odt','.ods','.odp','.txt','.rtf','.epub','.mobi'],
  Archives:   ['.zip','.rar','.7z','.tar','.gz','.bz2','.xz','.iso','.dmg','.cab'],
  Code:       ['.py','.js','.ts','.html','.css','.json','.xml','.yaml','.yml','.sh','.bat','.ps1','.java','.cpp','.c','.h','.cs','.go','.rb','.php','.sql','.md','.ipynb'],
  Installers: ['.exe','.msi','.msix','.appx','.apk','.deb','.rpm','.pkg'],
  Fonts:      ['.ttf','.otf','.woff','.woff2','.eot'],
  Torrents:   ['.torrent']
};

const LOG_FILE = path.join(os.homedir(), 'downloads-organizer.log');

function getCategory(ext) {
  for (const [cat, exts] of Object.entries(CATEGORIES)) {
    if (exts.includes(ext.toLowerCase())) return cat;
  }
  return null;
}

function getUniqueDest(destFolder, filename) {
  let dest = path.join(destFolder, filename);
  if (!fs.existsSync(dest)) return dest;
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let i = 1;
  do { dest = path.join(destFolder, `${base}_${i}${ext}`); i++; } while (fs.existsSync(dest));
  return dest;
}

// ── Preview ───────────────────────────────────────────────────────
ipcMain.handle('preview', async (_, folderPath) => {
  const results = [];
  try {
    const files = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(f => f.isFile());
    for (const f of files) {
      const ext = path.extname(f.name);
      const cat = getCategory(ext);
      if (cat) results.push({ name: f.name, category: cat, ext: ext.toLowerCase() });
    }
  } catch (e) {}
  return results;
});

// ── Organize ──────────────────────────────────────────────────────
ipcMain.handle('organize', async (_, folderPath) => {
  const moved = [];
  const errors = [];

  try {
    const files = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(f => f.isFile());

    for (const f of files) {
      const ext = path.extname(f.name);
      const cat = getCategory(ext);
      if (!cat) continue;

      const destFolder = path.join(folderPath, cat);
      if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });

      const src = path.join(folderPath, f.name);
      const dest = getUniqueDest(destFolder, f.name);

      try {
        fs.renameSync(src, dest);
        moved.push({ name: f.name, category: cat, from: src, to: dest });
      } catch (e) {
        errors.push({ name: f.name, error: e.message });
      }
    }

    // Write log
    const timestamp = new Date().toISOString();
    const logEntry = `\n[${timestamp}] Organized "${folderPath}"\n` +
      moved.map(m => `  MOVED: ${m.name} -> ${m.category}/`).join('\n') +
      (errors.length ? '\n' + errors.map(e => `  ERROR: ${e.name} - ${e.error}`).join('\n') : '') + '\n';
    fs.appendFileSync(LOG_FILE, logEntry);

  } catch (e) {
    errors.push({ name: 'General', error: e.message });
  }

  return { moved, errors };
});

// ── Undo ──────────────────────────────────────────────────────────
ipcMain.handle('undo', async (_, moves) => {
  const restored = [];
  const errors = [];
  for (const m of [...moves].reverse()) {
    try {
      if (fs.existsSync(m.to)) {
        fs.renameSync(m.to, m.from);
        restored.push(m.name);
        // Remove category folder if empty
        const dir = path.dirname(m.to);
        if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
      }
    } catch (e) {
      errors.push({ name: m.name, error: e.message });
    }
  }
  return { restored, errors };
});

// ── Folder picker ─────────────────────────────────────────────────
ipcMain.handle('pick-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    defaultPath: path.join(os.homedir(), 'Downloads')
  });
  return result.canceled ? null : result.filePaths[0];
});

// ── Open log ──────────────────────────────────────────────────────
ipcMain.handle('open-log', async () => {
  if (fs.existsSync(LOG_FILE)) shell.openPath(LOG_FILE);
  else return 'No log file yet.';
});

ipcMain.handle('get-downloads', async () => {
  return path.join(os.homedir(), 'Downloads');
});

// ── Window controls ───────────────────────────────────────────────
ipcMain.on('minimize', () => mainWindow.minimize());
ipcMain.on('close', () => mainWindow.close());

// ── Schedule helpers (returns info only — actual scheduling via schtasks) ──
ipcMain.handle('schedule', async (_, folderPath) => {
  const exePath = app.getPath('exe');
  const cmd = `schtasks /create /tn "DownloadsOrganizer" /tr "${exePath} --organize \\"${folderPath}\\"" /sc weekly /d MON /st 09:00 /f`;
  const { exec } = require('child_process');
  return new Promise(resolve => {
    exec(cmd, (err, stdout, stderr) => {
      resolve(err ? { ok: false, msg: stderr } : { ok: true });
    });
  });
});

ipcMain.handle('unschedule', async () => {
  const { exec } = require('child_process');
  return new Promise(resolve => {
    exec('schtasks /delete /tn "DownloadsOrganizer" /f', (err) => {
      resolve({ ok: !err });
    });
  });
});
