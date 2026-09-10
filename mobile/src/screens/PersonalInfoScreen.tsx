import { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Image,
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  View 
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

import { userService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalInfo'>;

export function PersonalInfoScreen({ navigation }: Props) {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>();

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || '');
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const chooseAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('personalInfo.photoPermissionTitle'), t('personalInfo.photoPermissionMessage'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.72,
      base64: true,
    });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset?.base64) return;
    setAvatarPreview(asset.uri);
    setAvatarBase64(`data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      setUpdateError(t('personalInfo.requiredName'));
      return;
    }
    setIsUpdating(true);
    setUpdateError('');
    try {
      const response = await userService.updateProfile({
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        avatarBase64,
      });
      await updateUser(response.user);
      Alert.alert(t('personalInfo.successTitle'), t('personalInfo.successMessage'));
      navigation.goBack();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : t('personalInfo.error'));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('personalInfo.title')}</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('personalInfo.changePhoto')} style={styles.avatarCircle} onPress={() => void chooseAvatar()}>
            {avatarPreview ? <Image source={{ uri: avatarPreview }} style={styles.avatarImage} /> : <Text style={styles.avatarLetter}>{user?.name.charAt(0).toUpperCase()}</Text>}
            <View style={styles.avatarEdit}><Ionicons name="camera" size={15} color={colors.white} /></View>
          </Pressable>
          <Text style={styles.changePhoto}>{t('personalInfo.changePhoto')}</Text>
          <Text style={styles.avatarRole}>{user?.role.toUpperCase()}</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.fieldLabelContainer}>
            <Text style={styles.fieldLabel}>{t('personalInfo.name')}</Text>
          </View>
          <View style={styles.field}>
            <Ionicons name="person-outline" size={19} color={colors.textMuted} />
            <TextInput
              placeholder={t('personalInfo.name')}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
            />
          </View>

          <View style={styles.fieldLabelContainer}>
            <Text style={styles.fieldLabel}>{t('personalInfo.phone')}</Text>
          </View>
          <View style={styles.field}>
            <Ionicons name="call-outline" size={19} color={colors.textMuted} />
            <TextInput
              placeholder={t('personalInfo.phone')}
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              style={styles.input}
              value={editPhone}
              onChangeText={setEditPhone}
            />
          </View>

          <View style={styles.fieldLabelContainer}>
            <Text style={styles.fieldLabel}>{t('personalInfo.email')}</Text>
          </View>
          <View style={[styles.field, styles.disabledField]}>
            <Ionicons name="mail-outline" size={19} color={colors.outline} />
            <TextInput
              editable={false}
              style={[styles.input, styles.disabledInput]}
              value={user?.email}
            />
            <Ionicons name="lock-closed" size={16} color={colors.outline} />
          </View>

          {updateError ? <Text style={styles.errorText}>{updateError}</Text> : null}

          <Pressable 
            disabled={isUpdating} 
            style={[styles.updateButton, isUpdating && styles.disabledButton]} 
            onPress={handleUpdateProfile}
          >
            {isUpdating ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.updateButtonText}>{t('personalInfo.save')}</Text>
            )}
          </Pressable>
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
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.surfaceContainer },
  avatarImage: { width: 82, height: 82, borderRadius: 41 },
  avatarEdit: { position: 'absolute', right: -3, bottom: 1, width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary, borderWidth: 2, borderColor: colors.surface },
  avatarLetter: { color: colors.white, fontFamily: fonts.display, fontSize: 36 },
  changePhoto: { color: colors.secondary, fontFamily: fonts.bold, fontSize: 11, marginTop: 8 },
  avatarRole: { fontFamily: fonts.bold, fontSize: 10, color: colors.secondary, letterSpacing: 1.5, marginTop: 8 },
  formContainer: { width: '100%' },
  fieldLabelContainer: { marginTop: 12, marginBottom: 6 },
  fieldLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSoft },
  field: { height: 54, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceLow, borderRadius: 14, paddingHorizontal: 16 },
  disabledField: { backgroundColor: colors.surfaceContainer, borderColor: colors.border },
  input: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 15 },
  disabledInput: { color: colors.textMuted },
  errorText: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginTop: 10, textAlign: 'center' },
  updateButton: { height: 54, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 14, marginTop: 28 },
  disabledButton: { backgroundColor: colors.textMuted, opacity: 0.7 },
  updateButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },
});
