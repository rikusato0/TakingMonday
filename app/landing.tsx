import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenGradient } from '../src/components/ScreenGradient';
import { EXTERNAL } from '../src/constants/links';
import { colors, fonts, space } from '../src/theme/tokens';

const WORDMARK_ASPECT = 183 / 39;

export default function LandingScreen() {
  return (
    <ScreenGradient edgeAccents>
      <SafeAreaView style={styles.safe}>
        <View style={styles.inner}>
          <Image
            source={require('../assets/smiley-mark.png')}
            style={styles.heroIcon}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <Image
            source={require('../assets/logo-wordmark.png')}
            style={styles.wordmark}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <Text style={styles.tagline}>
            THE WORLD&apos;S A LOT.{'\n'}LET&apos;S DO SOMETHING ABOUT IT.
          </Text>
          <Text style={styles.credits}>A DARNAIL AND TYLER PRODUCTION</Text>
          <Pressable
            onPress={() => router.replace('/main')}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaText}>CONTINUE</Text>
          </Pressable>
          <Text style={styles.hint}>Live wall · {EXTERNAL.website.replace(/^https?:\/\//, '')}</Text>
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
    alignItems: 'center',
  },
  heroIcon: {
    width: 72,
    height: 72,
    marginBottom: space.xs,
  },
  wordmark: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: WORDMARK_ASPECT,
    maxHeight: 56,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.9,
    color: colors.textOnGreen,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: '800',
    marginTop: space.sm,
  },
  credits: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textMutedOnDark,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cta: {
    marginTop: space.lg,
    backgroundColor: colors.goodGreenStroke,
    paddingVertical: space.lg,
    paddingHorizontal: space.xxl,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.goodGreenBright,
    minWidth: 200,
  },
  ctaPressed: { opacity: 0.92 },
  ctaText: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 2,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMutedOnDark,
    textAlign: 'center',
    marginTop: space.sm,
  },
});
