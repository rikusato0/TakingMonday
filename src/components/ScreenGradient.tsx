import type { ReactNode } from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Splash-style thick green / red side accents (Figma loading screen). */
  edgeAccents?: boolean;
};

/** Page background — Figma `bg_layer.png` (black canvas with grain edges). */
export function ScreenGradient({ children, style, edgeAccents }: Props) {
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
      <View style={styles.content}>{children}</View>
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
