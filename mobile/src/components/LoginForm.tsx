import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../context/AuthContext';
import { colors, fonts } from '../theme';

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!identifier.trim() || !password) {
      setError(t('login.required'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await login(identifier.trim(), password);
      onSuccess?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('login.failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View>
      <View style={styles.field}>
        <Ionicons name="person-outline" size={19} color={colors.textMuted} />
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder={t('login.identifier')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={identifier}
          onChangeText={setIdentifier}
        />
      </View>
      <View style={styles.field}>
        <Ionicons name="lock-closed-outline" size={19} color={colors.textMuted} />
        <TextInput
          autoCapitalize="none"
          placeholder={t('login.password')}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <Pressable onPress={() => setSecure((value) => !value)}>
          <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable disabled={submitting} style={styles.button} onPress={submit}>
        {submitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>{t('login.submit')}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 15 },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginBottom: 12 },
  button: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    marginTop: 4,
  },
  buttonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },
});
