import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import {
  adminService,
  type AdminCoupon,
  type AdminCouponPayload,
} from '../../api/services';
import { colors, fonts } from '../../theme';
import { getAppLocale } from '../../utils/date';

type PromotionStatus = 'upcoming' | 'active' | 'exhausted' | 'expired';
type DiscountType = 'percent' | 'fixed';

type Promotion = {
  id: number;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
};

const STATUS_FILTERS: Array<{ key: '' | PromotionStatus; label: string }> = [
  { key: '', label: 'Tất cả' },
  { key: 'active', label: 'Đang chạy' },
  { key: 'upcoming', label: 'Sắp diễn ra' },
  { key: 'exhausted', label: 'Hết lượt' },
  { key: 'expired', label: 'Hết hạn' },
];

function dateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function toPromotion(coupon: AdminCoupon): Promotion {
  const today = new Date().toISOString().slice(0, 10);
  let status: PromotionStatus = 'active';
  if (coupon.valid_until < today) status = 'expired';
  else if (coupon.valid_from > today) status = 'upcoming';
  else if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) status = 'exhausted';

  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description || '',
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
    minOrderAmount: coupon.min_order_amount || 0,
    usageLimit: coupon.max_uses,
    usedCount: coupon.used_count,
    startDate: coupon.valid_from,
    endDate: coupon.valid_until,
    status,
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể hoàn tất yêu cầu.';
}

