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

import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpCenter'>;

export function HelpCenterScreen({ navigation }: Props) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Làm thế nào để hủy phòng?',
      a: 'Bạn có thể vào tab "Chuyến đi", chọn đặt phòng muốn hủy và nhấn nút "Hủy đặt phòng". Việc hủy phòng trước 24 giờ kể từ giờ check-in sẽ được hoàn tiền đầy đủ.',
    },
    {
      q: 'Phương thức thanh toán được hỗ trợ?',
      a: 'Chúng tôi hỗ trợ thanh toán qua thẻ ngân hàng, ví điện tử (MoMo, ZaloPay) và chuyển khoản Sandbox trực tiếp.',
    },
    {
      q: 'Tôi có thể thay đổi ngày đi không?',
      a: 'Để thay đổi thông tin đặt phòng như ngày nhận/trả phòng, vui lòng liên hệ bộ phận hỗ trợ khách hàng của chúng tôi để được tư vấn nhanh nhất.',
    },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Trung tâm trợ giúp</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionHeader}>Câu hỏi thường gặp (FAQ)</Text>
        
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

        <Text style={[styles.sectionHeader, { marginTop: 32 }]}>Kênh liên hệ hỗ trợ</Text>

        <Pressable 
          style={styles.contactCard} 
          onPress={() => Alert.alert('Hotline 24/7', 'Đang thực hiện cuộc gọi hỗ trợ đến 1900 1234...')}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="call" size={20} color={colors.primary} />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>Hotline Chăm sóc khách hàng</Text>
            <Text style={styles.contactValue}>1900 1234 (Miễn phí cuộc gọi)</Text>
          </View>
        </Pressable>

        <Pressable 
          style={styles.contactCard} 
          onPress={() => Alert.alert('Gửi Email', 'Mở ứng dụng thư điện tử để gửi email đến support@aoklevart.com...')}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="mail" size={20} color={colors.primary} />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>Gửi Email phản hồi</Text>
            <Text style={styles.contactValue}>support@aoklevart.com</Text>
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
