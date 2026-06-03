# Changelog

All notable changes to Downloads Organizer v2 will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] - 2026-06-03

### Added
- Complete rewrite as a modern Electron desktop application
- Graphical user interface with dark theme and green accents
- Smart preview — shows files grouped by category before organizing
- Undo support — restores all moved files back to their original location
- Log history — every session saved to `downloads-organizer.log` in user home
- Auto-schedule — runs automatically every Monday at 9:00 AM via Windows Task Scheduler
- Bilingual support — Greek and English, switchable in real time
- Custom frameless window with minimize and close controls
- Custom app icon (branded with mojomultimedia colors)
- Browse any folder, not just Downloads
- "My Downloads" quick button to auto-detect the user's Downloads folder
- Toast notifications for feedback
- electron-builder NSIS installer with Desktop shortcut

### Changed
- Replaced PowerShell script with Node.js file operations
- Replaced NSIS-only installer with electron-builder pipeline

---

## [1.0.1] - 2026-05-25

> See [Downloads Organizer v1](https://github.com/mojouto3/downloads-organizer)

### Added
- Custom icon for Desktop shortcut

---

## [1.0.0] - 2026-05-25

> See [Downloads Organizer v1](https://github.com/mojouto3/downloads-organizer)

### Added
- Initial release — PowerShell script with NSIS installer
- 9 file categories
- Duplicate filename handling
- Color-coded output
