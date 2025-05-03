import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';

// Color constants
const CAMP_COLOR = '#A6B1E1'; // Blue
const ACTIVITY_COLOR = '#B7C4CF'; // Orange
const TEXT_COLOR = 'white';

// Activity types
interface BaseActivity {
  id: number;
  title: string;
  time: string;
  location: string;
  isCamp?: true;
  campId?: number;
  marking: {
    startingDay?: boolean;
    endingDay?: boolean;
  };
}

type Activity = BaseActivity;

// Configure Chinese locale
LocaleConfig.locales['zh'] = {
  monthNames: [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月'
  ],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天'
};
LocaleConfig.defaultLocale = 'zh';

const CustomDay = ({ date, state, marking }: any) => {
  const isToday = date.dateString === new Date().toISOString().split('T')[0];
  const isDisabled = state === 'disabled';
  const isCamp = marking?.color === CAMP_COLOR;
  const isStartingDay = marking?.startingDay;
  const isEndingDay = marking?.endingDay;
  const hasActivity = marking?.color === ACTIVITY_COLOR;
  const isPeriod = isCamp && !isStartingDay && !isEndingDay;

  return (
    <View style={{ 
      width: isPeriod ? '140%' : isCamp ? '100%' : '60%', 
      marginRight: isCamp && isStartingDay ? '-20%' : 0,
      marginLeft: isCamp && isEndingDay ? '-20%' : 0,
      height: 32, 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: isCamp ? CAMP_COLOR : 
                      hasActivity ? ACTIVITY_COLOR : isDisabled ? 'transparent' : 'transparent',
      borderTopLeftRadius: isStartingDay ? 16 : 0,
      borderBottomLeftRadius: isStartingDay ? 16 : 0,
      borderTopRightRadius: isEndingDay ? 16 : 0,
      borderBottomRightRadius: isEndingDay ? 16 : 0,
      marginHorizontal: 0,
      borderLeftWidth: isStartingDay ? 1 : 0,
      borderRightWidth: isEndingDay ? 1 : 0,
      borderColor: isCamp ? CAMP_COLOR : ACTIVITY_COLOR,
      overflow: 'hidden',
    }}>
      <Text style={{ 
        marginLeft: isCamp && isStartingDay ? '-20%' : 0,
        marginRight: isCamp && isEndingDay ? '-20%' : 0,
        fontWeight: isToday ? 'bold' : 'normal',
        color: isDisabled ? '#d9d9d9' : 
               isToday ? '#991700' : 
               isStartingDay || isEndingDay || isCamp || hasActivity ? TEXT_COLOR : '#333',
        textAlign: 'center',
        opacity: isDisabled ? 0.3 : 1
      }}>
        {date.day}
      </Text>
    </View>
  );
};

export default function CalendarScreen() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
  const [activities, setActivities] = useState<{ [key: string]: Activity[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('https://tuenmunpathfinder.com/calendar-data.json');
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const markedDates = Object.entries(activities).reduce((acc, [date, activities]) => {
    const activity = activities[0];
    acc[date] = {
      ...activity.marking,
      color: activity.isCamp ? CAMP_COLOR : ACTIVITY_COLOR,
      textColor: TEXT_COLOR
    };
    return acc;
  }, {} as { [key: string]: any });

  // Get all activities for the current month
  const currentMonthActivities = Object.entries(activities)
    .filter(([date]) => date.startsWith(currentMonth.substring(0, 7)))
    .flatMap(([_, activities]) => activities);

  const handleActivityPress = (activity: Activity) => {
    if (!activity.title.includes('集會')) {
      router.push('/(tabs)/notice');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '活動日曆' }} />
      <Calendar
        onMonthChange={(month: DateData) => {
          setCurrentMonth(month.dateString);
        }}
        markedDates={markedDates}
        markingType="period"
        dayComponent={CustomDay}
        renderHeader={(date: Date) => {
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          return <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{`${year}年${month}月`}</Text>;
        }}
      />
      <View style={styles.activitiesContainer}>
        <ScrollView style={styles.activitiesList} contentContainerStyle={styles.scrollContent}>
          {currentMonthActivities.length > 0 ? (
            Object.entries(
              currentMonthActivities.reduce((acc, activity) => {
                const dateKey = Object.keys(activities).find(key => 
                  activities[key].some(a => a.id === activity.id)
                ) || '';
                const [year, month, day] = dateKey.split('-');
                
                if (activity.isCamp) {
                  // Group camp activities by campId
                  const campId = activity.campId;
                  if (campId) {
                    // Find all dates for this camp
                    const campDates = Object.keys(activities)
                      .filter(key => activities[key].some(a => 
                        a.isCamp && a.campId === campId
                      ))
                      .sort();
                    
                    const startDate = campDates[0];
                    const endDate = campDates[campDates.length - 1];
                    const [startYear, startMonth, startDay] = startDate.split('-');
                    const [endYear, endMonth, endDay] = endDate.split('-');
                    
                    // Create a unique key for the camp that includes both months if they're different
                    let campDate;
                    if (startMonth === endMonth) {
                      campDate = `${parseInt(startMonth)}月${parseInt(startDay)}-${parseInt(endDay)}日`;
                    } else {
                      campDate = `${parseInt(startMonth)}月${parseInt(startDay)}日 - ${parseInt(endMonth)}月${parseInt(endDay)}日`;
                    }
                    
                    if (!acc[campDate]) acc[campDate] = [];
                    acc[campDate].push(activity);
                  }
                } else {
                  // Regular activities show individual dates
                  const date = `${parseInt(month)}月${parseInt(day)}日`;
                  if (!acc[date]) acc[date] = [];
                  acc[date].push(activity);
                }
                return acc;
              }, {} as { [key: string]: Activity[] })
            ).map(([date, activities]) => (
              <View key={date}>
                <Text style={styles.dateHeader}>{date}</Text>
                {activities.map(activity => {
                  const isCampActivity = activity.isCamp;
                  const isMeeting = activity.title.includes('集會');
                  return isMeeting ? (
                    <View 
                      key={activity.id} 
                      style={[
                        styles.activityItem,
                        isCampActivity && styles.campActivityItem
                      ]}
                    >
                      <Text style={styles.activityTime}>{activity.time}</Text>
                      <View style={styles.activityDetails}>
                        <Text style={[
                          styles.activityTitle,
                          isCampActivity && styles.campActivityTitle
                        ]}>{activity.title}</Text>
                        <Text style={styles.activityLocation}>{activity.location}</Text>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      key={activity.id} 
                      style={[
                        styles.activityItem,
                        isCampActivity && styles.campActivityItem
                      ]}
                      onPress={() => handleActivityPress(activity)}
                    >
                      <Text style={styles.activityTime}>{activity.time}</Text>
                      <View style={styles.activityDetails}>
                        <Text style={[
                          styles.activityTitle,
                          isCampActivity && styles.campActivityTitle
                        ]}>{activity.title}</Text>
                        <Text style={styles.activityLocation}>{activity.location}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          ) : (
            <Text style={styles.noActivities}>本月沒有活動</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  activitiesContainer: {
    borderTopWidth: 1.5,
    borderColor: 'rgba(108, 122, 137, 0.5)',
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activitiesList: {
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  activityTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#009688',
    marginRight: 12,
    minWidth: 60,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  activityLocation: {
    fontSize: 14,
    color: '#666',
  },
  noActivities: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  campActivityItem: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  campActivityTitle: {
    color: '#1976d2',
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
}); 