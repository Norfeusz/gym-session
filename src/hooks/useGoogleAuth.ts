import { useEffect, useRef } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(
  onSuccess: (idToken: string) => Promise<void>,
  onError?: (err: Error) => void,
): { promptAsync: () => void } {
  const [, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
  });

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const idToken = response.params?.id_token;
      if (!idToken) {
        onErrorRef.current?.(new Error('Brak tokenu Google. Spróbuj ponownie.'));
        return;
      }
      onSuccessRef.current(idToken).catch((err: unknown) => {
        onErrorRef.current?.(err instanceof Error ? err : new Error('Błąd logowania Google.'));
      });
    } else if (response.type === 'error') {
      onErrorRef.current?.(new Error('Błąd logowania Google. Spróbuj ponownie.'));
    }
    // type === 'cancel' | 'dismiss' — silent, user cancelled
  }, [response]);

  return { promptAsync };
}
