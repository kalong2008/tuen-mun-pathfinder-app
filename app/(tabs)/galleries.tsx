import { APP_COLORS, Colors } from '@/app/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, Stack, useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Constants
const BASE_URL = 'https://tuenmunpathfinder.com';
const GALLERIES_API_ENDPOINT = `${BASE_URL}/api/photo-links`;
const THUMBNAIL_SIZE = 100; // Size in pixels for optimized thumbnails

// Structure for data received from the API
interface ApiGalleryItem {
  name: string;
  href: string;
}

// Structure for processed data used by the component
interface GalleryInfo {
  name: string;
  title: string;
  apiEndpoint: string;
  urlPrefix: string;
  thumbnailUri: string;
  fallbackThumbnailUri: string;
  optimizedThumbnailUri: string;
  optimizedFallbackThumbnailUri: string;
  blurhash?: string; // Optional: Add blurhash property
}

// Removed the hardcoded availableGalleries array

// Create a separate component for the gallery item
const GalleryItem = ({ item, onPress }: { item: GalleryInfo; onPress: () => void }) => {
  const [currentUri, setCurrentUri] = React.useState(item.thumbnailUri);
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const [isFallback, setIsFallback] = React.useState(false);

  // Preload the fallback image when component mounts
  React.useEffect(() => {
    if (item.fallbackThumbnailUri) {
      Image.prefetch(item.fallbackThumbnailUri).catch(console.error);
    }
  }, [item.fallbackThumbnailUri]);

  const handleError = React.useCallback(() => {
    console.log(`Failed to load thumbnail ${currentUri}`);
    if (currentUri === item.thumbnailUri && item.fallbackThumbnailUri) {
      console.log(`Trying fallback thumbnail ${item.fallbackThumbnailUri}`);
      setIsFallback(true);
      setCurrentUri(item.fallbackThumbnailUri);
      setIsImageLoading(true); // Reset loading state for fallback attempt
    }
  }, [currentUri, item.thumbnailUri, item.fallbackThumbnailUri]);

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={onPress}
    >
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: currentUri }} 
          placeholder={item.blurhash ?? 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH'} // Generic placeholder
          placeholderContentFit="cover"
          style={styles.thumbnail}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          onLoad={() => setIsImageLoading(false)}
          onError={handleError}
        />
        {isImageLoading && !isFallback && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#666" />
          </View>
        )}
      </View>
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );
};

