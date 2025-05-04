import { Colors, TARGET_COLORS } from '@/app/constants/colors';
import { useColorScheme } from '@/app/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SignedIn, useClerk, useUser } from '@clerk/clerk-expo';
import { FontAwesome } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DailyVerse = {
  citation: string;
  passage: string;
  image?: string;
  version: string;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDailyVerse() {
      try {
        setLoading(true);
        const response = await fetch('http://tuenmunpathfinder.com/api/bible/cached');
        if (!response.ok) {
          throw new Error('Failed to fetch daily verse');
        }
        const data = await response.json();
        setDailyVerse(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching daily verse:', err);
        setError('無法載入今日經文');
        // Fallback verse if API fails
        setDailyVerse({
          citation: "腓立比書 4:13",
          passage: "我靠著那加給我力量的，凡事都能做。",
          version: "和合本"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDailyVerse();
  }, []);

  const handleContactPress = () => {
    // Navigate to the contact tab
    router.navigate('contact');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Stack.Screen options={{ title: '主頁', headerTitleAlign: 'center' }} />
      
      <ScrollView 
        style={[
          styles.container,
          Platform.OS === 'android' && { paddingTop: Constants.statusBarHeight }
        ]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* User Info */}
        <SignedIn>
          <View style={[
            styles.userContainer,
            { backgroundColor: 'rgba(200, 220, 255, 0.2)' }
          ]}>
            <View style={styles.userHeader}>
              <FontAwesome 
                name="user" 
                size={20} 
                color={Colors[colorScheme].primary} 
              />
              <Text style={[styles.userHeaderText, { color: Colors[colorScheme].text }]}>
                歡迎：{user?.firstName || user?.username || 'User'}
              </Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity 
                onPress={handleSignOut} 
                style={[styles.signOutButton, { backgroundColor: Colors[colorScheme].primary }]}
              >
                <Text style={styles.signOutText}>登出</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SignedIn>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image 
            source={{ uri: 'https://tuenmunpathfinder.com/photo/2024/2024-09-promotion/2024-09-promotion-87.jpeg' }} 
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>屯門前鋒會 幼鋒會</Text>
            <Text style={styles.bannerSubtitle}>Tuen Mun Pathfinder and Adventurer Club</Text>
          </View>
        </View>

        {/* Daily Verse */}
        <View style={styles.verseContainer}>
          <View style={styles.verseHeader}>
            <IconSymbol 
              name="bookmark.fill" 
              size={20} 
              color={Colors[colorScheme].primary} 
            />
            <Text style={[styles.verseHeaderText, { color: Colors[colorScheme].text }]}>今日經文</Text>
          </View>
          
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={Colors[colorScheme].primary} />
            </View>
          ) : error ? (
            <Text style={[styles.errorText, { color: Colors[colorScheme].danger }]}>{error}</Text>
          ) : dailyVerse && (
            <>
              <Text style={[styles.verseText, { color: Colors[colorScheme].text }]}>{dailyVerse.passage}</Text>
              <Text style={[styles.verseReference, { color: Colors[colorScheme].icon }]}>
                {dailyVerse.citation} ({dailyVerse.version})
              </Text>
            </>
          )}
        </View>

        {/* Main Sections */}
        <View style={styles.mainSections}>
          {/* Pathfinder Section */}
          <View style={[styles.section, { borderColor: TARGET_COLORS.PATHFINDER }]}>
            <View style={[styles.sectionHeader, { backgroundColor: TARGET_COLORS.PATHFINDER }]}>
              <Text style={styles.sectionTitle}>前鋒會</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionText, { color: Colors[colorScheme].text }]}>
                「前鋒會」不僅意味著行軍、露營和自然研究等探索，這個為10至15歲青少年成立的團體，更致力於達成雙重目標：開闊他們的世界視野，並幫助他們建立與上帝的關係。
              </Text>
            </View>
          </View>

          {/* Adventurer Section */}
          <View style={[styles.section, { borderColor: TARGET_COLORS.ADVENTURER }]}>
            <View style={[styles.sectionHeader, { backgroundColor: TARGET_COLORS.ADVENTURER }]}>
              <Text style={styles.sectionTitle}>幼鋒會</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionText, { color: Colors[colorScheme].text }]}>
                幼鋒會旨在幫助 6-9 歲的兒童成長，讓他們能在沒有父母在場的情況下，學習如何與其他小朋友相處，並能夠學到如何照顧自己。
              </Text>
            </View>
          </View>
        </View>

        {/* Join Us Section */}
        <View style={styles.joinSection}>
          <Text style={[styles.joinTitle, { color: Colors[colorScheme].text }]}>今天就加入我們！</Text>
          <Text style={[styles.joinText, { color: Colors[colorScheme].text }]}>
            我們歡迎所有兒童及青少年加入我們的幼鋒會及前鋒會，一起學習、成長，並在與上帝建立關係的同時享受樂趣。
          </Text>
          <TouchableOpacity 
            style={[styles.joinButton, { backgroundColor: Colors[colorScheme].primary }]}
            onPress={handleContactPress}
          >
            <Text style={styles.joinButtonText}>聯絡我們</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  bannerContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  verseContainer: {
    padding: 16,
    backgroundColor: 'rgba(200, 220, 255, 0.2)',
    borderRadius: 12,
    marginBottom: 24,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verseHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  verseReference: {
    fontSize: 14,
    textAlign: 'right',
  },
  mainSections: {
    gap: 20,
    marginBottom: 24,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  sectionContent: {
    padding: 16,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  learnMoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    color: 'white',
    fontWeight: '500',
  },
  joinSection: {
    padding: 16,
    backgroundColor: 'rgba(200, 220, 255, 0.2)',
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  joinTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  joinText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  joinButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  meetingSection: {
    marginBottom: 24,
  },
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  meetingHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  meetingList: {
    gap: 12,
  },
  meetingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  meetingText: {
    fontSize: 14,
    flex: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: 14,
    marginRight: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  userContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    //marginBottom: 12,
  },
  userHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  userDetailsContainer: {
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  signOutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
