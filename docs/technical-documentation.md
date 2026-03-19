# Technical Documentation — Gym Session App

> **Status:** Living document — updated by Project Manager after every merge.
> **Last updated:** 2026-03-19
> **Repository:** https://github.com/Norfeusz/gym-session.git

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Feature Registry](#feature-registry)
4. [Data Models](#data-models)
5. [Firebase Schema](#firebase-schema)
6. [Navigation Map](#navigation-map)
7. [Environment Variables](#environment-variables)
8. [Dependencies](#dependencies)
9. [Changelog](#changelog)

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Expo (React Native) | SDK 55 |
| Language | TypeScript | 5.9 (strict mode) |
| Navigation | React Navigation | v7 |
| Backend | Firebase | v10 (modular SDK) — *not yet configured* |
| Auth | Firebase Authentication | — |
| Database | Cloud Firestore | — |
| Charts | Victory Native | *pending* |
| Notifications | Expo Notifications | *pending* |
| State management | React Context + hooks | — |
| Linting | ESLint + Prettier | ✅ configured |

---

## Project Structure

```
D:\narzędzia\Gym Session\
├── App.tsx                              # Entry point — mounts RootNavigator
├── index.ts                             # Expo entry registration
├── babel.config.js                      # Babel + module-resolver (path aliases)
├── tsconfig.json                        # TypeScript strict + path aliases
├── .eslintrc.json                       # ESLint (TS + React + Prettier)
├── .prettierrc                          # Prettier config
├── .env.example                         # Firebase env template (commit)
├── .gitignore
├── package.json
├── AGENT_INSTRUCTIONS.md                # Rules for all agents
├── docs/
│   ├── technical-documentation.md      # This file
│   ├── user-manual.md
│   └── agents/
│       ├── ui-styling/   {commands/, reports/}
│       ├── database/     {commands/, reports/}
│       ├── auth/         {commands/, reports/}
│       ├── features/     {commands/, reports/}
│       ├── notifications/{commands/, reports/}
│       └── analytics/    {commands/, reports/}
├── src/
│   ├── navigation/
│   │   ├── navigation.types.ts          # TypeScript param lists for all navigators
│   │   ├── RootNavigator.tsx            # Root stack: Auth | App
│   │   ├── AuthNavigator.tsx            # Stack: Login, Register
│   │   └── AppNavigator.tsx             # Bottom tabs: Dashboard, Workout, History, Plans
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx          # Stub
│   │   │   └── RegisterScreen.tsx       # Stub
│   │   ├── workout/
│   │   │   ├── DashboardScreen.tsx      # Stub
│   │   │   └── WorkoutScreen.tsx        # Stub
│   │   ├── analytics/
│   │   │   └── HistoryScreen.tsx        # Stub
│   │   ├── plans/
│   │   │   └── PlansScreen.tsx          # Stub
│   │   └── notifications/               # Empty — pending Notifications Agent
│   ├── components/
│   │   └── ui/                          # Empty — pending UI Agent
│   ├── hooks/                           # Empty — pending feature agents
│   ├── services/                        # Empty — pending Database Agent
│   ├── constants/                       # Empty — pending UI Agent
│   ├── types/
│   │   ├── user.types.ts                # User interface
│   │   ├── exercise.types.ts            # Exercise, MuscleGroup, Equipment
│   │   ├── workout.types.ts             # WorkoutSet, WorkoutExercise, WorkoutSession
│   │   └── plan.types.ts                # PlanExercise, PlanDay, TrainingPlan
│   └── utils/                           # Empty — pending feature agents
└── assets/                              # Expo default icons/splash
```

---

## Feature Registry

### NAVIGATION

| ID | File | Key export | Line | Status |
|---|---|---|---|---|
| NAV-01 | `src/navigation/navigation.types.ts` | `RootStackParamList`, `AuthStackParamList`, `AppTabParamList`, `AppStackParamList` | 1–30 | ✅ Done |
| NAV-02 | `src/navigation/RootNavigator.tsx` | `RootNavigator` | 1–25 | ✅ Stub auth check |
| NAV-03 | `src/navigation/AuthNavigator.tsx` | `AuthNavigator` | 1–16 | ✅ Done |
| NAV-04 | `src/navigation/AppNavigator.tsx` | `AppNavigator` (bottom tabs) | 1–18 | ✅ Done |

### AUTH

| ID | File | Key export | Status |
|---|---|---|---|
| A-01 | `src/features/auth/LoginScreen.tsx` | `LoginScreen` | 🔲 Stub |
| A-02 | `src/features/auth/RegisterScreen.tsx` | `RegisterScreen` | 🔲 Stub |
| A-03 | `src/navigation/RootNavigator.tsx` | Auth state → `isAuthenticated` | 🔲 Needs `AuthContext` |

**Owner:** Auth Agent (`agent/auth`)

### WORKOUT

| ID | File | Key export | Status |
|---|---|---|---|
| W-01 | `src/features/workout/DashboardScreen.tsx` | `DashboardScreen` | 🔲 Stub |
| W-02 | `src/features/workout/WorkoutScreen.tsx` | `WorkoutScreen` | 🔲 Stub |

**Owner:** Features Agent (`agent/features`)

### PLANS

| ID | File | Key export | Status |
|---|---|---|---|
| P-01 | `src/features/plans/PlansScreen.tsx` | `PlansScreen` | 🔲 Stub |

**Owner:** Features Agent (`agent/features`)

### ANALYTICS

| ID | File | Key export | Status |
|---|---|---|---|
| AN-01 | `src/features/analytics/HistoryScreen.tsx` | `HistoryScreen` | 🔲 Stub |

**Owner:** Analytics Agent (`agent/analytics`)

### TYPES

| ID | File | Exports | Status |
|---|---|---|---|
| T-01 | `src/types/user.types.ts` | `User` | ✅ Done |
| T-02 | `src/types/exercise.types.ts` | `Exercise`, `MuscleGroup`, `Equipment` | ✅ Done |
| T-03 | `src/types/workout.types.ts` | `WorkoutSet`, `WorkoutExercise`, `WorkoutSession` | ✅ Done |
| T-04 | `src/types/plan.types.ts` | `PlanExercise`, `PlanDay`, `TrainingPlan` | ✅ Done |

---

## Data Models

```typescript
// src/types/user.types.ts
interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
}

// src/types/exercise.types.ts
type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';
type Equipment = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'kettlebell' | 'other';

interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  primaryMuscle: MuscleGroup;
  equipment: Equipment;
  description?: string;
  isCustom?: boolean;
  userId?: string;
}

// src/types/workout.types.ts
interface WorkoutSet {
  setNumber: number;
  weight: number;       // kg
  reps: number;
  rpe?: number;         // 1–10
  completedAt: Timestamp;
}

interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
  notes?: string;
}

interface WorkoutSession {
  id: string;
  userId: string;
  planId?: string;
  date: Timestamp;
  startedAt: Timestamp;
  finishedAt?: Timestamp;
  exercises: WorkoutExercise[];
  totalVolume: number;  // sum(weight * reps)
  notes?: string;
}

// src/types/plan.types.ts
interface PlanExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: string;   // e.g. "8-12"
  targetWeight?: number;
}

interface PlanDay {
  dayLabel: string;
  exercises: PlanExercise[];
}

interface TrainingPlan {
  id: string;
  userId: string;
  name: string;
  daysPerWeek: number;
  days: PlanDay[];
  createdAt: Timestamp;
  isActive: boolean;
}
```

---

## Firebase Schema

> To be finalised by Database Agent (`agent/database`). Schema below is draft.

```
firestore/
├── users/{userId}
│   ├── displayName: string
│   ├── email: string
│   └── createdAt: Timestamp
│
├── exercises/{exerciseId}       (global library — public read)
│   ├── name: string
│   ├── muscleGroups: string[]
│   ├── primaryMuscle: string
│   └── equipment: string
│
├── workouts/{workoutId}
│   ├── userId: string
│   ├── startType: 'suggested' | 'plan' | 'free'
│   ├── planId?: string
│   ├── date: Timestamp
│   ├── setsPerExercise: number
│   ├── exercises: WorkoutExercise[]
│   └── totalVolume: number
│
├── plans/{planId}
│   ├── userId: string
│   ├── name: string
│   ├── setsPerExercise: number
│   ├── restBetweenSets: number
│   ├── muscleGroups: PlanMuscleGroup[]
│   └── isActive: boolean
│
└── records/{recordId}           (personal bests)
    ├── userId: string
    ├── exerciseId: string
    ├── bestWeight: number
    ├── bestReps: number
    ├── bestVolume: number
    ├── achievedAt: Timestamp
    └── sessionId: string
```

Security rules: users read/write only their own `workouts`, `plans`, `records`. `exercises` is public read.

---

## Navigation Map

```
RootNavigator  (src/navigation/RootNavigator.tsx)
├── AuthStack  (src/navigation/AuthNavigator.tsx)  — when !isAuthenticated
│   ├── LoginScreen
│   └── RegisterScreen
│
└── AppStack   (src/navigation/AppNavigator.tsx)
    ├── Tabs (BottomTabNavigator)
    │   ├── Exercises  → src/features/exercises/ExercisesScreen.tsx
    │   ├── Plans      → src/features/plans/PlansScreen.tsx
    │   ├── Records    → src/features/records/RecordsScreen.tsx  (Osiągi)
    │   └── Calendar   → src/features/calendar/CalendarScreen.tsx
    │
    │   [FAB] "Rozpocznij trening" → navigates to StartWorkout
    │
    ├── StartWorkout   → src/features/workout/StartWorkoutScreen.tsx
    │   "Co dziś robimy?" — 3 options:
    │     1. Sugerowany plan   (mode: 'suggested')
    │     2. Wybierz plan      (mode: 'plan')
    │     3. Wybierz ćwiczenia (mode: 'free')
    │
    ├── ChooseMuscleGroups     (plan selection / suggestion / free pick)
    ├── ExercisePicker         (sorted by least recently done within muscle group)
    ├── ActiveSession          (set logging + rest timer + Osiągi suggestion)
    ├── SessionSummary         (total volume, PRs broken)
    ├── ExerciseDetail         (progress charts for one exercise)
    ├── PlanEditor             (create/edit plan)
    ├── SessionDetail          (historical session detail)
    └── Settings
```

---

## Path Aliases (babel.config.js + tsconfig.json)

| Alias | Resolves to |
|---|---|
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@features/*` | `src/features/*` |
| `@hooks/*` | `src/hooks/*` |
| `@services/*` | `src/services/*` |
| `@navigation/*` | `src/navigation/*` |
| `@constants/*` | `src/constants/*` |
| `@types/*` | `src/types/*` |
| `@utils/*` | `src/utils/*` |

---

## Environment Variables

```bash
# .env.example  (committed)
# .env          (DO NOT commit — in .gitignore)

EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

---

## Dependencies

| Package | Purpose | Added by | Status |
|---|---|---|---|
| `expo` ~55 | Core framework | Project Manager | ✅ |
| `react-native` 0.83 | React Native runtime | Project Manager | ✅ |
| `@react-navigation/native` | Navigation | Project Manager | ✅ |
| `@react-navigation/native-stack` | Stack navigator | Project Manager | ✅ |
| `@react-navigation/bottom-tabs` | Tab navigator | Project Manager | ✅ |
| `react-native-screens` | Native screen optimization | Project Manager | ✅ |
| `react-native-safe-area-context` | Safe area support | Project Manager | ✅ |
| `firebase` | Backend (to be configured) | Database Agent | 🔲 pending |
| `victory-native` | Charts | Analytics Agent | 🔲 pending |
| `expo-notifications` | Push notifications | Notifications Agent | 🔲 pending |
| `babel-plugin-module-resolver` | Path aliases | Project Manager | ✅ |
| `eslint` + plugins | Linting | Project Manager | ✅ |
| `prettier` | Formatting | Project Manager | ✅ |

---

## Changelog

| Date | Version | Change | Agent | Branch |
|---|---|---|---|---|
| 2026-03-19 | 0.1.0 | Initial documentation structure | Project Manager | main |
| 2026-03-19 | 0.2.0 | Expo scaffold, navigation structure, TypeScript types, ESLint/Prettier | Project Manager | main |
| 2026-03-19 | 0.3.0 | Architecture revision based on app flow diagram: new data models (PlanMuscleGroup, WorkoutStartType, ExerciseRecord), redesigned navigation (4 tabs + FAB), StartWorkoutScreen with 3 modes | Project Manager | main |

---

*Updated by Project Manager after each branch merge.*
