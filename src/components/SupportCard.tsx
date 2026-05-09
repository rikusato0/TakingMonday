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
      <View style={styles.top}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          <View style={styles.nameRule} />
          <Text style={styles.loc} numberOfLines={2}>
            {location}
          </Text>
          <Text style={styles.sent}>WISHES HAVE BEEN SENT.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeNum} numberOfLines={1} adjustsFontSizeToFit>
            {formatInt(totalWishes)}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onPass}
        disabled={busy}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed, busy && styles.ctaDisabled]}
      >
        {busy ? (
          <ActivityIndicator color={colors.textOnGreen} />
        ) : (
          <View style={styles.ctaInner}>
            <Text style={styles.ctaPlus}>+</Text>
            <Text style={styles.ctaText}>PASS ONE FORWARD</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.lg,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    gap: space.md,
    marginBottom: space.md,
  },
  top: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  name: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '900',
    color: colors.orangeDeep,
    letterSpacing: 1,
  },
  nameRule: {
    marginTop: 4,
    height: 3,
    width: '90%',
    backgroundColor: colors.orange,
    borderRadius: 2,
    opacity: 0.9,
  },
  loc: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.text,
    marginTop: space.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sent: {
    marginTop: space.sm,
    fontFamily: fonts.body,
    fontSize: 8,
    lineHeight: 12,
    color: colors.text,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    alignItems: 'center',
    minWidth: 88,
    borderWidth: 2,
    borderColor: colors.orangeDeep,
  },
  badgeNum: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.textOnGreen,
  },
  cta: {
    borderWidth: 2,
    borderColor: colors.orange,
    borderRadius: radius.button,
    paddingVertical: space.md,
    alignItems: 'center',
    backgroundColor: colors.orange,
  },
  ctaPressed: { opacity: 0.92 },
  ctaDisabled: { opacity: 0.55 },
  ctaInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaPlus: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.textOnGreen,
    marginTop: -2,
  },
  ctaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '900',
    color: colors.textOnGreen,
    letterSpacing: 0.6,
  },
});
