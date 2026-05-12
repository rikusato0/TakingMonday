import type { ReactNode } from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

type Props = {
  /** Spray-paint border PNG (e.g. assets/main/border_green.png). */
  source: ImageSourcePropType;
  children: ReactNode;
  /** Outer wrapper style (margin etc). */
  style?: StyleProp<ViewStyle>;
  /** Inner content padding override. */
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Card with a stretched spray-paint frame PNG and content placed on top.
 * Border is purely decorative; content padding keeps text inside the spray.
 */
export function SprayCard({ source, children, style, contentStyle }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={source}
        style={styles.border}
        resizeMode="stretch"
        accessibilityIgnoresInvertColors
      />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    position: 'relative',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
});
