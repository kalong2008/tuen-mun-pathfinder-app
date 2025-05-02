import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { APP_COLORS, TARGET_COLORS } from './constants/colors';

type NoticeItem = {
  id: string;
  title: string;
  date: string;
  activityType: string;
  pdfUrl: string[];
  target: string[];
};

type NoticeDetailModalProps = {
  visible: boolean;
  notice: NoticeItem | null;
  onClose: () => void;
  getTargetColor: (targets: string[]) => string;
};

const NoticeDetailModal = ({ visible, notice, onClose, getTargetColor }: NoticeDetailModalProps) => {
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  // Open PDF in web browser
  const handleOpenPdf = useCallback(async (pdfPath: string) => {
    try {
      // Set loading state
      setLoadingPdf(pdfPath);
      
      // Construct the full URL
      const fullUrl = `https://tuenmunpathfinder.com${pdfPath}`;
      
      // Open PDF in browser with controls and options
      const result = await WebBrowser.openBrowserAsync(fullUrl, {
        toolbarColor: notice && new Date(notice.date) < new Date() ? '#9e9e9e' : notice ? getTargetColor(notice.target) : '#000000',
        controlsColor: 'white',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        enableBarCollapsing: true,
        enableDefaultShareMenuItem: true,
      });
      
      // Log result for debugging
      console.log('WebBrowser result:', result);
    } catch (error) {
      console.error('Error opening PDF:', error);
    } finally {
      // Clear loading state
      setLoadingPdf(null);
    }
  }, [notice, getTargetColor]);

  if (!notice) return null;

  // Check if this is a past activity
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const noticeDate = new Date(notice.date);
  noticeDate.setHours(0, 0, 0, 0);
  const isPastActivity = noticeDate < today;

  const targetColor = isPastActivity ? '#9e9e9e' : getTargetColor(notice.target);

  // Get color for a specific target
  const getSingleTargetColor = (target: string) => {
    if (isPastActivity) {
      return '#9e9e9e'; // Gray for past activities
    }
    
    if (target === '前鋒會') {
      return TARGET_COLORS.PATHFINDER;
    }
    if (target === '幼鋒會') {
      return TARGET_COLORS.ADVENTURER;
    }
    return TARGET_COLORS.BOTH; // Default for "所有成員" or other cases
  };

  // Format date from YYYY-MM-DD to YYYY年MM月DD日
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}年${month}月${day}日`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalContainer}>
          <View style={[
            styles.modalContent,
            isPastActivity ? { opacity: 0.8 } : {}
          ]}>
            <View style={[styles.header, {backgroundColor: targetColor + '20'}]}>
              <Text style={[
                styles.headerTitle,
                isPastActivity ? { color: APP_COLORS.TEXT.SECONDARY } : {}
              ]}>
                {notice.title}
                {isPastActivity && ' (過去活動)'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.infoSection}>
                <Text style={styles.label}>日期：</Text>
                <Text style={styles.value}>{formatDate(notice.date)}</Text>
              </View>
              
              <View style={styles.infoSection}>
                <Text style={styles.label}>活動類型：</Text>
                <Text style={styles.value}>{notice.activityType}</Text>
              </View>
              
              <View style={styles.infoSection}>
                <Text style={styles.label}>參與對象：</Text>
                <View style={styles.targetContainer}>
                  {notice.target.map((target, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.targetBadge, 
                        {
                          backgroundColor: getSingleTargetColor(target) + '20', 
                          borderColor: getSingleTargetColor(target)
                        }
                      ]}
                    >
                      <Text style={{color: getSingleTargetColor(target), fontWeight: '500'}}>{target}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              {notice.pdfUrl.length > 0 && (
                <View style={styles.pdfSection}>
                  <Text style={styles.pdfSectionTitle}>相關文件：</Text>
                  {notice.pdfUrl.map((pdf, index) => {
                    // If the notice has both groups, choose colors based on filename
                    let buttonColor = targetColor;
                    if (!isPastActivity && notice.target.includes('前鋒會') && notice.target.includes('幼鋒會')) {
                      // If PDF filename contains 'pathfinder', use Pathfinder color
                      if (pdf.toLowerCase().includes('pathfinder')) {
                        buttonColor = TARGET_COLORS.PATHFINDER;
                      } 
                      // If PDF filename contains 'adventurer', use Adventurer color
                      else if (pdf.toLowerCase().includes('adventurer')) {
                        buttonColor = TARGET_COLORS.ADVENTURER;
                      }
                      // Otherwise use the default color for both
                    }
                    
                    const isLoading = loadingPdf === pdf;
                    const fileName = pdf.split('/').pop() || `文件 ${index + 1}`;
                    
                    return (
                      <TouchableOpacity 
                        key={index} 
                        style={[styles.pdfButton, {backgroundColor: buttonColor}]}
                        onPress={() => handleOpenPdf(pdf)}
                        disabled={isLoading}
                      >
                        <View style={styles.pdfButtonContent}>
                          <Ionicons name="document-text-outline" size={18} color="white" style={styles.pdfIcon} />
                          <View style={styles.pdfTextContainer}>
                            <Text style={styles.pdfButtonText}>通告下載</Text>
                            <Text style={styles.pdfFileName}>{fileName}</Text>
                          </View>
                          {isLoading ? (
                            <ActivityIndicator size="small" color="white" style={styles.pdfLoading} />
                          ) : (
                            <Ionicons name="open-outline" size={18} color="white" style={styles.pdfOpenIcon} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: APP_COLORS.BACKGROUND,
    borderRadius: 10,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: APP_COLORS.TEXT.PRIMARY,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: APP_COLORS.TEXT.SECONDARY,
  },
  scrollContent: {
    padding: 15,
  },
  infoSection: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: APP_COLORS.TEXT.SECONDARY,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: APP_COLORS.TEXT.PRIMARY,
  },
  pdfSection: {
    marginTop: 10,
  },
  pdfSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: APP_COLORS.TEXT.PRIMARY,
  },
  pdfButton: {
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  pdfButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfIcon: {
    marginRight: 8,
  },
  pdfTextContainer: {
    flex: 1,
  },
  pdfButtonText: {
    color: 'white',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pdfFileName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'left',
  },
  pdfOpenIcon: {
    marginLeft: 8,
  },
  pdfLoading: {
    marginLeft: 8,
  },
  targetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  targetBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
});

export default NoticeDetailModal; 