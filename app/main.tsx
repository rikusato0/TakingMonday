import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [busyG, setBusyG] = useState(false);
  const [busyW, setBusyW] = useState(false);

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
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BrandHeader
            onRefresh={() => void refresh()}
            onLongPressAdmin={() => router.push('/admin/login')}
          />

          <CounterBlock
            variant="green"
            title="GOOD THINGS"
            subtitle="GOOD THINGS HAVE BEEN DONE"
            today={counters.goodThingsToday}
            total={counters.goodThingsTotal}
            busy={busyG}
            onAction={() => {
              if (busyG) return;
              setBusyG(true);
              void incrementGoodThings()
                .catch(onErr)
                .finally(() => setBusyG(false));
            }}
            paragraph={{
              before: 'CLICK IF YOU DID SOMETHING GOOD OR SAW ',
              emphasized: 'SOMEONE ELSE',
              after: ' DO SOMETHING GOOD.',
            }}
          />

          <CounterBlock
            variant="orange"
            title="GOOD WISHES"
            subtitle="GOOD WISHES HAVE BEEN MADE"
            today={counters.goodWishesToday}
            total={counters.goodWishesTotal}
            busy={busyW}
            onAction={() => {
              if (busyW) return;
              setBusyW(true);
              void incrementGoodWishes()
                .catch(onErr)
                .finally(() => setBusyW(false));
            }}
            bottomRow={<ShowUpRow onPress={() => router.push('/wall')} />}
          />

          <GoodWatchCard />

          <MainMotto />
        </ScrollView>
      </SafeAreaView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: {
    paddingHorizontal: space.md,
    paddingTop: space.xs,
    paddingBottom: space.lg,
  },
});
