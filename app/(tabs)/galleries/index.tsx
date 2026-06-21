import { API } from '@/lib/api';
import { getPhotoUrl } from '@/lib/photo-url';
import { useAuth } from '@clerk/clerk-expo';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, useNavigation } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  GalleryPhotosHeader,
  getGalleryPhotosHeaderContentInset,
  getGalleryPhotosHeaderHeight,
  GALLERY_HEADER_CONTENT_INSET_INITIAL,
  GALLERY_HEADER_CONTENT_INSET_VIEW_SWITCH,
} from '@/components/gallery/GalleryPhotosHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LoadingView } from '@/components/ui/LoadingView';
import { ScalePressable } from '@/components/ui/ScalePressable';
import { radius, spacing, typography } from '@/constants/theme';
import { useNativeTabScrollProps } from '@/hooks/useNativeTabScrollProps';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  extractGalleryYears,
  filterAndSortGalleries,
  parseGalleryActivityType,
  parseGalleryYear,
  type GalleryListItem,
  type GallerySortOption,
  type GalleryViewMode,
} from '@/lib/gallery-utils';

const GALLERIES_INSET_DEBUG = __DEV__;

type GalleriesInsetDebugCategory = 'USER' | 'SYSTEM' | 'LAYOUT' | 'SCROLL' | 'NAV';

let galleriesInsetDebugSeq = 0;

const NAV_USER_MESSAGES: Record<string, string> = {
  'tab-blur': 'You switched away from the Galleries tab',
};

function logGalleriesDebug(
  category: GalleriesInsetDebugCategory,
  message: string,
  details?: Record<string, unknown>,
) {
  if (!GALLERIES_INSET_DEBUG) return;
  galleriesInsetDebugSeq += 1;
  if (details) {
    console.log(`[GalleriesInset] #${galleriesInsetDebugSeq} ${category} | ${message}`, details);
  } else {
    console.log(`[GalleriesInset] #${galleriesInsetDebugSeq} ${category} | ${message}`);
  }
}

const GALLERIES_API_ENDPOINT = API.photoLinks();
const GRID_GAP = spacing.md;
const GRID_PADDING = spacing.lg;
const TILE_WIDTH = (Dimensions.get('window').width - GRID_PADDING * 2 - GRID_GAP) / 2;
const TILE_HEIGHT = TILE_WIDTH * 1.15;
const LIST_THUMB_SIZE = 72;

interface ApiGalleryItem {
  name: string;
  href: string;
}

interface GalleryInfo extends GalleryListItem {}

function getGallerySubtitle({
  count,
  total,
  loading,
  locked,
}: {
  count: number;
  total?: number;
  loading?: boolean;
  locked?: boolean;
}) {
  if (locked) return '登入後即可瀏覽活動相簿';
  if (loading) return '正在載入…';
  if (total !== undefined && count !== total) {
    return `共 ${count} 個相簿（全部 ${total} 個）`;
  }
  return `共 ${count} 個相簿`;
}

const GalleryTile = React.memo(function GalleryTile({
  item,
  onPress,
}: {
  item: GalleryInfo;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const [coverUri, setCoverUri] = React.useState(item.coverUri);
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <ScalePressable
      style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.coverWrap}>
        <Image
          source={{ uri: coverUri }}
          style={styles.cover}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            if (coverUri !== item.fallbackCoverUri) {
              setCoverUri(item.fallbackCoverUri);
            } else {
              setIsLoading(false);
            }
          }}
        />
        {isLoading ? (
          <View style={styles.coverLoader}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        ) : null}
        <Text style={styles.coverTitle} numberOfLines={2}>
          {item.name}
        </Text>
      </View>
    </ScalePressable>
  );
});

