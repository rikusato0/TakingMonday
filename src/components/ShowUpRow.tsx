import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';
import { Underline } from './Underline';

type Props = {
  onPress: () => void;
};

/** "👥 SHOW UP FOR SOMEONE →" row that lives inside the Good Wishes card. */
export function ShowUpRow({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Show up for someone"
      hitSlop={8}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Image
        source={require('../../assets/main/2_person_icon.png')}
        style={styles.people}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <View style={styles.center}>
        <Text style={styles.text}>SHOW UP FOR SOMEONE</Text>
        <Underline
          source={require('../../assets/main/underline_show_up_for_someone.png')}
          width="100%"
          height={3}
          style={styles.under}
        />
      </View>
      <Image
        source={require('../../assets/main/arrow_red_right.png')}
        style={styles.arrow}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    alignSelf: 'stretch',
    flexWrap: 'nowrap',
  },
  pressed: { opacity: 0.85 },
  people: { width: 22, height: 18 },
  center: { flexShrink: 1 },
  text: {
    fontFamily: fonts.body,
    fontSize: 13,
    letterSpacing: 0.42,
    color: colors.orange,
  },
  under: { marginTop: 2 },
  arrow: { width: 22, height: 14 },
});
