import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ADMIN_LONG_PRESS_MS } from '../constants/config';
import { colors, fonts, space } from '../theme/tokens';
import { Underline } from './Underline';

type Props = {
  onLongPressAdmin?: () => void;
  onRefresh?: () => void;
  /** Wall screen: slightly roomier header under safe area / above BACK. */
  variant?: 'default' | 'wall';
};

/** Source assets/brand-header.png — 287×138. */
const BRAND_HEADER_ASPECT = 287 / 138;

export function BrandHeader({ onLongPressAdmin, onRefresh, variant = 'default' }: Props) {
  const wrapStyle = variant === 'wall' ? styles.wrapWall : styles.wrap;
  const { width: winW } = useWindowDimensions();
  const maxW = Math.min(340, Math.max(200, winW * 0.88));
  const maxH = 72;
  let headerW = maxW;
  let headerH = headerW / BRAND_HEADER_ASPECT;
  if (headerH > maxH) {
    headerH = maxH;
    headerW = headerH * BRAND_HEADER_ASPECT;
  }

  const accessibilityLabel =
    variant === 'wall'
      ? 'Taking Monday — tap to return to the main page'
      : 'Taking Monday — tap to refresh';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onRefresh}
      onLongPress={onLongPressAdmin}
      delayLongPress={ADMIN_LONG_PRESS_MS}
      style={({ pressed }) => [wrapStyle, pressed && styles.pressed]}
    >
      <View style={styles.logoRow}>
        <Image
          source={require('../../assets/brand-header.png')}
          style={{ width: headerW, height: headerH }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      {/** Centered block with lines left-aligned inside (Figma). Underline only under “LET’S DO”. */}
      <View style={styles.taglineOuter}>
        <View style={styles.taglineInner}>
          <Text style={styles.taglineLine}>THE WORLD&apos;S A LOT.</Text>
          <View style={styles.taglineSecond}>
            <View style={styles.letsDoRow}>
              <Text style={styles.taglineLets}>LET&apos;S DO </Text>
              <Text style={styles.taglineRest}>SOMETHING ABOUT IT.</Text>
            </View>
            <Underline
              source={require('../../assets/main/underline_lets_do_something_about_it.png')}
              width={58}
              height={5}
              style={styles.taglineUnderlineShort}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingTop: space.xs,
    paddingBottom: space.sm,
    paddingHorizontal: space.xs,
  },
  wrapWall: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingTop: space.sm,
    paddingBottom: space.md,
    paddingHorizontal: space.xs,
  },
  pressed: { opacity: 0.9 },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 2,
  },
  taglineOuter: {
    marginTop: 10,
    alignSelf: 'center',
    maxWidth: '92%',
  },
  /** Lines stack with left edges aligned; whole block stays centered via taglineOuter. */
  taglineInner: {
    alignItems: 'flex-start',
  },
  taglineLine: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.45,
    color: colors.textOnGreen,
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  taglineSecond: {
    marginTop: 2,
    alignItems: 'flex-start',
  },
  letsDoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  taglineLets: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.45,
    color: colors.textOnGreen,
    textTransform: 'uppercase',
  },
  taglineRest: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.45,
    color: colors.textOnGreen,
    textTransform: 'uppercase',
  },
  taglineUnderlineShort: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
});
