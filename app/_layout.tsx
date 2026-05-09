import { Stack } from 'expo-router';
import { SedgwickAve_400Regular, useFonts as useSedgwick } from '@expo-google-fonts/sedgwick-ave';
import { RoadRage_400Regular, useFonts as useRoadRage } from '@expo-google-fonts/road-rage';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppDataProvider } from '../src/context/AppDataContext';
import { colors } from '../src/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [roadLoaded] = useRoadRage({ RoadRage_400Regular });
  const [sedgLoaded] = useSedgwick({ SedgwickAve_400Regular });
  const loaded = roadLoaded && sedgLoaded;

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.gradientEnd },
            animation: 'fade',
          }}
        />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
