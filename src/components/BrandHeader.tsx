import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ADMIN_LONG_PRESS_MS } from '../constants/config';
import { colors, fonts, space } from '../theme/tokens';

type Props = {
  onLongPressAdmin?: () => void;
  onRefresh?: () => void;
};

/** Matches Figma `logo_group` + smiley aspect (~183×39). */
const WORDMARK_ASPECT = 183 / 39;

export function BrandHeader({ onLongPressAdmin, onRefresh }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Taking Monday, tap to refresh"
      onPress={onRefresh}
      onLongPress={onLongPressAdmin}
      delayLongPress={ADMIN_LONG_PRESS_MS}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <Image source={require('../../assets/smiley-mark.png')} style={styles.smiley} accessibilityIgnoresInvertColors />
      <View style={styles.col}>
        <Image
          source={require('../../assets/logo-wordmark.png')}
          style={styles.wordmark}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.underline} />
        <Text style={styles.tagline}>
          THE WORLD&apos;S A LOT.{'\n'}LET&apos;S DO SOMETHING ABOUT IT.
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    alignSelf: 'stretch',
    paddingVertical: space.sm,
  },
  pressed: { opacity: 0.9 },
  smiley: {
    width: 48,
    height: 48,
    marginTop: 2,
  },
  col: { flex: 1, minWidth: 0 },
  wordmark: {
    width: '100%',
    aspectRatio: WORDMARK_ASPECT,
    maxHeight: 52,
  },
  underline: {
    marginTop: 6,
    height: 4,
    width: 120,
    backgroundColor: colors.goodGreenBright,
    borderRadius: 2,
  },
  tagline: {
    marginTop: space.sm,
    fontFamily: fonts.body,
    fontSize: 9,
    lineHeight: 13,
    letterSpacing: 0.7,
    color: colors.textOnGreen,
    textTransform: 'uppercase',
  },
});
