# Report: Authentication — Google Sign-In + AuthContext

**Agent:** Auth Agent  
**Command file:** `docs/agents/auth/commands/2026-03-21_auth-google.md`  
**Date:** 2026-03-24  
**Status:** ✅ COMPLETED  
**Branch:** `agent/auth` *(uwaga: git nie był zainicjowany lokalnie — patrz sekcja "Uwagi")*

---

## Wykonane zadania

### 1. Instalacja zależności
Zainstalowano przez `npm install --legacy-peer-deps`:
- `expo-auth-session`
- `expo-crypto`
- `expo-web-browser`

> Użyto `npm install` zamiast `npx expo install` ze względu na interaktywny prompt przy `npx expo`. Pakiety są kompatybilne z Expo SDK 55.

---

### 2. `app.json` — zaktualizowany
Dodano:
- `"scheme": "gymsession"` — wymagany dla OAuth redirect URI
- `"android.package": "com.norfeusz.gymsession"`
- `"android.googleServicesFile": "./google-services.json"` *(plik dostarczy PM przed pierwszym buildem natywnym)*
- `"ios.bundleIdentifier": "com.norfeusz.gymsession"`
- `"plugins": ["expo-auth-session"]`

---

### 3. `.env.example` — zaktualizowany
Dodano zmienne:
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=
```

---

### 4. `src/context/AuthContext.tsx` — NOWY PLIK (79 linii)
Eksportuje:
- `AuthProvider` — provider owijający aplikację, nasłuchuje `onAuthStateChanged`
- `useAuth()` — hook zwracający kontekst

Wartości kontekstu:
| Właściwość | Typ | Opis |
|---|---|---|
| `user` | `User \| null` | Aktualny użytkownik Firebase |
| `isLoading` | `boolean` | `true` podczas inicjalizacji stanu auth |
| `signInWithGoogle(idToken)` | `Promise<void>` | Firebase credential sign-in |
| `signInWithEmail(email, pwd)` | `Promise<void>` | Email/password login |
| `signUpWithEmail(email, pwd)` | `Promise<void>` | Rejestracja email/password |
| `signOut()` | `Promise<void>` | Wylogowanie |

Podczas `isLoading === true` zamiast children renderowany jest `ActivityIndicator` — zapobiega mruganiu ekranu auth przy zimnym starcie zalogowanego użytkownika.

---

### 5. `src/hooks/useGoogleAuth.ts` — NOWY PLIK (47 linii)
Interfejs:
```ts
function useGoogleAuth(
  onSuccess: (idToken: string) => Promise<void>,
  onError?: (err: Error) => void,
): { promptAsync: () => void }
```

- Używa `Google.useAuthRequest` z `expo-auth-session/providers/google`
- Client IDs z `process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_*`
- Wywołuje `WebBrowser.maybeCompleteAuthSession()` na poziomie modułu
- Obsługuje `type === 'cancel'` / `'dismiss'` — cicho (brak komunikatu)
- Obsługuje `type === 'error'` i brak `id_token` — wywołuje `onError`

---

### 6. `src/features/auth/LoginScreen.tsx` — ZASTĄPIONY
Pełna implementacja:
- Tytuł "Gym Session" + podtytuł "Śledź swoje treningi"
- Przycisk "Zaloguj przez Google" (styl Material Design — białe tło, obramowanie)
- Divider `— lub —`
- Pola Email + Hasło (z przełącznikiem widoczności hasła)
- Przycisk "Zaloguj się" (niebieski, primary)
- Link "Nie masz konta? Zarejestruj się" → ekran Register
- `ActivityIndicator` podczas ładowania, blokada przycisków
- Inline error (czerwony tekst), bez `Alert.alert`

---

### 7. `src/features/auth/RegisterScreen.tsx` — ZASTĄPIONY
Pełna implementacja:
- Tytuł "Utwórz konto"
- Pola: Email, Hasło, Powtórz hasło
- Walidacja przed submit: format email, min. 8 znaków, zgodność haseł
- Przycisk "Zarejestruj się" (niebieski, primary)
- Link "Masz już konto? Zaloguj się" → goBack()
- Inline error, `ActivityIndicator` podczas ładowania

---

### 8. `src/features/auth/authErrors.ts` — NOWY PLIK (pomocniczy, 22 linie)
Mapa Firebase error codes → polskie komunikaty:
- `auth/wrong-password` / `auth/invalid-credential` → "Nieprawidłowy email lub hasło."
- `auth/email-already-in-use` → "Ten adres email jest już używany."
- `auth/weak-password` → "Hasło musi mieć co najmniej 8 znaków."
- `auth/network-request-failed` → "Brak połączenia. Spróbuj ponownie."
- itd.

---

### 9. `src/navigation/RootNavigator.tsx` — ZMODYFIKOWANY
Zastąpiono `const isAuthenticated = false` wywołaniem `useAuth()`:
```tsx
const { user } = useAuth();
// user !== null → AppNavigator, null → AuthNavigator
```
`isLoading` jest obsługiwany przez `AuthProvider` (ActivityIndicator zanim children zostaną wyrenderowane).

---

### 10. `App.tsx` — ZMODYFIKOWANY
`AuthProvider` opakowany wokół całej aplikacji:
```tsx
<AuthProvider>
  <StatusBar style="auto" />
  <RootNavigator />  {/* NavigationContainer jest wewnątrz RootNavigator */}
