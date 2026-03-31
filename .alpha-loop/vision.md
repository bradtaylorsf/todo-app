Here's the project vision document:

---

## What We're Building

A focused, daily-driver to-do list built to keep the CEO of Last Rev and AnswerAgent AI organized and on task. This is a personal productivity tool that prioritizes speed, clarity, and zero friction — it should feel like an extension of how the CEO already thinks about their day, not another app to manage.

## Who It's For

Semi-technical power users and admins who value efficiency over hand-holding. They're comfortable with keyboard shortcuts, expect snappy interactions, and will notice sluggish UI or unnecessary confirmation dialogs. Design for competence: minimize clicks, maximize information density, and trust the user to know what they're doing. Skip onboarding flows and tutorials — make the interface self-evident instead.

## Current Stage & Priority

Greenfield project with core architecture in place (vanilla JS, Vite, functional style). The app works — the priority now is making it **delightful**. That means: polished dark mode UI, smooth micro-interactions, satisfying transitions, and an experience that feels crafted rather than thrown together. Get the UX patterns right now so they scale as features are added.

## Decision Guidelines

- **Dark mode is the default and primary experience.** Design for dark first; light mode is not a priority. Choose colors, contrast, and shadows that look intentional on dark backgrounds.
- **Speed over features.** A fast, polished app with fewer features beats a slow app with many. Defer anything that adds latency or visual clutter.
- **Keep the stack simple.** Vanilla JS, no frameworks. If a feature would require a framework to implement well, simplify the feature instead.
- **Interactions should feel physical.** Adds, completions, and deletions should have subtle animations that give feedback. No jarring state changes.
- **Keyboard-first, mouse-friendly.** Power users live on the keyboard. Every core action should be reachable without a mouse, but the mouse experience should be equally polished.
- **Architecture decisions should favor the clean separation already established.** Pure functions in `todo.js`, DOM in `main.js`, persistence in `storage.js`. Don't blur these boundaries.
- **When in doubt, ship less but ship it polished.** One well-crafted feature beats three half-finished ones.

## What Good Looks Like

- **The app feels instant.** Adding, completing, and removing todos has zero perceptible delay. Transitions are smooth (< 200ms) and purposeful.
- **The dark mode UI looks intentional and premium.** Proper contrast ratios, consistent spacing, subtle depth cues — not just "white text on black background."
- **A CEO can open it at 6 AM, dump their priorities, and start checking things off without friction.** The happy path requires no thought.
- **Tests pass, code is clean, and the architecture holds.** Unit tests cover business logic, E2E tests cover user flows, and the functional/modular style is maintained throughout.

---

Where would you like this saved? I'd suggest adding it to CLAUDE.md (so agents see it automatically) or as a standalone `VISION.md` file.
