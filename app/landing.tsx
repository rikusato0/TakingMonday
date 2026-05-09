import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenGradient } from '../src/components/ScreenGradient';
import { colors, fonts, space } from '../src/theme/tokens';

export default function LandingScreen() {
  return (
    <ScreenGradient>
      <SafeAreaView style={styles.safe}>
        <View style={styles.inner}>
          <Image
            source={require('../assets/smiley-mark.png')}
            style={styles.heroIcon}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <Text style={styles.tagline}>
            THE WORLD&apos;S A LOT.{'\n'}LET&apos;S DO SOMETHING ABOUT IT.
          </Text>
          <View style={styles.taglineRule} />
          <Text style={styles.lead}>
            A darnail and tyler production — tap through for the live wall. No accounts, just the count.
          </Text>
          <Pressable
            onPress={() => router.replace('/main')}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaText}>Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  inner: {
    flex: 1,
    paddingHorizontal: space.xl,
    justifyContent: 'center',
    gap: space.lg,
  },
  heroIcon: {
    width: 88,
    height: 88,
    alignSelf: 'center',
    marginBottom: space.sm,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
    color: colors.textOnGreen,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  taglineRule: {
    height: 4,
    width: 120,
    backgroundColor: colors.goodGreenBright,
    borderRadius: 2,
    alignSelf: 'center',
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textOnGreen,
    textAlign: 'center',
    opacity: 0.95,
  },
  cta: {
    marginTop: space.lg,
    backgroundColor: colors.surface,
    paddingVertical: space.lg,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.orange,
  },
  ctaPressed: { opacity: 0.92 },
  ctaText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '900',
    color: colors.orange,
    letterSpacing: 1,
  },
});
