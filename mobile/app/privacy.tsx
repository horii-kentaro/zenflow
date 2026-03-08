import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';

const sections = [
  {
    title: '1. はじめに',
    body: 'Zenflow（以下「本アプリ」）は、お客様のプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーは、本アプリがどのような情報を収集し、どのように利用・保護するかについて説明します。',
  },
  {
    title: '2. 収集する情報',
    body: '本アプリでは以下の情報を収集します：\n\n・アカウント情報（メールアドレス、表示名）\n・気分記録データ（スコア、コンテキスト、日付）\n・セルフケア実施記録（種類、所要時間）\n・ジャーナルデータ（AIとの対話内容）\n・利用状況データ（アクセス頻度、機能利用状況）',
  },
  {
    title: '3. 情報の利用目的',
    body: '収集した情報は以下の目的で利用します：\n\n・サービスの提供と改善\n・パーソナライズされたセルフケアの提案\n・利用状況の分析と統計\n・お客様へのサポート対応',
  },
  {
    title: '4. 情報の共有',
    body: '本アプリは、お客様の個人情報を第三者に販売、貸出、共有することはありません。ただし、以下の場合を除きます：\n\n・お客様の同意がある場合\n・法令に基づく場合\n・サービス提供に必要な業務委託先への提供',
  },
  {
    title: '5. データの保管と保護',
    body: 'お客様のデータは暗号化された安全なサーバーに保管されます。業界標準のセキュリティ対策を実施し、不正アクセス、漏洩、改ざんからデータを保護します。',
  },
  {
    title: '6. データの削除',
    body: 'お客様はいつでもアカウントの削除を申請できます。アカウント削除時には、関連する全てのデータが30日以内に完全に削除されます。',
  },
  {
    title: '7. お問い合わせ',
    body: 'プライバシーに関するご質問やご要望は、アプリ内の設定画面またはメール（support@zenflow.app）よりお問い合わせください。',
  },
  {
    title: '8. ポリシーの変更',
    body: '本ポリシーは必要に応じて更新されることがあります。重要な変更がある場合は、アプリ内で通知いたします。\n\n最終更新日：2026年3月1日',
  },
];

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[600]} />
        </Pressable>
        <Text style={styles.headerTitle}>プライバシーポリシー</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.sm,
  },
  sectionBody: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    lineHeight: 22,
  },
});
