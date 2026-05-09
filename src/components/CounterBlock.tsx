import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, space } from '../theme/tokens';

type Props = {
  title: string;
  subtitle: string;
  totalLabel?: string;
  todayLabel?: string;
  today: number;
  total: number;
  busy?: boolean;
  onAdd: () => void;
  variant: 'green' | 'orange';
};

function formatInt(n: number) {
  return new Intl.NumberFormat().format(n);
}

export function CounterBlock({
  title,
  subtitle,
  totalLabel = 'ALL-TIME',
  todayLabel = 'TODAY',
  today,
  total,
  busy,
  onAdd,
  variant,
}: Props) {
  const accent = variant === 'green' ? colors.goodGreen : colors.orangeDeep;
  const accentMid = variant === 'green' ? colors.statGreen : colors.orange;
  const btnBg = variant === 'green' ? colors.goodGreenStroke : colors.orange;
  const btnBorder = variant === 'green' ? colors.goodGreenBright : colors.orangeDeep;
  const todayFontSize = useMemo(() => {
    const len = formatInt(today).length;
    if (len >= 7) return 26;
    if (len >= 5) return 30;
    return 34;
  }, [today]);
  const totalFontSize = useMemo(() => {
    const len = formatInt(total).length;
    if (len >= 8) return 22;
    if (len >= 6) return 24;
    return 26;
  }, [total]);

  return (
    <View style={styles.card}>
      <Text style={[styles.title, { color: accent }]}>{title}</Text>
      <View
        style={[styles.titleRule, { backgroundColor: variant === 'green' ? colors.goodGreenStroke : colors.orange }]}
      />
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: accent }]}>{todayLabel}</Text>
          <Text
            style={[styles.todayNum, { color: accentMid, fontSize: todayFontSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatInt(today)}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.text }]}>{totalLabel}</Text>
          <Text
            style={[styles.totalNum, { color: colors.cream, fontSize: totalFontSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatInt(total)}
          </Text>
        </View>
      </View>
      <Text style={styles.desc}>{subtitle}</Text>
      <Pressable
        onPress={onAdd}
        disabled={busy}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: btnBg, borderColor: btnBorder },
          pressed && styles.btnPressed,
          busy && styles.btnDisabled,
        ]}
      >
        {busy ? (
          <ActivityIndicator color={colors.textOnGreen} />
        ) : (
          <View style={styles.btnInner}>
            <Text style={styles.btnPlus}>+</Text>
            <Text style={styles.btnText}>ADD ONE</Text>
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
    gap: space.sm,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 15,
    letterSpacing: 1.3,
    fontWeight: '800',
  },
  titleRule: {
    height: 3,
    width: '72%',
    borderRadius: 2,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    marginTop: space.xs,
  },
  stat: { flex: 1, minWidth: 0 },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 7,
    letterSpacing: 0.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  todayNum: {
    fontFamily: fonts.display,
    fontWeight: '400',
  },
  totalNum: {
    fontFamily: fonts.display,
    fontWeight: '400',
  },
  divider: { width: 2, alignSelf: 'stretch', marginHorizontal: space.xs, opacity: 0.9 },
  desc: {
    fontFamily: fonts.body,
    fontSize: 7,
    lineHeight: 15,
    letterSpacing: 0.5,
    color: colors.text,
    marginTop: space.sm,
    textTransform: 'uppercase',
  },
  btn: {
    marginTop: space.md,
    borderRadius: radius.button,
    paddingVertical: space.md,
    alignItems: 'center',
    borderWidth: 2,
  },
  btnPressed: { opacity: 0.92 },
  btnDisabled: { opacity: 0.55 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnPlus: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.textOnGreen,
    marginTop: -4,
  },
  btnText: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '900',
    color: colors.textOnGreen,
    letterSpacing: 2,
  },
});
