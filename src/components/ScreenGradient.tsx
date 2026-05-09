import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Page background ~ Figma `bg_layer` (linear green). */
export function ScreenGradient({ children, style }: Props) {
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.flex, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
