import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, fonts } from '../theme';
import i18n from '../i18n';
import { setStoredValue } from '../storage';

export function LanguageSwitcher() {
  const language = i18n.language === 'en' ? 'en' : 'vi';
  const { t } = useTranslation();

  return (
    <Pressable
      style={styles.button}
      onPress={async () => {
        const next = language === 'vi' ? 'en' : 'vi';
        void i18n.changeLanguage(next);
        await setStoredValue('aoklevart_language', next);
      }}
      accessibilityLabel={language === 'vi' ? t('language.switchToEn') : t('language.switchToVi')}
    >
      <View style={styles.row}>
        <Text style={[styles.label, language === 'vi' && styles.active]}>VI</Text>
        <Text style={styles.divider}>/</Text>
        <Text style={[styles.label, language === 'en' && styles.active]}>EN</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  active: {
    color: colors.primary,
  },
  divider: {
    color: colors.outline,
    marginHorizontal: 6,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
});
