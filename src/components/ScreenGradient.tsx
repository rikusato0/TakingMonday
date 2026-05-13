import type { ReactNode } from 'react';
import { Image, StyleProp, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

/** At this width+, content is capped to mobile width and centered (Android tablet requirement). */
const TABLET_SIDE_BY_SIDE_MIN_DP = 600;
const MAX_MOBILE_CONTENT_WIDTH = 430;

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Splash-style thick green / red side accents (Figma loading screen). */
  edgeAccents?: boolean;
};

/** Page background — Figma `bg_layer.png` (black canvas with grain edges). */
export function ScreenGradient({ children, style, edgeAccents }: Props) {
  const { width: screenW } = useWindowDimensions();
  const clampWidth = screenW >= TABLET_SIDE_BY_SIDE_MIN_DP;
  const tabletBandW = Math.min(screenW, MAX_MOBILE_CONTENT_WIDTH);

  const inner = (
    <View style={[styles.content, clampWidth && { width: tabletBandW }]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.flex, style]}>
      <Image
        source={require('../../assets/main/bg_layer.png')}
        style={styles.bg}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      {edgeAccents ? (
        <>
          <Image
            source={require('../../assets/landing/graffiti_left_green.png')}
            style={styles.accentLeft}
            resizeMode="stretch"
            accessibilityIgnoresInvertColors
          />
          <Image
            source={require('../../assets/landing/graffiti_right_red.png')}
            style={styles.accentRight}
            resizeMode="stretch"
            accessibilityIgnoresInvertColors
          />
        </>
      ) : null}
      {clampWidth ? (
        <View style={styles.tabletFrame} pointerEvents="box-none">
          {inner}
        </View>
      ) : (
        inner
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.canvas },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  content: { flex: 1 },
  tabletFrame: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  accentLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 26,
    height: '100%',
  },
  accentRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 26,
    height: '100%',
  },
});
