import { API } from '@/lib/api';
import { getPhotoUrl } from '@/lib/photo-url';
import { useAuth } from '@clerk/clerk-expo';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { GalleryPhotosHeader, getGalleryPhotosHeaderHeight } from '@/components/gallery/GalleryPhotosHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LoadingView } from '@/components/ui/LoadingView';
import { ScalePressable } from '@/components/ui/ScalePressable';
import { radius, spacing, typography } from '@/constants/theme';
import { useNativeTabScrollProps } from '@/hooks/useNativeTabScrollProps';
import { useStickyHeaderContentInset } from '@/hooks/useStickyHeaderContentInset';
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
  const [headerHeight, setHeaderHeight] = React.useState(() =>
    getGalleryPhotosHeaderHeight(insets.top),
  );
  const { contentTopInset, scrollContentTopInset } = useStickyHeaderContentInset(
    headerHeight,
    getGalleryPhotosHeaderHeight,
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
    onLayout: setHeaderHeight,
    showOptions: isSignedIn,
    sort,
    onSortChange: setSort,
    selectedYear,
    onYearChange: setSelectedYear,
    availableYears,
    viewMode,
    onViewModeChange: setViewMode,
  };

  const subtitle = !isSignedIn
    ? getGallerySubtitle({ count: 0, locked: true })
    : isLoading
      ? getGallerySubtitle({ count: 0, loading: true })
      : getGallerySubtitle({
          count: filteredGalleries.length,
          total: galleries.length,
        });

  const showGalleryList =
    isSignedIn && !isLoading && !error && filteredGalleries.length > 0;

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

  return (
    <View
      collapsable={false}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {showGalleryList ? (
        <FlatList
          {...tabScrollProps}
          key={viewMode}
          style={styles.list}
          data={filteredGalleries}
          renderItem={viewMode === 'card' ? renderCardItem : renderListItem}
          keyExtractor={(item) => item.apiEndpoint}
          numColumns={viewMode === 'card' ? 2 : 1}
          columnWrapperStyle={viewMode === 'card' ? styles.columnWrap : undefined}
          contentContainerStyle={[
            styles.listContainer,
            { paddingTop: scrollContentTopInset },
            viewMode === 'list' && styles.listContainerList,
          ]}
          scrollIndicatorInsets={{ top: scrollContentTopInset }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={[styles.staticBody, { paddingTop: contentTopInset }]}>{body}</View>
      )}

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
