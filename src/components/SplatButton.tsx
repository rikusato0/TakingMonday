import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

type Props = {
  normal: ImageSourcePropType;
  pressedSrc: ImageSourcePropType;
  onPress: () => void;
  /** While true, button is disabled and shows the pressed image. */
  busy?: boolean;
  width?: number;
  height?: number;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

/** Spray-paint splat button (Figma ADD ONE / PASS ONE FORWARD). */
export function SplatButton({
  normal,
  pressedSrc,
  onPress,
  busy,
  width = 115,
  height = 100,
  accessibilityLabel,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={[{ width, height }, style]}
    >
      {({ pressed }) => (
        <Image
          source={pressed || busy ? pressedSrc : normal}
          style={styles.img}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  img: { width: '100%', height: '100%' },
});
