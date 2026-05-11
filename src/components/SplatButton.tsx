import { useCallback, useEffect, useRef, useState } from 'react';
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

/**
 * Number of image toggles in the blink burst. Even = ends on normal.
 * 6 toggles at 80ms each ≈ a 3-flash, ~480ms confirmation.
 */
const BLINK_STEPS = 6;
const BLINK_INTERVAL_MS = 80;

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
  const [blinkPressed, setBlinkPressed] = useState(false);
  const blinkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopBlink = useCallback(() => {
    if (blinkTimerRef.current) {
      clearInterval(blinkTimerRef.current);
      blinkTimerRef.current = null;
    }
    setBlinkPressed(false);
  }, []);

  const startBlink = useCallback(() => {
    stopBlink();
    let step = 0;
    setBlinkPressed(true);
    blinkTimerRef.current = setInterval(() => {
      step += 1;
      setBlinkPressed((prev) => !prev);
      if (step >= BLINK_STEPS) {
        if (blinkTimerRef.current) {
          clearInterval(blinkTimerRef.current);
          blinkTimerRef.current = null;
        }
        setBlinkPressed(false);
      }
    }, BLINK_INTERVAL_MS);
  }, [stopBlink]);

  useEffect(() => stopBlink, [stopBlink]);

  const handlePress = useCallback(() => {
    startBlink();
    onPress();
  }, [onPress, startBlink]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={[{ width, height }, style]}
    >
      {({ pressed }) => (
        <Image
          source={pressed || busy || blinkPressed ? pressedSrc : normal}
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
