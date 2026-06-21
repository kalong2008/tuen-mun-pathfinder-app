import { useRouter, type Href } from 'expo-router';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

function menuRoutePath(route: Href): string {
  return typeof route === 'string' ? route : route.pathname;
}

type HomeMenuContextValue = {
  navOpen: boolean;
  overlayRoute: Href | null;
  openNav: () => void;
  closeNav: () => void;
  navigateFromMenu: (route: Href) => void;
  clearOverlayRoute: () => void;
};

const HomeMenuContext = createContext<HomeMenuContextValue | null>(null);

export function HomeMenuProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [overlayRoute, setOverlayRoute] = useState<Href | null>(null);

  const navigateFromMenu = useCallback(
    (route: Href) => {
      setOverlayRoute(route);
      setNavOpen(false);
      router.push(route);
    },
    [router],
  );

  const clearOverlayRoute = useCallback(() => {
    setOverlayRoute(null);
  }, []);

  const value = useMemo(
    () => ({
      navOpen,
      overlayRoute,
      openNav: () => setNavOpen(true),
      closeNav: () => setNavOpen(false),
      navigateFromMenu,
      clearOverlayRoute,
    }),
    [navOpen, overlayRoute, navigateFromMenu, clearOverlayRoute],
  );

  return <HomeMenuContext.Provider value={value}>{children}</HomeMenuContext.Provider>;
}

export function useHomeMenu() {
  const context = useContext(HomeMenuContext);
  if (!context) {
    throw new Error('useHomeMenu must be used within HomeMenuProvider');
  }
  return context;
}

export function useMenuHandoff(route: Href): boolean {
  const { overlayRoute } = useHomeMenu();
  if (!overlayRoute) {
    return false;
  }
  return menuRoutePath(overlayRoute) === menuRoutePath(route);
}
