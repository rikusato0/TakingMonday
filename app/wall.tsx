import * as WebBrowser from 'expo-web-browser';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const listHeader = useCallback(
    () => (
      <View style={styles.head}>
        <BrandHeader
          onRefresh={() => void refresh()}
          onLongPressAdmin={() => router.push('/admin/login')}
        />

        <Pressable
          onPress={() => {
            void refresh();
            router.back();
          }}
          hitSlop={12}
          style={styles.backWrap}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <View style={styles.backRow}>
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
          <Text style={styles.pageTitle}>FOR SOMEONE WALL</Text>
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
    ),
    [refresh],
  );

  return (
    <ScreenGradient>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <FlatList
          data={publicWall}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onPullRefresh()} tintColor="#fff" />
          }
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => (
            <SupportCard
              name={item.displayName}
              location={item.location}
              totalWishes={item.totalWishes}
              onPass={() => void incrementWallPerson(item.id).catch(onErr)}
            />
          )}
          ListFooterComponent={
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
          }
        />
      </SafeAreaView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  head: { paddingBottom: space.sm },
  backWrap: {
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: space.sm,
    paddingVertical: 2,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backArrow: { width: 14, height: 14 },
  backText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textOnGreen,
    letterSpacing: 0.5,
  },
  backUnder: { marginTop: 1, marginLeft: 18 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
  },
  titleDing: { width: 22, height: 22 },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.textOnGreen,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  titleUnder: { alignSelf: 'center', marginTop: 0, marginBottom: space.sm },
  subtitleWrap: { alignItems: 'center', marginTop: 2, marginBottom: space.xs },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textOnGreen,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  subtitleEmph: { color: colors.textOnGreen },
  subtitleUnder: { marginTop: 1, marginLeft: 70 },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: space.md,
    paddingTop: space.xs,
    paddingBottom: space.xxl,
  },
  footerWrap: { paddingVertical: space.lg, paddingHorizontal: space.xs },
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
    fontSize: 12,
    lineHeight: 17,
    color: colors.textOnGreen,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  footerEmph: { color: colors.textOnGreen },
  footerUnder: { marginTop: 1, alignSelf: 'center' },
});
