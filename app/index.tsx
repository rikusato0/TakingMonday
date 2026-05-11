import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { LOADING_MS } from '../src/constants/config';
import * as appBackend from '../src/services/appBackend';
import { ScreenGradient } from '../src/components/ScreenGradient';
import { EXTERNAL } from '../src/constants/links';
import { colors, fonts, space } from '../src/theme/tokens';

const WORDMARK_ASPECT = 183 / 39;

export default function LoadingScreen() {
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await Promise.all([new Promise((r) => setTimeout(r, LOADING_MS)), appBackend.hydrate()]);
        if (alive) router.replace('/landing');
      } catch (e) {
        if (alive) setFailed(e instanceof Error ? e.message : 'Could not load');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (failed) {
    return (
      <ScreenGradient>
        <View style={styles.center}>
          <Text style={styles.err}>{failed}</Text>
        </View>
      </ScreenGradient>
    );
  }

  return (
    <ScreenGradient edgeAccents>
      <View style={styles.center}>
        <Image
          source={require('../assets/smiley-mark.png')}
          style={styles.icon}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Image
          source={require('../assets/logo-wordmark.png')}
          style={styles.wordmark}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.tag}>
          THE WORLD&apos;S A LOT.{'\n'}LET&apos;S DO SOMETHING ABOUT IT.
        </Text>
        <View style={styles.loaderRing}>
          <ActivityIndicator size="large" color={colors.goodGreenBright} />
        </View>
        <Text style={styles.caption}>LOADING GOOD THINGS...</Text>
        <Text style={styles.credits}>A DARNAIL AND TYLER PRODUCTION</Text>
        <Text style={styles.links}>
          TYLER · LINKTREE · DARNAIL{'\n'}
          <Text style={styles.linksMuted}>{EXTERNAL.website.replace(/^https?:\/\//, '')}</Text>
        </Text>
      </View>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    paddingHorizontal: space.xl,
  },
  icon: { width: 64, height: 64, marginBottom: space.xs },
  wordmark: {
    width: '100%',
    maxWidth: 300,
    aspectRatio: WORDMARK_ASPECT,
    maxHeight: 48,
  },
  tag: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    color: colors.textOnGreen,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: space.sm,
  },
  loaderRing: {
    marginTop: space.md,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    color: colors.textOnGreen,
    letterSpacing: 1,
    marginTop: space.sm,
  },
  credits: {
    fontFamily: fonts.body,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
    marginTop: space.xs,
  },
  links: {
    marginTop: space.lg,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMutedOnDark,
    textAlign: 'center',
    letterSpacing: 0.8,
    lineHeight: 16,
  },
  linksMuted: { fontWeight: '700', opacity: 0.85 },
  err: { color: '#FFCDD2', textAlign: 'center', fontFamily: fonts.body },
});
