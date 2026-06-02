import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ADMIN_LONG_PRESS_MS } from '../constants/config';
import { space } from '../theme/tokens';

type Props = {
  onLongPressAdmin?: () => void;
  onRefresh?: () => void;
  /** Wall screen: slightly roomier header under safe area / above BACK. */
  variant?: 'default' | 'wall';
};

/** Source assets/logo-banner.png — single-line lockup, 1044×320. */
const BRAND_HEADER_ASPECT = 1044 / 320;

export function BrandHeader({ onLongPressAdmin, onRefresh, variant = 'default' }: Props) {
  const wrapStyle = variant === 'wall' ? styles.wrapWall : styles.wrap;
  const { width: winW } = useWindowDimensions();
  const maxW = Math.min(360, Math.max(220, winW * 0.92));
  const maxH = 88;
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
          source={require('../../assets/logo-banner.png')}
          style={{ width: headerW, height: headerH }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
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
});
