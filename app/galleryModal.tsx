import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AwesomeGallery, { RenderItemInfo } from 'react-native-awesome-gallery';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type GalleryItem = { uri: string };

const GalleryImage = ({ item, setImageDimensions }: RenderItemInfo<GalleryItem>) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  const handleLoad = useCallback(
    (event: { source: { width: number; height: number } }) => {
      const { width, height } = event.source;
      setImageDimensions({ width, height });
      setIsLoading(false);
      setHasLoadFailed(false);
    },
    [setImageDimensions],
  );

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasLoadFailed(true);
  }, []);

  return (
    <View style={styles.imageContainer}>
      {hasLoadFailed ? (
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-circle" size={40} color="#95D5B2" />
          <Text style={styles.errorText}>無法載入圖片</Text>
        </View>
      ) : (
        <Image
          source={{ uri: item.uri }}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={280}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {isLoading && !hasLoadFailed ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : null}
    </View>
  );
};

function GalleryModalScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ images: string; index: string; title?: string }>();

  const images = useMemo(() => {
    try {
      return JSON.parse(params.images ?? '[]') as string[];
    } catch (error) {
      console.error('Failed to parse images param:', error);
      return [];
    }
  }, [params.images]);

  const initialIndex = useMemo(() => {
    const idx = parseInt(params.index ?? '0', 10);
    return Number.isNaN(idx) ? 0 : idx;
  }, [params.index]);

  const galleryData = useMemo(() => images.map((uri) => ({ uri })), [images]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const backdropOpacity = useSharedValue(0);
  const chromeOpacity = useSharedValue(0);
  const chromeTranslateY = useSharedValue(12);

  useEffect(() => {
    backdropOpacity.value = withTiming(1, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
    chromeOpacity.value = withDelay(
      90,
      withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) }),
    );
    chromeTranslateY.value = withDelay(
      90,
      withSpring(0, { damping: 22, stiffness: 280, mass: 0.85 }),
    );
  }, [backdropOpacity, chromeOpacity, chromeTranslateY]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    return () => {
      StatusBar.setBarStyle('dark-content', true);
    };
  }, []);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const chromeStyle = useAnimatedStyle(() => ({
    opacity: chromeOpacity.value,
    transform: [{ translateY: chromeTranslateY.value }],
  }));

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleDownload = async () => {
    const currentImageUri = galleryData[currentIndex]?.uri;
    if (!currentImageUri) {
      Alert.alert('錯誤', '找不到圖片');
      return;
    }

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('需要權限', '請允許存取相簿以儲存圖片');
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}${Date.now()}.jpg`;
      const { uri } = await FileSystem.downloadAsync(currentImageUri, fileUri);
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('成功', '圖片已儲存到相簿');
    } catch (error) {
      console.error('Error downloading image:', error);
      Alert.alert('錯誤', '無法儲存圖片');
    }
  };

  const topInset = insets.top + spacing.sm;
  const controlStyle = [styles.controlButton, { top: topInset }];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />

      <SignedIn>
        <Animated.View style={[styles.backdrop, backdropStyle]} />

        <AwesomeGallery
          data={galleryData}
          keyExtractor={(item: GalleryItem) => item.uri}
          renderItem={GalleryImage}
          initialIndex={initialIndex}
          onIndexChange={setCurrentIndex}
          onSwipeToClose={handleClose}
          loop
        />

        <Animated.View style={[styles.chromeLayer, chromeStyle]} pointerEvents="box-none">
          <Pressable
            style={[controlStyle, styles.closeButton]}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="關閉"
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>

          <Pressable
            style={[controlStyle, styles.downloadButton]}
            onPress={handleDownload}
            accessibilityRole="button"
            accessibilityLabel="下載圖片"
          >
            <FontAwesome name="download" size={18} color="#FFFFFF" />
          </Pressable>

          <View style={[styles.indexIndicator, { top: topInset }]}>
            <Text style={styles.indexText}>
              {`${currentIndex + 1} / ${galleryData.length}`}
            </Text>
          </View>

          {params.title ? (
            <View style={[styles.titleBar, { bottom: insets.bottom + spacing.lg }]}>
              <Text style={styles.titleText} numberOfLines={1}>
                {params.title}
              </Text>
            </View>
          ) : null}
        </Animated.View>
      </SignedIn>

      <SignedOut>
        <View style={[styles.signInContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.signInText, { color: colors.text }]}>請登入以查看相簿</Text>
          <Button
            label="登入"
            onPress={() =>
              router.push(`/(auth)/sign-in?redirect_url=${encodeURIComponent('/gallery')}`)
            }
          />
        </View>
      </SignedOut>
    </View>
  );
}

export default GalleryModalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  chromeLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  controlButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    left: spacing.lg,
  },
  downloadButton: {
    right: spacing.lg,
  },
  indexIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: radius.full,
  },
  indexText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  titleBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: radius.lg,
  },
  titleText: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  signInText: {
    ...typography.body,
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: '#95D5B2',
  },
});
