import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type TabBarScrollDirectionContextValue = {
  isScrollingUp: boolean;
  setScrollingUp: (scrollingUp: boolean) => void;
};

const TabBarScrollDirectionContext = createContext<TabBarScrollDirectionContextValue | null>(
  null,
);

export function TabBarScrollDirectionProvider({ children }: { children: ReactNode }) {
  const [isScrollingUp, setScrollingUp] = useState(false);

  const value = useMemo(
    () => ({
      isScrollingUp,
      setScrollingUp,
    }),
    [isScrollingUp],
  );

  return (
    <TabBarScrollDirectionContext.Provider value={value}>
      {children}
    </TabBarScrollDirectionContext.Provider>
  );
}

export function useTabBarScrollDirection() {
  const context = useContext(TabBarScrollDirectionContext);
  if (!context) {
    throw new Error('useTabBarScrollDirection must be used within TabBarScrollDirectionProvider');
  }
  return context;
}
