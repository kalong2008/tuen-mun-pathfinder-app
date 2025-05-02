import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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

  const renderItem = ({ item, index }: { item: GalleryItem, index: number }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: 'galleryModal' as any,
          params: {
            images: JSON.stringify(galleryData.map(img => img.uri)),
            index: index.toString(), // Ensure index is passed as string
          },
        })
      }
    >
      <Image source={{ uri: item.uri }} style={styles.image} />
    </TouchableOpacity>
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
          headerBackButtonDisplayMode: "minimal"
        }} 
      />
      <FlatList
        data={galleryData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
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
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderWidth: 1,
    borderColor: '#eee',
  },
  errorText: {
    color: 'red',
    margin: 20,
    textAlign: 'center',
  },
}); 