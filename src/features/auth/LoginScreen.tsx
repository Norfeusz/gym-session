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
import { useGoogleAuth } from '@hooks/useGoogleAuth';
import { mapFirebaseAuthError } from '@features/auth/authErrors';

type LoginNav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { promptAsync } = useGoogleAuth(
    async (idToken) => {
      setLoading(true);
      setError(null);
      try {
        await signInWithGoogle(idToken);
      } finally {
        setLoading(false);
      }
    },
    (err) => setError(err.message),
  );

  const handleEmailLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
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
      <Text style={styles.title}>Gym Session</Text>
      <Text style={styles.subtitle}>Śledź swoje treningi</Text>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={() => promptAsync()}
        disabled={loading}
      >
        <Text style={styles.googleButtonText}>G</Text>
        <Text style={styles.googleLabel}>Zaloguj przez Google</Text>
      </TouchableOpacity>

      <Text style={styles.divider}>— lub —</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />

      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Hasło"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setShowPassword((v) => !v)}
        >
          <Text style={styles.toggleText}>{showPassword ? 'Ukryj' : 'Pokaż'}</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabled]}
        onPress={handleEmailLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Zaloguj się</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
        <Text style={styles.link}>Nie masz konta? Zarejestruj się</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#111827' },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#6B7280', marginBottom: 32 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  googleButtonText: { fontSize: 18, fontWeight: 'bold', color: '#EA4335', marginRight: 8 },
  googleLabel: { fontSize: 16, color: '#374151' },
  divider: { textAlign: 'center', color: '#9CA3AF', marginVertical: 16 },
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
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  passwordInput: { flex: 1, marginBottom: 0 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 12 },
  toggleText: { color: '#2563EB', fontSize: 14 },
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

