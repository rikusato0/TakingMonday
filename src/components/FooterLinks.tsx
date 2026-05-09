import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EXTERNAL } from '../constants/links';
import { colors, fonts, space } from '../theme/tokens';

async function open(url: string) {
  await WebBrowser.openBrowserAsync(url);
}

export function FooterLinks() {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => void open(EXTERNAL.tiktok)} style={styles.linkBtn}>
        <Text style={styles.link}>TikTok</Text>
      </Pressable>
      <Text style={styles.dot}>·</Text>
      <Pressable onPress={() => void open(EXTERNAL.linktree)} style={styles.linkBtn}>
        <Text style={styles.link}>Linktree</Text>
      </Pressable>
      <Text style={styles.dot}>·</Text>
      <Pressable onPress={() => void open(EXTERNAL.website)} style={styles.linkBtn}>
        <Text style={styles.link}>Site</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    paddingVertical: space.lg,
  },
  linkBtn: { padding: space.xs },
  link: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '800',
    color: colors.textOnGreen,
    textDecorationLine: 'underline',
    letterSpacing: 0.5,
  },
  dot: { color: colors.textOnGreen, fontSize: 16, fontWeight: '700', opacity: 0.85 },
});
