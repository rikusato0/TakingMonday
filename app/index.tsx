import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScreenGradient } from '../src/components/ScreenGradient';
import { Underline } from '../src/components/Underline';
import { LOADING_MS } from '../src/constants/config';
import { EXTERNAL } from '../src/constants/links';
import * as appBackend from '../src/services/appBackend';
import { colors, fonts, space } from '../src/theme/tokens';

type Social = {
  key: string;
  label: string;
  url: string;
  icon: ReturnType<typeof require>;
  iconWidth: number;
  iconHeight: number;
};

const SOCIALS: Social[] = [
  {
    key: 'tyler',
    label: 'TYLER',
    url: EXTERNAL.tiktokTyler,
    icon: require('../assets/landing/tiktok_tyler.png'),
    iconWidth: 56,
    iconHeight: 64,
  },
  {
    key: 'linktree',
    label: 'LINKTREE',
    url: EXTERNAL.linktree,
    icon: require('../assets/landing/linktree.png'),
    iconWidth: 50,
    iconHeight: 60,
  },
  {
    key: 'darnail',
    label: 'DARNAIL',
    url: EXTERNAL.tiktokDarnail,
    icon: require('../assets/landing/tiktok_darnail.png'),
    iconWidth: 56,
    iconHeight: 64,
  },
];

export default function LoadingScreen() {
  const [failed, setFailed] = useState<string | null>(null);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await Promise.all([new Promise((r) => setTimeout(r, LOADING_MS)), appBackend.hydrate()]);
        if (alive) router.replace('/main');
      } catch (e) {
        if (alive) setFailed(e instanceof Error ? e.message : 'Could not load');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  if (failed) {
    return (
      <ScreenGradient edgeAccents>
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
          source={require('../assets/landing/header.png')}
          style={styles.header}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />

        <View style={styles.taglineWrap}>
          <Text style={styles.tagline}>THE WORLD&apos;S A LOT.</Text>
          <View style={styles.inlineTagline}>
            <View>
              <Text style={styles.tagline}>LET&apos;S</Text>
              <Underline
                source={require('../assets/landing/underline_tagline_lets.png')}
                width="100%"
                height={4}
                style={styles.inlineUnder}
              />
            </View>
            <Text style={styles.tagline}> DO SOMETHING ABOUT IT.</Text>
          </View>
        </View>

        <View style={styles.loader}>
          <Image
            source={require('../assets/landing/texture_speckle.png')}
            style={styles.loaderTexture}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <Image
            source={require('../assets/landing/loading_ring_gray.png')}
            style={styles.loaderBase}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <Animated.Image
            source={require('../assets/landing/loading_ring_green.png')}
            style={[styles.loaderProgress, { transform: [{ rotate }] }]}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <Image
            source={require('../assets/landing/pin_green_graffiti.png')}
            style={styles.loaderPin}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>

        <View style={styles.inlineCaption}>
          <Text style={styles.caption}>LOADING </Text>
          <View>
            <Text style={styles.caption}>GOOD</Text>
            <Underline
              source={require('../assets/landing/underline_good.png')}
              width="100%"
              height={4}
              style={styles.inlineUnder}
            />
          </View>
          <Text style={styles.caption}> THINGS...</Text>
        </View>

        <View style={styles.creditsRow}>
          <Image
            source={require('../assets/landing/line_sep_1.png')}
            style={styles.creditsLine}
            resizeMode="stretch"
            accessibilityIgnoresInvertColors
          />
          <Text style={styles.credits}>A DARNAIL AND TYLER PRODUCTION</Text>
          <Image
            source={require('../assets/landing/line_sep_2.png')}
            style={styles.creditsLine}
            resizeMode="stretch"
            accessibilityIgnoresInvertColors
          />
        </View>

        <View style={styles.socialsRow}>
          {SOCIALS.map((s, idx) => (
            <View key={s.key} style={styles.socialItem}>
              <Pressable
                onPress={() => void WebBrowser.openBrowserAsync(s.url)}
                accessibilityRole="link"
                accessibilityLabel={`Open ${s.label}`}
                hitSlop={8}
                style={({ pressed }) => [styles.socialBtn, pressed && styles.socialPressed]}
              >
                <Image
                  source={s.icon}
                  style={{ width: s.iconWidth, height: s.iconHeight }}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
                <Text style={styles.socialLabel}>{s.label}</Text>
              </Pressable>
              {idx < SOCIALS.length - 1 ? <View style={styles.socialDivider} /> : null}
            </View>
          ))}
        </View>
      </View>
    </ScreenGradient>
  );
}

const LOADER_SIZE = 220;
const PIN_SIZE = 110;
const TEXTURE_SIZE = 280;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingVertical: space.lg,
  },
  header: {
    width: '92%',
    maxWidth: 360,
    aspectRatio: 850 / 410,
    marginTop: 4,
  },
  taglineWrap: { alignItems: 'center', marginTop: space.xs },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.9,
    color: colors.textOnGreen,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  inlineTagline: { flexDirection: 'row', alignItems: 'flex-start' },
  inlineCaption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: space.md,
  },
  inlineUnder: { marginTop: -2 },
  loader: {
    marginTop: space.lg,
    width: TEXTURE_SIZE,
    height: TEXTURE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderTexture: {
    position: 'absolute',
    width: TEXTURE_SIZE,
    height: TEXTURE_SIZE,
    opacity: 0.85,
  },
  loaderBase: {
    position: 'absolute',
    width: LOADER_SIZE,
    height: LOADER_SIZE,
  },
  loaderProgress: {
    position: 'absolute',
    width: LOADER_SIZE,
    height: LOADER_SIZE,
  },
  loaderPin: {
    width: PIN_SIZE,
    height: PIN_SIZE * 1.35,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.textOnGreen,
    textTransform: 'uppercase',
  },
  creditsRow: {
    marginTop: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creditsLine: { width: 36, height: 2, opacity: 0.6, tintColor: colors.textMutedOnDark },
  credits: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
  },
  socialsRow: {
    marginTop: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialItem: { flexDirection: 'row', alignItems: 'center' },
  socialBtn: {
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    gap: 4,
  },
  socialPressed: { opacity: 0.7 },
  socialLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textOnGreen,
    textTransform: 'uppercase',
  },
  socialDivider: {
    width: 1,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  err: { color: '#FFCDD2', textAlign: 'center', fontFamily: fonts.body, fontSize: 14 },
});
