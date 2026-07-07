import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../context/AuthContext';
import { AuthPlaceholder } from '../components/AuthPlaceholder';
import { LoadingState } from '../components/ScreenState';
import type { TabParamList } from '../navigation/types';
import { colors, fonts } from '../theme';

type Props = BottomTabScreenProps<TabParamList, 'Notifications'>;

function iconForType(type: string): keyof typeof Ionicons.glyphMap {
  if (type.includes('booking')) return 'calendar';
  if (type.includes('broadcast') || type.includes('promotion')) return 'megaphone';
  return 'notifications';
}

export function NotificationsScreen({ navigation }: Props) {
  const {
    user,
    notifications,
    notificationsLoading,
    notificationsError,
    pushPermissionStatus,
    pushRegistrationError,
    refreshNotifications,
    markAllNotificationsAsRead,
    markNotificationOpened,
  } = useAuth();
  const { t } = useTranslation();
  const hasUnread = notifications.some((n) => n.unread);
  const permissionWarning = user
    && pushPermissionStatus !== 'unknown'
    && pushPermissionStatus !== 'unsupported'
    && pushPermissionStatus !== 'granted';

  const openNotification = async (id: number, type: string, bookingId?: unknown) => {
    await markNotificationOpened(id);
    if (type.includes('booking') || bookingId) {
      navigation.navigate('Trips');
    }
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={notificationsLoading}
              onRefresh={() => void refreshNotifications()}
              tintColor={colors.primary}
            />
          }
        >
          {permissionWarning ? (
            <View style={styles.warningBox}>
              <Ionicons name="notifications-off-outline" size={18} color={colors.secondary} />
              <Text style={styles.warningText}>
                Quyền thông báo chưa được bật. Inbox vẫn hoạt động, nhưng thiết bị này có thể không nhận push.
              </Text>
            </View>
          ) : null}

          {pushRegistrationError ? (
            <View style={styles.warningBox}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
              <Text style={styles.warningText}>{pushRegistrationError}</Text>
            </View>
          ) : null}

          {notificationsError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
              <Text style={styles.errorText}>{notificationsError}</Text>
            </View>
          ) : null}

          {notificationsLoading && notifications.length === 0 ? (
            <LoadingState label="Đang tải thông báo..." />
          ) : notifications.length > 0 ? (
            <>
              {notifications.map((notif) => (
                <Pressable
                  key={notif.id}
                  style={({ pressed }) => [
                    styles.notifItem,
                    notif.unread && styles.notifUnread,
                    pressed && styles.notifPressed,
                  ]}
                  onPress={() => void openNotification(notif.id, notif.type, notif.data?.bookingId)}
                >
                  <View style={styles.iconBubble}>
                    <Ionicons name={iconForType(notif.type)} size={18} color={colors.primary} />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifHeaderRow}>
                      <Text style={styles.notifTitle} numberOfLines={2}>{notif.title}</Text>
                      {notif.unread && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifBody}>{notif.body}</Text>
                    <Text style={styles.notifTime}>{notif.time}</Text>
                  </View>
                </Pressable>
              ))}
              {hasUnread && (
                <Pressable style={styles.markReadButton} onPress={() => void markAllNotificationsAsRead()}>
                  <Ionicons name="checkmark-done" size={16} color={colors.primary} />
                  <Text style={styles.markReadText}>{t('notifications.markAllRead')}</Text>
                </Pressable>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.outline} />
              <Text style={styles.emptyText}>{t('notifications.none')}</Text>
            </View>
          )}
        </ScrollView>
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
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 105 },
  warningBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.secondaryFixed,
    marginBottom: 12,
  },
  warningText: { flex: 1, fontFamily: fonts.medium, fontSize: 12, color: colors.primary, lineHeight: 17 },
  errorBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff1f1',
    borderWidth: 1,
    borderColor: '#ffd1d1',
    marginBottom: 12,
  },
  errorText: { flex: 1, fontFamily: fonts.medium, fontSize: 12, color: colors.error, lineHeight: 17 },
  notifItem: {
    minHeight: 92,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceLow,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notifUnread: { backgroundColor: '#f0f9f9', borderColor: '#d0eceb' },
  notifPressed: { opacity: 0.82 },
  iconBubble: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notifContent: { flex: 1 },
  notifHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', marginBottom: 4 },
  notifTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 14, color: colors.primary, lineHeight: 19 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 5 },
  notifBody: { fontFamily: fonts.body, fontSize: 13, color: colors.textSoft, lineHeight: 18 },
  notifTime: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 6 },
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
