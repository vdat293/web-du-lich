import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { API_BASE_URL } from '../api/client';
import { LoginForm } from '../components/LoginForm';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { AuthPlaceholder } from '../components/AuthPlaceholder';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  if (!user) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.unauthHeader}>
          <Text style={styles.eyebrow}>{t('profile.account')}</Text>
          <LanguageSwitcher />
        </View>
        <AuthPlaceholder
          icon="person-outline"
          title={t('nav.profile')}
          message={t('profile.loginMessage')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{t('profile.account')}</Text>
        <Text style={styles.title}>{t('profile.profileTitle')}</Text>
        <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>
        <View style={styles.languageRow}>
          <Text style={styles.languageLabel}>{t('profile.language')}</Text>
          <LanguageSwitcher />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text></View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {user.phone ? <Text style={styles.phone}>{user.phone}</Text> : null}
          <View style={styles.role}><Text style={styles.roleText}>{user.role}</Text></View>
        </View>
        <View style={styles.menuCard}>
          <MenuItem 
            icon="person-outline" 
            label={t('profile.personalInfo')} 
            onPress={() => navigation.navigate('PersonalInfo')} 
          />
          <MenuItem 
            icon="shield-checkmark-outline" 
            label={t('profile.security')} 
            onPress={() => navigation.navigate('Security')} 
          />
          <MenuItem 
            icon="help-circle-outline" 
            label={t('profile.helpCenter')} 
            onPress={() => navigation.navigate('HelpCenter')} 
            last 
          />
        </View>
        <Pressable style={styles.logoutButton} onPress={() => void logout()}>
          <Ionicons name="log-out-outline" size={19} color={colors.error} />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </Pressable>

        <View style={styles.serverInfo}>
          <Ionicons name="server-outline" size={16} color={colors.textMuted} />
          <Text style={styles.serverText} numberOfLines={1}>API: {API_BASE_URL}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ 
  icon, 
  label, 
  onPress, 
  badge, 
  last 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  label: string; 
  onPress?: () => void; 
  badge?: number; 
  last?: boolean 
}) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.menuItem, 
        last && styles.lastMenuItem,
        pressed && { backgroundColor: colors.surfaceContainer }
      ]}
      onPress={onPress}
    >
      <View style={styles.menuIcon}><Ionicons name={icon} size={20} color={colors.primary} /></View>
      <Text style={styles.menuLabel}>{label}</Text>
      {badge ? (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={colors.outline} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 105 },
  unauthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 22, paddingBottom: 10 },
  eyebrow: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.4 },
  title: { color: colors.primary, fontFamily: fonts.display, fontSize: 32, marginTop: 5 },
  subtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 24 },
  profileCard: { alignItems: 'center', borderRadius: 22, backgroundColor: colors.primary, padding: 26 },
  avatar: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondaryFixed, borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)' },
  avatarText: { color: colors.primary, fontFamily: fonts.display, fontSize: 30 },
  name: { color: colors.white, fontFamily: fonts.heading, fontSize: 25, marginTop: 14 },
  email: { color: 'rgba(255,255,255,0.72)', fontFamily: fonts.body, fontSize: 13, marginTop: 3 },
  phone: { color: 'rgba(255,255,255,0.72)', fontFamily: fonts.body, fontSize: 12, marginTop: 3 },
  role: { borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 5, marginTop: 13 },
  roleText: { color: colors.secondaryFixed, fontFamily: fonts.bold, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 },
  menuCard: { overflow: 'hidden', borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginTop: 18 },
  menuItem: { minHeight: 64, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 14 },
  lastMenuItem: { borderBottomWidth: 0 },
  menuIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer },
  menuLabel: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 13, paddingLeft: 12 },
  logoutButton: { height: 54, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 15, borderWidth: 1, borderColor: '#f2c8c5', backgroundColor: '#fff7f6', marginTop: 18 },
  logoutText: { color: colors.error, fontFamily: fonts.bold, fontSize: 13 },
  languageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  languageLabel: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase' },
  serverInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 24 },
  serverText: { maxWidth: '85%', color: colors.textMuted, fontFamily: fonts.body, fontSize: 10 },
  badgeContainer: { backgroundColor: colors.error, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8, minWidth: 20, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.white, fontFamily: fonts.bold, fontSize: 10 },
});
