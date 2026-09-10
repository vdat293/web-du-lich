import { useCallback, useState } from 'react';
import { Alert, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { bookingService } from '../api/services';
import { EmptyState, LoadingState } from '../components/ScreenState';
import { AuthPlaceholder } from '../components/AuthPlaceholder';
import { useAuth } from '../context/AuthContext';
import { colors, fonts } from '../theme';
import type { Booking } from '../types';
import { formatCurrency, formatDate } from '../utils/date';

const statusLabels: Record<string, string> = {
  pending: 'bookingStatus.pending',
  confirmed: 'bookingStatus.confirmed',
  checked_in: 'bookingStatus.checked_in',
  completed: 'bookingStatus.completed',
  cancelled: 'bookingStatus.cancelled',
  no_show: 'bookingStatus.no_show',
  not_checked_in: 'bookingStatus.not_checked_in',
};

export function TripsScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (!user) return;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      setBookings(await bookingService.list());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('trips.notAvailable'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t, user]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  const cancelBooking = (booking: Booking) => {
    Alert.alert(t('trips.cancelTitle'), t('trips.cancelMessage', { id: booking.id }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('trips.cancelAction'),
        style: 'destructive',
        onPress: () => {
          setCancellingId(booking.id);
          void bookingService.cancel(booking.id, 'Hủy bởi khách hàng trên ứng dụng')
            .then(() => load(true))
            .catch((reason) => Alert.alert(t('trips.cancelFailed'), reason instanceof Error ? reason.message : t('trips.cancelFailed')))
            .finally(() => setCancellingId(null));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t('trips.eyebrow')}</Text>
        <Text style={styles.title}>{t('trips.title')}</Text>
      </View>
      {!user ? (
        <AuthPlaceholder
          icon="briefcase-outline"
          title={t('nav.trips')}
          message={t('trips.loginMessage')}
        />
      ) : loading ? <LoadingState label={t('trips.loading')} /> : (
        <FlatList
          data={bookings}
          keyExtractor={(booking) => String(booking.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}
          ListHeaderComponent={error ? (
            <Pressable accessibilityRole="button" onPress={() => void load()}><Text style={styles.error}>{error} · {t('common.retry')}</Text></Pressable>
          ) : null}
          ListEmptyComponent={<EmptyState icon={error ? 'cloud-offline-outline' : 'calendar-outline'} title={error ? t('trips.notAvailable') : t('trips.emptyTitle')} message={error ? t('common.retry') : t('trips.emptyMessage')} />}
          renderItem={({ item: booking }) => (
            <View key={booking.id} style={styles.card}>
              {booking.property_image ? <Image source={{ uri: booking.property_image }} style={styles.image} /> : <View style={[styles.image, styles.imagePlaceholder]}><Ionicons name="bed-outline" size={30} color={colors.primary} /></View>}
              <View style={styles.cardContent}>
                <View style={styles.cardTop}><Text style={styles.bookingCode}>#{booking.id}</Text><View style={styles.status}><Text style={styles.statusText}>{t(statusLabels[booking.displayStatus || booking.status] || booking.status)}</Text></View></View>
                <Text style={styles.propertyName}>{booking.property_name}</Text>
                <Text style={styles.location}>{booking.property_location}</Text>
                <View style={styles.metaRow}><Ionicons name="calendar-outline" size={15} color={colors.textMuted} /><Text style={styles.meta}>{formatDate(booking.check_in)} – {formatDate(booking.check_out)}</Text></View>
                <View style={styles.cardBottom}><Text style={styles.room}>{booking.room_type_name}</Text><Text style={styles.price}>{formatCurrency(Number(booking.total_price))}</Text></View>
                {booking.status === 'pending' ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={cancellingId === booking.id}
                    style={[styles.cancelButton, cancellingId === booking.id && styles.cancelButtonDisabled]}
                    onPress={() => cancelBooking(booking)}
                  >
                    <Text style={styles.cancelButtonText}>{cancellingId === booking.id ? t('trips.cancelling') : t('trips.cancelAction')}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18 },
  eyebrow: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.4 },
  title: { color: colors.primary, fontFamily: fonts.display, fontSize: 32, marginTop: 5 },
  list: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 105 },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginBottom: 12 },
  card: { overflow: 'hidden', borderRadius: 19, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginBottom: 18 },
  image: { width: '100%', height: 170 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer },
  cardContent: { padding: 17 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingCode: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 11 },
  status: { borderRadius: 999, backgroundColor: colors.secondaryFixed, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { color: '#5a4303', fontFamily: fonts.bold, fontSize: 9 },
  propertyName: { color: colors.primary, fontFamily: fonts.heading, fontSize: 22, marginTop: 10 },
  location: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  meta: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 12 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 13, marginTop: 13 },
  room: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 12 },
  price: { color: colors.primary, fontFamily: fonts.heading, fontSize: 16 },
  cancelButton: { alignItems: 'center', justifyContent: 'center', minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: '#e8b0ad', backgroundColor: '#fff5f4', marginTop: 13 },
  cancelButtonDisabled: { opacity: 0.55 },
  cancelButtonText: { color: colors.error, fontFamily: fonts.bold, fontSize: 11 },
});
