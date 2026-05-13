import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenGradient } from '../src/components/ScreenGradient';
import { Underline } from '../src/components/Underline';
import { LOADING_MS } from '../src/constants/config';
import { MAIN_PAGE_SOCIALS } from '../src/constants/mainSocialLinks';
import * as appBackend from '../src/services/appBackend';
import { colors, fonts, space } from '../src/theme/tokens';

export default function LoadingScreen() {
  const [failed, setFailed] = useState<string | null>(null);
  const spin = useRef(new Animated.Value(0)).current;
  const { width: winW, height: winH } = useWindowDimensions();
  const safe = useSafeAreaInsets();

  const landingLayout = useMemo(() => {
    const padX = space.xl * 2;
    /** Inner width inside horizontal padding — primary constraint on phones beside graffiti accents */
    const innerW = Math.max(272, winW - padX);
    /** Vertical budget after SafeArea applies (helps short phones avoid hugging notch / gesture bar too tight) */
    const usableH = Math.max(400, winH - safe.top - safe.bottom - space.sm);
    const maxByWidth = innerW * 0.74;
    const maxByHeight = usableH * 0.34;
    const texture = Math.min(280, maxByWidth, maxByHeight);
    const snapped = Math.max(168, Math.round(texture));
    const loader = Math.round((snapped * 220) / 280);
    const pinW = Math.round((snapped * 110) / 280);
    const pinH = Math.round(pinW * 1.35);
    const textScale = Math.max(0.82, Math.min(1, snapped / 280));
    const compact = usableH < 620;
    return {
      texture: snapped,
      loader,
      pinW,
      pinH,
      textScale,
      underlineH: Math.max(3, Math.round(4 * textScale)),
      taglineSize: Math.max(10, Math.round(11 * textScale)),
      taglineLineHeight: Math.max(14, Math.round(16 * textScale)),
      captionSize: Math.max(11, Math.round(13 * textScale)),
      headerMaxW: Math.min(360, innerW * 0.94),
      creditsMarginTop: compact ? space.md : space.lg,
      socialMarginTop: compact ? space.md : space.lg,
      loaderMarginTop: compact ? space.md : space.lg,
      iconScale: textScale,
    };
  }, [winW, winH, safe.top, safe.bottom]);

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

  const underlineLetsH = landingLayout.underlineH;
  const underlineGoodH = landingLayout.underlineH;

  if (failed) {
    return (
      <ScreenGradient edgeAccents>
        <SafeAreaView style={styles.safeFill} edges={['top', 'bottom']}>
          <View style={styles.errWrap}>
            <Text style={styles.err}>{failed}</Text>
          </View>
        </SafeAreaView>
      </ScreenGradient>
    );
  }

  const tagStyle = [
    styles.tagline,
    {
      fontSize: landingLayout.taglineSize,
      lineHeight: landingLayout.taglineLineHeight,
    },
  ];
  const capStyle = [styles.caption, { fontSize: landingLayout.captionSize }];

  return (
    <ScreenGradient edgeAccents>
      <SafeAreaView style={styles.safeFill} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require('../assets/landing/header.png')}
            style={[styles.header, { width: '92%', maxWidth: landingLayout.headerMaxW, marginTop: 6 }]}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />

          <View style={styles.taglineWrap}>
            <Text style={tagStyle}>THE WORLD&apos;S A LOT.</Text>
            <View style={styles.inlineTagline}>
              <View>
                <Text style={tagStyle}>LET&apos;S</Text>
                <Underline
                  source={require('../assets/landing/underline_tagline_lets.png')}
                  width="100%"
                  height={underlineLetsH}
                  style={styles.inlineUnder}
                />
              </View>
              <Text style={tagStyle}> DO SOMETHING ABOUT IT.</Text>
            </View>
          </View>

          <View
            style={[
              styles.loader,
              {
                marginTop: landingLayout.loaderMarginTop,
                width: landingLayout.texture,
                height: landingLayout.texture,
              },
            ]}
          >
            <Image
              source={require('../assets/landing/texture_speckle.png')}
              style={[styles.loaderTexture, { width: landingLayout.texture, height: landingLayout.texture }]}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
            <Image
              source={require('../assets/landing/loading_ring_gray.png')}
              style={[styles.loaderBase, { width: landingLayout.loader, height: landingLayout.loader }]}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
            <Animated.Image
              source={require('../assets/landing/loading_ring_green.png')}
              style={[
                styles.loaderProgress,
                { width: landingLayout.loader, height: landingLayout.loader, transform: [{ rotate }] },
              ]}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
            <Image
              source={require('../assets/landing/pin_green_graffiti.png')}
              style={[styles.loaderPin, { width: landingLayout.pinW, height: landingLayout.pinH }]}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </View>

          <View style={styles.inlineCaption}>
            <Text style={capStyle}>LOADING </Text>
            <View>
              <Text style={capStyle}>GOOD</Text>
              <Underline
                source={require('../assets/landing/underline_good.png')}
                width="100%"
                height={underlineGoodH}
                style={styles.inlineUnder}
              />
            </View>
            <Text style={capStyle}> THINGS...</Text>
          </View>

          <View style={[styles.creditsRow, { marginTop: landingLayout.creditsMarginTop }]}>
            <Image
              source={require('../assets/landing/line_sep_1.png')}
              style={[styles.creditsLine, landingLayout.iconScale < 1 && creditsLineShrink(landingLayout.iconScale)]}
              resizeMode="stretch"
              accessibilityIgnoresInvertColors
            />
            <Text style={styles.credits}>A DARNAIL AND TYLER PRODUCTION</Text>
            <Image
              source={require('../assets/landing/line_sep_2.png')}
              style={[styles.creditsLine, landingLayout.iconScale < 1 && creditsLineShrink(landingLayout.iconScale)]}
              resizeMode="stretch"
              accessibilityIgnoresInvertColors
            />
          </View>

          <View style={[styles.socialsRow, { marginTop: landingLayout.socialMarginTop }]}>
            {MAIN_PAGE_SOCIALS.map((s, idx) => (
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
                    style={{
                      width: Math.round(s.iconWidth * landingLayout.iconScale),
                      height: Math.round(s.iconHeight * landingLayout.iconScale),
                    }}
                    resizeMode="contain"
                    accessibilityIgnoresInvertColors
                  />
                  <Text
                    style={[
                      styles.socialLabel,
                      { fontSize: Math.max(9, Math.round(11 * landingLayout.iconScale)) },
                    ]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
                {idx < MAIN_PAGE_SOCIALS.length - 1 ? (
                  <View style={[styles.socialDivider, socialDividerShrink(landingLayout.iconScale)]} />
                ) : null}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenGradient>
  );
}

function creditsLineShrink(scale: number) {
  const s = Math.max(0.75, Math.min(1, scale));
  return { width: Math.round(36 * s), height: Math.max(1, Math.round(2 * s)) };
}

function socialDividerShrink(scale: number) {
  const s = Math.max(0.75, Math.min(1, scale));
  return { height: Math.round(56 * s) };
}

const styles = StyleSheet.create({
  safeFill: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingVertical: space.sm,
    width: '100%',
  },
  errWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  header: {
    aspectRatio: 850 / 410,
  },
  taglineWrap: { alignItems: 'center', marginTop: space.xs },
  tagline: {
    fontFamily: fonts.body,
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
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  inlineUnder: { marginTop: -2 },
  loader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderTexture: {
    position: 'absolute',
    opacity: 0.85,
  },
  loaderBase: {
    position: 'absolute',
  },
  loaderProgress: {
    position: 'absolute',
  },
  loaderPin: {},
  caption: {
    fontFamily: fonts.body,
    letterSpacing: 1,
    color: colors.textOnGreen,
    textTransform: 'uppercase',
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  creditsLine: { width: 36, height: 2, opacity: 0.6, tintColor: colors.textMutedOnDark },
  credits: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  socialsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
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