const GalleryListRow = React.memo(function GalleryListRow({
  item,
  onPress,
}: {
  item: GalleryInfo;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const [coverUri, setCoverUri] = React.useState(item.coverUri);
  const [isLoading, setIsLoading] = React.useState(true);
  const year = parseGalleryYear(item.name);
  const activityType = parseGalleryActivityType(item.name);
  const subtitle = [year ? `${year}年` : null, activityType].filter(Boolean).join(' · ');

  return (
    <ScalePressable
      style={[styles.listRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.listThumbWrap}>
        <Image
          source={{ uri: coverUri }}
          style={styles.listThumb}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            if (coverUri !== item.fallbackCoverUri) {
              setCoverUri(item.fallbackCoverUri);
            } else {
              setIsLoading(false);
            }
          }}
        />
        {isLoading ? (
          <View style={styles.listThumbLoader}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        ) : null}
      </View>
      <View style={styles.listRowContent}>
        <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        {subtitle ? (
          <Text style={[styles.listSubtitle, { color: colors.muted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <IconSymbol name="chevron.right" size={18} color={colors.muted} />
    </ScalePressable>
  );
});

function LockedPreview() {
  const { colors } = useAppTheme();
  const router = useRouter();

  return (
    <View style={styles.lockedWrap}>
      <View style={styles.lockedGrid}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[styles.lockedTile, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
          />
        ))}
      </View>
      <View style={styles.lockedOverlay}>
        <View style={[styles.lockedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FontAwesome name="lock" size={28} color={colors.primary} />
          <Text style={[styles.lockedTitle, { color: colors.text }]}>需要登入</Text>
          <Text style={[styles.lockedText, { color: colors.muted }]}>登入後即可瀏覽活動相簿</Text>
          <Button
            label="前往登入"
            onPress={() =>
              router.push(`/sign-in?redirect_url=${encodeURIComponent('/(tabs)/galleries')}`)
            }
            style={styles.lockedButton}
          />
        </View>
      </View>
    </View>
  );
}

export default function GalleriesListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [isScreenFocused, setIsScreenFocused] = React.useState(() => navigation.isFocused());
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabScrollProps = useNativeTabScrollProps();
  const { isSignedIn } = useAuth();
  const [galleries, setGalleries] = React.useState<GalleryInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<GallerySortOption>('newest');
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [viewMode, setViewMode] = React.useState<GalleryViewMode>('card');
  const [headerHeight, setHeaderHeight] = React.useState(0);
  const [useSwitchInset, setUseSwitchInset] = React.useState(false);
  const [listLayoutKey, setListLayoutKey] = React.useState(0);
  const savedInitialContentTopInsetRef = React.useRef<number | null>(null);
  const [contentTopInset, setContentTopInset] = React.useState(() =>
    getGalleryPhotosHeaderContentInset(
      getGalleryPhotosHeaderHeight(insets.top),
      GALLERY_HEADER_CONTENT_INSET_INITIAL,
    ),
  );
  const scrollYRef = React.useRef(0);
  const flatListRef = React.useRef<FlatList<GalleryInfo>>(null);
  const loggedNegativeScrollKeyRef = React.useRef<string | null>(null);
  const insetStateRef = React.useRef({
    useSwitchInset: false,
    contentTopInset: 0,
    listLayoutKey: 0,
    viewMode: 'card' as GalleryViewMode,
    headerHeight: 0,
  });

  React.useEffect(() => {
    logGalleriesDebug('SYSTEM', 'GalleriesListScreen mounted');
    return () => {
      logGalleriesDebug('SYSTEM', 'GalleriesListScreen unmounted');
    };
  }, []);

  React.useEffect(() => {
    insetStateRef.current = {
      useSwitchInset,
      contentTopInset,
      listLayoutKey,
      viewMode,
      headerHeight,
    };
  }, [useSwitchInset, contentTopInset, listLayoutKey, viewMode, headerHeight]);

  const headerLayoutHeight = headerHeight || getGalleryPhotosHeaderHeight(insets.top);

  const getFallbackInitialContentTopInset = React.useCallback(
    () =>
      getGalleryPhotosHeaderContentInset(
        headerLayoutHeight,
        GALLERY_HEADER_CONTENT_INSET_INITIAL,
      ),
    [headerLayoutHeight],
  );

  const getSwitchContentTopInset = React.useCallback(
    () =>
      getGalleryPhotosHeaderContentInset(
        headerLayoutHeight,
        GALLERY_HEADER_CONTENT_INSET_VIEW_SWITCH,
      ),
    [headerLayoutHeight],
  );

  React.useEffect(() => {
    if (headerHeight <= 0 || savedInitialContentTopInsetRef.current !== null) return;

    const captured = getGalleryPhotosHeaderContentInset(
      headerHeight,
      GALLERY_HEADER_CONTENT_INSET_INITIAL,
    );
    savedInitialContentTopInsetRef.current = captured;
    logGalleriesDebug('SYSTEM', 'Captured initial inset from header onLayout (saved for resets)', {
      headerHeight,
      contentTopInset: captured,
      safeAreaTop: insets.top,
      previousContentTopInset: insetStateRef.current.contentTopInset,
      useSwitchInset: insetStateRef.current.useSwitchInset,
    });
    if (!useSwitchInset) {
      setContentTopInset(captured);
    }
  }, [headerHeight, useSwitchInset, insets.top]);

  const applySavedInitialInset = React.useCallback(() => {
    return (
      savedInitialContentTopInsetRef.current ?? getFallbackInitialContentTopInset()
    );
  }, [getFallbackInitialContentTopInset]);

  const applyTabBlurReset = React.useCallback(
    (source: 'tab-blur') => {
      const before = { ...insetStateRef.current, scrollY: scrollYRef.current };
      const inset = applySavedInitialInset();
      const nextListLayoutKey = before.listLayoutKey + 1;
      const nextFlatListKey = `${before.viewMode}-${nextListLayoutKey}-initial`;

      logGalleriesDebug('NAV', NAV_USER_MESSAGES[source], { source });
      logGalleriesDebug('SYSTEM', 'Tab leave → reset inset + bump FlatList key (force remount on return)', {
        before,
        after: {
          useSwitchInset: false,
          contentTopInset: inset,
          listLayoutKey: nextListLayoutKey,
          flatListKey: nextFlatListKey,
          scrollY: 0,
        },
        savedInitialContentTopInset: savedInitialContentTopInsetRef.current,
      });

      setUseSwitchInset(false);
      setContentTopInset(inset);
      setListLayoutKey(nextListLayoutKey);
      scrollYRef.current = 0;
      loggedNegativeScrollKeyRef.current = null;
    },
    [applySavedInitialInset],
  );

  React.useEffect(() => {
    const focusSubscription = navigation.addListener('focus', () => {
      setIsScreenFocused(true);
    });
    const blurSubscription = navigation.addListener('blur', () => {
      setIsScreenFocused(false);
    });

    return () => {
      focusSubscription();
      blurSubscription();
    };
  }, [navigation]);

  React.useEffect(() => {
    const tabNavigation = navigation.getParent();
    const tabFocusSubscription = tabNavigation?.addListener('focus', () => {
      setIsScreenFocused(true);
      const inset = applySavedInitialInset();
      if (insetStateRef.current.useSwitchInset) {
        setUseSwitchInset(false);
        setContentTopInset(inset);
        setListLayoutKey((key) => key + 1);
        logGalleriesDebug('SYSTEM', 'Tab enter → restored initial inset (was still switch)', {
          contentTopInset: inset,
          viewMode: insetStateRef.current.viewMode,
        });
      } else {
        logGalleriesDebug('NAV', 'Galleries tab visible again (FlatList will mount)', {
          contentTopInset: inset,
          flatListKey: `${insetStateRef.current.viewMode}-${insetStateRef.current.listLayoutKey}-initial`,
        });
      }
    });
    const tabBlurSubscription = tabNavigation?.addListener('blur', () => {
      setIsScreenFocused(false);
      applyTabBlurReset('tab-blur');
    });

    return () => {
      tabFocusSubscription?.();
      tabBlurSubscription?.();
    };
  }, [navigation, applyTabBlurReset, applySavedInitialInset]);

  const handleViewModeChange = React.useCallback(
    (mode: GalleryViewMode) => {
      const before = { ...insetStateRef.current, scrollY: scrollYRef.current };
      const useSwitch = mode === 'list';
      const inset = useSwitch
        ? getSwitchContentTopInset()
        : applySavedInitialInset();
      const profile = useSwitch ? 'switch' : 'initial';
      const flatListKeyForMode = `${mode}-${before.listLayoutKey}-${profile}`;

      logGalleriesDebug(
        'USER',
        `You changed display mode → ${mode === 'card' ? 'card grid' : 'list'}`,
        { viewMode: mode },
      );
      logGalleriesDebug('SYSTEM', `Apply ${profile} inset (view mode change)`, {
        before,
        after: {
          useSwitchInset: useSwitch,
          contentTopInset: inset,
          viewMode: mode,
          flatListKey: flatListKeyForMode,
        },
        ...(useSwitch
          ? { switchConfig: GALLERY_HEADER_CONTENT_INSET_VIEW_SWITCH }
          : { savedInitialContentTopInset: savedInitialContentTopInsetRef.current }),
      });

      setUseSwitchInset(useSwitch);
      setContentTopInset(inset);
      setViewMode(mode);
    },
    [getSwitchContentTopInset, applySavedInitialInset],
  );

  const switchContentTopInset = getSwitchContentTopInset();
  const flatListKey = `${viewMode}-${listLayoutKey}-${useSwitchInset ? 'switch' : 'initial'}`;

  const renderGalleryListHeader = React.useCallback(() => {
    return (
      <View
        style={{ height: contentTopInset }}
        onLayout={(event) => {
          logGalleriesDebug('LAYOUT', 'Spacer onLayout (actual native height)', {
            measuredHeight: event.nativeEvent.layout.height,
            expectedHeight: contentTopInset,
            flatListKey,
          });
        }}
      />
    );
  }, [contentTopInset, flatListKey]);

  const handleHeaderLayout = React.useCallback(
    (height: number) => {
      logGalleriesDebug('LAYOUT', 'Header onLayout fired', {
        measuredHeight: height,
        previousHeaderHeight: headerHeight,
        safeAreaTop: insets.top,
        estimatedHeaderHeight: getGalleryPhotosHeaderHeight(insets.top),
        currentContentTopInset: insetStateRef.current.contentTopInset,
      });
      setHeaderHeight(height);
    },
    [headerHeight, insets.top],
  );

  const handleListScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentInset } = event.nativeEvent;
      scrollYRef.current = contentOffset.y;
      if (contentInset.top > 0 || contentInset.bottom > 0) {
        logGalleriesDebug('SCROLL', 'Non-zero native contentInset on FlatList', {
          contentInset,
          scrollY: contentOffset.y,
          paddingTopApplied: insetStateRef.current.contentTopInset,
          flatListKey: `${insetStateRef.current.viewMode}-${insetStateRef.current.listLayoutKey}-${insetStateRef.current.useSwitchInset ? 'switch' : 'initial'}`,
        });
      }
      const currentKey = `${insetStateRef.current.viewMode}-${insetStateRef.current.listLayoutKey}-${insetStateRef.current.useSwitchInset ? 'switch' : 'initial'}`;
      if (
        contentOffset.y < 0 &&
        loggedNegativeScrollKeyRef.current !== currentKey
      ) {
        loggedNegativeScrollKeyRef.current = currentKey;
        logGalleriesDebug('SCROLL', 'Negative contentOffset detected (content shifted up)', {
          scrollY: contentOffset.y,
          contentInset,
          safeAreaTop: insets.top,
          paddingTopApplied: insetStateRef.current.contentTopInset,
          flatListKey: currentKey,
        });
      }
      tabScrollProps.onScroll?.(event);
    },
    [insets.top, tabScrollProps],
  );

  const handleListMomentumScrollEnd = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      scrollYRef.current = scrollY;
      logGalleriesDebug('SCROLL', 'FlatList scroll stopped', {
        scrollY,
        contentTopInset: insetStateRef.current.contentTopInset,
        flatListKey,
        viewMode: insetStateRef.current.viewMode,
        profile: insetStateRef.current.useSwitchInset ? 'switch' : 'initial',
      });
    },
    [flatListKey],
  );

  const handleListContentSizeChange = React.useCallback(
    (width: number, height: number) => {
      logGalleriesDebug('LAYOUT', 'FlatList content size changed', {
        contentWidth: width,
        contentHeight: height,
        scrollY: scrollYRef.current,
        paddingTopApplied: insetStateRef.current.contentTopInset,
        flatListKey,
        viewMode: insetStateRef.current.viewMode,
      });
    },
    [flatListKey],
  );

  const handleListLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      logGalleriesDebug('LAYOUT', 'FlatList container onLayout', {
        layout: event.nativeEvent.layout,
        paddingTopApplied: insetStateRef.current.contentTopInset,
        flatListKey,
        scrollY: scrollYRef.current,
        isScreenFocused,
      });
      if (scrollYRef.current < 0) {
        const wasScrollY = scrollYRef.current;
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
          scrollYRef.current = 0;
          logGalleriesDebug('SCROLL', 'Corrected negative scrollY on layout → scrollToOffset(0)', {
            flatListKey,
            wasScrollY,
          });
        });
      }
    },
    [flatListKey, isScreenFocused],
  );

  const availableYears = React.useMemo(() => extractGalleryYears(galleries), [galleries]);

  const filteredGalleries = React.useMemo(
    () =>
      filterAndSortGalleries(galleries, {
        year: selectedYear,
        activityType: null,
        sort,
      }),
    [galleries, selectedYear, sort],
  );

  const showGalleryList =
    isSignedIn && !isLoading && !error && filteredGalleries.length > 0;

  React.useLayoutEffect(() => {
    if (showGalleryList && navigation.isFocused()) {
      setIsScreenFocused(true);
    }
  }, [showGalleryList, navigation]);

  React.useEffect(() => {
    logGalleriesDebug('SYSTEM', 'React render committed (inset state snapshot)', {
      profile: useSwitchInset ? 'switch' : 'initial',
      savedInitialContentTopInset: savedInitialContentTopInsetRef.current,
      headerHeight,
      headerLayoutHeight,
      contentTopInset,
      switchContentTopInset,
      safeAreaTop: insets.top,
      listLayoutKey,
      flatListKey,
      viewMode,
      scrollY: scrollYRef.current,
      showGalleryList,
      isScreenFocused,
    });
  }, [
    useSwitchInset,
    headerHeight,
    headerLayoutHeight,
    contentTopInset,
    switchContentTopInset,
    insets.top,
    listLayoutKey,
    flatListKey,
    viewMode,
    showGalleryList,
    isScreenFocused,
  ]);

  React.useEffect(() => {
    if (!showGalleryList || !isScreenFocused) return;

    logGalleriesDebug('SYSTEM', 'FlatList mounted (screen focused)', {
      flatListKey,
      contentTopInset,
      viewMode,
      listLayoutKey,
      isScreenFocused,
    });

    return () => {
      logGalleriesDebug('SYSTEM', 'FlatList unmounting', {
        flatListKey,
        scrollY: scrollYRef.current,
        isScreenFocused,
      });
    };
  }, [flatListKey, contentTopInset, viewMode, listLayoutKey, showGalleryList, isScreenFocused]);

  React.useEffect(() => {
    const fetchGalleries = async () => {
      if (!isSignedIn) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(GALLERIES_API_ENDPOINT);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: { galleries: ApiGalleryItem[] } = await response.json();

        const transformedData = data.galleries
          .map((item) => {
            if (typeof item.href !== 'string' || !item.href) return null;
            return {
              name: item.name,
              title: item.name,
              apiEndpoint: getPhotoUrl(item.href),
              coverUri: getPhotoUrl(item.href.replace(/\.json$/, '-1.jpg')),
              fallbackCoverUri: getPhotoUrl(item.href.replace(/\.json$/, '-1.jpeg')),
            };
          })
          .filter((item): item is GalleryInfo => item !== null);

        setGalleries(transformedData);
      } catch (err) {
        console.error('Failed to fetch galleries list:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      fetchGalleries();
    } else {
      setGalleries([]);
      setIsLoading(false);
      setError(null);
    }
  }, [isSignedIn]);

  const openGallery = React.useCallback(
    (item: GalleryInfo) => {
      router.push({
        pathname: '/gallery',
        params: {
          apiEndpoint: item.apiEndpoint,
          galleryTitle: item.title,
        },
      });
    },
    [router],
  );

  const renderCardItem = React.useCallback(
    ({ item }: { item: GalleryInfo }) => (
      <GalleryTile item={item} onPress={() => openGallery(item)} />
    ),
    [openGallery],
  );

  const renderListItem = React.useCallback(
    ({ item }: { item: GalleryInfo }) => (
      <GalleryListRow item={item} onPress={() => openGallery(item)} />
    ),
    [openGallery],
  );

  const headerProps = {
    sticky: true,
    onLayout: handleHeaderLayout,
    showOptions: isSignedIn,
    sort,
    onSortChange: setSort,
    selectedYear,
    onYearChange: setSelectedYear,
    availableYears,
    viewMode,
    onViewModeChange: handleViewModeChange,
  };

  const subtitle = !isSignedIn
    ? getGallerySubtitle({ count: 0, locked: true })
    : isLoading
      ? getGallerySubtitle({ count: 0, loading: true })
      : getGallerySubtitle({
          count: filteredGalleries.length,
          total: galleries.length,
        });

  let body: React.ReactNode = null;

  if (!isSignedIn) {
    body = <LockedPreview />;
  } else if (isLoading) {
    body = <LoadingView message="載入相簿…" />;
  } else if (error) {
    body = (
      <EmptyState
        icon={<FontAwesome name="exclamation-triangle" size={32} color={colors.muted} />}
        title="載入失敗"
        description={error}
      />
    );
  } else if (filteredGalleries.length === 0) {
    body = (
      <View style={styles.emptyWrap}>
        <EmptyState
          icon={<FontAwesome name="filter" size={32} color={colors.muted} />}
          title="沒有符合的相簿"
          description="試試其他年份篩選"
        />
      </View>
    );
  }

  if (showGalleryList) {
    return (
      <>
        {isScreenFocused ? (
          <FlatList
            ref={flatListRef}
            automaticallyAdjustContentInsets={false}
            automaticallyAdjustsScrollIndicatorInsets={false}
            contentInset={{ top: 0, bottom: 0, left: 0, right: 0 }}
            scrollIndicatorInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
            contentInsetAdjustmentBehavior="never"
            key={flatListKey}
            ListHeaderComponent={renderGalleryListHeader}
            scrollEventThrottle={tabScrollProps.scrollEventThrottle}
            onScroll={handleListScroll}
            onMomentumScrollEnd={handleListMomentumScrollEnd}
            onContentSizeChange={handleListContentSizeChange}
            onLayout={handleListLayout}
            style={[styles.list, { backgroundColor: colors.background }]}
            data={filteredGalleries}
            renderItem={viewMode === 'card' ? renderCardItem : renderListItem}
            keyExtractor={(item) => item.apiEndpoint}
            numColumns={viewMode === 'card' ? 2 : 1}
            columnWrapperStyle={viewMode === 'card' ? styles.columnWrap : undefined}
            contentContainerStyle={[
              styles.listContainer,
              viewMode === 'list' && styles.listContainerList,
            ]}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={[styles.list, { backgroundColor: colors.background }]} />
        )}
        <GalleryPhotosHeader {...headerProps} subtitle={subtitle} />
      </>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.staticBody, { paddingTop: contentTopInset }]}>{body}</View>
      <GalleryPhotosHeader {...headerProps} subtitle={subtitle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  staticBody: {
    flex: 1,
  },
  emptyWrap: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: spacing.xxxl,
  },
  listContainerList: {
    gap: spacing.sm,
  },
  columnWrap: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
    paddingHorizontal: GRID_PADDING,
  },
  tile: {
    width: TILE_WIDTH,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  coverWrap: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverLoader: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverTitle: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    ...typography.bodyMedium,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
    marginHorizontal: GRID_PADDING,
  },
  listThumbWrap: {
    width: LIST_THUMB_SIZE,
    height: LIST_THUMB_SIZE,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  listThumb: {
    width: '100%',
    height: '100%',
  },
  listThumbLoader: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRowContent: {
    flex: 1,
    gap: spacing.xs,
  },
  listTitle: {
    ...typography.bodyMedium,
  },
  listSubtitle: {
    ...typography.caption,
  },
  lockedWrap: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  lockedGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  lockedTile: {
    width: '47%',
    flexGrow: 1,
    height: 120,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  lockedCard: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  lockedTitle: {
    ...typography.heading,
  },
  lockedText: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  lockedButton: {
    minWidth: 160,
  },
});
