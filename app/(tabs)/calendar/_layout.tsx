import { Stack } from 'expo-router';

import { useTabStackScreenOptions } from '@/constants/tab-stack-screen-options';

export default function CalendarStackLayout() {
  const screenOptions = useTabStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
