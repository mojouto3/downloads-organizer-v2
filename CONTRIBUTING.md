# Contributing to Downloads Organizer v2

Thank you for your interest in improving this project!

---

## Getting Started

1. Fork this repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/downloads-organizer-v2.git`
3. Install dependencies: `npm install`
4. Run the app: `npm start`
5. Make your changes
6. Test thoroughly on Windows
7. Submit a Pull Request with a clear description

---

## Adding New File Categories or Extensions

Open `main.js` and find the `CATEGORIES` object:

```javascript
const CATEGORIES = {
  Images: ['.jpg', '.jpeg', '.png', ...],
  // Add a new category:
  MyCategory: ['.abc', '.xyz'],
};
```

Then update `CATEGORY_ICONS` in `renderer.js` to add an emoji for your new category:

```javascript
const CATEGORY_ICONS = {
  MyCategory: '🗂️',
};
```

---

## UI Changes

- Styles are in `style.css` using CSS variables — edit `--green`, `--bg`, `--surface` etc. to change the theme
- Layout is in `index.html`
- UI logic is in `renderer.js`

---

## Translations

To add a new language, add `data-XX` attributes to elements in `index.html` and handle them in the `toggleLang()` function in `renderer.js`.

---

## Versioning

This project uses [Semantic Versioning](https://semver.org/):
- **Patch** (2.0.x): Bug fixes
- **Minor** (2.x.0): New features or file types
- **Major** (x.0.0): Major UI or architecture changes

Always update `CHANGELOG.md` and the version in `package.json` before submitting a release PR.

---

## Reporting Issues

Please open a GitHub Issue and include:
- Your Windows version
- Steps to reproduce
- What you expected vs what happened
- Any error messages
