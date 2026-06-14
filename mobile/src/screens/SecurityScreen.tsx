import { useState } from 'react';
import { 
  Alert, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Switch, 
  Text, 
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Security'>;

export function SecurityScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Bảo mật tài khoản</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.securityScoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.securityTitle}>Độ bảo mật tài khoản</Text>
            <View style={styles.safeBadge}>
              <Text style={styles.safeBadgeText}>AN TOÀN</Text>
            </View>
          </View>
          <Text style={styles.securityDesc}>
            Tài khoản của bạn đã được bảo vệ tối đa với các phương thức xác thực chuẩn.
          </Text>
        </View>

        <View style={styles.settingSection}>
          <Text style={styles.sectionHeader}>Phương thức đăng nhập</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Đăng nhập sinh trắc học</Text>
              <Text style={styles.settingSublabel}>Sử dụng FaceID/Vân tay để đăng nhập nhanh</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: colors.outline, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Xác thực 2 yếu tố (2FA)</Text>
              <Text style={styles.settingSublabel}>Yêu cầu OTP gửi về điện thoại khi đăng nhập</Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: colors.outline, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.settingSection}>
          <Text style={styles.sectionHeader}>Thông tin đăng nhập</Text>
          
          <Pressable 
            style={styles.actionRow} 
            onPress={() => Alert.alert('Đổi mật khẩu', 'Một email hướng dẫn đổi mật khẩu đã được gửi đến email đăng ký của bạn.')}
          >
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Thay đổi mật khẩu</Text>
              <Text style={styles.settingSublabel}>Đã cập nhật cách đây 30 ngày</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
          </Pressable>
          
          <View style={[styles.actionRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Email đăng ký</Text>
              <Text style={styles.settingSublabel}>{user?.email}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.verifiedText}>Đã xác minh</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.primary },
  placeholderButton: { width: 40 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  securityScoreCard: { padding: 18, borderRadius: 16, backgroundColor: colors.primary, marginBottom: 24 },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  securityTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
  safeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.success },
  safeBadgeText: { fontFamily: fonts.bold, fontSize: 9, color: colors.white, letterSpacing: 1 },
  securityDesc: { fontFamily: fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 18 },
  settingSection: { marginBottom: 26 },
  sectionHeader: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  settingTextContainer: { flex: 1, paddingRight: 15 },
  settingLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  settingSublabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontFamily: fonts.bold, fontSize: 12, color: colors.success },
});
