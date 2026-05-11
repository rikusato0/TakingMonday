import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EXTERNAL } from '../constants/links';
import { colors, fonts, space } from '../theme/tokens';

async function open(url: string) {
  await WebBrowser.openBrowserAsync(url);
}

export function FooterLinks() {
  return (
    <View style={styles.col}>
      <Text style={styles.motto}>
        IT&apos;S NOT MUCH. DO IT ANYWAY.{' '}
        <Text style={styles.heart} accessibilityLabel="love">
          ♥
        </Text>
      </Text>
      <View style={styles.row}>
        <Pressable onPress={() => void open(EXTERNAL.tiktokTyler)} style={styles.linkBtn}>
          <Text style={styles.link}>TYLER</Text>
        </Pressable>
        <Text style={styles.dot}>·</Text>
        <Pressable onPress={() => void open(EXTERNAL.linktree)} style={styles.linkBtn}>
          <Text style={styles.link}>LINKTREE</Text>
        </Pressable>
        <Text style={styles.dot}>·</Text>
        <Pressable onPress={() => void open(EXTERNAL.tiktokDarnail)} style={styles.linkBtn}>
          <Text style={styles.link}>DARNAIL</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable onPress={() => void open(EXTERNAL.website)} style={styles.linkBtn}>
          <Text style={styles.linkSmall}>takingmonday.org</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  col: {
    gap: space.md,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  motto: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    color: colors.textOnGreen,
    textAlign: 'center',
    letterSpacing: 0.6,
    lineHeight: 18,
    paddingHorizontal: space.sm,
  },
  heart: { color: colors.heartRed },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  linkBtn: { padding: space.xs },
  link: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    color: colors.textMutedOnDark,
    textDecorationLine: 'underline',
    letterSpacing: 1,
  },
  linkSmall: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMutedOnDark,
    textDecorationLine: 'underline',
    letterSpacing: 0.4,
  },
  dot: { color: colors.textMutedOnDark, fontSize: 14, fontWeight: '700', opacity: 0.85 },
});
