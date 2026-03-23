# Command: Authentication — Google Sign-In + AuthContext

**Issued by:** Project Manager  
**Date:** 2026-03-21  
**Priority:** High  
**Branch:** `agent/auth`

---

## Objective

Implement complete authentication: Google Sign-In as the primary method (one-tap, cross-device), with email/password as a fallback. Wire up an `AuthContext` so the entire app reacts to login/logout state. Replace the hardcoded `isAuthenticated = false` in `RootNavigator`.

---

## Context

- Expo SDK 55, managed workflow (no bare/ejected native code).
- Firebase is already initialized — import `auth` from `src/services/firebase.ts`.
- `RootNavigator.tsx` already switches between Auth and App stacks — it currently uses a hardcoded `const isAuthenticated = false`. Replace this with real Firebase state.
- `LoginScreen.tsx` and `RegisterScreen.tsx` are stubs — replace them fully.
- `AuthNavigator.tsx` has screens `Login` and `Register` — keep this structure, just implement the screens.
- Do **not** modify `AppNavigator.tsx`, `firebase.ts`, or any service file.

---

## Architecture Decision: Google Sign-In in Expo Managed Workflow

Use **`expo-auth-session`** with Google OAuth provider (`expo-auth-session/providers/google`).  
This is the correct approach for Expo managed workflow — it opens a browser-based OAuth flow (no native module needed), works on Android, iOS, and web.

Do **not** use `@react-native-google-signin/google-signin` — it requires bare workflow / native build.  
Do **not** use Firebase `signInWithRedirect` / `signInWithPopup` — not supported on React Native.

Flow:
1. User taps "Zaloguj przez Google" → `useAuthRequest` opens system browser / WebView
2. Browser redirects back → app receives `idToken`
3. App calls Firebase `signInWithCredential(auth, GoogleAuthProvider.credential(idToken))`
4. Firebase Auth confirms identity → `onAuthStateChanged` fires → user is logged in
5. `AuthContext` state updates → `RootNavigator` shows `AppNavigator`

---

## Tasks

### 1. Install dependencies

```
npx expo install expo-auth-session expo-crypto expo-web-browser
```

> `expo-crypto` and `expo-web-browser` are peer dependencies of `expo-auth-session`.  
> Use `npx expo install` (not `npm install`) to get Expo-compatible versions.

---

### 2. `app.json` — add scheme and Google client IDs

Add to the `expo` object in `app.json`:

```json
"scheme": "gymsession",
"android": {
  "googleServicesFile": "./google-services.json",
  "package": "com.norfeusz.gymsession"
},
"ios": {
  "bundleIdentifier": "com.norfeusz.gymsession"
},
"plugins": [
  "expo-auth-session"
]
```

> `scheme` is required for OAuth redirect URIs.  
> `google-services.json` will be provided by Project Manager before the first native build.  
> For development with Expo Go, scheme is handled automatically by `expo-auth-session`.

Google OAuth Client IDs come from `.env` (already in `.env.example`). Add to `.env.example` if not present:

```
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=
```

---

### 3. `src/context/AuthContext.tsx` — NEW FILE

Create an `AuthContext` that:

- Listens to `onAuthStateChanged` from Firebase Auth.
- Exposes:
  - `user: FirebaseUser | null` — current Firebase user (or null if not logged in)
  - `isLoading: boolean` — true while the initial auth state is being resolved
  - `signInWithGoogle: () => Promise<void>` — triggers Google OAuth flow
  - `signInWithEmail: (email: string, password: string) => Promise<void>` — Firebase email/password login
  - `signUpWithEmail: (email: string, password: string) => Promise<void>` — Firebase email/password registration
  - `signOut: () => Promise<void>` — Firebase sign out

- Show a loading screen (centered `ActivityIndicator`) while `isLoading` is true — prevents flashing the auth screen to already-logged-in users on cold start.

Keep the file under 120 lines. Put Google OAuth logic (`useGoogleAuth` hook) in a separate file.

---

### 4. `src/hooks/useGoogleAuth.ts` — NEW FILE

Extract the Google OAuth request/response logic here:

```ts
// Returns: { promptAsync, request } — call promptAsync() to trigger the flow
export function useGoogleAuth(onSuccess: (idToken: string) => Promise<void>): { ... }
```

