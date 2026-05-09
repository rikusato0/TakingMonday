import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LOADING_MS } from '../src/constants/config';
import * as appBackend from '../src/services/appBackend';
import { ScreenGradient } from '../src/components/ScreenGradient';
import { colors, fonts } from '../src/theme/tokens';

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
    <ScreenGradient>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textOnGreen} />
        <Text style={styles.caption}>LOADING GOOD THINGS...</Text>
      </View>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    color: colors.textOnGreen,
    letterSpacing: 0.8,
  },
  err: { color: '#FFCDD2', textAlign: 'center', fontFamily: fonts.body },
});
