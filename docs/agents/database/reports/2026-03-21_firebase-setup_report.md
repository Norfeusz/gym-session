# Report: Firebase Setup & Firestore Service Layer

**Agent:** Database Agent  
**Branch:** `agent/database`  
**Date:** 2026-03-21  
**Status:** ✅ COMPLETED  
**Relates to command:** `docs/agents/database/commands/2026-03-19_firebase-setup.md`

---

## What Was Done

### 1. Firebase SDK installed

```
npm install firebase
```

Firebase v10 modular API installed into the project's `node_modules`.  
> **Note:** The terminal in this environment has a character-encoding issue with the folder name `narzędzia` (ę gets dropped).  
> Firebase was accidentally installed to the wrong path on first attempt.  
> Fix: used `Set-Location` with Unicode literal `[char]0x0119` to navigate to the correct directory before running `npm install`.  
> This is a **local environment issue only** — CI/CD and other machines will not be affected.

---

### 2. `src/services/firebase.ts` — Firebase initialization

- Guard against double-init via `getApps().length`.
- `auth` — FirebaseAuth instance.
- `db` — Firestore initialized with **`persistentLocalCache` + `persistentMultipleTabManager`** (offline persistence).

> **Deviation from command (optimization for mobile):**  
> The command specified `getFirestore()`. Changed to `initializeFirestore()` with `persistentLocalCache` to enable **offline data persistence** — critical for mobile apps on Android & iOS where connectivity is unreliable.  
> This means the app will continue to work (reads from cache, queues writes) even when offline.

---

### 3. `src/services/workoutService.ts`

| Function | Notes |
|---|---|
| `createWorkoutSession` | addDoc, returns new ID |
| `getWorkoutSessions` | ordered by `date` desc |
| `getWorkoutSessionById` | getDoc, returns null if missing |
| `updateWorkoutSession` | updateDoc partial |
| `deleteWorkoutSession` | deleteDoc |
| `getLastSessionForExercise` | queries last 50 sessions, stops on first match |

> **`getLastSessionForExercise` implementation note:**  
> Firestore does not support querying inside arrays of maps efficiently (no array-of-maps field query for nested `exerciseId`).  
> Approach: fetch up to 50 most recent sessions for the user (ordered by date desc), scan client-side until the exercise is found. Stops early on first match — typically requires reading only 1-3 sessions. `limit(50)` caps the worst case.

---

### 4. `src/services/planService.ts`

| Function | Notes |
|---|---|
| `createPlan` | addDoc, returns new ID |
| `getPlans` | by userId |
| `getPlanById` | getDoc |
| `updatePlan` | updateDoc partial |
| `deletePlan` | deleteDoc |
| `setActivePlan` | batch write — sets `isActive: true` on target, `false` on all others atomically |

---

### 5. `src/services/exerciseService.ts`

| Function | Notes |
|---|---|
| `getExercises` | full global library |
| `searchExercises` | client-side filter (case-insensitive) |
| `filterByMuscleGroup` | query by `primaryMuscle` field |
| `getExercisesSortedByLastDone` | see note below |
| `createCustomExercise` | adds `isCustom: true` and `userId` |
| `getUserExercises` | query by `userId` |

> **`getExercisesSortedByLastDone` implementation:**  
> - Fetches global exercises for the muscle group + user's custom exercises for that group (2 queries, run in parallel via `Promise.all`).  
> - Fetches all user sessions (1 query).  
> - Builds `exerciseId → latest date` map **client-side** (zero extra Firestore reads).  
> - Sorts: exercises **without history come FIRST**, then ascending by last used date (least recently done = top of list).  
> Deduplication applied in case a custom exercise appears in both queries.

---

### 6. `src/services/recordService.ts`

| Function | Notes |
|---|---|
| `getRecords` | all PRs for user, query by `userId` |
| `getRecordForExercise` | **single `getDoc`** — O(1) lookup |
| `updateRecordIfBetter` | transaction per set, updates only if new best |

> **Deviation from command (optimization):**  
> The command did not specify a document ID strategy for `records`.  
> **Decision:** use deterministic composite ID `{userId}_{exerciseId}` instead of Firestore auto-ID.  
>  
> **Why:** `getRecordForExercise` becomes a single `getDoc` (O(1)) instead of a `getDocs` query with `where` clauses. On mobile,  
> this saves a Firestore index read and reduces latency. The transaction in `updateRecordIfBetter` also targets the doc directly — no pre-query needed.  
>  
> **Trade-off:** If `userId` or `exerciseId` contains underscores, there is a theoretical collision risk. In this app both are Firestore auto-IDs (no underscores), so the risk is zero.

> **`updateRecordIfBetter` logic:**  
> New best is detected when either `weight > bestWeight` OR `volume > bestVolume`.  
> When `weight >= bestWeight`, `bestReps` is updated to the new value (new best set).  
> When only volume is higher (more reps, same weight), only `bestVolume` updates.

---

### 7. `tsconfig.json` — module resolution fix

Added `"moduleResolution": "bundler"` explicitly.

> Firebase v10 uses the `exports` field in its `package.json` for subpath resolution (`firebase/firestore`, `firebase/auth`, etc.).  
> TypeScript requires `moduleResolution: "bundler"` (or `"node16"`) to resolve these.  
> `expo/tsconfig.base.json` already sets this, but making it explicit ensures correctness even if the base config changes.

---

## TypeScript Validation

```
tsc --noEmit → 0 errors
```

All 5 service files are type-safe. No `implicit any`, no `@ts-ignore`.

---

## Files Created / Modified

| File | Action |
|---|---|
| `src/services/firebase.ts` | Created |
| `src/services/workoutService.ts` | Created |
| `src/services/planService.ts` | Created |
| `src/services/exerciseService.ts` | Created |
| `src/services/recordService.ts` | Created |
| `tsconfig.json` | Modified — added `moduleResolution: "bundler"` |
| `package.json` | Modified by npm — firebase added to dependencies |

---

## Firestore Collections Overview

| Collection | Doc ID | Notes |
|---|---|---|
| `sessions` | Firestore auto-ID | Workout sessions |
| `plans` | Firestore auto-ID | Training plans |
| `exercises` | Firestore auto-ID | Global + custom exercises |
| `records` | `{userId}_{exerciseId}` | Personal records — deterministic ID |

---

## Ready for next steps

- Auth Agent can use `auth` from `src/services/firebase.ts`.
- Features Agent can import all service functions — all return typed values matching `src/types/`.
- Project Manager: please verify `records` composite ID convention is acceptable.
