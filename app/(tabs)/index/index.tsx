import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { NoticeListItem } from '@/components/notice/NoticeListItem';
import { AppLogo } from '@/components/AppLogo';
import { HomeHeaderLogin, HomeHeaderMenuButton } from '@/components/HomeHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ClubCard } from '@/components/ui/ClubCard';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { ScalePressable } from '@/components/ui/ScalePressable';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { spacing, TARGET_COLORS, typography } from '@/constants/theme';
import { useNativeTabScrollProps } from '@/hooks/useNativeTabScrollProps';
import { useAppTheme } from '@/hooks/useAppTheme';
import { API } from '@/lib/api';
import {
  getActivityClubBadges,
  getActivityDisplayName,
  getNextUpcomingActivity,
  parseActivityClub,
  type ActivitiesByDate,
  type ActivityClub,
} from '@/lib/calendar-utils';
import { getNoticePreview, type NoticeItem } from '@/lib/notice-utils';
import { HERO_BANNER_PHOTO } from '@/lib/photo-url';

type DailyVerse = {
  citation: string;
  passage: string;
  version: string;
};

type NextEventPreview = {
  name: string;
  date: string;
  club: ActivityClub | null;
};

function getClubColor(club: 'PATHFINDER' | 'ADVENTURER'): string {
  switch (club) {
    case 'PATHFINDER':
      return TARGET_COLORS.PATHFINDER;
    case 'ADVENTURER':
      return TARGET_COLORS.ADVENTURER;
    default: {
      const unreachable: never = club;
      return unreachable;
    }
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const tabScrollProps = useNativeTabScrollProps();

  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);
  const [verseError, setVerseError] = useState<string | null>(null);
  const [nextEvent, setNextEvent] = useState<NextEventPreview | null>(null);
  const [noticePreview, setNoticePreview] = useState<NoticeItem[]>([]);

  useEffect(() => {
    async function loadHomeData() {
      setVerseLoading(true);
      try {
        const [verseRes, calendarRes, noticesRes] = await Promise.all([
          fetch(API.bibleCached()),
          fetch(API.calendar()),
          fetch(API.notices()),
        ]);

        if (verseRes.ok) {
          const verseData = await verseRes.json();
          setDailyVerse(verseData);
          setVerseError(null);
        } else {
          throw new Error('verse fetch failed');
        }

        if (calendarRes.ok) {
          const calendarData = (await calendarRes.json()) as ActivitiesByDate;
          const next = getNextUpcomingActivity(calendarData);
          if (next) {
            setNextEvent({
              name: getActivityDisplayName(next.activity.title),
              date: next.dateLabel,
              club: parseActivityClub(next.activity.title),
            });
          }
        }

        if (noticesRes.ok) {
          const notices = (await noticesRes.json()) as NoticeItem[];
          setNoticePreview(getNoticePreview(notices, 2));
        }
      } catch (err) {
        console.error('Home data error:', err);
        setVerseError('無法載入今日經文');
        setDailyVerse({
          citation: '腓立比書 4:13',
          passage: '我靠著那加給我力量的，凡事都能做。',
          version: '和合本',
        });
      } finally {
        setVerseLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <Screen scroll={false} padded={false} edges={['top']}>
      <View collapsable={false} style={styles.screenRoot}>
        <ScrollView
          {...tabScrollProps}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        <View style={styles.heroWrap}>
          <HeroBanner
            fullBleed
            imageUri={HERO_BANNER_PHOTO}
            title="屯門前鋒會 幼鋒會"
            subtitle="Tuen Mun Pathfinder and Adventurer Club"
          />
        </View>

        <View style={styles.quickRow}>
          <Card muted style={styles.quickCard}>
            <Text style={[styles.quickLabel, { color: colors.primary }]}>今日經文</Text>
            {verseLoading ? (
              <ActivityIndicator color={colors.primary} style={styles.quickLoader} />
            ) : (
              <>
                {verseError ? (
                  <Text style={[styles.quickError, { color: colors.danger }]}>{verseError}</Text>
                ) : null}
                <Text style={[styles.quickText, { color: colors.text }]} numberOfLines={4}>
                  {dailyVerse?.passage}
                </Text>
                <Text style={[styles.quickMeta, { color: colors.muted }]}>
                  {dailyVerse?.citation}
                </Text>
              </>
            )}
          </Card>

          <ScalePressable
            style={styles.quickCard}
            onPress={() => router.push('/(tabs)/calendar')}
          >
            <Card muted style={styles.quickCardInner}>
              <Text style={[styles.quickLabel, { color: colors.primary }]}>下一活動</Text>
              {nextEvent ? (
                <>
                  <Text style={[styles.quickText, { color: colors.text }]} numberOfLines={2}>
                    {nextEvent.name}
                  </Text>
                  <Text style={[styles.quickMeta, { color: colors.muted }]}>
                    {nextEvent.date}
                  </Text>
                  {nextEvent.club ? (
                    <View style={styles.clubBadges}>
                      {getActivityClubBadges(nextEvent.club).map((badge) => (
                        <Badge
                          key={badge.club}
                          label={badge.label}
                          color={getClubColor(badge.club)}
                        />
                      ))}
                    </View>
                  ) : null}
                </>
              ) : (
                <Text style={[styles.quickMeta, { color: colors.muted }]}>暫無即將舉行的活動</Text>
              )}
            </Card>
          </ScalePressable>
        </View>

        {noticePreview.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="最新通告"
              action={
                <ScalePressable onPress={() => router.push('/(tabs)/notice')}>
                  <Text style={[styles.linkAction, { color: colors.primary }]}>查看全部</Text>
                </ScalePressable>
              }
            />
            {noticePreview.map((notice) => (
              <View key={notice.id} style={styles.noticePreviewWrap}>
                <NoticeListItem
                  notice={notice}
                  variant="preview"
                  onPress={() => router.push('/(tabs)/notice')}
                />
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="認識我們" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.clubScroll}
          >
            <View style={styles.clubCardWrap}>
              <ClubCard
                accent="PATHFINDER"
                title="前鋒會"
                description="為 10 至 15 歲青少年而設，透過探索、露營與自然研究，開闊視野並建立與上帝的關係。"
              />
            </View>
            <View style={styles.clubCardWrap}>
              <ClubCard
                accent="ADVENTURER"
                title="幼鋒會"
                description="為 6 至 9 歲兒童而設，幫助孩子在群體中學習相處、獨立與照顧自己。"
              />
            </View>
          </ScrollView>
        </View>
      </ScrollView>

        <View
          pointerEvents="box-none"
          style={[styles.headerOverlay, styles.headerBar, { backgroundColor: colors.background }]}
        >
          <AppLogo />
          <View style={styles.headerActions}>
            <HomeHeaderLogin />
            <HomeHeaderMenuButton />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scrollContent: {
    paddingTop: 44 + spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  heroWrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickCard: {
    flex: 1,
  },
  quickCardInner: {
    flex: 1,
    height: '100%',
  },
  quickLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  quickText: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  quickMeta: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  clubBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  quickLoader: {
    marginVertical: spacing.lg,
  },
  quickError: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  linkAction: {
    ...typography.caption,
    fontWeight: '600',
  },
  noticePreviewWrap: {
    marginBottom: spacing.xs,
  },
  clubScroll: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  clubCardWrap: {
    width: 280,
  },
});
