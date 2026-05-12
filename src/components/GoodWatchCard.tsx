import * as WebBrowser from 'expo-web-browser';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { EXTERNAL } from '../constants/links';
import { colors, fonts, space } from '../theme/tokens';
import { SprayCard } from './SprayCard';

/** Figma "SOMETHING GOOD TO WATCH" card — corner marks + thumb/text vertically centered. */
export function GoodWatchCard() {
  const { width: windowWidth } = useWindowDimensions();
  const gutter = space.md * 2 + 52;
  /** Larger preview plate vs prior cap — fills card width proportionally on tall phones. */
  const thumbW = Math.round(Math.min(148, Math.max(108, (windowWidth - gutter) * 0.38)));
  const thumbH = Math.round(thumbW * (80 / 110));

  return (
    <SprayCard
      source={require('../../assets/main/border_whitte_video_card.png')}
      style={styles.card}
      contentStyle={styles.content}
    >
      <View style={[styles.inner, { minHeight: Math.max(thumbH + 32, 112) }]}>
        <Image
          source={require('../../assets/main/arrow_green_down.png')}
          style={[styles.cornerArt, styles.cornerTL]}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Image
          source={require('../../assets/main/busrt.png')}
          style={[styles.cornerArt, styles.cornerTR]}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />

        <View style={[styles.row, { minHeight: Math.max(thumbH, 90) }]}>
          <View style={[styles.frame, { width: thumbW, height: thumbH }]}>
            <Image
              source={require('../../assets/main/play_icon.png')}
              style={styles.play}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </View>

          <View style={[styles.rightCol, { minHeight: thumbH }]}>
            <Text style={styles.kicker}>SHARED BY SOMEONE</Text>

            <View style={styles.titleStack}>
              <Text style={styles.titleTop} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
                SOMETHING GOOD
              </Text>
              <Text style={styles.titleBottom} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
                TO WATCH
              </Text>
            </View>

            <Pressable
              onPress={() => void WebBrowser.openBrowserAsync(EXTERNAL.goodWatch)}
              style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
              accessibilityRole="button"
              accessibilityLabel="Watch now"
            >
              <Image
                source={require('../../assets/main/play_icon.png')}
                style={styles.ctaPlay}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
              <Text style={styles.ctaText}>WATCH NOW</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SprayCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: space.md,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 18,
  },
  inner: {
    position: 'relative',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerArt: {
    position: 'absolute',
    width: 28,
    height: 28,
    zIndex: 2,
  },
  cornerTL: {
    top: -6,
    left: -4,
  },
  cornerTR: {
    top: -6,
    right: -4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: space.md,
    paddingVertical: 6,
    maxWidth: '100%',
  },
  frame: {
    flexShrink: 0,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: { width: 40, height: 40, opacity: 0.95 },
  rightCol: {
    flexGrow: 0,
    flexShrink: 1,
    maxWidth: 220,
    minWidth: 0,
    justifyContent: 'center',
    gap: 10,
    paddingTop: 2,
  },
  kicker: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 0.55,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  titleStack: {
    gap: 2,
  },
  titleTop: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 19,
    letterSpacing: 0.42,
    color: colors.textOnGreen,
  },
  titleBottom: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 19,
    letterSpacing: 0.42,
    color: colors.goodGreenBright,
  },
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.goodGreenBright,
    borderRadius: 8,
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  ctaPressed: { opacity: 0.85 },
  ctaPlay: { width: 14, height: 14 },
  ctaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textOnGreen,
    letterSpacing: 0.48,
  },
});
