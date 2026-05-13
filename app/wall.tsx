import * as WebBrowser from 'expo-web-browser';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandHeader } from '../src/components/BrandHeader';
import { ScreenGradient } from '../src/components/ScreenGradient';
import { SupportCard } from '../src/components/SupportCard';
import { Underline } from '../src/components/Underline';
import { EXTERNAL } from '../src/constants/links';
import { RATE_LIMIT_MESSAGE } from '../src/constants/config';
import { useAppData } from '../src/context/AppDataContext';
import { RateLimitError } from '../src/services/appBackend';
import { colors, fonts, space } from '../src/theme/tokens';

export default function WallScreen() {
  const { publicWall, incrementWallPerson, refresh } = useAppData();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const onErr = useCallback((e: unknown) => {
    if (e instanceof RateLimitError) {
      Alert.alert('Thanks for the energy', RATE_LIMIT_MESSAGE);
    } else {
      Alert.alert('Something went wrong', e instanceof Error ? e.message : 'Try again.');
    }
  }, []);

  const onPullRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  /** `router.back()` can no-op on some stacks; `dismissTo` pops until `/main` or replaces with it. */
  const goBackToMain = useCallback(() => {
    void refresh();
    router.dismissTo('/main');
  }, [refresh]);

  return (
    <ScreenGradient>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, space.sm) + space.lg },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onPullRefresh()}
              tintColor="#fff"
              colors={['#ffffff']}
              progressBackgroundColor="#1a1a1a"
            />
          }
        >
          <View>
            <View style={styles.head} collapsable={false}>
              <BrandHeader
                variant="wall"
                onRefresh={goBackToMain}
                onLongPressAdmin={() => router.push('/admin/login')}
              />

              <Pressable
                onPress={goBackToMain}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 14 }}
                style={styles.backWrap}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <View style={styles.backRow} collapsable={false}>
                  <Image
                    source={require('../assets/show/border_bottom_backbutton.png')}
                    style={styles.backArrow}
                    resizeMode="contain"
                    accessibilityIgnoresInvertColors
                  />
                  <Text style={styles.backText}>BACK</Text>
                </View>
                <Underline
                  source={require('../assets/show/border_grunge_backbutton.png')}
                  width={64}
                  height={4}
                  style={styles.backUnder}
                />
              </Pressable>

              <View style={styles.titleRow}>
                <Image
                  source={require('../assets/show/layer_163_for_someone_wall.png')}
                  style={styles.titleDing}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
                <Text style={styles.pageTitle} adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1}>
                  FOR SOMEONE WALL
                </Text>
                <Image
                  source={require('../assets/show/layer_166_for_someone_wall.png')}
                  style={styles.titleDing}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
              </View>
              <Underline
                source={require('../assets/show/underline_for_someone_wall.png')}
                width={240}
                height={10}
                style={styles.titleUnder}
              />

              <View style={styles.subtitleWrap}>
                <Text style={styles.subtitle}>
                  Click. For someone <Text style={styles.subtitleEmph}>out there.</Text>
                </Text>
                <Underline
                  source={require('../assets/show/underline_out_there.png')}
                  width={70}
                  height={3}
                  style={styles.subtitleUnder}
                />
              </View>
            </View>

            {publicWall.map((item) => (
              <SupportCard
                key={item.id}
                name={item.displayName}
                location={item.location}
                totalWishes={item.totalWishes}
                onPass={() => void incrementWallPerson(item.id).catch(onErr)}
              />
            ))}
          </View>

          <Pressable
            onPress={() => void WebBrowser.openBrowserAsync(EXTERNAL.website)}
            style={styles.footerWrap}
            accessibilityRole="link"
            accessibilityLabel="Reach out on our website"
          >
            <View style={styles.footerRow}>
              <Image
                source={require('../assets/show/arrow.png')}
                style={styles.footerArrow}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
              <View style={styles.footerCenter}>
                <Text style={styles.footerText}>
                  Want your name on this page?{'\n'}Reach out on{' '}
                  <Text style={styles.footerEmph}>our website.</Text>
                </Text>
                <Underline
                  source={require('../assets/show/underline_green_our_website.png')}
                  width={92}
                  height={4}
                  style={styles.footerUnder}
                />
              </View>
              <Image
                source={require('../assets/show/heart_outline.png')}
                style={styles.footerHeart}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            </View>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  head: { paddingBottom: space.md },
  backWrap: {
    alignSelf: 'flex-start',
    marginTop: space.sm,
    marginBottom: space.md,
    paddingVertical: space.xs,
    paddingRight: space.sm,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backArrow: { width: 16, height: 16 },
  backText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textOnGreen,
    letterSpacing: 0.5,
  },
  backUnder: { marginTop: 2, marginLeft: 18 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: space.xs,
    paddingHorizontal: space.xs,
  },
  titleDing: { width: 26, height: 26 },
  pageTitle: {
    fontFamily: fonts.body,
    fontSize: 34,
    color: colors.textOnGreen,
    letterSpacing: 0.65,
    textAlign: 'center',
    flexShrink: 1,
    maxWidth: '88%',
    textTransform: 'uppercase',
  },
  titleUnder: { alignSelf: 'center', marginTop: 0, marginBottom: space.sm },
  subtitleWrap: { alignItems: 'center', marginTop: space.xs, marginBottom: space.sm },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textOnGreen,
    letterSpacing: 0.3,
    textAlign: 'center',
    paddingHorizontal: space.sm,
  },
  subtitleEmph: { color: colors.textOnGreen, fontStyle: 'italic' },
  subtitleUnder: { marginTop: 2, marginLeft: 70 },
  /** Option B: footer sits at bottom when list is short; scrolls normally when long. */
  listContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  footerWrap: {
    paddingTop: space.md,
    paddingBottom: space.xs,
    paddingHorizontal: space.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  footerArrow: { width: 28, height: 22, opacity: 0.85 },
  footerHeart: { width: 26, height: 24, opacity: 0.85 },
  footerCenter: { flexShrink: 1, alignItems: 'center' },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textOnGreen,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  footerEmph: { color: colors.textOnGreen },
  footerUnder: { marginTop: 1, alignSelf: 'center' },
});
