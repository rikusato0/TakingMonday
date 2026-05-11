import * as WebBrowser from 'expo-web-browser';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { EXTERNAL } from '../constants/links';
import { colors, fonts, space } from '../theme/tokens';

/** Figma "SOMETHING GOOD TO WATCH" card. */
export function GoodWatchCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>SHARED BY SOMEONE</Text>

      <View style={styles.row}>
        <View style={styles.frame}>
          <Image
            source={require('../../assets/main/play_icon.png')}
            style={styles.play}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>

        <View style={styles.right}>
          <View>
            <Text style={styles.titleTop} numberOfLines={1}>
              SOMETHING GOOD
            </Text>
            <Text style={styles.titleBottom} numberOfLines={1}>
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
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: space.md,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  kicker: {
    alignSelf: 'flex-end',
    fontFamily: fonts.body,
    fontSize: 8.5,
    letterSpacing: 0.6,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  frame: {
    width: 110,
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: { width: 30, height: 30, opacity: 0.95 },
  right: {
    flex: 1,
    minWidth: 0,
    height: 80,
    justifyContent: 'space-between',
  },
  titleTop: {
    fontFamily: fonts.body,
    fontSize: 14,
    letterSpacing: 0.4,
    color: colors.textOnGreen,
  },
  titleBottom: {
    fontFamily: fonts.body,
    fontSize: 14,
    letterSpacing: 0.4,
    color: colors.goodGreenBright,
    marginTop: 0,
  },
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  ctaPressed: { opacity: 0.85 },
  ctaPlay: { width: 12, height: 12 },
  ctaText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textOnGreen,
    letterSpacing: 0.5,
  },
});
