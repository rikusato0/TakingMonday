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
import { useAppData } from '../../src/context/AppDataContext';
import { AdminAuthError } from '../../src/services/adminAuth';
import { colors, space } from '../../src/theme/tokens';

type CaptchaChallenge = {
  prompt: string;
  /** Already-normalized expected answer (lowercase, no spaces). */
  answer: string;
};

const CAPTCHA_CHALLENGES: CaptchaChallenge[] = [
  {
    prompt:
      'What is 67 plus 67, divided by 2, plus 8 minus 8, with the word yadnoM backwards (no spaces)?',
    answer: '67monday',
  },
  {
    prompt:
      'What is 10 plus 10, divided by 2, plus 1 minus 1, with the word yadnoM backwards (no spaces)?',
    answer: '10monday',
  },
  {
    prompt:
      'What is 44 plus 44, divided by 2, minus 4 plus 4, with the word yadnoM backwards (no spaces)?',
    answer: '44monday',
  },
  {
    prompt:
      'What is 24 plus 24, divided by 2, plus 6 minus 6, with the word yadnoM backwards (no spaces)?',
    answer: '24monday',
  },
  {
    prompt:
      'What is 14 plus 14, divided by 2, plus 7 minus 7, with the word yadseuT backwards (no spaces)?',
    answer: '14tuesday',
  },
  {
    prompt:
      'What is 80 plus 80, divided by 2, plus 2 minus 2, with the word yadnoM backwards (no spaces)?',
    answer: '80monday',
  },
];

function pickRandomChallenge(excludeAnswer?: string): CaptchaChallenge {
  if (CAPTCHA_CHALLENGES.length === 0) {
    return { prompt: '', answer: '' };
  }
  let pick = CAPTCHA_CHALLENGES[Math.floor(Math.random() * CAPTCHA_CHALLENGES.length)];
  let guard = 0;
  while (excludeAnswer && pick.answer === excludeAnswer && guard++ < 8) {
    pick = CAPTCHA_CHALLENGES[Math.floor(Math.random() * CAPTCHA_CHALLENGES.length)];
  }
  return pick;
}

function normalizeCaptchaInput(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '');
}
export default function AdminLoginScreen() {
  const { isAdmin, adminInitializing, signInAdmin } = useAppData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaChallenge, setCaptchaChallenge] = useState(() => pickRandomChallenge());
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
    if (normalizeCaptchaInput(captcha) !== captchaChallenge.answer) {
      setError('Answer does not match the security question.');
      setCaptcha('');
      setCaptchaChallenge((prev) => pickRandomChallenge(prev.answer));
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
          <Text style={styles.label}>Security question</Text>
          <Text style={styles.captchaHint}>{captchaChallenge.prompt}</Text>
          <TextInput
            value={captcha}
            onChangeText={setCaptcha}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Answer"
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
  captchaHint: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 4,
  },
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
});
