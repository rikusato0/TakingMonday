import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, space } from '../theme/tokens';

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
  return (
    <View style={styles.card}>
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
      <View style={styles.nameRule} />
      <View style={styles.locRow}>
        <Text style={styles.pin} accessibilityLabel="Location">
          📍
        </Text>
        <Text style={styles.loc} numberOfLines={2}>
          {location}
        </Text>
      </View>
      <View style={styles.countRow}>
        <Text style={styles.countNum} numberOfLines={1} adjustsFontSizeToFit>
          {formatInt(totalWishes)}
        </Text>
        <Text style={styles.sent}>WISHES HAVE BEEN SENT.</Text>
      </View>
      <Pressable
        onPress={onPass}
        disabled={busy}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed, busy && styles.ctaDisabled]}
      >
        {busy ? (
          <ActivityIndicator color={colors.textOnGreen} />
        ) : (
          <Text style={styles.ctaText}>PASS ONE FORWARD →</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardDark,
    borderRadius: radius.card,
    padding: space.lg,
    borderWidth: 2,
    borderColor: colors.orange,
    gap: space.sm,
    marginBottom: space.md,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: '900',
    color: colors.orangeDeep,
    letterSpacing: 1,
  },
  nameRule: {
    marginTop: 4,
    height: 3,
    width: '92%',
    backgroundColor: colors.orange,
    borderRadius: 2,
    opacity: 0.95,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.xs,
    marginTop: space.sm,
  },
  pin: { fontSize: 14, marginTop: 1 },
  loc: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.goodGreenBright,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  countRow: {
    marginTop: space.md,
    alignItems: 'flex-start',
    gap: 4,
  },
  countNum: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.textOnGreen,
  },
  sent: {
    fontFamily: fonts.body,
    fontSize: 9,
    lineHeight: 13,
    color: colors.textMutedOnDark,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  cta: {
    marginTop: space.md,
    borderWidth: 2,
    borderColor: colors.orangeDeep,
    borderRadius: radius.full,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.orange,
    minWidth: 200,
  },
  ctaPressed: { opacity: 0.92 },
  ctaDisabled: { opacity: 0.55 },
  ctaText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    color: colors.textOnGreen,
    letterSpacing: 0.8,
  },
});
