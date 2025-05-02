import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Constants
const BASE_URL = 'https://tuenmunpathfinder.com';
const GALLERIES_API_ENDPOINT = `${BASE_URL}/api/photo-links`;


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
}

// Removed the hardcoded availableGalleries array

// Create a separate component for the gallery item
const GalleryItem = ({ item, onPress }: { item: GalleryInfo; onPress: () => void }) => {
  const [currentUri, setCurrentUri] = React.useState(item.thumbnailUri);

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={onPress}
    >
      <Image 
        source={{ uri: currentUri }} 
        style={styles.thumbnail}
        onError={() => {
          console.log(`Failed to load thumbnail ${currentUri}`);
          if (currentUri === item.thumbnailUri && item.fallbackThumbnailUri) {
            console.log(`Trying fallback thumbnail ${item.fallbackThumbnailUri}`);
            setCurrentUri(item.fallbackThumbnailUri);
          }
        }}
      />
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );
};

export default function GalleriesListScreen() {
  const router = useRouter();
  const [galleries, setGalleries] = React.useState<GalleryInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchGalleries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(GALLERIES_API_ENDPOINT);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: { galleries: ApiGalleryItem[] } = await response.json();
        console.log('API Response:', data);

        // Transform API data into GalleryInfo structure
        const transformedData = data.galleries
          .map((item) => {
            // Check if item.link is valid before processing
            if (typeof item.href !== 'string' || !item.href) {
              console.warn(`Invalid or missing link for gallery: ${item.name}`);
              return null; // Skip this item if link is invalid
            }

            const apiEndpoint = `${BASE_URL}${item.href}`;
            // Construct thumbnail URI safely, handling both .jpg and .jpeg extensions
            const thumbnailUri = `${BASE_URL}${item.href.replace(/\.json$/, '-1.jpg')}`;
            // Try .jpg first, if that fails, try .jpeg
            const fallbackThumbnailUri = `${BASE_URL}${item.href.replace(/\.json$/, '-1.jpeg')}`;
            
            console.log(`Gallery: ${item.name}`);
            console.log(`Thumbnail URI: ${thumbnailUri}`);
            console.log(`Fallback URI: ${fallbackThumbnailUri}`);
            
            return {
              name: item.name,
              title: item.name,
              apiEndpoint: apiEndpoint,
              urlPrefix: BASE_URL,
              thumbnailUri: thumbnailUri,
              fallbackThumbnailUri: fallbackThumbnailUri,
            };
          })
          .filter((item): item is GalleryInfo => item !== null); // Remove null items

        setGalleries(transformedData.reverse());
      } catch (err) {
        console.error("Failed to fetch galleries list:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleries();
  }, []); // Runs once on mount


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

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
        <Text>Loading galleries...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error loading galleries: {error}</Text>
        {/* Optional: Add a retry button */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Available Galleries' }} />
      <FlatList
        data={galleries}
        renderItem={renderItem}
        keyExtractor={(item) => item.apiEndpoint} 
        contentContainerStyle={[styles.listContainer, { paddingBottom: 80 }]}
      />
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
    paddingVertical: 10,
  },
  itemContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff',
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  thumbnail: {
    width: 50, 
    height: 50,
    borderRadius: 4, 
    marginRight: 15, 
  },
  itemText: {
    fontSize: 16,
    flex: 1, 
  },
  errorText: { // Added for error state
    color: 'red',
    margin: 20,
    textAlign: 'center',
  },
}); 