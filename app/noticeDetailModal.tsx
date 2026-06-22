import * as WebBrowser from 'expo-web-browser';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LoadingView } from '@/components/ui/LoadingView';
import { radius, spacing, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { API, apiUrl } from '@/lib/api';
import { type ActivitiesByDate } from '@/lib/calendar-utils';
import {
  expandNoticeTargets,
  getNoticeDisplayDate,
  getNoticePdfDocuments,
  type NoticeItem,
} from '@/lib/notice-utils';
import { getSingleTargetColor, getTargetColor } from '@/lib/target-colors';

type DetailRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

function DetailRow({ label, value, isLast = false }: DetailRowProps) {
  const { colors } = useAppTheme();

  return (
    <>
      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: colors.muted }]} numberOfLines={3}>
          {value}
        </Text>
      </View>
      {isLast ? null : <View style={[styles.divider, { backgroundColor: colors.border }]} />}
    </>
  );
}

type DocumentRowProps = {
  fileName: string;
  clubLabel?: string | null;
  accentColor: string;
  loading: boolean;
  isLast?: boolean;
  onPress: () => void;
};

function DocumentRow({
  fileName,
  clubLabel,
  accentColor,
  loading,
  isLast = false,
  onPress,
}: DocumentRowProps) {
  const { colors } = useAppTheme();
  const subtitle = clubLabel ? `${clubLabel} · 通告下載` : '通告下載';

  return (
    <>
      <Pressable
        onPress={onPress}
        disabled={loading}
        style={({ pressed }) => [
          styles.documentRow,
          pressed && !loading ? { backgroundColor: colors.surfaceMuted } : null,
        ]}
      >
        <IconSymbol name="doc.text" size={20} color={accentColor} />
        <View style={styles.documentCopy}>
          <Text style={[styles.documentTitle, { color: colors.text }]} numberOfLines={1}>
            {fileName}
          </Text>
          <Text style={[styles.documentSubtitle, { color: clubLabel ? accentColor : colors.muted }]}>
            {subtitle}
          </Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={accentColor} />
        ) : (
          <IconSymbol name="chevron.right" size={16} color={colors.muted} />
        )}
      </Pressable>
      {isLast ? null : <View style={[styles.divider, { backgroundColor: colors.border }]} />}
    </>
  );
}

export default function NoticeDetailModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const [notice, setNotice] = useState<NoticeItem | null>(null);
  const [calendarActivities, setCalendarActivities] = useState<ActivitiesByDate>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoadError('找不到通告');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadNotice() {
      setLoading(true);
      setLoadError(null);

      try {
        const [noticesRes, calendarRes] = await Promise.all([
          fetch(API.notices()),
          fetch(API.calendar()),
        ]);

        if (!noticesRes.ok) {
          throw new Error(`Network response was not ok: ${noticesRes.status}`);
        }

        const notices = (await noticesRes.json()) as NoticeItem[];
        const matchedNotice = notices.find((item) => item.id === id) ?? null;

        if (cancelled) return;

        if (calendarRes.ok) {
          setCalendarActivities((await calendarRes.json()) as ActivitiesByDate);
        }

        if (!matchedNotice) {
          setLoadError('找不到通告');
          setNotice(null);
        } else {
          setNotice(matchedNotice);
        }
      } catch (error) {
        console.error('Failed to load notice detail:', error);
        if (!cancelled) {
          setLoadError('無法載入通告，請稍後再試');
          setNotice(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadNotice();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleOpenPdf = useCallback(
    async (pdfPath: string, club?: string | null) => {
      if (!notice) return;

      try {
        setLoadingPdf(pdfPath);

        const fullUrl = pdfPath.startsWith('http') ? pdfPath : apiUrl(pdfPath);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const noticeDate = new Date(notice.date);
        noticeDate.setHours(0, 0, 0, 0);
        const isPastActivity = noticeDate < today;
        const toolbarColor = club
          ? getSingleTargetColor(club, isPastActivity)
          : getTargetColor(notice.target, isPastActivity);

        await WebBrowser.openBrowserAsync(fullUrl, {
          toolbarColor,
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const noticeDate = notice ? new Date(notice.date) : null;
  if (noticeDate) {
    noticeDate.setHours(0, 0, 0, 0);
  }
  const isPastActivity = noticeDate ? noticeDate < today : false;
  const screenTitle = notice
    ? `${notice.title}${isPastActivity ? ' (過去活動)' : ''}`
    : '通告';
  const displayDate = notice
    ? getNoticeDisplayDate(notice, calendarActivities)
    : '';
  const pdfDocuments = notice ? getNoticePdfDocuments(notice) : [];

  return (
    <>
      <Stack.Screen
        options={{
          title: screenTitle,
          headerShown: true,
          headerTitleAlign: 'center',
          headerBackButtonDisplayMode: 'minimal',
          headerBackVisible: false,
          headerRight: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="關閉"
              style={({ pressed }) => [styles.headerCloseButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <IconSymbol name="xmark" size={22} color={colors.text} />
            </Pressable>
          ),
        }}
      />

      {loading ? (
        <LoadingView message="載入通告…" />
      ) : loadError || !notice ? (
        <View style={[styles.container, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.errorText, { color: colors.muted }]}>{loadError ?? '找不到通告'}</Text>
        </View>
      ) : (
        <ScrollView
          style={[styles.container, { backgroundColor: colors.surfaceMuted }]}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>詳情</Text>
          <Card style={styles.groupCard}>
            <DetailRow label="日期" value={displayDate} />
            <DetailRow label="活動類型" value={notice.activityType} />
            <DetailRow
              label="參與對象"
              value={expandNoticeTargets(notice.target).join(' · ')}
              isLast
            />
          </Card>

          {pdfDocuments.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.muted }]}>相關文件</Text>
              <Card style={styles.groupCard}>
                {pdfDocuments.map((document, index) => {
                  const fileName =
                    document.pdfUrl.split('/').pop() || `文件 ${index + 1}`;
                  const accentColor = document.club
                    ? getSingleTargetColor(document.club, isPastActivity)
                    : getTargetColor(notice.target, isPastActivity);

                  return (
                    <DocumentRow
                      key={`${document.pdfUrl}-${index}`}
                      fileName={fileName}
                      clubLabel={document.club}
                      accentColor={accentColor}
                      loading={loadingPdf === document.pdfUrl}
                      isLast={index === pdfDocuments.length - 1}
                      onPress={() => handleOpenPdf(document.pdfUrl, document.club)}
                    />
                  );
                })}
              </Card>
            </>
          ) : null}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCloseButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.small,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  groupCard: {
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
    borderRadius: radius.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  detailLabel: {
    ...typography.body,
    flexShrink: 0,
  },
  detailValue: {
    ...typography.body,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.lg,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  documentCopy: {
    flex: 1,
    gap: 2,
  },
  documentTitle: {
    ...typography.bodyMedium,
  },
  documentSubtitle: {
    ...typography.caption,
  },
  errorText: {
    ...typography.body,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
