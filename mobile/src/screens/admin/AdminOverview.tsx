import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  adminService,
  type AdminStats,
  type AdminTimeRange,
} from '../../api/services';
import { colors, fonts } from '../../theme';

const EMPTY_STATS: AdminStats = {
  totalUsers: 0,
  totalBookings: 0,
  totalProperties: 0,
  totalRevenue: 0,
  totalVolume: 0,
  monthlyVisits: 0,
  topUsers: [],
  recentLogs: [],
  usersByRole: {},
  bookingsByStatus: {},
  recentBookings: [],
  revenueByMonth: [],
  dailyVisits: [],
  bookingsByDay: [],
  propertiesByType: [],
};

const TIME_RANGES: Array<{ key: AdminTimeRange; label: string }> = [
  { key: 'today', label: 'Hôm nay' },
  { key: '7days', label: '7 ngày' },
  { key: 'month', label: 'Tháng này' },
  { key: 'quarter', label: 'Quý này' },
  { key: 'year', label: 'Năm nay' },
  { key: 'all', label: 'Tất cả' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  paid: 'Đã thanh toán',
  checked_in: 'Đã nhận phòng',
  checked_out: 'Đã trả phòng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
}

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
  const [timeRange, setTimeRange] = useState<AdminTimeRange>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadStats = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      setStats(await adminService.getStats(timeRange));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const cancelled = Number(stats.bookingsByStatus.cancelled || 0);
  const cancellationRate = stats.totalBookings > 0
    ? Math.round((cancelled / stats.totalBookings) * 100)
    : 0;
  const chartData = stats.revenueByMonth.slice(-6);
  const maxRevenue = Math.max(1, ...chartData.map((item) => Number(item.revenue) || 0));

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadStats(true)}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.heading}>Dashboard</Text>
          <Text style={styles.subheading}>Tổng quan hoạt động hệ thống</Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={() => void loadStats(true)}>
          <Ionicons name="refresh" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {TIME_RANGES.map((range) => (
          <Pressable
            key={range.key}
            style={[styles.filterChip, timeRange === range.key && styles.activeFilterChip]}
            onPress={() => setTimeRange(range.key)}
          >
            <Text style={[styles.filterText, timeRange === range.key && styles.activeFilterText]}>
              {range.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.statsGrid}>
        <StatCard icon="people" label="Người dùng" value={stats.totalUsers.toLocaleString('vi-VN')} color="#3276d3" loading={loading} />
        <StatCard icon="calendar" label="Booking" value={stats.totalBookings.toLocaleString('vi-VN')} color="#26875b" loading={loading} />
        <StatCard icon="business" label="Chỗ ở" value={stats.totalProperties.toLocaleString('vi-VN')} color="#7056b8" loading={loading} />
        <StatCard icon="eye" label="Lượt truy cập" value={stats.monthlyVisits.toLocaleString('vi-VN')} color="#b56b20" loading={loading} />
        <StatCard icon="wallet" label="Doanh thu (10%)" value={formatCurrency(stats.totalRevenue)} color="#8d4a7d" compact loading={loading} />
        <StatCard icon="close-circle" label="Tỉ lệ hủy" value={`${cancellationRate}%`} color="#b33f45" loading={loading} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Xu hướng doanh thu</Text>
            <Text style={styles.cardCaption}>Lợi nhuận 10% theo kỳ</Text>
          </View>
          <Text style={styles.totalRevenue}>{formatCurrency(stats.totalRevenue)}</Text>
        </View>
        {chartData.length ? (
          <View style={styles.chart}>
            {chartData.map((item) => {
              const height = Math.max(8, Math.round((Number(item.revenue) / maxRevenue) * 92));
              return (
                <View key={item.month} style={styles.barColumn}>
                  <Text style={styles.barValue}>{compactNumber(item.revenue)}</Text>
                  <View style={[styles.bar, { height }]} />
                  <Text style={styles.barLabel} numberOfLines={1}>{shortPeriod(item.month)}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>Chưa có dữ liệu doanh thu trong kỳ này.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trạng thái booking</Text>
        <View style={styles.statusList}>
          {Object.entries(stats.bookingsByStatus).map(([status, count]) => {
            const total = Math.max(1, stats.totalBookings);
            const width = Math.min(100, Math.round((Number(count) / total) * 100));
            return (
              <View key={status} style={styles.statusItem}>
                <View style={styles.statusTopRow}>
                  <Text style={styles.statusLabel}>{STATUS_LABELS[status] || status}</Text>
                  <Text style={styles.statusCount}>{count}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${width}%`, backgroundColor: statusColor(status) }]} />
                </View>
              </View>
            );
          })}
          {!Object.keys(stats.bookingsByStatus).length ? (
            <Text style={styles.emptyText}>Chưa có booking trong kỳ này.</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Người dùng tích cực nhất</Text>
        <View style={styles.list}>
          {stats.topUsers.map((item, index) => (
            <View key={item.id} style={styles.rankingRow}>
              <View style={styles.rank}><Text style={styles.rankText}>{index + 1}</Text></View>
              <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text></View>
              <View style={styles.flexText}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.booking_count} booking</Text>
              </View>
              <Text style={styles.amount}>{formatCurrency(item.total_spent)}</Text>
            </View>
          ))}
          {!stats.topUsers.length ? <Text style={styles.emptyText}>Chưa có dữ liệu người dùng.</Text> : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Booking gần đây</Text>
        <View style={styles.list}>
          {stats.recentBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingRow}>
              <View style={styles.bookingIcon}>
                <Ionicons name="bed-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.flexText}>
                <Text style={styles.itemTitle} numberOfLines={1}>{booking.property_name || `Booking #${booking.id}`}</Text>
                <Text style={styles.itemMeta}>{booking.user_name || 'Khách'} · {formatDate(booking.check_in)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor(booking.status)}18` }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColor(booking.status) }]}>
                    {STATUS_LABELS[booking.status] || booking.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.amount}>{formatCurrency(booking.total_price)}</Text>
            </View>
          ))}
          {!stats.recentBookings.length ? <Text style={styles.emptyText}>Chưa có booking gần đây.</Text> : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hoạt động gần đây</Text>
        <View style={styles.list}>
          {stats.recentLogs.slice(0, 5).map((log) => (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.logDot} />
              <View style={styles.flexText}>
                <Text style={styles.itemTitle}>{log.user_name || 'Hệ thống'}</Text>
                <Text style={styles.itemMeta}>{log.action}</Text>
                <Text style={styles.logTime}>{formatDateTime(log.created_at)}</Text>
              </View>
            </View>
          ))}
          {!stats.recentLogs.length ? <Text style={styles.emptyText}>Chưa có hoạt động gần đây.</Text> : null}
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  compact = false,
  loading,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  compact?: boolean;
  loading: boolean;
}) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}16` }]}>
        <Ionicons name={icon} size={19} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, compact && styles.compactStatValue]} numberOfLines={1}>
        {loading ? '...' : value}
      </Text>
    </View>
  );
}

function compactNumber(value: number) {
  const number = Number(value) || 0;
  if (number >= 1_000_000) return `${Math.round(number / 1_000_000)}tr`;
  if (number >= 1_000) return `${Math.round(number / 1_000)}k`;
  return String(number);
}

function shortPeriod(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(5).replace('-', '/');
  if (/^\d{4}-\d{2}$/.test(value)) return value.slice(5);
  return value.length > 5 ? value.slice(-5) : value;
}

function statusColor(status: string) {
  if (['confirmed', 'paid', 'completed'].includes(status)) return colors.success;
  if (status === 'cancelled') return colors.error;
  if (status === 'pending') return '#b56b20';
  return '#547285';
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { color: colors.primary, fontFamily: fonts.heading, fontSize: 24 },
  subheading: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  refreshButton: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer },
  filters: { gap: 7, paddingVertical: 16 },
  filterChip: { borderRadius: 99, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  activeFilterChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 10 },
  activeFilterText: { color: colors.white },
  errorBox: { flexDirection: 'row', gap: 8, alignItems: 'center', borderRadius: 12, backgroundColor: '#fff1f0', borderWidth: 1, borderColor: '#f4cecb', padding: 12, marginBottom: 14 },
  errorText: { flex: 1, color: colors.error, fontFamily: fonts.medium, fontSize: 11, lineHeight: 17 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', minHeight: 120, borderRadius: 17, borderTopWidth: 3, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 14 },
  statIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statLabel: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 11 },
  statValue: { color: colors.primary, fontFamily: fonts.heading, fontSize: 22, marginTop: 3 },
  compactStatValue: { fontSize: 16, marginTop: 7 },
  card: { borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 16, marginTop: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cardTitle: { color: colors.primary, fontFamily: fonts.bold, fontSize: 14 },
  cardCaption: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 9, marginTop: 2 },
  totalRevenue: { color: colors.secondary, fontFamily: fonts.bold, fontSize: 12 },
  chart: { height: 140, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', gap: 6, marginTop: 16 },
  barColumn: { flex: 1, height: 140, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '62%', maxWidth: 28, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: colors.secondary },
  barValue: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 7, marginBottom: 4 },
  barLabel: { width: '100%', color: colors.textMuted, fontFamily: fonts.body, fontSize: 8, textAlign: 'center', marginTop: 5 },
  emptyText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, textAlign: 'center', paddingVertical: 20 },
  statusList: { marginTop: 10 },
  statusItem: { marginTop: 9 },
  statusTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { color: colors.textSoft, fontFamily: fonts.medium, fontSize: 11 },
  statusCount: { color: colors.primary, fontFamily: fonts.bold, fontSize: 11 },
  progressTrack: { height: 5, borderRadius: 99, overflow: 'hidden', backgroundColor: colors.surfaceContainer, marginTop: 5 },
  progressFill: { height: '100%', borderRadius: 99 },
  list: { marginTop: 8 },
  rankingRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 9 },
  rank: { width: 25, height: 25, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondaryFixed },
  rankText: { color: colors.secondary, fontFamily: fonts.bold, fontSize: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, marginLeft: 9 },
  avatarText: { color: colors.white, fontFamily: fonts.bold, fontSize: 12 },
  flexText: { flex: 1, paddingHorizontal: 10 },
  itemTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 11 },
  itemMeta: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 9, lineHeight: 14, marginTop: 2 },
  amount: { maxWidth: 90, color: colors.secondary, fontFamily: fonts.bold, fontSize: 10, textAlign: 'right' },
  bookingRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12 },
  bookingIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3, marginTop: 5 },
  statusBadgeText: { fontFamily: fonts.bold, fontSize: 8 },
  logRow: { flexDirection: 'row', alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 11 },
  logDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary, marginTop: 5 },
  logTime: { color: colors.outline, fontFamily: fonts.body, fontSize: 8, marginTop: 3 },
});