export default function GalleriesListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { isSignedIn } = useAuth();
  const [galleries, setGalleries] = React.useState<GalleryInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [visibleStartIndex, setVisibleStartIndex] = React.useState(0);
  const [visibleEndIndex, setVisibleEndIndex] = React.useState(10);
  const loadingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Preload images for the next set of items
  const preloadImages = React.useCallback((start: number, end: number) => {
    if (!galleries.length) return;
    
    const itemsToPreload = galleries.slice(start, end);
    itemsToPreload.forEach(item => {
      if (!item?.thumbnailUri) return;
      
      // Preload both primary and fallback images simultaneously
      Promise.all([
        Image.prefetch(item.thumbnailUri),
        item.fallbackThumbnailUri ? Image.prefetch(item.fallbackThumbnailUri) : Promise.resolve()
      ]).catch((error) => {
        console.warn(`Failed to prefetch images for ${item.name}:`, error);
      });
    });
  }, []); // Keep empty dependency array

  React.useEffect(() => {
    const fetchGalleries = async () => {
      console.log('Attempting to fetch galleries...');
      setIsLoading(true);
      setError(null);

      // Set a timeout to prevent infinite loading
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setError('Loading timeout. Please try again.');
      }, 10000); // 10 seconds timeout

      try {
        const response = await fetch(GALLERIES_API_ENDPOINT);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: { galleries: ApiGalleryItem[] } = await response.json();
        console.log('API Response:', data);

        const transformedData = data.galleries
          .map((item) => {
            if (typeof item.href !== 'string' || !item.href) {
              console.warn(`Invalid or missing link for gallery: ${item.name}`);
              return null;
            }
            const apiEndpoint = `${BASE_URL}${item.href}`;
            const thumbnailUri = `${BASE_URL}${item.href.replace(/\.json$/, '-1.jpg')}`;
            const fallbackThumbnailUri = `${BASE_URL}${item.href.replace(/\.json$/, '-1.jpeg')}`;
            
            return {
              name: item.name,
              title: item.name,
              apiEndpoint: apiEndpoint,
              urlPrefix: BASE_URL,
              thumbnailUri: thumbnailUri,
              fallbackThumbnailUri: fallbackThumbnailUri,
            };
          })
          .filter((item): item is GalleryInfo => item !== null);

        const reversedData = transformedData.reverse();
        setGalleries(reversedData);
        
        // Preload initial set of images after state update
        setTimeout(() => {
          preloadImages(0, 10);
        }, 0);
      } catch (err) {
        console.error("Failed to fetch galleries list:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      console.log('User is signed in, fetching galleries.');
      fetchGalleries();
    } else {
      console.log('User is not signed in, skipping gallery fetch.');
      setGalleries([]);
      setIsLoading(false);
      setError(null);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isSignedIn]); // Remove preloadImages dependency

  const handleViewableItemsChanged = React.useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const startIndex = viewableItems[0].index;
      const endIndex = viewableItems[viewableItems.length - 1].index;
      setVisibleStartIndex(startIndex);
      setVisibleEndIndex(endIndex);
      
      // Preload next set of images
      const nextStart = Math.min(endIndex + 1, galleries.length);
      const nextEnd = Math.min(nextStart + 10, galleries.length);
      preloadImages(nextStart, nextEnd);
    }
  }, [galleries, preloadImages]);

  const renderItem = ({ item }: { item: GalleryInfo }) => (
    <GalleryItem
      item={item}
      onPress={() => {
        router.push({
          pathname: '/gallery', 
          params: {
            apiEndpoint: item.apiEndpoint,
            urlPrefix: item.urlPrefix,
            galleryTitle: item.title,
          },
        });
      }}
    />
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '相簿', headerTitleAlign: 'center', headerStyle: { backgroundColor: APP_COLORS.BACKGROUND } }} />
      
      <SignedIn>
        {isLoading ? (
          <View style={[styles.container, styles.center]}>
            <ActivityIndicator size="large" />
            <Text>載入相簿...</Text>
          </View>
        ) : error ? (
          <View style={[styles.container, styles.center]}>
            <Text style={styles.errorText}>載入相簿時發生錯誤: {error}</Text>
          </View>
        ) : (
          <FlatList
            data={galleries}
            renderItem={renderItem}
            keyExtractor={(item) => item.apiEndpoint}
            contentContainerStyle={[styles.listContainer, { paddingBottom: 80 }]}
            windowSize={5}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            // removeClippedSubviews={true} // Temporarily remove for testing
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50,
              minimumViewTime: 300,
            }}
          />
        )}
      </SignedIn>

      <SignedOut>
        <View style={[styles.signedOutContainer, { backgroundColor: Colors[colorScheme].background }]}>
          <FontAwesome 
            name="lock" 
            size={64} 
            color={Colors[colorScheme].icon} 
            style={styles.lockIcon}
          />
          <Text style={[styles.signedOutTitle, { color: Colors[colorScheme].text }]}>
            需要登入
          </Text>
          <Text style={[styles.signedOutText, { color: Colors[colorScheme].text }]}>
            請先登入以查看相簿內容
          </Text>
          
          <Link 
            href={`/(auth)/sign-in?redirect_url=${encodeURIComponent('/galleries')}`} 
            style={[styles.signInButton, { backgroundColor: Colors[colorScheme].primary }]}
          >
            <Text style={styles.signInButtonText}>前往登入</Text>
          </Link>

        </View>
      </SignedOut>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  center: { // Added for loading/error states
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingTop: 0,
    paddingVertical: 10,
  },
  itemContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff',
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  thumbnailContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    marginRight: 15, // Increased from 15 to 20
  },
  thumbnail: {
    width: 50, 
    height: 50,
    borderRadius: 4, 
  },
  itemText: {
    fontSize: 16,
    flex: 1,
    paddingRight: 10, // Added padding on the right
  },
  errorText: { // Added for error state
    color: 'red',
    margin: 20,
    textAlign: 'center',
  },
  signedOutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  lockIcon: {
    marginBottom: 24,
    opacity: 0.6,
  },
  signedOutTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  signedOutText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    opacity: 0.8,
  },
  signInButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
}); 