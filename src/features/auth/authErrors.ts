type FirebaseError = { code?: string };

const ERROR_MAP: Record<string, string> = {
  'auth/wrong-password': 'Nieprawidłowy email lub hasło.',
  'auth/invalid-credential': 'Nieprawidłowy email lub hasło.',
  'auth/user-not-found': 'Nieprawidłowy email lub hasło.',
  'auth/email-already-in-use': 'Ten adres email jest już używany.',
  'auth/weak-password': 'Hasło musi mieć co najmniej 8 znaków.',
  'auth/invalid-email': 'Podaj prawidłowy adres email.',
  'auth/network-request-failed': 'Brak połączenia. Spróbuj ponownie.',
  'auth/too-many-requests': 'Zbyt wiele prób. Spróbuj później.',
};

export function mapFirebaseAuthError(err: unknown): string {
  const code = (err as FirebaseError)?.code;
  if (code && ERROR_MAP[code]) return ERROR_MAP[code];
  return 'Wystąpił błąd. Spróbuj ponownie.';
}
