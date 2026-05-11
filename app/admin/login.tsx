import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ADMIN_LONG_PRESS_MS } from '../../src/constants/config';
import { useAppData } from '../../src/context/AppDataContext';
import { AdminAuthError } from '../../src/services/adminAuth';
import { colors, space } from '../../src/theme/tokens';

const CAPTCHA_WORD = 'monday';

export default function AdminLoginScreen() {
  const { isAdmin, adminInitializing, signInAdmin } = useAppData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adminInitializing && isAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [adminInitializing, isAdmin]);

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError('Enter email and password.');
      return;
    }
    if (captcha.trim().toLowerCase() !== CAPTCHA_WORD) {
      setError('CAPTCHA does not match. Hint: lowercase weekday.');
      return;
    }

    setSubmitting(true);
    try {
      await signInAdmin(email, password);
      setPassword('');
      setCaptcha('');
      router.replace('/admin/dashboard');
    } catch (e) {
      const message =
        e instanceof AdminAuthError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Sign-in failed.';
      setError(message);
      Alert.alert('Sign-in failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (adminInitializing) {
    return (
      <>
        <Stack.Screen options={{ title: 'Admin', headerBackTitle: 'Back' }} />
        <View style={[styles.flex, styles.centerLoading]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Admin', headerBackTitle: 'Back' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.box}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="you@example.com"
            editable={!submitting}
            style={styles.input}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            editable={!submitting}
            style={styles.input}
          />
          <Text style={styles.label}>CAPTCHA — type the word: monday</Text>
          <TextInput
            value={captcha}
            onChangeText={setCaptcha}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="monday"
            editable={!submitting}
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.btn,
              submitting && styles.btnDisabled,
              pressed && !submitting && { opacity: 0.9 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Sign in</Text>
            )}
          </Pressable>

          <Text style={styles.note}>
            Entry from the app is hidden on purpose (not shown in the public Figma): on the home screen, press and
            hold the Taking Monday logo for {ADMIN_LONG_PRESS_MS / 1000} seconds to open this screen.
          </Text>
          <Text style={styles.note}>
            Sign-in is verified by Firebase Authentication. Only accounts with a matching{' '}
            <Text style={styles.code}>admins/&lt;uid&gt;</Text> document and{' '}
            <Text style={styles.code}>active != false</Text> can manage wall entries.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, padding: space.lg },
  centerLoading: { alignItems: 'center', justifyContent: 'center' },
  box: { gap: space.sm, maxWidth: 480, width: '100%', alignSelf: 'center' },
  label: { fontWeight: '700', color: colors.text, marginTop: space.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    fontSize: 16,
  },
  btn: {
    marginTop: space.lg,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  error: {
    marginTop: space.sm,
    color: '#B00020',
    fontWeight: '700',
  },
  note: { marginTop: space.md, color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 12,
    color: colors.text,
  },
});
