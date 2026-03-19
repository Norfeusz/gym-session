# Command: Firebase Setup & Firestore Service Layer

**Issued by:** Project Manager  
**Date:** 2026-03-19  
**Priority:** High  
**Branch:** `agent/database`

---

## Objective

Install and configure Firebase in the project, then build the complete service layer for Firestore — all CRUD operations needed by the app.

---

## Context

- Expo SDK 55, React Native + TypeScript strict mode.
- TypeScript types are in `src/types/` — use them, do not redefine.
- Env vars via `EXPO_PUBLIC_*` prefix (Expo built-in `.env` support).
- Firebase SDK **v10 modular API only** — `import { getFirestore } from 'firebase/firestore'`. Never use compat API.
- `.env.example` is at root. Real `.env` will be provided by Project Manager before testing.

---

## App Logic to Understand Before Writing Code

**Training Plans** store only *structure*, not specific exercises:
- Which muscle groups to train (e.g. chest + back)
- How many exercises per muscle group (e.g. 3 chest exercises)
- Sets per exercise (e.g. 4 — applies to every exercise in the session)
- Rest between sets (seconds)
- Specific exercises are chosen by the user *during* the workout, not stored in the plan.

**Workout Sessions** have a `startType`:  
- `'suggested'` — app suggested the plan based on history  
- `'plan'` — user picked a plan manually  
- `'free'` — user picked exercises freely, no plan  

**Personal Records** (`records` collection) store the best performance per exercise per user. Must be updated automatically when a session is saved and a new best is detected (use a Firestore transaction).

**Exercise suggestion logic** (query needed):  
- For a given muscle group, fetch sessions containing exercises of that group → sort exercises by most recent `date` ascending → return list. This is used to sort exercises from "least recently done" in `ExercisePicker` screen.

---

## Tasks

### 1. Install Firebase

```
npm install firebase
```

### 2. Firebase Initialization — `src/services/firebase.ts`

- Initialize Firebase app using `EXPO_PUBLIC_*` env vars.
- Export `auth` (Firebase Auth instance) and `db` (Firestore instance).
- Guard against double-initialization with `getApps().length`.

### 3. Workout Service — `src/services/workoutService.ts`

| Function | Signature | Description |
|---|---|---|
| `createWorkoutSession` | `(data: Omit<WorkoutSession, 'id'>) => Promise<string>` | Add session, return new doc ID |
| `getWorkoutSessions` | `(userId: string) => Promise<WorkoutSession[]>` | All sessions, ordered by date desc |
| `getWorkoutSessionById` | `(sessionId: string) => Promise<WorkoutSession \| null>` | Single session |
| `updateWorkoutSession` | `(sessionId: string, data: Partial<WorkoutSession>) => Promise<void>` | Update fields |
| `deleteWorkoutSession` | `(sessionId: string) => Promise<void>` | Delete session |
| `getLastSessionForExercise` | `(userId: string, exerciseId: string) => Promise<WorkoutExercise \| null>` | Fetch most recent set data for a given exercise — used to show "Osiągi" suggestion before each exercise |

### 4. Training Plan Service — `src/services/planService.ts`

| Function | Signature | Description |
|---|---|---|
| `createPlan` | `(data: Omit<TrainingPlan, 'id'>) => Promise<string>` | Add plan |
| `getPlans` | `(userId: string) => Promise<TrainingPlan[]>` | All plans for user |
| `getPlanById` | `(planId: string) => Promise<TrainingPlan \| null>` | Single plan |
| `updatePlan` | `(planId: string, data: Partial<TrainingPlan>) => Promise<void>` | Update plan |
| `deletePlan` | `(planId: string) => Promise<void>` | Delete plan |
| `setActivePlan` | `(userId: string, planId: string) => Promise<void>` | Set one plan active, deactivate all others — use a **batch write** |

### 5. Exercise Service — `src/services/exerciseService.ts`

| Function | Signature | Description |
|---|---|---|
| `getExercises` | `() => Promise<Exercise[]>` | Full global library |
| `searchExercises` | `(query: string) => Promise<Exercise[]>` | Filter by name (client-side, case-insensitive) |
| `filterByMuscleGroup` | `(muscle: MuscleGroup) => Promise<Exercise[]>` | Filter by primary muscle |
| `getExercisesSortedByLastDone` | `(userId: string, muscle: MuscleGroup) => Promise<Exercise[]>` | Returns exercises for a muscle group sorted from least recently done — used in ExercisePicker |
| `createCustomExercise` | `(userId: string, data: Omit<Exercise, 'id'>) => Promise<string>` | Add user custom exercise |
| `getUserExercises` | `(userId: string) => Promise<Exercise[]>` | Fetch user's custom exercises |

### 6. Records Service — `src/services/recordService.ts`

| Function | Signature | Description |
|---|---|---|
| `getRecords` | `(userId: string) => Promise<ExerciseRecord[]>` | All PRs for user |
| `getRecordForExercise` | `(userId: string, exerciseId: string) => Promise<ExerciseRecord \| null>` | PR for one exercise |
| `updateRecordIfBetter` | `(userId: string, session: WorkoutSession) => Promise<void>` | After saving a session, compare each exercise's best set against stored record — update via transaction if new best |

### 7. Suggestion Service — `src/services/suggestionService.ts`

