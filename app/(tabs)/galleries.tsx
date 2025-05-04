import { APP_COLORS, Colors } from '@/app/constants/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
import { FontAwesome } from '@expo/vector-icons';
import { Link, Stack, useRouter } from 'expo-router';
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
  const colorScheme = useColorScheme() ?? 'light';
  const { isSignedIn } = useAuth();
  const [galleries, setGalleries] = React.useState<GalleryInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchGalleries = async () => {
      console.log('Attempting to fetch galleries...');
      setIsLoading(true);
      setError(null);
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

        setGalleries(transformedData.reverse());
      } catch (err) {
        console.error("Failed to fetch galleries list:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
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
  }, [isSignedIn]);

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
}); 