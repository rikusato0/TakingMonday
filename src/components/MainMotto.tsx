import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, space } from '../theme/tokens';
import { Underline } from './Underline';

/** Figma footer line: "IT'S NOT MUCH. DO IT ANYWAY ❤" */
export function MainMotto() {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.text}>
          IT&apos;S NOT MUCH. <Text style={styles.emph}>DO IT ANYWAY.</Text>
        </Text>
        <Image
          source={require('../../assets/main/heart.png')}
          style={styles.heart}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      <Underline
        source={require('../../assets/main/underline_do_it anyway.png')}
        width={92}
        height={5}
        style={styles.underline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: space.md,
    paddingBottom: space.md,
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  text: {
    fontFamily: fonts.body,
    fontSize: 12,
    letterSpacing: 0.3,
    color: colors.textOnGreen,
  },
  emph: { color: colors.textOnGreen },
  heart: { width: 14, height: 14 },
  underline: { marginTop: 2, marginRight: 22 },
});
