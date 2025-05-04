import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Import Expo Image and FontAwesome
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { APP_COLORS } from './constants/colors';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width / 3; // Adjust number of columns (3 here)

// Define the structure of the fetched data item
interface FetchedImage {
  url: string;
  width: number;
  height: number;
}

// Define the structure for our gallery data
interface GalleryItem {
  id: string;
  uri: string;
  originalWidth: number;
  originalHeight: number;
}

// Create a memoized component for each grid item
const GridImageItem = React.memo(({ item, index, onPress }: { item: GalleryItem; index: number; onPress: (index: number) => void }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasLoadFailed, setHasLoadFailed] = React.useState(false);

  const handlePress = React.useCallback(() => {
    if (!hasLoadFailed) {
      onPress(index);
    }
  }, [index, onPress, hasLoadFailed]);

  const handleLoad = React.useCallback(() => {
    setIsLoading(false);
    setHasLoadFailed(false);
  }, []);

  const handleError = React.useCallback(() => {
    // No fallback logic here based on API structure
    setIsLoading(false);
    setHasLoadFailed(true);
  }, []);

  return (
    <TouchableOpacity onPress={handlePress} style={styles.imageContainer} disabled={hasLoadFailed}>
      {hasLoadFailed ? (
        <View style={styles.errorPlaceholder}>
          <FontAwesome name="exclamation-triangle" size={IMAGE_SIZE * 0.5} color="#888" />
        </View>
      ) : (
        <Image
          source={{ uri: item.uri }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk" // Ensure caching
          transition={100} // Shorter transition for grid
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {isLoading && !hasLoadFailed && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      )}
    </TouchableOpacity>
  );
});
GridImageItem.displayName = 'GridImageItem';

export default function GalleryGridScreen() {
  const router = useRouter();
  // Get parameters passed from the galleries list screen
  const params = useLocalSearchParams<{ apiEndpoint: string; urlPrefix: string; galleryTitle: string }>();
  const { apiEndpoint, urlPrefix, galleryTitle } = params;

  const [galleryData, setGalleryData] = React.useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Check if required parameters are present
    if (!apiEndpoint || !urlPrefix) {
      setError('Missing gallery information.');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use passed parameters
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: FetchedImage[] = await response.json();

        const transformedData = data.map((item, index) => ({
          id: `${index}-${item.url}`,
          // Use passed urlPrefix
          uri: `${urlPrefix}${item.url}`,
          originalWidth: item.width,
          originalHeight: item.height,
        }));

        setGalleryData(transformedData);
      } catch (err) {
        console.error("Failed to fetch gallery data:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Add dependencies to re-run effect if parameters change
  }, [apiEndpoint, urlPrefix]);

  // Function to handle press, passed to GridImageItem
  const handleImagePress = React.useCallback((index: number) => {
    router.push({
      pathname: 'galleryModal' as any,
      params: {
        images: JSON.stringify(galleryData.map(img => img.uri)),
        index: index.toString(), // Ensure index is passed as string
      },
    });
  }, [router, galleryData]);

  const renderItem = ({ item, index }: { item: GalleryItem, index: number }) => (
    <GridImageItem 
      item={item} 
      index={index} 
      onPress={handleImagePress} 
    />
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
        <Text>Loading images...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error loading images: {error}</Text>
        {/* Optional: Add a retry button */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Set header title dynamically and use empty back title string */}
      <Stack.Screen 
        options={{ 
          title: galleryTitle ?? 'Gallery', 
          //headerBackTitle: '', // Use empty string
          headerBackButtonDisplayMode: "minimal",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: APP_COLORS.BACKGROUND,
          },
          headerTitleStyle: {
            fontSize: 17, // Default iOS size, adjust as needed
            fontWeight: '600', // Default iOS weight, adjust as needed
          },
        }} 
      />
      <FlatList
        data={galleryData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        style={{ width: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    // Optional: Add padding if needed
  },
  imageContainer: { // Added container for positioning overlay/error
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    position: 'relative',
    backgroundColor: '#eee', // Background for loading/error states
    borderWidth: 1,
    borderColor: '#eee',
  },
  image: {
    width: '100%', // Fill container
    height: '100%', // Fill container
    // Removed border styles, handled by container
  },
  errorPlaceholder: { // Style for the error state
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  loadingOverlay: { // Style for loading indicator
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  errorText: {
    color: 'red',
    margin: 20,
    textAlign: 'center',
  },
}); 