import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { adminService } from '../../api/services';
import { colors, fonts } from '../../theme';

type Audience = 'all' | 'customers' | 'hosts' | 'selected';

type Campaign = {
  id: number;
  title: string;
  body: string;
  audience: string;
  sent_count: number;
  failed_count: number;
  created_at: string;
  created_by_name?: string;
};

const AUDIENCES: Array<{ key: Audience; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'all', label: 'Tat ca', icon: 'people-outline' },
  { key: 'customers', label: 'Customer', icon: 'person-outline' },
  { key: 'hosts', label: 'Host', icon: 'business-outline' },
  { key: 'selected', label: 'User ID', icon: 'at-outline' },
];

function parseUserIds(value: string) {
  return value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
}

export function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<Audience>('all');
  const [userIdsText, setUserIdsText] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const selectedUserIds = useMemo(() => parseUserIds(userIdsText), [userIdsText]);

  const loadCampaigns = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const response = await adminService.getNotificationCampaigns();
      setCampaigns(response.campaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai lich su gui.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const sendNotification = async () => {
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (!cleanTitle || !cleanBody) {
      Alert.alert('Thieu thong tin', 'Hay nhap tieu de va noi dung thong bao.');
      return;
    }
    if (audience === 'selected' && selectedUserIds.length === 0) {
      Alert.alert('Thieu nguoi nhan', 'Nhap danh sach user ID, cach nhau bang dau phay.');
      return;
    }

    setSending(true);
    try {
      const result = await adminService.sendNotification({
        title: cleanTitle,
        body: cleanBody,
        audience,
        userIds: selectedUserIds,
      });
      setTitle('');
      setBody('');
      setUserIdsText('');
      await loadCampaigns();
      Alert.alert(
        'Da gui thong bao',
        `Recipients: ${result.recipients}\nPush ok: ${result.sent}\nPush loi: ${result.failed}`,
      );
    } catch (err) {
      Alert.alert('Khong the gui', err instanceof Error ? err.message : 'Da xay ra loi.');
    } finally {
      setSending(false);
    }
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
            onRefresh={() => void loadCampaigns(true)}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.sectionHeader}>
          <View style={styles.flexText}>
            <Text style={styles.heading}>Gui thong bao</Text>
            <Text style={styles.subheading}>Push notification hien ngoai man hinh dien thoai</Text>
          </View>
          <View style={styles.liveBadge}>
            <Ionicons name="notifications" size={14} color={colors.primary} />
            <Text style={styles.liveBadgeText}>PUSH</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>TIEU DE</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Vi du: Uu dai cuoi tuan"
            placeholderTextColor={colors.outline}
            style={styles.input}
            maxLength={120}
          />

          <Text style={styles.fieldLabel}>NOI DUNG</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Nhap noi dung se hien tren notification..."
            placeholderTextColor={colors.outline}
            style={[styles.input, styles.textArea]}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>DOI TUONG</Text>
          <View style={styles.audienceGrid}>
            {AUDIENCES.map((item) => {
              const active = audience === item.key;
              return (
                <Pressable
                  key={item.key}
                  style={[styles.audienceButton, active && styles.activeAudienceButton]}
                  onPress={() => setAudience(item.key)}
                >
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={active ? colors.white : colors.textMuted}
                  />
                  <Text style={[styles.audienceText, active && styles.activeAudienceText]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {audience === 'selected' ? (
            <>
              <Text style={styles.fieldLabel}>USER ID</Text>
              <TextInput
                value={userIdsText}
                onChangeText={setUserIdsText}
                placeholder="12, 15, 21"
                placeholderTextColor={colors.outline}
                keyboardType="numbers-and-punctuation"
                style={styles.input}
              />
            </>
          ) : null}

          <View style={styles.noteBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.secondary} />
            <Text style={styles.noteText}>
              Hien tai chi admin duoc gui. Sau nay neu them role nhan vien, sua guard dashboard va server auth helper.
            </Text>
          </View>

          <Pressable
            style={[styles.sendButton, sending && styles.disabledButton]}
            onPress={() => void sendNotification()}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="send" size={17} color={colors.white} />
                <Text style={styles.sendButtonText}>Gui thong bao</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Lich su gui</Text>
          <Text style={styles.historyCount}>{campaigns.length} chien dich</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => void loadCampaigns()}>
              <Text style={styles.retryText}>Thu lai</Text>
            </Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Dang tai lich su...</Text>
          </View>
        ) : (
          <View style={styles.campaignList}>
            {campaigns.map((campaign) => (
              <View key={campaign.id} style={styles.campaignCard}>
                <View style={styles.campaignTopRow}>
                  <View style={styles.campaignIcon}>
                    <Ionicons name="megaphone-outline" size={18} color={colors.secondary} />
                  </View>
                  <View style={styles.flexText}>
                    <Text style={styles.campaignTitle} numberOfLines={1}>{campaign.title}</Text>
                    <Text style={styles.campaignMeta}>
                      {campaign.audience} - {formatDate(campaign.created_at)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.campaignBody} numberOfLines={2}>{campaign.body}</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statText}>OK {campaign.sent_count}</Text>
                  <Text style={styles.statText}>Loi {campaign.failed_count}</Text>
                  {campaign.created_by_name ? (
                    <Text style={styles.statText}>By {campaign.created_by_name}</Text>
                  ) : null}
                </View>
              </View>
            ))}
            {!campaigns.length ? (
              <View style={styles.emptyBox}>
                <Ionicons name="notifications-off-outline" size={34} color={colors.outline} />
                <Text style={styles.emptyTitle}>Chua co chien dich nao</Text>
                <Text style={styles.emptyMessage}>Thong bao admin gui se hien tai day.</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flexText: { flex: 1 },
  heading: { color: colors.primary, fontFamily: fonts.heading, fontSize: 22 },
  subheading: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  liveBadge: { height: 34, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 99, backgroundColor: colors.secondaryFixed, paddingHorizontal: 11 },
  liveBadgeText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 9 },
  formCard: { borderRadius: 17, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 15, marginTop: 16 },
  fieldLabel: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.5, marginBottom: 6, marginTop: 8 },
  input: { minHeight: 47, borderRadius: 13, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.white, color: colors.text, fontFamily: fonts.body, fontSize: 12, paddingHorizontal: 13 },
  textArea: { minHeight: 96, paddingTop: 12, lineHeight: 18 },
  audienceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  audienceButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceLow, paddingHorizontal: 11 },
  activeAudienceButton: { backgroundColor: colors.primary, borderColor: colors.primary },
  audienceText: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 10 },
  activeAudienceText: { color: colors.white },
  noteBox: { flexDirection: 'row', gap: 8, borderRadius: 12, backgroundColor: '#fff6df', borderWidth: 1, borderColor: '#eedba9', padding: 11, marginTop: 13 },
  noteText: { flex: 1, color: '#756441', fontFamily: fonts.body, fontSize: 10, lineHeight: 15 },
  sendButton: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 13, backgroundColor: colors.primary, marginTop: 14 },
  sendButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 12 },
  disabledButton: { opacity: 0.7 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 10 },
  historyTitle: { color: colors.primary, fontFamily: fonts.heading, fontSize: 18 },
  historyCount: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 10 },
  errorBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, backgroundColor: '#fff1f0', padding: 12, marginBottom: 12 },
  errorText: { flex: 1, color: colors.error, fontFamily: fonts.medium, fontSize: 10 },
  retryText: { color: colors.error, fontFamily: fonts.bold, fontSize: 10 },
  loadingBox: { minHeight: 180, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 10 },
  campaignList: { gap: 10 },
  campaignCard: { borderRadius: 15, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 13 },
  campaignTopRow: { flexDirection: 'row', alignItems: 'center' },
  campaignIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondaryFixed, marginRight: 10 },
  campaignTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  campaignMeta: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 9, marginTop: 3 },
  campaignBody: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10, lineHeight: 15, marginTop: 10 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 11, paddingTop: 9 },
  statText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 9 },
  emptyBox: { minHeight: 220, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { color: colors.primary, fontFamily: fonts.bold, fontSize: 14, marginTop: 12 },
  emptyMessage: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10, marginTop: 4 },
});
