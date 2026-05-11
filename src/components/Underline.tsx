import { Image, ImageSourcePropType, ImageStyle, StyleProp, StyleSheet } from 'react-native';

type Props = {
  source: ImageSourcePropType;
  width?: number | `${number}%`;
  height?: number;
  style?: StyleProp<ImageStyle>;
};

/** Sharpie / spray underline image, stretched to a precise width. */
export function Underline({ source, width = '60%', height = 6, style }: Props) {
  return (
    <Image
      source={source}
      style={[{ width, height }, styles.img, style]}
      resizeMode="stretch"
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  img: { marginTop: 2 },
});
