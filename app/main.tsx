import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandHeader } from '../src/components/BrandHeader';
import { CounterBlock } from '../src/components/CounterBlock';
import { FooterLinks } from '../src/components/FooterLinks';
import { ScreenGradient } from '../src/components/ScreenGradient';
import { RATE_LIMIT_MESSAGE } from '../src/constants/config';
import { useAppData } from '../src/context/AppDataContext';
import { RateLimitError } from '../src/services/appBackend';
import { colors, fonts, radius, space } from '../src/theme/tokens';

const COPY_GOOD_THINGS =
  'CLICK IF YOU DID SOMETHING GOOD OR SAW SOMEONE ELSE DO SOMETHING GOOD.';
const COPY_GOOD_WISHES = 'SHOW UP FOR SOMEONE';

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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <BrandHeader
            onRefresh={() => void refresh()}
            onLongPressAdmin={() => router.push('/admin/login')}
          />

          <CounterBlock
            title="GOOD THINGS"
            subtitle={COPY_GOOD_THINGS}
            today={counters.goodThingsToday}
            total={counters.goodThingsTotal}
            busy={busyG}
            variant="green"
            onAdd={() => {
              if (busyG) return;
              setBusyG(true);
              void incrementGoodThings()
                .catch(onErr)
                .finally(() => setBusyG(false));
            }}
          />

          <CounterBlock
            title="GOOD WISHES"
            subtitle={COPY_GOOD_WISHES}
            today={counters.goodWishesToday}
            total={counters.goodWishesTotal}
            busy={busyW}
            variant="orange"
            onAdd={() => {
              if (busyW) return;
              setBusyW(true);
              void incrementGoodWishes()
                .catch(onErr)
                .finally(() => setBusyW(false));
            }}
          />

          <Pressable
            onPress={() => router.push('/wall')}
            style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
          >
            <Text style={styles.navBtnText}>SHOW UP FOR SOMEONE</Text>
          </Pressable>

          <FooterLinks />
        </ScrollView>
      </SafeAreaView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: {
    padding: space.lg,
    paddingBottom: space.xxl,
    gap: space.md,
  },
  navBtn: {
    marginTop: space.md,
    borderRadius: radius.button,
    borderWidth: 2,
    borderColor: colors.orange,
    paddingVertical: space.lg,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  navBtnPressed: { opacity: 0.92 },
  navBtnText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '900',
    color: colors.orange,
    letterSpacing: 1,
  },
});
