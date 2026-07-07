import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState } from '../../components/ScreenState';
import { useAuth } from '../../context/AuthContext';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme';
import { AdminOverview } from './AdminOverview';
import { AdminPromotions } from './AdminPromotions';
import { AdminUsers } from './AdminUsers';

type AdminTab = 'dashboard' | 'users' | 'promotions';

const TABS: Array<{
  key: AdminTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { key: 'users', label: 'Người dùng', icon: 'people-outline' },
  { key: 'promotions', label: 'Khuyến mãi', icon: 'pricetags-outline' },
];

export function AdminDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  if (user?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.screen}>
        <EmptyState
          icon="lock-closed-outline"
          title="Không có quyền truy cập"
          message="Khu vực này chỉ dành cho tài khoản quản trị viên."
          actionLabel="Quay lại"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={21} color={colors.white} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>AOKLEVART ADMIN</Text>
            <Text style={styles.title}>Quản trị hệ thống</Text>
          </View>
          <View style={styles.adminBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tab, active && styles.activeTab]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons
                  name={tab.icon}
                  size={17}
                  color={active ? colors.primary : 'rgba(255,255,255,0.7)'}
                />
                <Text style={[styles.tabText, active && styles.activeTabText]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.body}>
        {activeTab === 'dashboard' ? <AdminOverview /> : null}
        {activeTab === 'users' ? <AdminUsers currentUserId={user.id} /> : null}
        {activeTab === 'promotions' ? <AdminPromotions /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { backgroundColor: colors.primary, paddingTop: 10, paddingBottom: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerText: { flex: 1, paddingHorizontal: 12 },
  eyebrow: { color: colors.secondaryFixed, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.3 },
  title: { color: colors.white, fontFamily: fonts.heading, fontSize: 20, marginTop: 2 },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#66d98d' },
  adminBadgeText: { color: colors.white, fontFamily: fonts.bold, fontSize: 8, letterSpacing: 0.8 },
  tabs: { gap: 8, paddingHorizontal: 16, paddingTop: 14 },
  tab: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  activeTab: { backgroundColor: colors.secondaryFixed },
  tabText: { color: 'rgba(255,255,255,0.74)', fontFamily: fonts.bold, fontSize: 11 },
  activeTabText: { color: colors.primary },
  body: { flex: 1 },
});
