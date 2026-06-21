import { useMemo } from "react";

import { getThemeColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";

export function useAppTheme() {
  const scheme = useColorScheme();
  const colors = useMemo(() => getThemeColors(scheme), [scheme]);

  return { scheme, colors, isDark: scheme === "dark" };
}
