import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AwesomeGallery, { RenderItemInfo } from 'react-native-awesome-gallery';

// Define the expected shape of the image data for the gallery
type GalleryItem = { uri: string };

// Define constants for safe area
const SAFE_AREA_TOP = Platform.OS === 'ios' ? 44 : 24;

const renderItem = ({ item, setImageDimensions }: RenderItemInfo<GalleryItem>) => {
  // The library expects the renderItem to handle loading and setting dimensions.
  // For basic network images with Expo Image or RN Image, this might
  // sometimes work without explicitly setting dimensions, but it's safer to include.
  return (
    <Image
      source={{ uri: item.uri }}
      style={StyleSheet.absoluteFillObject}
      resizeMode="contain" // Contain ensures the whole image fits
      onLoad={(e) => {
        // Important: Provide dimensions to the gallery for layout
        const { width, height } = e.nativeEvent.source;
        setImageDimensions({ width, height });
      }}
    />
  );
};

function GalleryModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ images: string; index: string }>();
  const top = SAFE_AREA_TOP;

  // Parse the parameters
  const images = React.useMemo(() => {
    try {
      return JSON.parse(params.images ?? '[]') as string[];
    } catch (e) {
      console.error('Failed to parse images param:', e);
      return [];
    }
  }, [params.images]);

  const initialIndex = React.useMemo(() => {
    const idx = parseInt(params.index ?? '0', 10);
    return isNaN(idx) ? 0 : idx;
  }, [params.index]);

  // Map the URI strings to the structure expected by the gallery
  const galleryData = React.useMemo(() => images.map(uri => ({ uri })), [images]);

  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  // Hide header for the modal
  // Show status bar with light content
  React.useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    return () => {
      StatusBar.setBarStyle('dark-content', true); // Reset on unmount
    };
  }, []);

  // Sync local state with gallery's internal index
  const onIndexChange = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Use Stack.Screen to hide the header if using stack layout */}
      <Stack.Screen options={{ headerShown: false }} />
      <AwesomeGallery
        data={galleryData}
        keyExtractor={(item: GalleryItem) => item.uri}
        renderItem={renderItem}
        initialIndex={initialIndex}
        onIndexChange={onIndexChange}
        onSwipeToClose={() => router.back()} // Close modal on vertical swipe
        // onTap={() => setControlsVisible(!controlsVisible)} // Optional: Toggle controls on tap
        loop // Enable looping through images
      />
      {/* Simple Close Button */}
      <TouchableOpacity
        style={[styles.closeButton, { top: top + 10 }]} // Position below status bar
        onPress={() => router.back()}
      >
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>
      {/* Optional: Index Indicator */}
      <View style={[styles.indexIndicator, { top: top + 15 }]}>
        <Text style={styles.indexText}>
          {`${currentIndex + 1} / ${galleryData.length}`}
        </Text>
      </View>
    </View>
  );
}

// Make sure the export statement is clear and separate
export default GalleryModalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background for lightbox effect
  },
  closeButton: {
    position: 'absolute',
    left: 15,
    // top: 10, // Adjust based on safe area
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    zIndex: 10, // Ensure it's above the gallery
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  indexIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    // top: 15, // Adjust based on safe area
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    zIndex: 10,
  },
  indexText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 