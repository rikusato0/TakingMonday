import { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors, fonts, space } from '../theme/tokens';
import { SprayCard } from './SprayCard';
import { SplatButton } from './SplatButton';
import { Underline } from './Underline';

type Variant = 'green' | 'orange';

type ParagraphLines = {
  line1: string;
  line2Before: string;
  emphasized: string;
  after: string;
};

type Props = {
  variant: Variant;
  title: string;
  /** Optional descriptive paragraph (Good Things only): two lines + underline under emphasis. */
  paragraph?: ParagraphLines;
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
    subtitleUnderline: require('../../assets/main/undeline_96003.png'),
    statUnderline: require('../../assets/main/undeline_96003.png'),
    paragraphUnderline: require('../../assets/main/underline_someone_else.png'),
    btnNormal: require('../../assets/main/btn_add_one_normal.png'),
    btnPressed: require('../../assets/main/btn_add_one_pressed.png'),
  },
  orange: {
    border: require('../../assets/main/border_red.png'),
    titleUnderline: require('../../assets/main/border_good_wishes.png'),
    subtitleUnderline: require('../../assets/main/border_96003_orange.png'),
    statUnderline: require('../../assets/main/border_96003_orange.png'),
    paragraphUnderline: require('../../assets/main/underline_someone_else.png'),
    btnNormal: require('../../assets/main/btn_pass_one_forward_normal.png'),
    btnPressed: require('../../assets/main/btn_pass_one_forward_pressed.png'),
  },
} as const;

function formatInt(n: number) {
  return new Intl.NumberFormat().format(n);
}

/** Below this logical width, stats sit on their own row (full card width) so ALL-TIME is readable beside a fixed-width splat. */
const NARROW_BODY_BREAKPOINT = 440;

