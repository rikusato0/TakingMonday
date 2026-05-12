import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandHeader } from '../src/components/BrandHeader';
import { CounterBlock } from '../src/components/CounterBlock';
import { GoodWatchCard } from '../src/components/GoodWatchCard';
import { MainMotto } from '../src/components/MainMotto';
import { ScreenGradient } from '../src/components/ScreenGradient';
import { ShowUpRow } from '../src/components/ShowUpRow';
import { RATE_LIMIT_MESSAGE } from '../src/constants/config';
import { useAppData } from '../src/context/AppDataContext';
import { RateLimitError } from '../src/services/appBackend';
import { space } from '../src/theme/tokens';

export default function MainScreen() {
  const { counters, incrementGoodThings, incrementGoodWishes, refresh } = useAppData();
  const insets = useSafeAreaInsets();

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
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Math.max(insets.bottom, space.sm) + space.lg },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <BrandHeader
              onRefresh={() => void refresh()}
              onLongPressAdmin={() => router.push('/admin/login')}
            />

            <CounterBlock
              variant="green"
              title="GOOD THINGS"
              today={counters.goodThingsToday}
              total={counters.goodThingsTotal}
              onAction={() => void incrementGoodThings().catch(onErr)}
              paragraph={{
                line1: 'CLICK IF YOU DID SOMETHING GOOD',
                line2Before: 'OR SAW ',
                emphasized: 'SOMEONE ELSE',
                after: ' DO SOMETHING GOOD.',
              }}
            />

            <CounterBlock
              variant="orange"
              title="GOOD WISHES"
              today={counters.goodWishesToday}
              total={counters.goodWishesTotal}
              onAction={() => void incrementGoodWishes().catch(onErr)}
              bottomRow={<ShowUpRow onPress={() => router.push('/wall')} />}
            />

            <GoodWatchCard />
          </View>

          <MainMotto />
        </ScrollView>
      </SafeAreaView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  /** Option B: fill viewport when content is short; push motto to the visual bottom. */
  scroll: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
});
