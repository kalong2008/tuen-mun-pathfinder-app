import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingView } from '@/components/ui/LoadingView';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getPhotoUrl } from '@/lib/photo-url';

const GRID_GAP = spacing.sm;
const GRID_PADDING = spacing.lg;
const TILE_WIDTH =
  (Dimensions.get('window').width - GRID_PADDING * 2 - GRID_GAP) / 2;

interface FetchedImage {
  url: string;
  width: number;
  height: number;
}

interface GalleryPhoto {
  id: string;
  uri: string;
  width: number;
  height: number;
}

const PhotoTile = React.memo(function PhotoTile({
  item,
  onPress,
}: {
  item: GalleryPhoto;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
        pressed && styles.tilePressed,
      ]}
      onPress={onPress}
      disabled={hasError}
    >
      {hasError ? (
        <View style={styles.errorWrap}>
          <FontAwesome name="exclamation-triangle" size={24} color={colors.muted} />
        </View>
      ) : (
        <>
          <Image
            source={{ uri: item.uri }}
            style={styles.photo}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null}
        </>
      )}
    </Pressable>
  );
});

export default function GalleryGridScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ apiEndpoint: string; galleryTitle: string }>();
  const { apiEndpoint, galleryTitle } = params;

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGallery = useCallback(async () => {
    if (!apiEndpoint) {
      setError('缺少相簿資料');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = (await response.json()) as FetchedImage[];
      setPhotos(
        data.map((item, index) => ({
          id: `${index}-${item.url}`,
          uri: getPhotoUrl(item.url),
          width: item.width,
          height: item.height,
        })),
      );
    } catch (err) {
      console.error('Failed to fetch gallery data:', err);
      setError(err instanceof Error ? err.message : '無法載入相片');
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const handleImagePress = useCallback(
    (index: number) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({
        pathname: '/galleryModal',
        params: {
          images: JSON.stringify(photos.map((photo) => photo.uri)),
          index: index.toString(),
          title: galleryTitle ?? '相簿',
        },
      });
    },
    [router, photos, galleryTitle],
  );

  const renderCardItem = useCallback(
    ({ item, index }: { item: GalleryPhoto; index: number }) => (
      <PhotoTile item={item} onPress={() => handleImagePress(index)} />
    ),
    [handleImagePress],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: galleryTitle ?? '相簿',
          headerBackButtonDisplayMode: 'minimal',
          headerTitleAlign: 'center',
        }}
      />

      {isLoading ? (
        <LoadingView message="載入相片…" />
      ) : error ? (
        <EmptyState
          icon={<FontAwesome name="exclamation-triangle" size={32} color={colors.muted} />}
          title="載入失敗"
          description={error}
          actionLabel="重試"
          onAction={loadGallery}
        />
      ) : photos.length === 0 ? (
        <EmptyState
          icon={<FontAwesome name="photo" size={32} color={colors.muted} />}
          title="沒有相片"
          description="此相簿暫時沒有相片"
        />
      ) : (
        <>
          <View style={[styles.listHeader, { backgroundColor: colors.background }]}>
            <Text style={[styles.countLabel, { color: colors.muted }]}>
              共 {photos.length} 張相片
            </Text>
          </View>
          <FlatList
            style={styles.list}
            data={photos}
            renderItem={renderCardItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrap}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
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
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  listHeader: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: GRID_PADDING,
  },
  countLabel: {
    ...typography.caption,
  },
  columnWrap: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
    paddingHorizontal: GRID_PADDING,
  },
  tile: {
    width: TILE_WIDTH,
    height: TILE_WIDTH,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  tilePressed: {
    opacity: 0.88,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  loader: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
