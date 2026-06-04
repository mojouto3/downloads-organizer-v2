# Downloads Organizer v2.0

> A modern, elegant desktop application to automatically sort your Downloads folder built with Electron.

![Version](https://img.shields.io/badge/version-2.0.0-brightgreen)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Electron](https://img.shields.io/badge/electron-42.x-47848F)

---

## What is Downloads Organizer?

Downloads Organizer is a free, open-source Windows desktop app that sorts your messy Downloads folder into clean, organized subfolders, with a single click. No command line, no configuration, no technical knowledge required. Just open, preview, and organize.

This is the v2.0 rewrite of the original [Downloads Organizer v1](https://github.com/mojouto3/downloads-organizer), now featuring a full graphical interface built with Electron.

---

## Screenshots

> A clean dark interface with green accents, easy on the eyes, easy to use.

| Select & Preview | Results | Auto-Schedule |
|---|---|---|
| Browse or auto-detect your Downloads folder, see exactly what will be moved before doing anything | After organizing, see a clear summary grouped by category | Set it and forget it runs automatically every Monday at 9:00 AM |

---

## Features

- **Modern GUI** ➔ dark theme with a clean, minimal interface
- **Smart Preview** ➔ see exactly what files will be moved, grouped by category, before committing
- **One-click Organize** ➔ sorts files instantly into the right folders
- **Undo** ➔ changed your mind? Restore everything back to where it was
- **Log History** ➔ every session is logged so you always know what happened
- **Auto-Schedule** ➔ set it to run automatically every week via Windows Task Scheduler
- **Bilingual** ➔ full Greek 🇬🇷 and English 🇬🇧 support, switchable in real time
- **Custom Icon** ➔ branded Desktop shortcut so it always looks the part
- **Safe** ➔ only moves files, never deletes anything

---

## File Categories

| Folder | File Types |
|---|---|
| 🖼️ Images | jpg, jpeg, png, gif, bmp, webp, svg, ico, tiff, heic, raw |
| 🎬 Videos | mp4, mkv, avi, mov, wmv, flv, webm, m4v, mpg, mpeg |
| 🎵 Audio | mp3, wav, flac, aac, ogg, m4a, wma, opus, aiff |
| 📄 Documents | pdf, doc, docx, xls, xlsx, ppt, pptx, odt, txt, rtf, epub, mobi |
| 📦 Archives | zip, rar, 7z, tar, gz, bz2, xz, iso, dmg, cab |
| 💻 Code | py, js, ts, html, css, json, xml, yaml, sh, bat, ps1, java, cpp, cs, go, php, sql, md |
| ⚙️ Installers | exe, msi, msix, appx, apk, deb, rpm, pkg |
| 🔤 Fonts | ttf, otf, woff, woff2, eot |
| 🌊 Torrents | torrent |

---

## Installation

1. Go to the [Releases](../../releases) page
2. Download the latest **`Downloads Organizer Setup X.X.X.exe`**
3. Run the installer and follow the steps
4. A **Downloads Organizer** shortcut will appear on your Desktop

---

## Usage

1. Double-click the **Downloads Organizer** shortcut on your Desktop
2. Click **My Downloads** to auto-detect your Downloads folder, or **Browse** to choose any folder
3. Review the **Preview** & see what will be moved and where
4. Click **Organize Now**
5. Done! Use **↩ Undo** if you want to reverse, or **📋 View Log** to see the history

---

## Auto-Schedule

To run automatically every week:
1. First select your Downloads folder
2. Click **Enable Auto-Run** in the Auto-Schedule section
3. The app will run silently every Monday at 9:00 AM via Windows Task Scheduler
4. Click **Disable** at any time to turn it off

> Note: Enabling auto-schedule requires the app to be run as Administrator once.

---

## Building from Source

### Requirements
- [Node.js](https://nodejs.org) v18 or later
- npm (included with Node.js)

### Steps

```bash
git clone https://github.com/mojouto3/downloads-organizer-v2.git
cd downloads-organizer-v2
npm install
npm start
```

### Build installer

Run PowerShell as Administrator, then:

```bash
npm run build
```

The installer will be created at `dist/Downloads Organizer Setup X.X.X.exe`.

---

## Project Structure

```
downloads-organizer-v2/
├── assets/
│   └── icon.ico          # Custom app icon
├── main.js               # Electron main process — file operations, IPC, scheduling
├── preload.js            # Secure bridge between main and renderer
├── renderer.js           # UI logic — preview, organize, undo, language
├── index.html            # App layout
├── style.css             # Dark theme styling
└── package.json          # Project config and build settings
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## Contributing

Pull requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

To add new file types, edit the `CATEGORIES` object in `main.js`.

---

## Related

- [Downloads Organizer v1](https://github.com/mojouto3/downloads-organizer) The original lightweight PowerShell + NSIS version

---

## License

MIT License-free to use, modify, and share. See [LICENSE](LICENSE) for details.

---

## Author

Made with ☕ by [mojo](https://github.com/mojouto3) / mojomultimedia
