import { Stack } from 'expo-router';

import {
  customHeaderScrollEdgeOptions,
  useTabStackScreenOptions,
} from '@/constants/tab-stack-screen-options';

export default function GalleriesStackLayout() {
  const screenOptions = useTabStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          ...customHeaderScrollEdgeOptions,
        }}
      />
    </Stack>
  );
}
