import * as WebBrowser from 'expo-web-browser';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MAIN_PAGE_SOCIALS } from '../constants/mainSocialLinks';
import { colors, fonts, space } from '../theme/tokens';

export function MainSocialLinks() {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {MAIN_PAGE_SOCIALS.map((s, idx) => (
          <View key={s.key} style={styles.item}>
            <Pressable
              onPress={() => void WebBrowser.openBrowserAsync(s.url)}
              accessibilityRole="link"
              accessibilityLabel={`Open ${s.label}`}
              hitSlop={8}
              style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            >
              <Image
                source={s.icon}
                style={{ width: s.iconWidth, height: s.iconHeight }}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
              <Text style={styles.label}>{s.label}</Text>
            </Pressable>
            {idx < MAIN_PAGE_SOCIALS.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: space.md,
    paddingBottom: space.md,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    gap: 6,
  },
  pressed: { opacity: 0.72 },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textOnGreen,
    textTransform: 'uppercase',
  },
  divider: {
    width: 1,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});
