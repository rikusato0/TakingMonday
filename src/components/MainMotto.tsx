import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, space } from '../theme/tokens';
import { Underline } from './Underline';

/** Figma footer line: "IT'S NOT MUCH. DO IT ANYWAY ❤" — underline sits under DO IT ANYWAY. only. */
export function MainMotto() {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.lead}>IT&apos;S NOT MUCH.</Text>
        <View style={styles.emphCol}>
          <Text style={[styles.text, styles.emph]}>DO IT ANYWAY.</Text>
          <Underline
            source={require('../../assets/main/underline_do_it anyway.png')}
            width={108}
            height={5}
            style={styles.underlineImg}
          />
        </View>
        <Image
          source={require('../../assets/main/heart.png')}
          style={styles.heart}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: space.sm,
    paddingBottom: space.xs,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: space.sm,
    maxWidth: 420,
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.32,
    color: colors.textOnGreen,
  },
  emphCol: {
    alignItems: 'center',
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.32,
    color: colors.textOnGreen,
  },
  emph: { color: colors.textOnGreen },
  underlineImg: { marginTop: 3 },
  heart: { width: 16, height: 16, marginTop: 2 },
});
