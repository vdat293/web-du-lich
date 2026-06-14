import { 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import type { TabParamList } from '../navigation/types';
import { colors, fonts } from '../theme';

type Props = BottomTabScreenProps<TabParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: Props) {
  const { user, notifications, markAllNotificationsAsRead } = useAuth();
  const hasUnread = notifications.some((n) => n.unread);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo & Ưu đãi</Text>
      </View>

      {user ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {notifications.length > 0 ? (
            <>
              {notifications.map((notif) => (
                <View key={notif.id} style={[styles.notifItem, notif.unread && styles.notifUnread]}>
                  <View style={styles.notifHeaderRow}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    {notif.unread && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifBody}>{notif.body}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
              ))}
              {hasUnread && (
                <Pressable style={styles.markReadButton} onPress={markAllNotificationsAsRead}>
                  <Ionicons name="checkmark-done" size={16} color={colors.primary} />
                  <Text style={styles.markReadText}>Đánh dấu tất cả đã đọc</Text>
                </Pressable>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.outline} />
              <Text style={styles.emptyText}>Không có thông báo nào</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.outline} />
          <Text style={styles.emptyText}>Đăng nhập để xem thông báo & ưu đãi của bạn</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 56, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.primary },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  notifItem: { padding: 14, borderRadius: 14, backgroundColor: colors.surfaceLow, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  notifUnread: { backgroundColor: '#f0f9f9', borderColor: '#d0eceb' },
  notifHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  notifBody: { fontFamily: fonts.body, fontSize: 13, color: colors.textSoft, lineHeight: 18 },
  notifTime: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 6 },
  markReadButton: { height: 48, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.outline, borderStyle: 'dashed', marginTop: 10 },
  markReadText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 13 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100, gap: 14 },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 40 },
});
