import { useState } from 'react';
import { 
  Alert, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpCenter'>;

export function HelpCenterScreen({ navigation }: Props) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { t } = useTranslation();

  const faqs = [
    {
      q: t('help.faqs.cancel'),
      a: t('help.faqs.cancelAnswer'),
    },
    {
      q: t('help.faqs.payment'),
      a: t('help.faqs.paymentAnswer'),
    },
    {
      q: t('help.faqs.dateChange'),
      a: t('help.faqs.dateChangeAnswer'),
    },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('help.header')}</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionHeader}>{t('help.faq')}</Text>
        
        {faqs.map((faq, index) => {
          const isExpanded = expandedFaq === index;
          return (
            <View key={index} style={styles.faqCard}>
              <Pressable 
                style={styles.faqHeader} 
                onPress={() => setExpandedFaq(isExpanded ? null : index)}
              >
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Ionicons 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={18} 
                  color={colors.primary} 
                />
              </Pressable>
              {isExpanded && (
                <View style={styles.faqAnswerContainer}>
                  <Text style={styles.faqAnswer}>{faq.a}</Text>
                </View>
              )}
            </View>
          );
        })}

        <Text style={[styles.sectionHeader, { marginTop: 32 }]}>{t('help.support')}</Text>

        <Pressable 
          style={styles.contactCard} 
          onPress={() => Alert.alert(t('help.hotlineTitle'), t('help.hotlineMessage'))}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="call" size={20} color={colors.primary} />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>{t('help.hotlineLabel')}</Text>
            <Text style={styles.contactValue}>{t('help.hotlineValue')}</Text>
          </View>
        </Pressable>

        <Pressable 
          style={styles.contactCard} 
          onPress={() => Alert.alert(t('help.emailTitle'), t('help.emailMessage'))}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="mail" size={20} color={colors.primary} />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>{t('help.emailLabel')}</Text>
            <Text style={styles.contactValue}>{t('help.emailValue')}</Text>
          </View>
        </Pressable>
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
  sectionHeader: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  faqCard: { borderBottomWidth: 1, borderBottomColor: colors.border },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  faqQuestion: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.text, paddingRight: 10 },
  faqAnswerContainer: { paddingBottom: 16, paddingHorizontal: 4 },
  faqAnswer: { fontFamily: fonts.body, fontSize: 13, color: colors.textSoft, lineHeight: 20 },
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, backgroundColor: colors.surfaceLow, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  contactIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  contactTextContainer: { flex: 1 },
  contactLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  contactValue: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary, marginTop: 1 },
});
