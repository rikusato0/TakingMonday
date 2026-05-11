import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ADMIN_LONG_PRESS_MS } from '../constants/config';
import { colors, fonts, space } from '../theme/tokens';

type Props = {
  onLongPressAdmin?: () => void;
  onRefresh?: () => void;
};

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
      <Image
        source={require('../../assets/smiley-mark.png')}
        style={styles.smiley}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <View style={styles.col}>
        <View style={styles.wordRow}>
          <Image
            source={require('../../assets/logo-wordmark.png')}
            style={styles.wordmark}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <Image
            source={require('../../assets/main/lightning.png')}
            style={styles.lightning}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>
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
    gap: space.sm,
    alignSelf: 'stretch',
    paddingTop: space.xs,
    paddingBottom: space.sm,
  },
  pressed: { opacity: 0.9 },
  smiley: { width: 44, height: 44, marginTop: 4 },
  col: { flex: 1, minWidth: 0 },
  wordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordmark: { flex: 1, aspectRatio: WORDMARK_ASPECT, maxHeight: 44 },
  lightning: { width: 18, height: 26 },
  tagline: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 9,
    lineHeight: 13,
    letterSpacing: 0.5,
    color: colors.textOnGreen,
    textTransform: 'uppercase',
  },
});
