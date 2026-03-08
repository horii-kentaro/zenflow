import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';

const sections = [
  {
    title: '第1条（適用）',
    body: '本利用規約（以下「本規約」）は、Zenflow（以下「本アプリ」）の利用に関する条件を定めるものです。ユーザーは本アプリを利用することにより、本規約に同意したものとみなされます。',
  },
  {
    title: '第2条（アカウント）',
    body: 'ユーザーは正確な情報を提供してアカウントを作成する必要があります。アカウント情報の管理はユーザーの責任とし、第三者への譲渡・貸与は禁止します。',
  },
  {
    title: '第3条（サービス内容）',
    body: '本アプリは以下のサービスを提供します：\n\n・気分トラッキング機能\n・AIを活用したセルフケアルーティン\n・AIジャーナリング（対話型日記）\n・メンタルヘルスの可視化\n\nサービス内容は予告なく変更・追加される場合があります。',
  },
  {
    title: '第4条（料金プラン）',
    body: '本アプリはフリーミアムモデルを採用しています。\n\n・Freeプラン：基本機能を無料で利用可能\n・Proプラン：月額980円で全機能を利用可能\n\nProプランは自動更新となります。解約はいつでも可能で、期間終了まで引き続きご利用いただけます。',
  },
  {
    title: '第5条（禁止事項）',
    body: 'ユーザーは以下の行為を行ってはなりません：\n\n・不正アクセスまたはサービスへの妨害行為\n・他のユーザーへの迷惑行為\n・本アプリの逆コンパイル、リバースエンジニアリング\n・法令または公序良俗に反する行為\n・虚偽の情報を登録する行為',
  },
  {
    title: '第6条（免責事項）',
    body: '本アプリは医療行為の代替となるものではありません。深刻な精神的健康上の問題がある場合は、専門の医療機関にご相談ください。\n\n本アプリの利用により生じたいかなる損害についても、当社は責任を負いかねます。',
  },
  {
    title: '第7条（退会）',
    body: 'ユーザーはいつでも退会することができます。退会時には、保存されたデータは当社のプライバシーポリシーに従い処理されます。',
  },
  {
    title: '第8条（規約の変更）',
    body: '当社は必要に応じて本規約を変更することがあります。変更後の規約は、アプリ内での通知をもって効力を生じるものとします。\n\n最終更新日：2026年3月1日',
  },
];

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[600]} />
        </Pressable>
        <Text style={styles.headerTitle}>利用規約</Text>
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
