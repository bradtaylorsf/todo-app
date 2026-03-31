# CLAUDE.md

## Project: Todo App

A simple, vanilla JavaScript todo list app. No frameworks — just HTML, CSS, and plain JS with Vite as the build tool.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vanilla JS, HTML, CSS |
| **Build** | Vite |
| **Unit Tests** | Vitest |
| **E2E Tests** | Playwright |

## Commands

```bash
npm run dev         # Start dev server on port 3000
npm run build       # Build for production
npm run preview     # Preview production build on port 3000
npm test            # Run unit tests (vitest)
npm run test:e2e    # Run Playwright E2E tests
```

## Directory Structure

```
todo-app/
├── src/
│   ├── main.js          # App entry point
│   ├── todo.js           # Todo logic (add, remove, toggle, filter)
│   └── storage.js        # LocalStorage persistence
├── tests/
│   ├── unit/             # Vitest unit tests
│   └── e2e/              # Playwright E2E tests
├── index.html            # Single page
├── vite.config.js
├── vitest.config.js
└── playwright.config.js
```

## Code Style

- Vanilla JavaScript (no TypeScript, no React, no frameworks)
- ES modules (`import`/`export`)
- Functional style — no classes
- CSS in a single `src/style.css` file
- All DOM manipulation in `src/main.js`
- Business logic (add, remove, toggle, filter) in `src/todo.js` (pure functions, no DOM)
- Storage in `src/storage.js`

## Testing Rules

- Unit tests go in `tests/unit/` with `.test.js` suffix
- E2E tests go in `tests/e2e/` with `.spec.js` suffix
- Unit tests should test `todo.js` pure functions (no DOM needed)
- E2E tests should test the full UI flow in a real browser
- Run `npm test` before committing
