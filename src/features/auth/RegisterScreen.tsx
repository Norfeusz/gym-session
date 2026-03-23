import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@navigation/navigation.types';
import { useAuth } from '@/context/AuthContext';
import { mapFirebaseAuthError } from '@features/auth/authErrors';

type RegisterNav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNav>();
  const { signUpWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Podaj prawidłowy adres email.';
    if (password.length < 8) return 'Hasło musi mieć co najmniej 8 znaków.';
    if (password !== confirmPassword) return 'Hasła nie są identyczne.';
    return null;
  };

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password);
    } catch (err: unknown) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Utwórz konto</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Hasło (min. 8 znaków)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Powtórz hasło"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!loading}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Zarejestruj się</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
        <Text style={styles.link}>Masz już konto? Zaloguj się</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#111827', marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#111827',
  },
  error: { color: '#DC2626', fontSize: 14, marginBottom: 12 },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.6 },
  link: { textAlign: 'center', color: '#2563EB', fontSize: 14 },
});