export function CounterBlock({
  variant,
  title,
  paragraph,
  bottomRow,
  today,
  total,
  busy,
  onAction,
}: Props) {
  const a = ASSETS[variant];
  const accent = variant === 'green' ? colors.goodGreenBright : colors.orange;
  /** Sub-label under hero: Figma uses deeper green / orange, not pure white. */
  const subtitleAccent = variant === 'green' ? colors.statGreen : colors.orange;

  const heroSize = useMemo(() => {
    const len = formatInt(total).replace(/,/g, '').length;
    if (len >= 10) return 36;
    if (len >= 8) return 40;
    if (len >= 6) return 44;
    return 50;
  }, [total]);

  const subtitle =
    variant === 'green'
      ? { line1: 'GOOD THINGS HAVE', lastWord: 'DONE' }
      : { line1: 'GOOD WISHES HAVE', lastWord: 'SENT' };

  const { width: windowWidth } = useWindowDimensions();
  const narrowCounters = windowWidth < NARROW_BODY_BREAKPOINT;

  const heroSubtitle = (
    <>
      <Text
        style={[styles.hero, { fontSize: heroSize }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.38}
        maxFontSizeMultiplier={1.15}
      >
        {formatInt(total)}
      </Text>

      <View style={styles.subtitleBlock}>
        <Text style={styles.subtitleLine1} numberOfLines={2}>
          {subtitle.line1}
        </Text>
        <View style={styles.subtitleLine2Row}>
          <Text style={styles.subtitleBeenMuted} numberOfLines={1}>
            BEEN{' '}
          </Text>
          <View style={styles.subtitleLastWordWrap}>
            <Text style={[styles.subtitleLastWord, { color: subtitleAccent }]} numberOfLines={1}>
              {subtitle.lastWord}
            </Text>
            <Underline
              source={a.subtitleUnderline}
              width="100%"
              height={4}
              style={styles.subtitleAccentUnder}
            />
          </View>
        </View>
      </View>
    </>
  );

  const statsRow = (
    <View style={[styles.statsRow, narrowCounters && styles.statsRowFullBleed]}>
      <View style={styles.statColToday}>
        <Text style={styles.statLabel} adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1}>
          TODAY
        </Text>
        <Text
          style={[styles.statNumToday, { color: accent }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {formatInt(today)}
        </Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statColAllTime}>
        <Text style={styles.statLabel} adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1}>
          ALL-TIME
        </Text>
        <Text
          style={styles.statNumAllTime}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {formatInt(total)}
        </Text>
        <Underline source={a.statUnderline} width={78} height={3} />
      </View>
    </View>
  );

  return (
    <SprayCard source={a.border} style={styles.card} contentStyle={styles.content}>
      <Text style={[styles.title, { color: accent }]}>{title}</Text>
      <Underline source={a.titleUnderline} width={130} height={7} style={styles.titleUnderline} />

      {narrowCounters ? (
        <View style={styles.bodyColumn}>
          <View style={styles.bodyTopRow}>
            <View style={styles.left}>{heroSubtitle}</View>

            <SplatButton
              normal={a.btnNormal}
              pressedSrc={a.btnPressed}
              onPress={onAction}
              busy={busy}
              width={154}
              height={132}
              accessibilityLabel={variant === 'green' ? 'Add one good thing' : 'Pass one forward'}
              style={styles.splatNarrow}
            />
          </View>
          {statsRow}
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.left}>
            {heroSubtitle}

            {statsRow}
          </View>

          <SplatButton
            normal={a.btnNormal}
            pressedSrc={a.btnPressed}
            onPress={onAction}
            busy={busy}
            width={154}
            height={132}
            accessibilityLabel={variant === 'green' ? 'Add one good thing' : 'Pass one forward'}
            style={styles.splat}
          />
        </View>
      )}

      {paragraph ? (
        <View style={styles.paragraphBlock}>
          <Text style={[styles.paragraph, styles.paragraphLine1]}>{paragraph.line1}</Text>
          <View style={styles.paragraphLine2Wrap}>
            <View style={styles.paragraphLine2Inner}>
              <Text style={styles.paragraphInline}>{paragraph.line2Before}</Text>
              <View style={styles.paragraphEmphWrap}>
                <Text style={[styles.paragraphEmph, { color: subtitleAccent }]}>{paragraph.emphasized}</Text>
                <Underline
                  source={a.paragraphUnderline}
                  width="100%"
                  height={4}
                  style={styles.paragraphEmphUnderlineImg}
                />
              </View>
              <Text style={styles.paragraphInline}>{paragraph.after}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {bottomRow ? <View style={styles.bottom}>{bottomRow}</View> : null}
    </SprayCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: space.md },
  content: {
    paddingLeft: 26,
    paddingRight: 24,
    paddingTop: 22,
    paddingBottom: 22,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 19,
    letterSpacing: 0.75,
  },
  titleUnderline: { marginTop: 0, marginBottom: 8 },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    gap: 12,
  },
  /** Narrow phones: hero + subtitle + splat row, counter strip uses full inner width underneath. */
  bodyColumn: {
    marginTop: 10,
    gap: space.sm,
  },
  bodyTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  left: { flex: 1, minWidth: 0 },
  hero: {
    fontFamily: fonts.display,
    color: colors.textOnGreen,
    alignSelf: 'stretch',
  },
  subtitleBlock: {
    marginTop: 6,
    alignSelf: 'stretch',
    gap: 2,
  },
  subtitleLine1: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.45,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
  },
  subtitleLine2Row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  subtitleBeenMuted: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.45,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
  },
  subtitleLastWordWrap: {
    minWidth: 0,
    alignItems: 'stretch',
  },
  subtitleLastWord: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  subtitleAccentUnder: {
    marginTop: 2,
    alignSelf: 'stretch',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    marginTop: 8,
    alignSelf: 'stretch',
  },
  statsRowFullBleed: {
    width: '100%',
  },
  /** Narrower TODAY band so divider sits left and ALL-TIME label has room. */
  statColToday: {
    flexGrow: 0,
    flexShrink: 1,
    width: '28%',
    maxWidth: 116,
    minWidth: 0,
    paddingLeft: 4,
  },
  statColAllTime: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 0.55,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
  },
  statNumToday: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.textOnGreen,
    marginTop: 4,
    alignSelf: 'stretch',
  },
  statNumAllTime: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.textOnGreen,
    marginTop: 4,
    alignSelf: 'stretch',
  },
  /** Slightly higher than vertical center beside the stacked left column on wide layouts. */
  splat: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  splatNarrow: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  paragraphBlock: {
    marginTop: 14,
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    paddingHorizontal: 2,
    gap: 6,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 0.42,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
  },
  paragraphLine1: {
    lineHeight: 14,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  paragraphLine2Wrap: {
    alignSelf: 'stretch',
    alignItems: 'flex-start',
  },
  paragraphLine2Inner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    rowGap: 4,
    columnGap: 0,
    maxWidth: '100%',
  },
  paragraphInline: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.42,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
  },
  /** Underline is absolutely positioned so it doesn’t change row baseline vs neighbors. */
  paragraphEmphWrap: {
    position: 'relative',
    alignSelf: 'baseline',
    paddingBottom: 6,
  },
  paragraphEmph: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.42,
    textTransform: 'uppercase',
  },
  paragraphEmphUnderlineImg: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 1,
    marginTop: 0,
    width: '100%',
  },
  bottom: { marginTop: 12, alignItems: 'center', alignSelf: 'stretch' },
});
