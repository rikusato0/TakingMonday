import * as WebBrowser from 'expo-web-browser';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandHeader } from '../src/components/BrandHeader';
import { ScreenGradient } from '../src/components/ScreenGradient';
import { SupportCard } from '../src/components/SupportCard';
import { EXTERNAL } from '../src/constants/links';
import { RATE_LIMIT_MESSAGE } from '../src/constants/config';
import { useAppData } from '../src/context/AppDataContext';
import { RateLimitError } from '../src/services/appBackend';
import { colors, fonts, space } from '../src/theme/tokens';

export default function WallScreen() {
  const { publicWall, incrementWallPerson, refresh } = useAppData();
  const [busyId, setBusyId] = useState<string | null>(null);

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

  return (
    <ScreenGradient>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.head}>
          <Pressable
            onPress={() => {
              void refresh();
              router.back();
            }}
            hitSlop={12}
            style={styles.backWrap}
          >
            <Text style={styles.backText}>{'< '}BACK</Text>
          </Pressable>
          <BrandHeader
            onRefresh={() => void refresh()}
            onLongPressAdmin={() => router.push('/admin/login')}
          />
          <Text style={styles.pageTitle}>FOR SOMEONE WALL</Text>
          <View style={styles.titleUnderline} />
        </View>

        <FlatList
          data={publicWall}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SupportCard
              name={item.displayName}
              location={item.location}
              totalWishes={item.totalWishes}
              busy={busyId === item.id}
              onPass={() => {
                if (busyId) return;
                setBusyId(item.id);
                void incrementWallPerson(item.id)
                  .catch(onErr)
                  .finally(() => setBusyId(null));
              }}
            />
          )}
          ListFooterComponent={
            <Pressable onPress={() => void WebBrowser.openBrowserAsync(EXTERNAL.website)} style={styles.footerLink}>
              <Text style={styles.footerText}>Want your name on this page? Reach out on our website.</Text>
            </Pressable>
          }
        />
      </SafeAreaView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  head: { paddingHorizontal: space.lg, paddingBottom: space.sm },
  backWrap: { alignSelf: 'flex-start', marginBottom: space.sm },
  backText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '900',
    color: colors.textOnGreen,
    letterSpacing: 0.6,
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.orange,
    marginTop: space.md,
    letterSpacing: 0.5,
  },
  titleUnderline: {
    marginTop: space.xs,
    height: 4,
    width: '85%',
    backgroundColor: colors.orange,
    borderRadius: 2,
    opacity: 0.95,
  },
  list: { padding: space.lg, paddingTop: space.sm, paddingBottom: space.xxl },
  footerLink: { paddingVertical: space.xl, paddingHorizontal: space.sm },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMutedOnDark,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
  },
});
