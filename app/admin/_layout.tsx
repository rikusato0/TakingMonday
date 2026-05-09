import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: '#E85D4C',
        contentStyle: { backgroundColor: '#FFF8F3' },
      }}
    />
  );
}
