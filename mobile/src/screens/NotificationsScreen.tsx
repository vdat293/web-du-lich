import { useCallback } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { useAuth, type NotificationItem } from '../context/AuthContext';
import { propertyService } from '../api/services';
import { AuthPlaceholder } from '../components/AuthPlaceholder';
import { LoadingState } from '../components/ScreenState';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { colors, fonts } from '../theme';
import { formatRelativeTime } from '../utils/date';
import { resolveNotificationTarget } from '../utils/notificationRouting';

type Props = BottomTabScreenProps<TabParamList, 'Notifications'>;

function visualForNotification(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes('booking')) {
    return {
      icon: 'calendar' as const,
      iconColor: colors.primary,
      iconBackground: '#e4f2f1',
      borderColor: '#d5e9e7',
    };
  }
  if (normalized.includes('broadcast') || normalized.includes('promotion')) {
    return {
      icon: 'megaphone' as const,
      iconColor: colors.secondary,
      iconBackground: '#fff3d6',
      borderColor: '#f1e3ba',
    };
  }
  return {
    icon: 'notifications' as const,
    iconColor: colors.primary,
    iconBackground: '#edf0ef',
    borderColor: colors.border,
  };
}

export function NotificationsScreen({ navigation }: Props) {
  const {
    user,
    notifications,
    notificationsLoading,
    notificationsError,
    refreshNotifications,
    markAllNotificationsAsRead,
    markNotificationOpened,
  } = useAuth();
  const { t } = useTranslation();
  const hasUnread = notifications.some((n) => n.unread);
  const unreadCount = notifications.filter((n) => n.unread).length;

  useFocusEffect(
    useCallback(() => {
      if (user) void refreshNotifications();
    }, [refreshNotifications, user]),
  );

  const openNotification = async (notification: NotificationItem) => {
    await markNotificationOpened(notification.id);
    const target = resolveNotificationTarget(notification);

    if (target.kind === 'tab') {
      navigation.navigate(target.screen);
      return;
    }

    try {
      const properties = await propertyService.list({ ids: [target.propertyId], limit: 1 });
      const property = properties[0];
      const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
      if (property && rootNavigation) {
        rootNavigation.navigate('Details', { property });
        return;
      }
    } catch {
      // A stale/deleted property must not break the inbox interaction.
    }

    navigation.navigate('Explore');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        {hasUnread ? (
          <Pressable style={styles.headerAction} onPress={() => void markAllNotificationsAsRead()}>
            <Ionicons name="checkmark-done" size={18} color={colors.primary} />
          </Pressable>
        ) : <View style={styles.headerActionPlaceholder} />}
      </View>

      {user ? (
        <FlatList
          data={notifications}
          keyExtractor={(notif) => String(notif.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={notificationsLoading}
              onRefresh={() => void refreshNotifications()}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={(
            <>
              <View style={styles.overviewCard}>
                <View style={styles.overviewIcon}>
                  <Ionicons name="sparkles-outline" size={22} color={colors.secondary} />
                </View>
                <View style={styles.overviewCopy}>
                  <Text style={styles.overviewLabel}>{t('notifications.inboxLabel')}</Text>
                  <Text style={styles.overviewSubtitle}>{t('notifications.subtitle')}</Text>
                </View>
                <View style={styles.unreadSummary}>
                  <Text style={styles.unreadSummaryCount}>{unreadCount}</Text>
                  <Text style={styles.unreadSummaryLabel}>{t('notifications.unreadShort')}</Text>
                </View>
              </View>
              {notificationsError ? (
                <Pressable accessibilityRole="button" style={styles.errorBox} onPress={() => void refreshNotifications()}>
                  <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
                  <Text style={styles.errorText}>{notificationsError} · {t('common.retry')}</Text>
                </Pressable>
              ) : null}
              {notificationsLoading && notifications.length === 0 ? <LoadingState label={t('notifications.loading')} /> : null}
            </>
          )}
          renderItem={({ item: notif }) => (
            (() => {
              const visual = visualForNotification(notif.type);
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.notifItem,
                    { borderColor: notif.unread ? visual.borderColor : colors.border },
                    notif.unread && styles.notifUnread,
                    pressed && styles.notifPressed,
                  ]}
                  onPress={() => void openNotification(notif)}
                  accessibilityRole="button"
                  accessibilityLabel={`${notif.title}. ${notif.body}`}
                >
                  <View style={[styles.iconBubble, { backgroundColor: visual.iconBackground }]}>
                    <Ionicons name={visual.icon} size={18} color={visual.iconColor} />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifHeaderRow}>
                      <Text style={styles.notifTitle} numberOfLines={2}>{notif.title}</Text>
                      {notif.unread ? <View style={styles.unreadDot} /> : null}
                    </View>
                    <Text style={styles.notifBody} numberOfLines={3}>{notif.body}</Text>
                    <View style={styles.notifMetaRow}>
                      <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                        <Text style={styles.notifTime}>{formatRelativeTime(notif.created_at)}</Text>
                      </View>
                      {notif.unread ? (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>{t('notifications.newLabel')}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })()
          )}
          ListFooterComponent={hasUnread ? (
            <Pressable accessibilityRole="button" style={styles.markReadButton} onPress={() => void markAllNotificationsAsRead()}>
              <Ionicons name="checkmark-done" size={16} color={colors.primary} />
              <Text style={styles.markReadText}>{t('notifications.markAllRead')}</Text>
            </Pressable>
          ) : null}
          ListEmptyComponent={!notificationsLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.outline} />
              <Text style={styles.emptyText}>{t('notifications.none')}</Text>
            </View>
          ) : null}
        />
      ) : (
        <AuthPlaceholder
          icon="notifications-outline"
          title={t('notifications.title')}
          message={t('notifications.login')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.primary },
  headerAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surfaceLow,
  },
  headerActionPlaceholder: { width: 36, height: 36 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 105 },
  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 86,
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.primary,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  overviewIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.secondaryFixed,
  },
  overviewCopy: { flex: 1, paddingHorizontal: 12 },
  overviewLabel: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
  overviewSubtitle: { color: 'rgba(255,255,255,0.68)', fontFamily: fonts.body, fontSize: 11, lineHeight: 16, marginTop: 3 },
  unreadSummary: { alignItems: 'center', minWidth: 48, paddingVertical: 4 },
  unreadSummaryCount: { color: colors.secondaryFixed, fontFamily: fonts.display, fontSize: 22, lineHeight: 24 },
  unreadSummaryLabel: { color: 'rgba(255,255,255,0.7)', fontFamily: fonts.medium, fontSize: 9, marginTop: 2 },
  errorBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff1f1',
    borderWidth: 1,
    borderColor: '#ffd1d1',
    marginBottom: 12,
    shadowColor: colors.error,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  errorText: { flex: 1, fontFamily: fonts.medium, fontSize: 12, color: colors.error, lineHeight: 17 },
  notifItem: {
    minHeight: 98,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.white,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notifUnread: { backgroundColor: '#f3fbfa' },
  notifPressed: { opacity: 0.82 },
  iconBubble: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notifContent: { flex: 1 },
  notifHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', marginBottom: 4 },
  notifTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 14, color: colors.primary, lineHeight: 19 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 5 },
  notifBody: { fontFamily: fonts.body, fontSize: 13, color: colors.textSoft, lineHeight: 18, marginTop: 1 },
  notifMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  notifTime: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  newBadge: { borderRadius: 999, backgroundColor: colors.secondaryFixed, paddingHorizontal: 8, paddingVertical: 3 },
  newBadgeText: { color: colors.secondary, fontFamily: fonts.bold, fontSize: 9 },
  markReadButton: {
    height: 48,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outline,
    borderStyle: 'dashed',
    marginTop: 10,
  },
  markReadText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 13 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100, gap: 14 },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 40 },
});