export function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | PromotionStatus>('');
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadPromotions = async () => {
    setLoadError('');
    try {
      setPromotions((await adminService.getCoupons()).map(toPromotion));
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadPromotions(); }, []);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return promotions.filter((promotion) => {
      const matchesSearch = !normalizedSearch
        || promotion.description.toLowerCase().includes(normalizedSearch)
        || promotion.code.toLowerCase().includes(normalizedSearch);
      return matchesSearch && (!status || promotion.status === status);
    });
  }, [promotions, search, status]);

  const openCreate = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = (promotion: Promotion) => {
    setEditing(promotion);
    setModalVisible(true);
  };

  const savePromotion = async (payload: AdminCouponPayload) => {
    if (editing) await adminService.updateCoupon(editing.id, payload);
    else await adminService.createCoupon(payload);
    await loadPromotions();
    setModalVisible(false);
    setEditing(null);
  };

  const deletePromotion = (promotion: Promotion) => {
    Alert.alert(
      'Xóa khuyến mãi',
      `Bạn có chắc muốn xóa mã ${promotion.code}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            void adminService.deleteCoupon(promotion.id)
              .then(loadPromotions)
              .catch((error) => Alert.alert('Không thể xóa', errorMessage(error)));
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.flexText}>
            <Text style={styles.heading}>Quản lý khuyến mãi</Text>
            <Text style={styles.subheading}>{promotions.length} chương trình đã tạo</Text>
          </View>
          <Pressable style={styles.addButton} onPress={openCreate}>
            <Ionicons name="add" size={19} color={colors.white} />
            <Text style={styles.addButtonText}>Thêm</Text>
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <SummaryItem label="Đang chạy" value={promotions.filter((item) => item.status === 'active').length} color={colors.success} />
          <SummaryItem label="Sắp diễn ra" value={promotions.filter((item) => item.status === 'upcoming').length} color="#6d5aac" />
          <SummaryItem label="Lượt dùng" value={promotions.reduce((sum, item) => sum + item.usedCount, 0)} color={colors.secondary} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={19} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm mô tả hoặc mã khuyến mãi..."
            placeholderTextColor={colors.outline}
            autoCapitalize="characters"
            style={styles.searchInput}
          />
          {search ? <Pressable onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.outline} /></Pressable> : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {STATUS_FILTERS.map((item) => (
            <Pressable
              key={item.key || 'all'}
              style={[styles.filterChip, status === item.key && styles.activeFilterChip]}
              onPress={() => setStatus(item.key)}
            >
              <Text style={[styles.filterText, status === item.key && styles.activeFilterText]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? <ActivityIndicator style={styles.loading} color={colors.primary} /> : null}
        {loadError ? (
          <Pressable style={styles.errorBox} onPress={() => { setLoading(true); void loadPromotions(); }}>
            <Text style={styles.formError}>{loadError}</Text>
            <Text style={styles.retryText}>Chạm để thử lại</Text>
          </Pressable>
        ) : null}
        {!loading && !loadError ? <View style={styles.promotionList}>
          {filtered.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              onEdit={() => openEdit(promotion)}
              onDelete={() => deletePromotion(promotion)}
            />
          ))}
          {!filtered.length ? (
            <View style={styles.emptyBox}>
              <Ionicons name="pricetags-outline" size={32} color={colors.outline} />
              <Text style={styles.emptyTitle}>Không có khuyến mãi phù hợp</Text>
              <Text style={styles.emptyMessage}>Tạo chương trình mới hoặc thay đổi bộ lọc.</Text>
            </View>
          ) : null}
        </View> : null}
      </ScrollView>

      <PromotionFormModal
        key={editing?.id || 'new-promotion'}
        visible={modalVisible}
        promotion={editing}
        onClose={() => {
          setModalVisible(false);
          setEditing(null);
        }}
        onSave={savePromotion}
      />
    </View>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.summaryItem}>
      <View style={[styles.summaryDot, { backgroundColor: color }]} />
      <Text style={styles.summaryValue}>{value.toLocaleString(getAppLocale())}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function PromotionCard({
  promotion,
  onEdit,
  onDelete,
}: {
  promotion: Promotion;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const usedPercentage = promotion.usageLimit != null && promotion.usageLimit > 0
    ? Math.min(100, Math.round((promotion.usedCount / promotion.usageLimit) * 100))
    : 0;
  const statusTheme = getStatusTheme(promotion.status);

  return (
    <View style={styles.promotionCard}>
      <View style={styles.cardTopRow}>
        <View style={styles.promoIcon}><Ionicons name="ticket-outline" size={21} color={colors.secondary} /></View>
        <View style={styles.flexText}>
          <Text style={styles.promotionCode}>{promotion.code}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusTheme.background }]}>
          <Text style={[styles.statusText, { color: statusTheme.text }]}>{statusTheme.label}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>{promotion.description || 'Chưa có mô tả.'}</Text>

      <View style={styles.discountBox}>
        <View>
          <Text style={styles.discountLabel}>MỨC GIẢM</Text>
          <Text style={styles.discountValue}>
            {promotion.discountType === 'percent'
              ? `${promotion.discountValue}%`
              : formatCurrency(promotion.discountValue)}
          </Text>
        </View>
        <View style={styles.discountDivider} />
        <View style={styles.flexText}>
          <Text style={styles.discountLabel}>ĐƠN TỐI THIỂU</Text>
          <Text style={styles.discountSecondary}>{formatCurrency(promotion.minOrderAmount)}</Text>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <Meta icon="calendar-outline" text={`${formatDate(promotion.startDate)} - ${formatDate(promotion.endDate)}`} />
        <Meta icon="people-outline" text="Áp dụng theo điều kiện coupon trên hệ thống" />
      </View>

      <View style={styles.usageHeader}>
        <Text style={styles.usageLabel}>Đã sử dụng</Text>
        <Text style={styles.usageCount}>{promotion.usedCount} / {promotion.usageLimit || '∞'}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${usedPercentage}%` }]} />
      </View>

      <View style={styles.cardActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Sửa mã ${promotion.code}`} style={styles.iconButton} onPress={onEdit}><Ionicons name="create-outline" size={17} color="#3276d3" /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Xóa mã ${promotion.code}`} style={styles.deleteButton} onPress={onDelete}><Ionicons name="trash-outline" size={17} color={colors.error} /></Pressable>
      </View>
    </View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color={colors.textMuted} />
      <Text style={styles.metaText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

function PromotionFormModal({
  visible,
  promotion,
  onClose,
  onSave,
}: {
  visible: boolean;
  promotion: Promotion | null;
  onClose: () => void;
  onSave: (payload: AdminCouponPayload) => Promise<void>;
}) {
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percent' as DiscountType,
    discountValue: 10,
    minOrderAmount: 0,
    usageLimit: 100,
    startDate: dateAfter(0),
    endDate: dateAfter(30),
    ...(promotion ? {
      code: promotion.code,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      minOrderAmount: promotion.minOrderAmount,
      usageLimit: promotion.usageLimit || 0,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
    } : {}),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!/^[A-Z0-9_-]{3,50}$/.test(form.code.trim().toUpperCase())) {
      setError('Mã cần 3-50 ký tự A-Z, 0-9, gạch ngang hoặc gạch dưới.');
      return;
    }
    if (form.discountValue <= 0) {
      setError('Mức giảm phải lớn hơn 0.');
      return;
    }
    if (form.discountType === 'percent' && form.discountValue > 100) {
      setError('Khuyến mãi phần trăm không được vượt quá 100%.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(form.endDate)) {
      setError('Ngày bắt đầu và kết thúc cần theo định dạng YYYY-MM-DD.');
      return;
    }
    if (form.endDate < form.startDate) {
      setError('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave({
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        discount_type: form.discountType,
        discount_value: form.discountValue,
        min_order_amount: form.minOrderAmount || null,
        max_uses: form.usageLimit || null,
        valid_from: form.startDate,
        valid_until: form.endDate,
      });
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{promotion ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}</Text>
              <Text style={styles.modalSubtitle}>Thiết lập điều kiện và thời gian áp dụng</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}><Ionicons name="close" size={20} color={colors.text} /></Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
            <FormField label="Mã khuyến mãi *" value={form.code} onChangeText={(code) => setForm({ ...form, code: code.toUpperCase() })} placeholder="SUMMER20" autoCapitalize="characters" />
            <FormField label="Mô tả" value={form.description} onChangeText={(description) => setForm({ ...form, description })} placeholder="Mô tả ngắn về chương trình" multiline numberOfLines={3} textAlignVertical="top" inputStyle={styles.textArea} />

            <Text style={styles.fieldLabel}>LOẠI GIẢM GIÁ</Text>
            <View style={styles.segmentedRow}>
              <SegmentButton label="Phần trăm (%)" active={form.discountType === 'percent'} onPress={() => setForm({ ...form, discountType: 'percent' })} />
              <SegmentButton label="Số tiền (VND)" active={form.discountType === 'fixed'} onPress={() => setForm({ ...form, discountType: 'fixed' })} />
            </View>

            <View style={styles.twoColumns}>
              <NumberField label="Mức giảm *" value={form.discountValue} onChange={(discountValue) => setForm({ ...form, discountValue })} />
              <NumberField label="Đơn tối thiểu" value={form.minOrderAmount} onChange={(minOrderAmount) => setForm({ ...form, minOrderAmount })} />
            </View>
            <NumberField label="Tổng lượt sử dụng (0 = không giới hạn)" value={form.usageLimit} onChange={(usageLimit) => setForm({ ...form, usageLimit })} />

            <View style={styles.twoColumns}>
              <FormField label="Bắt đầu" value={form.startDate} onChangeText={(startDate) => setForm({ ...form, startDate })} placeholder="YYYY-MM-DD" />
              <FormField label="Kết thúc" value={form.endDate} onChangeText={(endDate) => setForm({ ...form, endDate })} placeholder="YYYY-MM-DD" />
            </View>

            {error ? <Text style={styles.formError}>{error}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable disabled={saving} style={styles.cancelButton} onPress={onClose}><Text style={styles.cancelButtonText}>Hủy</Text></Pressable>
              <Pressable disabled={saving} style={[styles.saveButton, saving && styles.disabledButton]} onPress={() => void submit()}>
                {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Lưu khuyến mãi</Text>}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FormField({ label, inputStyle, ...props }: { label: string; inputStyle?: object } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput {...props} placeholderTextColor={colors.outline} style={[styles.input, inputStyle]} />
    </View>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <FormField
      label={label}
      value={String(value)}
      onChangeText={(text) => onChange(Number(text.replace(/[^0-9]/g, '')) || 0)}
      keyboardType="number-pad"
    />
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segmentButton, active && styles.activeSegmentButton]} onPress={onPress}>
      <Text style={[styles.segmentText, active && styles.activeSegmentText]}>{label}</Text>
    </Pressable>
  );
}

