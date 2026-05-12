import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
    const len = formatInt(total).length;
    if (len >= 8) return 32;
    if (len >= 6) return 36;
    return 40;
  }, [total]);

  const subtitlePrefix = variant === 'green' ? 'GOOD THINGS ' : 'GOOD WISHES ';
  const subtitleSuffix = variant === 'green' ? 'HAVE BEEN DONE' : 'HAVE BEEN MADE';

  return (
    <SprayCard source={a.border} style={styles.card} contentStyle={styles.content}>
      <Text style={[styles.title, { color: accent }]}>{title}</Text>
      <Underline source={a.titleUnderline} width={130} height={7} style={styles.titleUnderline} />

      <View style={styles.body}>
        <View style={styles.left}>
          <Text style={[styles.hero, { fontSize: heroSize }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatInt(total)}
          </Text>

          <View style={styles.subtitleBlock}>
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitlePrefix} numberOfLines={1}>
                {subtitlePrefix}
              </Text>
              <View style={styles.subtitleSuffixWrap}>
                <Text style={[styles.subtitleSuffix, { color: subtitleAccent }]} numberOfLines={1}>
                  {subtitleSuffix}
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

          <View style={styles.statsRow}>
            <View style={styles.statColToday}>
              <Text style={styles.statLabel}>TODAY</Text>
              <Text
                style={[styles.statNum, { color: accent }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {formatInt(today)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColAllTime}>
              <Text style={styles.statLabel}>ALL-TIME</Text>
              <Text style={styles.statNum} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                {formatInt(total)}
              </Text>
              <Underline source={a.statUnderline} width={78} height={3} />
            </View>
          </View>
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
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  left: { flex: 1, minWidth: 0 },
  hero: {
    fontFamily: fonts.display,
    color: colors.textOnGreen,
  },
  subtitleBlock: { marginTop: 5 },
  /** Single baseline row: prefix + accent suffix + underline only under suffix (Figma). */
  subtitleRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'flex-start',
    gap: 0,
  },
  subtitlePrefix: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.45,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
    flexShrink: 0,
    paddingTop: 0,
  },
  subtitleSuffixWrap: {
    flexShrink: 1,
    minWidth: 0,
    alignItems: 'stretch',
  },
  subtitleSuffix: {
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
    gap: space.md,
    marginTop: 8,
  },
  /** TODAY inset slightly — matches Figma column inset from divider. */
  statColToday: {
    flexGrow: 0,
    flexShrink: 0,
    width: '34%',
    maxWidth: 128,
    minWidth: 82,
    paddingLeft: 12,
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
    marginHorizontal: 6,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 0.55,
    color: colors.textMutedOnDark,
    textTransform: 'uppercase',
  },
  statNum: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textOnGreen,
    marginTop: 4,
  },
  splat: {
    alignSelf: 'center',
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
