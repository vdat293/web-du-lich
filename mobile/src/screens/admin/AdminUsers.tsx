import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  adminService,
  type AdminUser,
  type AdminUserPayload,
} from '../../api/services';
import { colors, fonts } from '../../theme';

type RoleFilter = '' | AdminUser['role'];

const ROLES: Array<{ key: RoleFilter; label: string }> = [
  { key: '', label: 'Tất cả' },
  { key: 'admin', label: 'Admin' },
  { key: 'host', label: 'Host' },
  { key: 'customer', label: 'Customer' },
];

export function AdminUsers({ currentUserId }: { currentUserId: number }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<RoleFilter>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((current) => ({ ...current, page: 1 }));
      setQuery(search.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadUsers = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const response = await adminService.getUsers({
        page: pagination.page,
        limit: 10,
        search: query,
        role,
      });
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.page, query, role]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const openCreate = () => {
    setEditingUser(null);
    setModalVisible(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setModalVisible(true);
  };

  const saveUser = async (payload: AdminUserPayload) => {
    if (editingUser) {
      await adminService.updateUser(editingUser.id, payload);
    } else {
      await adminService.createUser(payload);
    }
    setModalVisible(false);
    setEditingUser(null);
    await loadUsers();
  };

  const confirmDelete = (user: AdminUser) => {
    Alert.alert(
      'Xóa người dùng',
      `Bạn có chắc muốn xóa ${user.name}? Thao tác này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            void adminService.deleteUser(user.id)
              .then(() => loadUsers())
              .catch((err: unknown) => {
                Alert.alert('Không thể xóa', err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
              });
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadUsers(true)}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.heading}>Quản lý người dùng</Text>
            <Text style={styles.subheading}>{pagination.total} tài khoản trong hệ thống</Text>
          </View>
          <Pressable style={styles.addButton} onPress={openCreate}>
            <Ionicons name="add" size={19} color={colors.white} />
            <Text style={styles.addButtonText}>Thêm</Text>
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={19} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm theo tên hoặc email..."
            placeholderTextColor={colors.outline}
            style={styles.searchInput}
            autoCapitalize="none"
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.outline} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleFilters}>
          {ROLES.map((item) => (
            <Pressable
              key={item.key || 'all'}
              style={[styles.roleFilter, role === item.key && styles.activeRoleFilter]}
              onPress={() => {
                setRole(item.key);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
            >
              <Text style={[styles.roleFilterText, role === item.key && styles.activeRoleFilterText]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => void loadUsers()}><Text style={styles.retryText}>Thử lại</Text></Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải người dùng...</Text>
          </View>
        ) : (
          <View style={styles.userList}>
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isCurrentUser={user.id === currentUserId}
                onEdit={() => openEdit(user)}
                onDelete={() => confirmDelete(user)}
              />
            ))}
            {!users.length ? (
              <View style={styles.emptyBox}>
                <Ionicons name="people-outline" size={31} color={colors.outline} />
                <Text style={styles.emptyTitle}>Không tìm thấy người dùng</Text>
                <Text style={styles.emptyMessage}>Thử thay đổi từ khóa hoặc bộ lọc role.</Text>
              </View>
            ) : null}
          </View>
        )}

        {pagination.totalPages > 1 ? (
          <View style={styles.pagination}>
            <Pressable
              disabled={pagination.page <= 1}
              style={[styles.pageButton, pagination.page <= 1 && styles.disabledButton]}
              onPress={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}
            >
              <Ionicons name="chevron-back" size={18} color={colors.primary} />
            </Pressable>
            <Text style={styles.pageText}>Trang {pagination.page} / {pagination.totalPages}</Text>
            <Pressable
              disabled={pagination.page >= pagination.totalPages}
              style={[styles.pageButton, pagination.page >= pagination.totalPages && styles.disabledButton]}
              onPress={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <UserFormModal
        key={editingUser?.id || 'new-user'}
        visible={modalVisible}
        user={editingUser}
        onClose={() => {
          setModalVisible(false);
          setEditingUser(null);
        }}
        onSave={saveUser}
      />
    </View>
  );
}

function UserCard({
  user,
  isCurrentUser,
  onEdit,
  onDelete,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const contact = user.email.includes('@phone.system') ? user.email.split('@')[0] : user.email;
  return (
    <View style={styles.userCard}>
      <View style={styles.userTopRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text></View>
        <View style={styles.userIdentity}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
            {isCurrentUser ? <Text style={styles.youBadge}>BẠN</Text> : null}
          </View>
          <Text style={styles.userContact} numberOfLines={1}>{contact}</Text>
          {user.phone ? <Text style={styles.userPhone}>{user.phone}</Text> : null}
        </View>
        <View style={[styles.roleBadge, { backgroundColor: roleColor(user.role).background }]}>
          <Text style={[styles.roleBadgeText, { color: roleColor(user.role).text }]}>{user.role}</Text>
        </View>
      </View>
      <View style={styles.userFooter}>
        <Text style={styles.createdAt}>ID #{user.id} · {formatDate(user.created_at)}</Text>
        <View style={styles.actions}>
          <Pressable style={styles.editButton} onPress={onEdit}>
            <Ionicons name="create-outline" size={17} color="#3276d3" />
          </Pressable>
          <Pressable
            style={[styles.deleteButton, isCurrentUser && styles.disabledButton]}
            disabled={isCurrentUser}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={17} color={colors.error} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function UserFormModal({
  visible,
  user,
  onClose,
  onSave,
}: {
  visible: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSave: (payload: AdminUserPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<AdminUserPayload>({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'customer',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || (!user && !form.password?.trim())) {
      setError('Vui lòng nhập đầy đủ tên, email và mật khẩu.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone?.trim() };
      if (user && !payload.password) delete payload.password;
      await onSave(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu người dùng.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{user ? 'Sửa người dùng' : 'Thêm người dùng'}</Text>
              <Text style={styles.modalSubtitle}>{user ? `Cập nhật tài khoản #${user.id}` : 'Tạo tài khoản mới trong hệ thống'}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <FormField label="Họ và tên *" value={form.name} onChangeText={(name) => setForm({ ...form, name })} placeholder="Nguyễn Văn A" />
            <FormField label="Email *" value={form.email} onChangeText={(email) => setForm({ ...form, email })} placeholder="name@example.com" autoCapitalize="none" keyboardType="email-address" />
            <FormField label={`Mật khẩu ${user ? '(để trống nếu không đổi)' : '*'}`} value={form.password || ''} onChangeText={(password) => setForm({ ...form, password })} placeholder="Tối thiểu 6 ký tự" secureTextEntry />
            <FormField label="Số điện thoại" value={form.phone || ''} onChangeText={(phone) => setForm({ ...form, phone })} placeholder="09xxxxxxxx" keyboardType="phone-pad" />

            <Text style={styles.fieldLabel}>ROLE</Text>
            <View style={styles.roleSelector}>
              {ROLES.filter((item) => item.key).map((item) => (
                <Pressable
                  key={item.key}
                  style={[styles.roleOption, form.role === item.key && styles.activeRoleOption]}
                  onPress={() => setForm({ ...form, role: item.key as AdminUser['role'] })}
                >
                  <Text style={[styles.roleOptionText, form.role === item.key && styles.activeRoleOptionText]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            {error ? <Text style={styles.formError}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={onClose} disabled={saving}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={() => void submit()} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.saveButtonText}>Lưu thông tin</Text>}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FormField({ label, ...inputProps }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput {...inputProps} placeholderTextColor={colors.outline} style={styles.input} />
    </View>
  );
}

function roleColor(role: AdminUser['role']) {
  if (role === 'admin') return { background: '#fde8e8', text: '#9d2929' };
  if (role === 'host') return { background: '#eee8fb', text: '#6742a2' };
  return { background: '#e5f0ff', text: '#285f9c' };
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  heading: { color: colors.primary, fontFamily: fonts.heading, fontSize: 22 },
  subheading: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  addButton: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 12, backgroundColor: colors.primary, paddingHorizontal: 13 },
  addButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 11 },
  searchBox: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13, marginTop: 16 },
  searchInput: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 12 },
  roleFilters: { gap: 7, paddingVertical: 12 },
  roleFilter: { borderRadius: 99, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13, paddingVertical: 7 },
  activeRoleFilter: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleFilterText: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 10 },
  activeRoleFilterText: { color: colors.white },
  errorBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, backgroundColor: '#fff1f0', padding: 12, marginBottom: 12 },
  errorText: { flex: 1, color: colors.error, fontFamily: fonts.medium, fontSize: 10 },
  retryText: { color: colors.error, fontFamily: fonts.bold, fontSize: 10 },
  loadingBox: { minHeight: 260, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 10 },
  userList: { gap: 10 },
  userCard: { borderRadius: 17, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 14 },
  userTopRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  avatarText: { color: colors.secondaryFixed, fontFamily: fonts.heading, fontSize: 16 },
  userIdentity: { flex: 1, paddingHorizontal: 11 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { maxWidth: '78%', color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  youBadge: { color: colors.secondary, fontFamily: fonts.bold, fontSize: 7, backgroundColor: colors.secondaryFixed, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  userContact: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10, marginTop: 3 },
  userPhone: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 9, marginTop: 1 },
  roleBadge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5 },
  roleBadgeText: { fontFamily: fonts.bold, fontSize: 8, textTransform: 'uppercase' },
  userFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12, paddingTop: 10 },
  createdAt: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 9 },
  actions: { flexDirection: 'row', gap: 7 },
  editButton: { width: 34, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#edf5ff' },
  deleteButton: { width: 34, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff0ef' },
  disabledButton: { opacity: 0.35 },
  emptyBox: { minHeight: 250, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { color: colors.primary, fontFamily: fonts.bold, fontSize: 14, marginTop: 12 },
  emptyMessage: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10, marginTop: 4 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15, marginTop: 18 },
  pageButton: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  pageText: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 10 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.42)' },
  modalCard: { maxHeight: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.surface, paddingHorizontal: 18, paddingBottom: 24 },
  modalHandle: { width: 42, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: colors.outline, marginTop: 9, marginBottom: 13 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 20 },
  modalSubtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
  closeButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer },
  field: { marginBottom: 12 },
  fieldLabel: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.5, marginBottom: 6 },
  input: { height: 47, borderRadius: 13, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.white, color: colors.text, fontFamily: fonts.body, fontSize: 12, paddingHorizontal: 13 },
  roleSelector: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  roleOption: { flex: 1, alignItems: 'center', borderRadius: 11, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.white, paddingVertical: 10 },
  activeRoleOption: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleOptionText: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 9 },
  activeRoleOptionText: { color: colors.white },
  formError: { color: colors.error, fontFamily: fonts.medium, fontSize: 10, lineHeight: 15, marginTop: 8 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelButton: { flex: 1, height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer },
  cancelButtonText: { color: colors.text, fontFamily: fonts.bold, fontSize: 11 },
  saveButton: { flex: 1.5, height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  saveButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 11 },
});