function getStatusTheme(status: PromotionStatus) {
  if (status === 'active') return { label: 'ĐANG CHẠY', background: '#e3f4e9', text: '#24633b' };
  if (status === 'upcoming') return { label: 'SẮP DIỄN RA', background: '#eee8fb', text: '#6742a2' };
  if (status === 'exhausted') return { label: 'HẾT LƯỢT', background: '#fff1d8', text: '#8b5b12' };
  if (status === 'expired') return { label: 'HẾT HẠN', background: '#fde8e8', text: '#9d2929' };
  return { label: 'KHÔNG XÁC ĐỊNH', background: '#eee8fb', text: '#6742a2' };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(getAppLocale());
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flexText: { flex: 1 },
  heading: { color: colors.primary, fontFamily: fonts.heading, fontSize: 22 },
  subheading: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  addButton: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 12, backgroundColor: colors.primary, paddingHorizontal: 13 },
  addButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 11 },
  scaffoldNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 15, backgroundColor: '#fff6df', borderWidth: 1, borderColor: '#eedba9', padding: 13, marginTop: 16 },
  noticeTitle: { color: colors.secondary, fontFamily: fonts.bold, fontSize: 11 },
  noticeText: { color: '#756441', fontFamily: fonts.body, fontSize: 9, lineHeight: 14, marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  summaryItem: { flex: 1, minHeight: 76, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  summaryDot: { width: 7, height: 7, borderRadius: 4, marginBottom: 4 },
  summaryValue: { color: colors.primary, fontFamily: fonts.heading, fontSize: 18 },
  summaryLabel: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 8, marginTop: 2 },
  searchBox: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13, marginTop: 14 },
  searchInput: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 12 },
  loading: { marginTop: 48 },
  errorBox: { alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: '#f0b7b2', backgroundColor: '#fff0ef', padding: 16, marginTop: 14 },
  retryText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 10, marginTop: 8 },
  filters: { gap: 7, paddingVertical: 12 },
  filterChip: { borderRadius: 99, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13, paddingVertical: 7 },
  activeFilterChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 10 },
  activeFilterText: { color: colors.white },
  promotionList: { gap: 11 },
  promotionCard: { borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 15 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center' },
  promoIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondaryFixed, marginRight: 10 },
  promotionName: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  promotionCode: { color: colors.secondary, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.9, marginTop: 3 },
  statusBadge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontFamily: fonts.bold, fontSize: 7, letterSpacing: 0.3 },
  description: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10, lineHeight: 15, marginTop: 12 },
  discountBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 13, backgroundColor: colors.surfaceLow, padding: 12, marginTop: 12 },
  discountLabel: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 7, letterSpacing: 0.7 },
  discountValue: { color: colors.primary, fontFamily: fonts.heading, fontSize: 20, marginTop: 2 },
  discountSecondary: { color: colors.text, fontFamily: fonts.bold, fontSize: 11, marginTop: 4 },
  discountDivider: { width: 1, height: 32, backgroundColor: colors.outline, marginHorizontal: 14 },
  metaGrid: { gap: 6, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metaText: { flex: 1, color: colors.textMuted, fontFamily: fonts.body, fontSize: 9 },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  usageLabel: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 9 },
  usageCount: { color: colors.primary, fontFamily: fonts.bold, fontSize: 9 },
  progressTrack: { height: 5, borderRadius: 99, overflow: 'hidden', backgroundColor: colors.surfaceContainer, marginTop: 6 },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.secondary },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 7, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 11 },
  toggleButton: { height: 34, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, backgroundColor: colors.surfaceContainer, paddingHorizontal: 10 },
  toggleButtonText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 9 },
  iconButton: { width: 36, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#edf5ff' },
  deleteButton: { width: 36, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff0ef' },
  emptyBox: { minHeight: 250, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { color: colors.primary, fontFamily: fonts.bold, fontSize: 14, marginTop: 12 },
  emptyMessage: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10, marginTop: 4 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.42)' },
  modalCard: { height: '92%', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.surface, paddingHorizontal: 18 },
  modalHandle: { width: 42, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: colors.outline, marginTop: 9, marginBottom: 13 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 20 },
  modalSubtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
  closeButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer },
  formContent: { paddingBottom: 28 },
  field: { flex: 1, marginBottom: 12 },
  fieldLabel: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.5, marginBottom: 6 },
  input: { height: 47, borderRadius: 13, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.white, color: colors.text, fontFamily: fonts.body, fontSize: 12, paddingHorizontal: 13 },
  textArea: { height: 82, paddingTop: 12 },
  segmentedRow: { flexDirection: 'row', gap: 7, marginBottom: 13 },
  segmentButton: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 11, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.white, paddingHorizontal: 5 },
  activeSegmentButton: { backgroundColor: colors.primary, borderColor: colors.primary },
  segmentText: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 8, textAlign: 'center' },
  activeSegmentText: { color: colors.white },
  twoColumns: { flexDirection: 'row', gap: 9 },
  optionList: { gap: 7, marginBottom: 14 },
  optionRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: 12 },
  activeOptionRow: { borderColor: colors.primary, backgroundColor: '#f1f5f4' },
  optionText: { color: colors.text, fontFamily: fonts.medium, fontSize: 10 },
  formError: { color: colors.error, fontFamily: fonts.medium, fontSize: 10, lineHeight: 15, marginTop: 5 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelButton: { flex: 1, height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer },
  cancelButtonText: { color: colors.text, fontFamily: fonts.bold, fontSize: 11 },
  saveButton: { flex: 1.5, height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  disabledButton: { opacity: 0.55 },
  saveButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 11 },
});