Use `Google.useAuthRequest` from `expo-auth-session/providers/google`.  
Client IDs from `process.env.EXPO_PUBLIC_GOOGLE_*`.  
On success (`response?.type === 'success'`), extract `id_token` and pass to `onSuccess`.  
Handle errors: if `type === 'error'` or `id_token` is missing, throw descriptive Error.

---

### 5. `src/features/auth/LoginScreen.tsx` — REPLACE STUB

Full implementation:

- "Gym Session" title + subtitle "Śledzij swoje treningi".
- Large **"Zaloguj przez Google"** button (Google icon + white background, Material Design style).
- Divider `— lub —`
- Email input + Password input (with show/hide password toggle).
- **"Zaloguj się"** button (primary blue).
- **"Nie masz konta? Zarejestruj się"** link at the bottom → navigates to `Register`.
- Show `ActivityIndicator` while loading, disable all buttons during async operations.
- Show inline error message (red text) on failure — never use `Alert.alert`.
- No external UI library — plain `StyleSheet` only.

---

### 6. `src/features/auth/RegisterScreen.tsx` — REPLACE STUB

Full implementation:

- Title "Utwórz konto".
- Email input + Password input + Confirm Password input.
- **"Zarejestruj się"** button (primary blue).
- Validation before submit: email format check, passwords match, min. 8 characters.
- Show inline errors — never use `Alert.alert`.
- **"Masz już konto? Zaloguj się"** link → navigates back to `Login`.
- Show `ActivityIndicator` while loading.

---

### 7. `src/navigation/RootNavigator.tsx` — WIRE UP AuthContext

Replace hardcoded `isAuthenticated = false` with `AuthContext`:

```tsx
// Before (stub):
const isAuthenticated = false;

// After:
const { user, isLoading } = useAuth();
if (isLoading) return <LoadingScreen />;
```

Use `user !== null` to decide which stack to show. Wrap `<NavigationContainer>` with `<AuthProvider>` inside `App.tsx` (or wrap it in `RootNavigator` itself — your call, but document the choice in the report).

---

### 8. Error handling rules

| Scenario | Response |
|---|---|
| Google OAuth cancelled by user | Silent — do nothing, stay on Login screen |
| Network error | Inline message: "Brak połączenia. Spróbuj ponownie." |
| Wrong email/password | Inline message: "Nieprawidłowy email lub hasło." |
| Email already in use | Inline message: "Ten adres email jest już używany." |
| Weak password | Inline message: "Hasło musi mieć co najmniej 8 znaków." |

Parse Firebase error codes (`auth/wrong-password`, `auth/email-already-in-use`, etc.) and map to Polish messages.

---

## File Structure Expected

```
src/
  context/
    AuthContext.tsx          ← NEW
  hooks/
    useGoogleAuth.ts         ← NEW
  features/
    auth/
      LoginScreen.tsx        ← REPLACE stub
      RegisterScreen.tsx     ← REPLACE stub
  navigation/
    RootNavigator.tsx        ← MODIFY (wire up AuthContext)
app.json                     ← MODIFY (add scheme + plugins)
.env.example                 ← MODIFY (add Google client ID vars)
```

---

## Rules Reminder

1. **Validate first** — write `PENDING CLARIFICATION` report if anything is unclear.
2. **No external UI libraries** — only `react-native` StyleSheet.
3. **Inline errors only** — no `Alert.alert`, no `console.error` left in production code.
4. **Polish UI text** — all user-facing strings in Polish.
5. **< 120 lines per file.**
6. After completing all tasks:
   - `npm run tsc -- --noEmit` must pass (0 errors)
   - Commit: `feat(auth): google sign-in + email auth + AuthContext`
   - Push to `agent/auth`
   - Submit report: `docs/agents/auth/reports/2026-03-21_auth-google_report.md`

---

## Definition of Done

- [ ] `expo-auth-session`, `expo-crypto`, `expo-web-browser` installed
- [ ] `app.json` updated with scheme + plugins
- [ ] `.env.example` updated with Google client ID vars
- [ ] `src/context/AuthContext.tsx` created — exports `AuthProvider`, `useAuth`
- [ ] `src/hooks/useGoogleAuth.ts` created
- [ ] `LoginScreen.tsx` — Google button + email/password form + inline errors
- [ ] `RegisterScreen.tsx` — registration form + validation + inline errors
- [ ] `RootNavigator.tsx` — uses real `AuthContext` state, shows loading indicator
- [ ] `tsc --noEmit` passes
- [ ] Report submitted
