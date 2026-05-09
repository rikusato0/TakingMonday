import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, space } from '../../src/theme/tokens';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');

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
            keyboardType="email-address"
            placeholder="you@example.com"
            style={styles.input}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            style={styles.input}
          />
          <Text style={styles.label}>CAPTCHA — type the word: monday</Text>
          <TextInput
            value={captcha}
            onChangeText={setCaptcha}
            autoCapitalize="none"
            placeholder="monday"
            style={styles.input}
          />
          <Pressable
            onPress={() => {
              if (!email.trim() || !password.trim()) {
                Alert.alert('Missing info', 'Enter email and password.');
                return;
              }
              if (captcha.trim().toLowerCase() !== 'monday') {
                Alert.alert('CAPTCHA', 'That does not match. Hint: lowercase weekday.');
                return;
              }
              router.replace('/admin/dashboard');
            }}
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.btnText}>Sign in</Text>
          </Pressable>
          <Text style={styles.note}>
            Demo gate only — wire to Cloud Function + real CAPTCHA when Firebase is connected.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, padding: space.lg },
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
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  note: { marginTop: space.md, color: colors.textMuted, fontSize: 13, lineHeight: 18 },
});
