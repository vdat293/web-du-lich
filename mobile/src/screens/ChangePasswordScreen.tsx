import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { securityService } from '../api/services';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;

export function ChangePasswordScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t('security.passwordRequired'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('security.passwordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('security.passwordMismatch'));
      return;
    }
    if (currentPassword === newPassword) {
      setError(t('security.passwordMustChange'));
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await securityService.changePassword(currentPassword, newPassword);
      Alert.alert(t('security.passwordSuccessTitle'), t('security.passwordSuccessMessage'), [
        { text: t('common.close'), onPress: () => navigation.goBack() },
      ]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('security.passwordFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('security.changePassword')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="key-outline" size={30} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('security.passwordFormTitle')}</Text>
          <Text style={styles.description}>{t('security.passwordFormDescription')}</Text>

          <PasswordField
            label={t('security.currentPassword')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <PasswordField
            label={t('security.newPassword')}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <PasswordField
            label={t('security.confirmNewPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={submitting}
            style={[styles.submitButton, submitting && styles.disabled]}
            onPress={() => void submit()}
          >
            {submitting
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.submitText}>{t('security.updatePassword')}</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PasswordField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!visible}
          textContentType="password"
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          hitSlop={10}
          onPress={() => setVisible((current) => !current)}
        >
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  headerTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.primary },
  headerSpacer: { width: 44 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 30, paddingBottom: 40 },
  iconWrap: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', backgroundColor: colors.surfaceContainer },
  title: { color: colors.primary, fontFamily: fonts.heading, fontSize: 27, textAlign: 'center', marginTop: 18 },
  description: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8, marginBottom: 22 },
  fieldGroup: { marginTop: 14 },
  label: { color: colors.textSoft, fontFamily: fonts.medium, fontSize: 13, marginBottom: 7 },
  field: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surfaceLow, paddingHorizontal: 15 },
  input: { flex: 1, minHeight: 52, color: colors.text, fontFamily: fonts.body, fontSize: 15 },
  error: { color: colors.error, fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, marginTop: 14 },
  submitButton: { minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.primary, marginTop: 24 },
  submitText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
  disabled: { opacity: 0.6 },
});