| Function | Signature | Description |
|---|---|---|
| `getSuggestedMuscleGroups` | `(userId: string) => Promise<MuscleGroup[]>` | Returns muscle groups ordered by how long ago they were last trained (longest first) — used for "Sugerowany plan" option |

### 8. Firestore Security Rules — `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for exercise library
    match /exercises/{doc} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    // Users own their data
    match /workouts/{doc} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /plans/{doc} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /records/{doc} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## File Structure Expected

```
src/services/
  firebase.ts
  workoutService.ts
  planService.ts
  exerciseService.ts
  recordService.ts
  suggestionService.ts
firestore.rules
```

---

## Rules Reminder

1. **Validate first** — write a `PENDING CLARIFICATION` report if anything is unclear.
2. **One file = one responsibility.**
3. **< 150 lines per file.**
4. **Use existing types** from `@types/*`. Do not duplicate interfaces.
5. **No hardcoded Firebase config** — only `process.env.EXPO_PUBLIC_*`.
6. After completing all tasks:
   - `npm run tsc -- --noEmit` must pass with no errors
   - Commit: `feat(database): firebase setup and firestore service layer`
   - Push to `agent/database`
   - Submit report: `docs/agents/database/reports/2026-03-19_firebase-setup_report.md`

---

## Definition of Done

- [ ] `firebase` in `package.json`
- [ ] `firebase.ts` — exports `auth` and `db`
- [ ] `workoutService.ts` — 6 functions
- [ ] `planService.ts` — 6 functions
- [ ] `exerciseService.ts` — 6 functions
- [ ] `recordService.ts` — 3 functions
- [ ] `suggestionService.ts` — 1 function
- [ ] `firestore.rules` created
- [ ] `tsc --noEmit` passes
- [ ] Report submitted


---

## Tasks

### 1. Install Firebase SDK

```
npm install firebase
```

### 2. Firebase Initialization

Create **`src/services/firebase.ts`**  
- Initialize Firebase app using `EXPO_PUBLIC_*` env vars.
- Export `auth` (Firebase Auth instance) and `db` (Firestore instance).
- Guard against double-initialization.

### 3. Workout Service

Create **`src/services/workoutService.ts`**  
Implement the following functions (all async, all typed):

| Function | Description |
|---|---|
| `createWorkoutSession(userId, session)` | Add a new workout session to Firestore |
| `getWorkoutSessions(userId)` | Fetch all sessions for a user, ordered by date desc |
| `getWorkoutSessionById(sessionId)` | Fetch a single session by ID |
| `updateWorkoutSession(sessionId, data)` | Update fields on an existing session |
| `deleteWorkoutSession(sessionId)` | Delete a session |

### 4. Training Plan Service

Create **`src/services/planService.ts`**  
Implement:

| Function | Description |
|---|---|
| `createPlan(userId, plan)` | Add a new training plan |
| `getPlans(userId)` | Fetch all plans for a user |
| `getPlanById(planId)` | Fetch a single plan by ID |
| `updatePlan(planId, data)` | Update plan fields |
| `deletePlan(planId)` | Delete a plan |
| `setActivePlan(userId, planId)` | Set one plan as active, deactivate all others (transaction) |

### 5. Exercise Service

Create **`src/services/exerciseService.ts`**  
Implement:

| Function | Description |
|---|---|
| `getExercises()` | Fetch all exercises from global library |
| `searchExercises(query)` | Filter by name (client-side) |
| `filterExercisesByMuscle(muscle)` | Filter by muscle group |
| `createCustomExercise(userId, exercise)` | Add a custom exercise for a user |
| `getUserExercises(userId)` | Fetch user's custom exercises |

### 6. Firestore Security Rules

Create **`firestore.rules`** at project root with rules that:
- Allow users to read/write only their own `workouts` and `plans` documents (`userId == request.auth.uid`)
- Allow all authenticated users to read `exercises`
- Block all unauthenticated access

---

## File Structure Expected

```
src/
  services/
    firebase.ts          (new)
    workoutService.ts    (new)
    planService.ts       (new)
    exerciseService.ts   (new)
firestore.rules          (new)
```

---

## Rules Reminder

1. **Validate first** — if anything is unclear, write questions in a `PENDING CLARIFICATION` report before writing any code.
2. **One file = one responsibility** — do not merge services into one file.
3. **< 150 lines per file** — if a service grows too large, split into smaller helpers.
4. **Use existing types** — import from `@types/workout.types`, `@types/plan.types`, `@types/exercise.types`. Do not duplicate interfaces.
5. **No hardcoded Firebase config** — only `process.env.EXPO_PUBLIC_*`.
6. After completing all tasks:
   - Commit: `feat(database): firebase setup and firestore service layer`
   - Push to `agent/database`
   - Submit a report to `docs/agents/database/reports/2026-03-19_firebase-setup_report.md`

---

## Definition of Done

- [ ] `firebase` package installed and in `package.json`
- [ ] `src/services/firebase.ts` exports `auth` and `db`
- [ ] `workoutService.ts` — all 5 functions implemented and typed
- [ ] `planService.ts` — all 6 functions implemented and typed
- [ ] `exerciseService.ts` — all 5 functions implemented and typed
- [ ] `firestore.rules` created
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] Report submitted to `docs/agents/database/reports/`
