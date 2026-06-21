import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { CenterFadeSheet } from '@/components/ui/AnimatedOverlay';
import { radius, shadows, spacing, TARGET_COLORS, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { apiUrl } from '@/lib/api';
import { expandNoticeTargets, hasBothNoticeTargets } from '@/lib/notice-utils';
import { getSingleTargetColor, getTargetColor } from '@/lib/target-colors';

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
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  } catch {
    return dateString;
  }
}

const NoticeDetailModal = ({ visible, notice, onClose }: NoticeDetailModalProps) => {
  const { colors } = useAppTheme();
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  const handleOpenPdf = useCallback(
    async (pdfPath: string) => {
      if (!notice) return;

      try {
        setLoadingPdf(pdfPath);

        const fullUrl = pdfPath.startsWith('http') ? pdfPath : apiUrl(pdfPath);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const noticeDate = new Date(notice.date);
        noticeDate.setHours(0, 0, 0, 0);
        const isPastActivity = noticeDate < today;

        await WebBrowser.openBrowserAsync(fullUrl, {
          toolbarColor: getTargetColor(notice.target, isPastActivity),
          controlsColor: 'white',
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          enableBarCollapsing: true,
          enableDefaultShareMenuItem: true,
        });
      } catch (error) {
        console.error('Error opening PDF:', error);
      } finally {
        setLoadingPdf(null);
      }
    },
    [notice],
  );

  if (!notice) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const noticeDate = new Date(notice.date);
  noticeDate.setHours(0, 0, 0, 0);
  const isPastActivity = noticeDate < today;
  const targetColor = getTargetColor(notice.target, isPastActivity);

  return (
    <CenterFadeSheet visible={visible} onClose={onClose}>
      <View style={[styles.modalContent, { backgroundColor: colors.surface }, shadows.md]}>
        <View style={[styles.header, { backgroundColor: `${targetColor}22`, borderBottomColor: colors.border }]}>
          <Text
            style={[
              styles.headerTitle,
              { color: isPastActivity ? colors.muted : colors.text },
            ]}
            numberOfLines={3}
          >
            {notice.title}
            {isPastActivity && ' (過去活動)'}
          </Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.6 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="關閉"
          >
            <Ionicons name="close" size={22} color={colors.muted} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoSection}>
            <Text style={[styles.label, { color: colors.muted }]}>日期</Text>
            <Text style={[styles.value, { color: colors.text }]}>{formatDate(notice.date)}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={[styles.label, { color: colors.muted }]}>活動類型</Text>
            <Text style={[styles.value, { color: colors.text }]}>{notice.activityType}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={[styles.label, { color: colors.muted }]}>參與對象</Text>
            <View style={styles.targetContainer}>
              {expandNoticeTargets(notice.target).map((target) => (
                <Badge
                  key={target}
                  label={target}
                  color={getSingleTargetColor(target, isPastActivity)}
                />
              ))}
            </View>
          </View>

          {notice.pdfUrl.length > 0 && (
            <View style={styles.pdfSection}>
              <Text style={[styles.pdfSectionTitle, { color: colors.text }]}>相關文件</Text>
              {notice.pdfUrl.map((pdf, index) => {
                let buttonColor = targetColor;
                if (
                  !isPastActivity &&
                  hasBothNoticeTargets(notice.target)
                ) {
                  if (pdf.toLowerCase().includes('pathfinder')) {
                    buttonColor = TARGET_COLORS.PATHFINDER;
                  } else if (pdf.toLowerCase().includes('adventurer')) {
                    buttonColor = TARGET_COLORS.ADVENTURER;
                  }
                }

                const isLoading = loadingPdf === pdf;
                const fileName = pdf.split('/').pop() || `文件 ${index + 1}`;

                return (
                  <Pressable
                    key={pdf}
                    onPress={() => handleOpenPdf(pdf)}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.pdfButton,
                      { backgroundColor: buttonColor, opacity: isLoading ? 0.7 : pressed ? 0.88 : 1 },
                    ]}
                  >
                    <View style={styles.pdfButtonContent}>
                      <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
                      <View style={styles.pdfTextContainer}>
                        <Text style={styles.pdfButtonText}>通告下載</Text>
                        <Text style={styles.pdfFileName} numberOfLines={1}>
                          {fileName}
                        </Text>
                      </View>
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="open-outline" size={18} color="#FFFFFF" />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </CenterFadeSheet>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    borderRadius: radius.lg,
    width: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    ...Platform.select({
      android: { elevation: 8 },
      default: {},
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...typography.heading,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  infoSection: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.body,
  },
  pdfSection: {
    marginTop: spacing.sm,
  },
  pdfSectionTitle: {
    ...typography.bodyMedium,
    marginBottom: spacing.md,
  },
  pdfButton: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  pdfButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pdfTextContainer: {
    flex: 1,
  },
  pdfButtonText: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
  },
  pdfFileName: {
    ...typography.small,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  targetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});

export default NoticeDetailModal;
