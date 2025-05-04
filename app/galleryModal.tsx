import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
  Alert,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AwesomeGallery, { RenderItemInfo } from 'react-native-awesome-gallery';

// Define the expected shape of the image data for the gallery
type GalleryItem = { uri: string };

// Define constants for safe area
const SAFE_AREA_TOP = Platform.OS === 'ios' ? 44 : 24;

// Create a separate component for the gallery item
const GalleryImage = ({ item, setImageDimensions }: RenderItemInfo<GalleryItem>) => {
  // Remove all state and download logic from here
  
  return (
    // Return only the Image component
    <Image
      source={{ uri: item.uri }}
      style={StyleSheet.absoluteFillObject}
      resizeMode="contain"
      onLoad={(e) => {
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

  // Download handler for the current image
  const handleDownload = async () => {
    const currentImageUri = galleryData[currentIndex]?.uri;
    if (!currentImageUri) {
      Alert.alert('Error', 'Could not find the image URL.');
      return;
    }

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save images.');
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}${Date.now()}.jpg`;
      Alert.alert('Downloading', 'Saving image to your device...'); // Optional: provide feedback
      const { uri } = await FileSystem.downloadAsync(currentImageUri, fileUri);
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Success', 'Image saved successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      Alert.alert('Error', 'Failed to save image.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SignedIn>
        <AwesomeGallery
          data={galleryData}
          keyExtractor={(item: GalleryItem) => item.uri}
          renderItem={GalleryImage}
          initialIndex={initialIndex}
          onIndexChange={onIndexChange}
          onSwipeToClose={() => router.back()}
          loop
        />
        <TouchableOpacity
          style={[styles.fixedButton, styles.closeButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fixedButton, styles.downloadButton]}
          onPress={handleDownload}
        >
          <FontAwesome name="download" size={20} color="white" />
        </TouchableOpacity>
        <View style={[styles.indexIndicator, { top: top + 15 }]}>
          <Text style={styles.indexText}>
            {`${currentIndex + 1} / ${galleryData.length}`}
          </Text>
        </View>
      </SignedIn>

      <SignedOut>
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Please sign in to view gallery</Text>
          <Link href={`/(auth)/sign-in?redirect_url=${encodeURIComponent('/gallery')}`} asChild>
            <TouchableOpacity style={styles.signInButton}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SignedOut>
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
  fixedButton: {
    position: 'absolute',
    top: SAFE_AREA_TOP + 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    zIndex: 10,
  },
  closeButton: {
    left: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 24, // Adjust line height for better centering
  },
  downloadButton: {
    right: 15,
    padding: 12, // Adjust padding for icon size
  },
  indexIndicator: {
    position: 'absolute',
    alignSelf: 'center',
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
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signInText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: '#3c73e9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 