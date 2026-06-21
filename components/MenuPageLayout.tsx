import { Stack, type Href } from 'expo-router';
import { ReactNode } from 'react';

import { MenuPageHandoffShell } from '@/components/MenuPageHandoffShell';
import { useMenuHandoff } from '@/contexts/HomeMenuContext';

type MenuPageLayoutProps = {
  route: Href;
  title: string;
  children: ReactNode;
};

export function MenuPageLayout({ route, title, children }: MenuPageLayoutProps) {
  const isHandoff = useMenuHandoff(route);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          animation: isHandoff ? 'none' : 'default',
        }}
      />
      <MenuPageHandoffShell route={route} title={title}>
        {children}
      </MenuPageHandoffShell>
    </>
  );
}
