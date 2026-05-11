import { Stack, useRouter, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { useAppData } from '../../src/context/AppDataContext';

export default function AdminLayout() {
  const { isAdmin, adminInitializing } = useAppData();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (adminInitializing) return;

    const onLogin = pathname === '/admin' || pathname === '/admin/login';

    if (!isAdmin && !onLogin) {
      router.replace('/admin/login');
    } else if (isAdmin && onLogin) {
      router.replace('/admin/dashboard');
    }
  }, [isAdmin, adminInitializing, pathname, router]);

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
