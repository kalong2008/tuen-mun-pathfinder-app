import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, SafeAreaView, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { APP_COLORS, TARGET_COLORS } from '../constants/colors';
import NoticeDetailModal from '../noticeDetailModal';

type NoticeItem = {
  id: string;
  title: string;
  date: string;
  activityType: string;
  pdfUrl: string[];
  target: string[];
};

export default function NoticeScreen() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [useLocalData, setUseLocalData] = useState(false);

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://tuenmunpathfinder.com/notice-data.json');
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const data = await response.json();
      setNotices(data);
      setUseLocalData(false);
    } catch (err) {
      console.error('Failed to fetch notices:', err);
      // Create default fallback data if no notices are available
      if (notices.length === 0) {
        // Get today's date and future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
      }
      setUseLocalData(true);
    } finally {
      setLoading(false);
    }
  }, [notices.length]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleRefresh = useCallback(async () => {
    if (useLocalData) {
      // If using local data, don't try to refresh from network
      return;
    }
    
    setRefreshing(true);
    try {
      const response = await fetch('https://tuenmunpathfinder.com/notice-data.json');
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const data = await response.json();
      setNotices(data);
    } catch (err) {
      console.error('Failed to refresh notices:', err);
      // We don't change to sample data here if we already have data
    } finally {
      setRefreshing(false);
    }
  }, [useLocalData]);

  const handleViewDetails = (item: NoticeItem) => {
    setSelectedNotice(item);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // Check if a notice is new (less than 7 days old)
  const isNewNotice = (dateString: string) => {
    const noticeDate = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - noticeDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Get color based on target audience
  const getTargetColor = (targets: string[]) => {
    if (targets.includes('前鋒會') && targets.includes('幼鋒會')) {
      return TARGET_COLORS.BOTH;
    }
    if (targets.includes('前鋒會')) {
      return TARGET_COLORS.PATHFINDER;
    }
    if (targets.includes('幼鋒會')) {
      return TARGET_COLORS.ADVENTURER;
    }
    return TARGET_COLORS.BOTH; // Default for "所有成員" or other cases
  };

  // Get color for a specific target
  const getSingleTargetColor = (target: string) => {
    if (target === '前鋒會') {
      return TARGET_COLORS.PATHFINDER;
    }
    if (target === '幼鋒會') {
      return TARGET_COLORS.ADVENTURER;
    }
    return TARGET_COLORS.BOTH; // Default for "所有成員" or other cases
  };

  // Render targets with their individual colors
  const renderColoredTargets = (targets: string[], isPastActivity: boolean) => {
    return (
      <Text style={styles.noticeTarget}>
        參與對象: {targets.map((target, index) => (
          <React.Fragment key={index}>
            <Text 
              style={{
                color: isPastActivity ? '#9e9e9e' : getSingleTargetColor(target), 
                fontWeight: '500'
              }}
            >
              {target}
            </Text>
            {index < targets.length - 1 && <Text style={{color: '#666'}}>, </Text>}
          </React.Fragment>
        ))}
      </Text>
    );
  };

  const ColorLegend = () => (
    <View style={styles.legendContainer}>
      <View style={styles.legendRow}>
        <View style={[styles.legendColorBox, { backgroundColor: TARGET_COLORS.PATHFINDER }]} />
        <Text style={styles.legendText}>前鋒會</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.legendColorBox, { backgroundColor: TARGET_COLORS.ADVENTURER }]} />
        <Text style={styles.legendText}>幼鋒會</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.legendColorBox, { backgroundColor: TARGET_COLORS.BOTH }]} />
        <Text style={styles.legendText}>前鋒會及幼鋒會</Text>
      </View>
    </View>
  );

  // Group notices into sections: upcoming and past
  const groupedNotices = useMemo(() => {
    const today = new Date();
    // Reset time to start of day to properly include today's events
    today.setHours(0, 0, 0, 0);
    
    const futureNotices: NoticeItem[] = [];
    const pastNotices: NoticeItem[] = [];

    // Sort by date
    notices.forEach(notice => {
      const noticeDate = new Date(notice.date);
      // Reset time to start of day for proper comparison
      noticeDate.setHours(0, 0, 0, 0);
      
      // Include today's events in upcoming section (>= instead of >)
      if (noticeDate >= today) {
        futureNotices.push(notice);
      } else {
        pastNotices.push(notice);
      }
    });

    // Sort future events by date ascending (closest events first)
    futureNotices.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    // Sort past events by date descending (most recent first)
    pastNotices.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    const sections = [];
    if (futureNotices.length > 0) {
      sections.push({ title: '即將舉行', data: futureNotices });
    }
    if (pastNotices.length > 0) {
      sections.push({ title: '較早通知', data: pastNotices });
    }

    return sections;
  }, [notices]);

  const renderNoticeItem = ({ item }: { item: NoticeItem }) => {
    const targetColor = getTargetColor(item.target);
    
    // Check if this is a past activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const noticeDate = new Date(item.date);
    noticeDate.setHours(0, 0, 0, 0);
    const isPastActivity = noticeDate < today;
    
    // Apply dimming effect to past activities
    const opacity = isPastActivity ? 0.5 : 1;
    const textColor = isPastActivity ? APP_COLORS.TEXT.SECONDARY : APP_COLORS.TEXT.PRIMARY;
    
    return (
      <View 
        style={[
          styles.noticeItem, 
          {
            borderLeftWidth: 5, 
            borderLeftColor: isPastActivity ? '#9e9e9e' : targetColor,
            opacity: opacity
          }
        ]}
      >
        <View style={styles.noticeHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.noticeTitle, { color: textColor }]}>{item.title}</Text>
            {isNewNotice(item.date) && !isPastActivity && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>新</Text>
              </View>
            )}
          </View>
          <Text style={styles.noticeDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.noticeDetails}>
          <Text style={styles.noticeType}>活動類型: {item.activityType}</Text>
          {renderColoredTargets(item.target, isPastActivity)}
        </View>
        <TouchableOpacity 
          style={[styles.detailsButton, {
            backgroundColor: isPastActivity ? '#9e9e9e' : targetColor
          }]}
          onPress={() => handleViewDetails(item)}
        >
          <Text style={styles.detailsButtonText}>查看通告</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Format date from YYYY-MM-DD to YYYY年MM月DD日
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}年${month}月${day}日`;
    } catch {
      return dateString;
    }
  };

  // Render section headers
  const renderSectionHeader = ({ section }: { section: { title: string, data: NoticeItem[] } }) => {
    const isFutureSection = section.title.includes('即將舉行');
    const borderColor = isFutureSection ? '#ff9800' : '#9e9e9e'; // Orange for upcoming, Gray for past
    
    return (
      <View style={[styles.sectionHeader, { borderLeftColor: borderColor }]}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: '通知',
          headerStyle: {
            backgroundColor: APP_COLORS.BACKGROUND,
          },
          headerShadowVisible: false,
        }} 
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={APP_COLORS.PRIMARY} />
        </View>
      ) : (
        <SafeAreaView style={styles.safeArea}>
          {useLocalData && (
            <View style={styles.localDataBanner}>
              <Text style={styles.localDataText}>使用示例數據 - 無法連接到服務器</Text>
            </View>
          )}
          <ColorLegend />
          <SectionList
            sections={groupedNotices}
            renderItem={({ item }) => renderNoticeItem({ item })}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                colors={[APP_COLORS.PRIMARY]}
                tintColor={APP_COLORS.PRIMARY}
              />
            }
            stickySectionHeadersEnabled={false}
          />
        </SafeAreaView>
      )}

      <NoticeDetailModal 
        visible={modalVisible}
        notice={selectedNotice}
        onClose={handleCloseModal}
        getTargetColor={getTargetColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  noticeItem: {
    backgroundColor: APP_COLORS.BACKGROUND,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_COLORS.TEXT.PRIMARY,
    flex: 1,
  },
  noticeDate: {
    fontSize: 12,
    color: APP_COLORS.TEXT.SECONDARY,
    marginLeft: 8,
  },
  noticeDetails: {
    marginTop: 8,
  },
  noticeType: {
    fontSize: 14,
    color: APP_COLORS.TEXT.SECONDARY,
    marginBottom: 4,
  },
  noticeTarget: {
    fontSize: 14,
    color: APP_COLORS.TEXT.SECONDARY,
  },
  detailsButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-end',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  detailsButtonText: {
    color: APP_COLORS.BACKGROUND,
    fontWeight: '600',
    fontSize: 14,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  newBadge: {
    backgroundColor: APP_COLORS.STATUS.NEW,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  legendContainer: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: APP_COLORS.TEXT.SECONDARY,
  },
  localDataBanner: {
    backgroundColor: APP_COLORS.STATUS.INFO,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localDataText: {
    color: APP_COLORS.TEXT.PRIMARY,
    fontWeight: '500',
    fontSize: 12,
  },
  safeArea: {
    flex: 1,
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 4,
    borderLeftColor: APP_COLORS.PRIMARY,
    marginVertical: 10,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: APP_COLORS.TEXT.PRIMARY,
  },
}); 