import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppLogo } from '@/components/AppLogo';
import { DailyVerseCard } from '@/components/home/DailyVerseCard';
import { HomeQuickCard } from '@/components/home/HomeQuickCard';
import { HomeHeaderLogin, HomeHeaderMenuButton } from '@/components/HomeHeader';
import { ClubCard } from '@/components/ui/ClubCard';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { spacing, TARGET_COLORS } from '@/constants/theme';
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
import {
  formatNoticeDate,
  getNoticePreview,
  type NoticeItem,
} from '@/lib/notice-utils';
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
          setNoticePreview(getNoticePreview(notices, 1));
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

        <DailyVerseCard
          style={styles.verseCard}
          passage={dailyVerse?.passage}
          citation={dailyVerse?.citation}
          version={dailyVerse?.version}
          loading={verseLoading}
          error={verseError}
        />

        <View style={styles.quickRow}>
          {noticePreview[0] ? (
            <HomeQuickCard
              variant="notice"
              title={noticePreview[0].title}
              subtitle={formatNoticeDate(noticePreview[0].date)}
              emptyText="暫無最新通告"
              onPress={() =>
                router.push({
                  pathname: '/noticeDetailModal',
                  params: { id: noticePreview[0].id },
                })
              }
            />
          ) : null}

          <HomeQuickCard
            variant="activity"
            title={nextEvent?.name}
            subtitle={nextEvent?.date}
            emptyText="暫無即將舉行的活動"
            badges={
              nextEvent?.club
                ? getActivityClubBadges(nextEvent.club).map((badge) => ({
                    label: badge.label,
                    color: getClubColor(badge.club),
                  }))
                : []
            }
            onPress={() => router.push('/(tabs)/calendar')}
          />
        </View>

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
  verseCard: {
    marginBottom: spacing.md,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    alignItems: 'stretch',
  },
  section: {
    marginBottom: spacing.xl,
  },
  clubScroll: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  clubCardWrap: {
    width: 280,
  },
});
