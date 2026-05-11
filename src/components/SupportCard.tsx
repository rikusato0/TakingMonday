import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, space } from '../theme/tokens';
import { SplatButton } from './SplatButton';
import { SprayCard } from './SprayCard';
import { Underline } from './Underline';

type Props = {
  name: string;
  location: string;
  totalWishes: number;
  busy?: boolean;
  onPass: () => void;
};

function formatInt(n: number) {
  return new Intl.NumberFormat().format(n);
}

export function SupportCard({ name, location, totalWishes, busy, onPass }: Props) {
  const heroSize = useMemo(() => {
    const len = formatInt(totalWishes).length;
    if (len >= 8) return 24;
    if (len >= 6) return 28;
    return 32;
  }, [totalWishes]);

  return (
    <SprayCard
      source={require('../../assets/show/border_red_card.png')}
      style={styles.card}
      contentStyle={styles.content}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          <Underline
            source={require('../../assets/show/border_grunge_alex.png')}
            width="70%"
            height={5}
            style={styles.nameUnder}
          />

          <View style={styles.locRow}>
            <Image
              source={require('../../assets/show/border_grunge.png')}
              style={styles.pin}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
            <Text style={styles.loc} numberOfLines={2}>
              {location}
            </Text>
          </View>

          <Text style={[styles.hero, { fontSize: heroSize }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatInt(totalWishes)}
          </Text>

          <Text style={styles.sent}>
            WISHES HAVE{'\n'}BEEN SENT.
          </Text>
          <Underline
            source={require('../../assets/show/border_grunge_been_sent.png')}
            width={66}
            height={4}
            style={styles.sentUnder}
          />
        </View>

        <SplatButton
          normal={require('../../assets/main/btn_pass_one_forward_normal.png')}
          pressedSrc={require('../../assets/main/btn_pass_one_forward_pressed.png')}
          onPress={onPass}
          busy={busy}
          width={124}
          height={114}
          accessibilityLabel={`Pass one forward to ${name}`}
          style={styles.splat}
        />
      </View>
    </SprayCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: space.md },
  content: {
    paddingLeft: 18,
    paddingRight: 10,
    paddingTop: 16,
    paddingBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  left: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: fonts.body,
    fontSize: 20,
    color: colors.orange,
    letterSpacing: 0.6,
  },
  nameUnder: { marginTop: 2, marginBottom: 2 },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  pin: { width: 12, height: 16 },
  loc: {
    flexShrink: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.goodGreenBright,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  hero: {
    fontFamily: fonts.display,
    color: colors.textOnGreen,
    marginTop: 6,
  },
  sent: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textOnGreen,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  sentUnder: { marginTop: 2 },
  splat: {
    marginRight: -6,
    marginLeft: -4,
  },
});
