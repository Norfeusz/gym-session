# Agent Instructions — Gym Session App

## Project Overview

**Gym Session** is a mobile application built with **Expo (React Native + TypeScript)** and **Firebase** backend.  
It allows users to log gym workouts, track progress over time, follow training plans, and receive smart suggestions about what to train today.

**Repository:** https://github.com/Norfeusz/gym-session.git  
**Platform target:** Android & iOS  
**Tech stack:** Expo SDK, TypeScript, React Navigation, Firebase (Auth + Firestore), Recharts/Victory Native, Expo Notifications

---

## Agent Roster

| Agent | Branch | Responsibility |
|---|---|---|
| Project Manager | `main` | Architecture decisions, code review, merging, documentation |
| UI/Styling Agent | `agent/ui-styling` | Components, colors, fonts, layout, design system |
| Database Agent | `agent/database` | Firebase schema, Firestore queries, data models, migrations |
| Auth Agent | `agent/auth` | Login, registration, session management, protected routes |
| Features Agent | `agent/features` | Workout logging, training plans, rest timer, exercise suggestions |
| Notifications Agent | `agent/notifications` | Push notifications, reminders, scheduling |
| Analytics Agent | `agent/analytics` | Progress charts, volume/intensity stats, personal records |

---

## Rules (All Agents Must Follow)

### 1. Communication Protocol

All communication happens through dedicated folders inside `docs/agents/<agent-name>/`:

- **`docs/agents/<agent-name>/commands/`** — The Project Manager places task files here (format: `YYYY-MM-DD_short-title.md`).
- **`docs/agents/<agent-name>/reports/`** — The agent places completion reports here after finishing each task (same naming format).

Agents must **not** start work until a command file appears in their `commands/` folder.  
After completing a task, the agent must submit a report **before** pushing to their branch.

### 2. Code Parceling — No Wall of Code

- Prefer **many small files** over few large ones.
- A single file should ideally do **one thing** (one component, one utility, one hook, one service).
- Target: **< 150 lines per file** as a soft limit. Over 200 lines — consider splitting.
- Folder structure should reflect feature ownership, e.g.:
  ```
  src/
    features/
      workout/
        WorkoutScreen.tsx
        useWorkoutSession.ts
        workoutService.ts
        workout.types.ts
    components/
      ui/
        Button.tsx
        Card.tsx
  ```

### 3. Validation Before Action

Before implementing any task, the agent must:
1. Re-read the command file carefully.
2. List any **ambiguous points** or **missing information**.
3. Ask clarifying questions — write them in the report file with status `PENDING CLARIFICATION` before doing any code work.
4. Only proceed with implementation once all doubts are resolved.

**When in doubt — always ask. Never assume.**

### 4. Git Branching

- Every agent works exclusively on their own branch (see Agent Roster above).
- Branch naming: `agent/<role>` — e.g., `agent/ui-styling`.
- After completing each task:
  1. Commit with a meaningful message: `feat(ui): add ExerciseCard component`
  2. Push to your branch: `git push origin agent/<role>`
  3. **Do not merge into `main`** — that is the Project Manager's responsibility.
- Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat:` — new feature
  - `fix:` — bug fix
  - `docs:` — documentation
  - `style:` — formatting, no logic change
  - `refactor:` — code restructure
  - `chore:` — tooling, dependencies

### 5. Merging — Project Manager Only

The Project Manager (main agent / human developer):
1. Reviews the agent's report.
2. Reviews the code diff on the branch.
3. Merges to `main` via Pull Request on GitHub.
4. Updates `docs/technical-documentation.md` after each merge.

### 6. Documentation Updates

After every merge, the Project Manager updates:
- **`docs/technical-documentation.md`** — new/changed files, functions, line references.
- The relevant section of **`docs/user-manual.md`** if the feature is user-facing.

---

## File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| React component | PascalCase | `WorkoutCard.tsx` |
| Hook | camelCase, prefix `use` | `useWorkoutSession.ts` |
| Service/API | camelCase, suffix `Service` | `workoutService.ts` |
| Types/interfaces | camelCase, suffix `.types` | `workout.types.ts` |
| Constants | camelCase, suffix `.constants` | `colors.constants.ts` |
| Screens | PascalCase, suffix `Screen` | `DashboardScreen.tsx` |
| Command files | `YYYY-MM-DD_short-title.md` | `2026-03-18_create-login-screen.md` |
| Report files | `YYYY-MM-DD_short-title_report.md` | `2026-03-18_create-login-screen_report.md` |

---

## Environment

- Node.js + npm/yarn
- Expo CLI (`npx expo`)
- TypeScript strict mode enabled
- ESLint + Prettier configured
- Firebase project: to be configured (credentials in `.env`, never committed)

---

*This file is maintained by the Project Manager. Last updated: 2026-03-18*
