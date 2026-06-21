import { SignedIn, SignedOut, useClerk, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { FloatingPopover, type PopoverAnchor } from '@/components/ui/AnimatedOverlay';
import { radius, spacing, typography } from '@/constants/theme';
import { useHomeMenu } from '@/contexts/HomeMenuContext';
import { useAppTheme } from '@/hooks/useAppTheme';

type PopoverMenuItemProps = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

function PopoverMenuItem({ label, onPress, destructive = false }: PopoverMenuItemProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.popoverItem,
        { backgroundColor: pressed ? 'rgba(0, 0, 0, 0.06)' : 'transparent' },
      ]}
    >
      <Text
        style={[
          styles.popoverItemText,
          { color: destructive ? colors.danger : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function HomeHeaderLogin() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user } = useUser();
  const { signOut } = useClerk();

  const profileAnchorRef = useRef<View>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<PopoverAnchor | null>(null);

  const displayName = user?.firstName || user?.username || '會員';
  const closeProfile = () => setProfileOpen(false);

  const openProfileMenu = () => {
    profileAnchorRef.current?.measureInWindow((x, y, width, height) => {
      setProfileAnchor({ x, y, width, height });
      setProfileOpen(true);
    });
  };

  return (
    <>
      <SignedOut>
        <Pressable
          onPress={() =>
            router.push(`/sign-in?redirect_url=${encodeURIComponent('/(tabs)/')}`)
          }
          style={({ pressed }) => [
            styles.loginButton,
            {
              backgroundColor: colors.primarySoft,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.loginButtonText, { color: colors.text }]}>登入</Text>
        </Pressable>
      </SignedOut>

      <SignedIn>
        <View style={styles.profileRow}>
          <View ref={profileAnchorRef} collapsable={false}>
            <Pressable
              onPress={openProfileMenu}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="帳戶選單"
              style={({ pressed }) => [
                styles.profileIconButton,
                { backgroundColor: colors.primarySoft, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <IconSymbol name="person.fill" size={18} color={colors.primary} />
            </Pressable>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>
            {displayName}
          </Text>
        </View>

        <FloatingPopover visible={profileOpen} anchor={profileAnchor} onClose={closeProfile}>
          <PopoverMenuItem
            label="登出"
            destructive
            onPress={() => {
              closeProfile();
              signOut().catch((error) => {
                console.error('Sign out error:', error);
              });
            }}
          />
        </FloatingPopover>
      </SignedIn>
    </>
  );
}

export function HomeHeaderMenuButton() {
  const { colors } = useAppTheme();
  const { openNav } = useHomeMenu();

  return (
    <Pressable
      onPress={openNav}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="開啟選單"
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
    >
      <IconSymbol name="line.3.horizontal" size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  loginButtonText: {
    ...typography.caption,
    fontWeight: '700',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 140,
  },
  profileIconButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    ...typography.caption,
    fontWeight: '600',
    flexShrink: 1,
  },
  popoverItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  popoverItemText: {
    ...typography.bodyMedium,
  },
});
