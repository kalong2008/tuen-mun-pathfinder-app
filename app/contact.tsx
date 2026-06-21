import { MenuPageLayout } from '@/components/MenuPageLayout';
import { Button } from '@/components/ui/Button';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TextField } from '@/components/ui/TextField';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { radius, spacing, TARGET_COLORS, typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { API } from '@/lib/api';

function ContactRow({
  icon,
  iconColor,
  label,
  children,
}: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  iconColor: string;
  label: string;
  children: React.ReactNode;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.contactRow}>
      <IconSymbol name={icon} size={20} color={iconColor} />
      <View style={styles.contactRowContent}>
        <Text style={[styles.contactLabel, { color: colors.text }]}>{label}</Text>
        {children}
      </View>
    </View>
  );
}

function LinkChip({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.linkChip,
        { borderColor: color, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[styles.linkChipText, { color }]}>{label}</Text>
    </Pressable>
  );
}

export default function ContactScreen() {
  const { colors } = useAppTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const messageInputRef = useRef<TextInput>(null);

  const handleOpenMap = () => {
    const location = '屯門山景邨景榮樓21-30號地下';
    const mapUrl = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(location)}`,
      android: `geo:0,0?q=${encodeURIComponent(location)}`,
      default: `https://maps.google.com/?q=${encodeURIComponent(location)}`,
    });
    if (mapUrl) Linking.openURL(mapUrl);
  };

  const handleCall = (phoneNumber: string) => Linking.openURL(`tel:${phoneNumber}`);
  const handleEmail = () => Linking.openURL('mailto:info@tuenmunpathfinder.com');
  const handleWhatsApp = () =>
    Linking.openURL('https://wa.me/85265721493?text=我想查詢有關幼鋒會及前鋒會的資料。');

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('錯誤', '請輸入姓名');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('錯誤', '請輸入電子郵件');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('錯誤', '請輸入電話號碼');
      return false;
    }
    if (!message.trim()) {
      Alert.alert('錯誤', '請輸入訊息內容');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await fetch(API.send(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      });

      if (response.ok) {
        Alert.alert('成功', '感謝您的訊息！我們會盡快回覆您。', [
          {
            text: '確定',
            onPress: () => {
              setName('');
              setEmail('');
              setPhone('');
              setMessage('');
            },
          },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert('錯誤', errorData.message || '發送訊息時出現問題，請稍後再試。');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('錯誤', '發送訊息時出現問題，請稍後再試。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MenuPageLayout route="/contact" title="聯絡我們">
      <Screen scroll={false} padded={false} edges={[]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
          <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <SectionHeader title="關於我們" icon="info.circle.fill" />
            <Card>
              <ContactRow icon="location.fill" iconColor={TARGET_COLORS.PATHFINDER} label="地址">
                <Text style={[styles.bodyText, { color: colors.text }]}>
                  屯門山景邨景榮樓21-30號地下{'\n'}山景綜合青少年服務中心
                </Text>
                <LinkChip
                  label="在 Google 地圖中查看"
                  color={TARGET_COLORS.PATHFINDER}
                  onPress={handleOpenMap}
                />
              </ContactRow>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <ContactRow icon="phone.fill" iconColor={TARGET_COLORS.ADVENTURER} label="電話">
                <Pressable onPress={() => handleCall('85224626122')}>
                  <Text style={[styles.bodyText, { color: colors.text }]}>+852 2462-6122</Text>
                </Pressable>
                <Pressable onPress={() => handleCall('85265721493')}>
                  <Text style={[styles.bodyText, { color: colors.text }]}>+852 6572-1493</Text>
                </Pressable>
                <LinkChip
                  label="透過 WhatsApp 聯絡我們"
                  color={TARGET_COLORS.ADVENTURER}
                  onPress={handleWhatsApp}
                />
              </ContactRow>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <ContactRow icon="envelope.fill" iconColor={TARGET_COLORS.BOTH} label="電子郵件">
                <Pressable onPress={handleEmail}>
                  <Text style={[styles.bodyText, { color: colors.text }]}>
                    info@tuenmunpathfinder.com
                  </Text>
                </Pressable>
              </ContactRow>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <ContactRow icon="clock.fill" iconColor={colors.primary} label="聚會時間">
                <View style={[styles.meetingPill, { backgroundColor: `${TARGET_COLORS.PATHFINDER}22` }]}>
                  <View style={[styles.meetingDot, { backgroundColor: TARGET_COLORS.PATHFINDER }]} />
                  <Text style={[styles.meetingText, { color: colors.text }]}>
                    前鋒會：逢星期六 下午2:30 - 4:30
                  </Text>
                </View>
                <View style={[styles.meetingPill, { backgroundColor: `${TARGET_COLORS.ADVENTURER}22` }]}>
                  <View style={[styles.meetingDot, { backgroundColor: TARGET_COLORS.ADVENTURER }]} />
                  <Text style={[styles.meetingText, { color: colors.text }]}>
                    幼鋒會：逢星期六 下午2:30 - 4:30
                  </Text>
                </View>
              </ContactRow>
            </Card>
          </View>

          <View style={styles.section}>
            <SectionHeader title="聯絡表單" icon="envelope.badge.fill" />
            <Text style={[styles.formIntro, { color: colors.muted }]}>
              請填寫以下表格，我們會盡快回覆您。
            </Text>
            <Card>
              <TextField
                label="姓名 *"
                placeholder="請輸入您的姓名"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TextField
                ref={emailInputRef}
                label="電子郵件 *"
                placeholder="請輸入您的電子郵件"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => phoneInputRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TextField
                ref={phoneInputRef}
                label="電話號碼 *"
                placeholder="請輸入您的電話號碼"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => messageInputRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TextField
                ref={messageInputRef}
                label="訊息內容 *"
                placeholder="請輸入您的訊息內容"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
              />
              <Button
                label={submitting ? '發送中…' : '發送訊息'}
                onPress={() => {
                  Keyboard.dismiss();
                  handleSubmit();
                }}
                loading={submitting}
              />
            </Card>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Screen>
    </MenuPageLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  contactRowContent: {
    flex: 1,
    gap: spacing.xs,
  },
  contactLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  bodyText: {
    ...typography.body,
  },
  linkChip: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.full,
  },
  linkChipText: {
    ...typography.caption,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.lg,
  },
  meetingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  meetingDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  meetingText: {
    ...typography.caption,
    flex: 1,
  },
  formIntro: {
    ...typography.body,
    marginBottom: spacing.md,
  },
});
