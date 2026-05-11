import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, space } from '../theme/tokens';
import { SprayCard } from './SprayCard';
import { SplatButton } from './SplatButton';
import { Underline } from './Underline';

type Variant = 'green' | 'orange';

type Props = {
  variant: Variant;
  title: string;
  /** Subtitle line (e.g. "GOOD THINGS HAVE BEEN DONE"). */
  subtitle: string;
  /** Optional descriptive paragraph (Good Things only). */
  paragraph?: { before: string; emphasized: string; after: string };
  /** Optional row at the bottom (Good Wishes => "SHOW UP FOR SOMEONE"). */
  bottomRow?: React.ReactNode;
  today: number;
  total: number;
  busy?: boolean;
  onAction: () => void;
};

const ASSETS = {
  green: {
    border: require('../../assets/main/border_green.png'),
    titleUnderline: require('../../assets/main/border_good_things.png'),
    subtitleUnderline: require('../../assets/main/underline_lets_do_something_about_it.png'),
    statUnderline: require('../../assets/main/undeline_96003.png'),
    btnNormal: require('../../assets/main/btn_add_one_normal.png'),
    btnPressed: require('../../assets/main/btn_add_one_pressed.png'),
  },
  orange: {
    border: require('../../assets/main/border_red.png'),
    titleUnderline: require('../../assets/main/border_good_wishes.png'),
    subtitleUnderline: require('../../assets/main/border_96003_orange.png'),
    statUnderline: require('../../assets/main/border_96003_orange.png'),
    btnNormal: require('../../assets/main/btn_pass_one_forward_normal.png'),
    btnPressed: require('../../assets/main/btn_pass_one_forward_pressed.png'),
  },
} as const;

function formatInt(n: number) {
  return new Intl.NumberFormat().format(n);
}

export function CounterBlock({
  variant,
  title,
  subtitle,
  paragraph,
  bottomRow,
  today,
  total,
  busy,
  onAction,
}: Props) {
  const a = ASSETS[variant];
  const accent = variant === 'green' ? colors.goodGreenBright : colors.orange;

  const heroSize = useMemo(() => {
    const len = formatInt(total).length;
    if (len >= 8) return 26;
    if (len >= 6) return 30;
    return 34;
  }, [total]);

  return (
    <SprayCard source={a.border} style={styles.card} contentStyle={styles.content}>
      <Text style={[styles.title, { color: accent }]}>{title}</Text>
      <Underline source={a.titleUnderline} width={130} height={7} style={styles.titleUnderline} />

      <View style={styles.body}>
        <View style={styles.left}>
          <Text style={[styles.hero, { fontSize: heroSize }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatInt(total)}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Underline source={a.subtitleUnderline} width={90} height={4} style={styles.subtitleUnderline} />

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={[styles.statLabel, { color: accent }]}>TODAY</Text>
              <Text style={[styles.statNum, { color: accent }]} numberOfLines={1} adjustsFontSizeToFit>
                {formatInt(today)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>ALL-TIME</Text>
              <Text style={styles.statNum} numberOfLines={1} adjustsFontSizeToFit>
                {formatInt(total)}
              </Text>
              <Underline source={a.statUnderline} width={70} height={3} />
            </View>
          </View>
        </View>

        <SplatButton
          normal={a.btnNormal}
          pressedSrc={a.btnPressed}
          onPress={onAction}
          busy={busy}
          width={108}
          height={94}
          accessibilityLabel={variant === 'green' ? 'Add one good thing' : 'Pass one forward'}
          style={styles.splat}
        />
      </View>

      {paragraph ? (
        <Text style={styles.paragraph}>
          {paragraph.before}
          <Text style={[styles.paragraphEmph, { color: accent }]}>{paragraph.emphasized}</Text>
          {paragraph.after}
        </Text>
      ) : null}

      {bottomRow ? <View style={styles.bottom}>{bottomRow}</View> : null}
    </SprayCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: space.md },
  content: {
    paddingLeft: 18,
    paddingRight: 12,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 18,
    letterSpacing: 0.8,
  },
  titleUnderline: { marginTop: 0, marginBottom: 4 },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  left: { flex: 1, minWidth: 0 },
  hero: {
    fontFamily: fonts.display,
    color: colors.textOnGreen,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 9,
    letterSpacing: 0.4,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  subtitleUnderline: { marginTop: 1, marginBottom: 8 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    marginTop: 2,
  },
  statCol: { flexShrink: 1, minWidth: 0 },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    letterSpacing: 0.5,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
  },
  statNum: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textOnGreen,
    marginTop: 1,
  },
  splat: {
    marginRight: -8,
  },
  paragraph: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 9,
    lineHeight: 13,
    letterSpacing: 0.4,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
  },
  paragraphEmph: {
    textDecorationLine: 'underline',
  },
  bottom: { marginTop: 8 },
});
