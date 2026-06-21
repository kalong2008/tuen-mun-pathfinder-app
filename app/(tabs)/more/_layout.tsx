import { Stack } from 'expo-router';

import { useTabStackScreenOptions } from '@/constants/tab-stack-screen-options';

export default function MoreStackLayout() {
  const screenOptions = useTabStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: '更多' }} />
    </Stack>
  );
}