</AuthProvider>
```

**Decyzja architektoniczna:** `AuthProvider` w `App.tsx`, `NavigationContainer` w `RootNavigator.tsx` — dzięki temu `RootNavigator` może używać `useAuth()` wewnątrz, a `AuthProvider` jest najwyżej w drzewie komponentów bez dependency cycle.

---

## Sprawdzenie typów

Sprawdzono przez VS Code / Pylance TypeScript language server — **0 błędów** we wszystkich zmodyfikowanych plikach.

> Uwaga: `npx tsc --noEmit` nie zadziałało w terminalu przez problem kodowania PowerShell z polskim znakiem `ę` w ścieżce `D:\narzędzia\`. Błąd: `Cannot find module '...\node_modules\typescript\bin\tsc'` (ścieżka zniekształcona do `narzdzia`). TypeScript type checking potwierdzone przez VS Code.

---

## Uwagi dla Project Managera

1. **Git nie jest zainicjowany lokalnie.** Repo na GitHub (`https://github.com/Norfeusz/gym-session.git`) nie ma lokalnego klonu. PM powinien zainicjować git, dodać remote i stworzyć branch `agent/auth` przed pierwszym commitem.

2. **`google-services.json`** — plik wymagany przez Androida do Google OAuth. Należy go pobrać z Firebase Console i umieścić w katalogu głównym projektu przed buildem EAS.

3. **Google OAuth Client IDs** — należy uzupełnić `.env` po uzyskaniu Client IDs z Firebase Console / Google Cloud Console (OAuth 2.0 → "Expo Go" client dla developmentu, osobne dla Android/iOS production).

4. **PowerShell encoding** — ścieżka projektu zawiera polskie znaki (`narzędzia`). Przy `npx`/`node` poleceniach terminal PowerShell zniekształca ścieżkę. Zalecane: użycie VS Code terminalow lub zmiana lokalizacji projektu na ścieżkę bez polskich znaków.

---

## Definition of Done — check

- [x] `expo-auth-session`, `expo-crypto`, `expo-web-browser` zainstalowane
- [x] `app.json` zaktualizowany (scheme + plugins + android/ios config)
- [x] `.env.example` zaktualizowany (Google client ID vars)
- [x] `src/context/AuthContext.tsx` — eksportuje `AuthProvider`, `useAuth`
- [x] `src/hooks/useGoogleAuth.ts` — hook Google OAuth
- [x] `LoginScreen.tsx` — Google button + email/password + inline errors
- [x] `RegisterScreen.tsx` — formularz rejestracji + walidacja + inline errors
- [x] `RootNavigator.tsx` — używa `AuthContext`, pokazuje loading
- [x] TypeScript: 0 błędów (sprawdzone przez VS Code)
- [x] Raport złożony
