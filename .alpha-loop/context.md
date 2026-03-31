## Architecture
- **Entry point**: `index.html` loads `src/main.js` as an ES module into a `<div id="app">` — currently a placeholder ("Coming soon...")
- **No backend/database**: Pure client-side SPA. CLAUDE.md plans for `src/storage.js` (localStorage) and `src/todo.js` (business logic), but neither file exists yet
- **Build**: Vite serves on port 3000 (dev and preview). No plugins, no special config
- **Key directories**: `src/` for app code (only `main.js` exists), `tests/unit/` for Vitest, `tests/e2e/` for Playwright (empty)
- **State**: Project is scaffolded but feature-incomplete — only boilerplate and config exist

## Conventions
- Vanilla JS with ES modules, no frameworks/TypeScript — functional style, no classes
- Unit tests in `tests/unit/*.test.js` using Vitest (`environment: 'node'`); E2E tests in `tests/e2e/*.spec.js` using Playwright
- Business logic must stay in `src/todo.js` as pure functions; DOM manipulation only in `src/main.js`; persistence in `src/storage.js`
- CSS goes in a single `src/style.css` (does not exist yet)
- Run `npm test` before committing

## Critical Rules
- **Three-file separation**: `todo.js` (pure logic), `main.js` (DOM), `storage.js` (persistence) — do not mix concerns
- **Playwright expects `npm run preview` on port 3000** — must `npm run build` first; the `webServer` config handles this automatically
- **Vitest runs in `node` environment** — unit tests must not touch the DOM; keep `todo.js` functions pure
- **No dependencies beyond devDependencies** — this is a zero-runtime-dependency project; don't add frameworks
- `index.html` is the single page — the `#app` div is the mount point for all rendered content

## Active State
- **Test status**: (will be filled in by the loop)
- **Recent changes**: (will be filled in by the loop)
