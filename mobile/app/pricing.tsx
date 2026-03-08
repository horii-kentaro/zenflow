import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/stores/app-store';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadow } from '@/constants/theme';

const freeFeatures = [
  { label: '気分記録', included: true },
  { label: 'セルフケアルーティン', included: true },
  { label: 'AIジャーナル（1日3回）', included: true },
  { label: '7日間の履歴', included: true },
  { label: '基本的な統計', included: true },
  { label: '月間カレンダー', included: false },
  { label: '30日間の履歴', included: false },
  { label: 'AIジャーナル無制限', included: false },
  { label: '詳細な分析レポート', included: false },
  { label: '優先サポート', included: false },
];

const proFeatures = [
  { label: '気分記録', included: true },
  { label: 'セルフケアルーティン', included: true },
  { label: 'AIジャーナル無制限', included: true },
  { label: '30日間の履歴', included: true },
  { label: '詳細な統計・分析', included: true },
  { label: '月間カレンダー', included: true },
  { label: '気分の傾向レポート', included: true },
  { label: 'データエクスポート', included: true },
  { label: '広告なし', included: true },
  { label: '優先サポート', included: true },
];

const faqs = [
  {
    q: 'いつでも解約できますか？',
    a: 'はい。いつでも解約可能で、期間終了まで引き続きProプランをご利用いただけます。',
  },
  {
    q: '無料トライアルはありますか？',
    a: 'Freeプランで基本機能をお試しいただけます。Proプランは初月から月額980円です。',
  },
  {
    q: '支払い方法は？',
    a: 'クレジットカード（Visa, Mastercard, AMEX）に対応しています。',
  },
  {
    q: 'データは引き継がれますか？',
    a: 'はい。FreeからProへのアップグレード時、全てのデータはそのまま引き継がれます。',
  },
  {
    q: 'AIジャーナルとは何ですか？',
    a: 'AIがあなたの気持ちに寄り添いながら対話形式で日記を書く機能です。Freeプランでは1日3回、Proプランでは無制限にご利用いただけます。',
  },
  {
    q: 'AIウィークリーレポートではどんなことがわかりますか？',
    a: '1週間の気分の推移、曜日ごとの傾向、きっかけタグとの相関分析、そしてAIによる具体的なアドバイスが毎週届きます。',
  },
  {
    q: 'セルフケアルーティンはどのくらいの時間がかかりますか？',
    a: '1回約5分で完了します。呼吸法・ストレッチ・マインドフルネスなど5種類から選べ、Proプランではあなたの気分に合わせたAIおすすめも表示されます。',
  },
  {
    q: '記録したデータは安全ですか？',
    a: 'はい。すべてのデータは暗号化して保管しており、第三者に共有されることはありません。詳しくはプライバシーポリシーをご確認ください。',
  },
  {
    q: 'このアプリは医療の代わりになりますか？',
    a: 'いいえ。Zenflowはセルフケアをサポートするツールであり、医療行為の代替ではありません。深刻な症状がある場合は専門の医療機関にご相談ください。',
  },
  {
    q: 'ProからFreeに戻した場合、データはどうなりますか？',
    a: 'データは全て保持されます。ただし、8日目以降の履歴閲覧やAIウィークリーレポートなどPro限定機能はご利用いただけなくなります。',
  },
];

export default function PricingScreen() {
  const plan = useAppStore((s) => s.plan);
  const isPro = plan === 'premium';

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Stripe決済フロー
    Alert.alert(
      'Proプランにアップグレード',
      '月額980円で全機能が使えるようになります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '購入する',
          onPress: () => {
            Alert.alert('準備中', 'Stripe決済の実装後にご利用いただけます。');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[600]} />
        </Pressable>
        <Text style={styles.headerTitle}>料金プラン</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Badge */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.currentPlanBadge}
        >
          <Ionicons
            name={isPro ? 'diamond' : 'leaf'}
            size={16}
            color={isPro ? colors.primary[700] : colors.neutral[600]}
          />
          <Text style={[styles.currentPlanText, isPro && styles.currentPlanTextPro]}>
            現在のプラン: {isPro ? 'Pro' : 'Free'}
          </Text>
        </MotiView>

        {/* Plan Cards */}
        <View style={styles.planCards}>
          {/* Free Plan */}
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 100 }}
            style={[styles.planCard, !isPro && styles.planCardActive]}
          >
            <Text style={styles.planName}>Free</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>¥0</Text>
              <Text style={styles.pricePeriod}>/月</Text>
            </View>
            <Text style={styles.planDescription}>基本機能で始めよう</Text>
            <View style={styles.featureList}>
              {freeFeatures.map((f) => (
                <View key={f.label} style={styles.featureRow}>
                  <Ionicons
                    name={f.included ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color={f.included ? colors.primary[500] : colors.neutral[300]}
                  />
                  <Text style={[styles.featureText, !f.included && styles.featureTextDisabled]}>
                    {f.label}
                  </Text>
                </View>
              ))}
            </View>
            {!isPro && (
              <View style={styles.currentTag}>
                <Text style={styles.currentTagText}>利用中</Text>
              </View>
            )}
          </MotiView>

          {/* Pro Plan */}
          <MotiView
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 200 }}
            style={[styles.planCard, styles.planCardPro, isPro && styles.planCardActive]}
          >
            <View style={styles.recommendBadge}>
              <Ionicons name="star" size={12} color={colors.white} />
              <Text style={styles.recommendText}>おすすめ</Text>
            </View>
            <Text style={[styles.planName, styles.planNamePro]}>Pro</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.priceAmount, styles.priceAmountPro]}>¥980</Text>
              <Text style={[styles.pricePeriod, styles.pricePeriodPro]}>/月</Text>
            </View>
            <Text style={[styles.planDescription, styles.planDescriptionPro]}>
              全機能を使いこなそう
            </Text>
            <View style={styles.featureList}>
              {proFeatures.map((f) => (
                <View key={f.label} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary[400]} />
                  <Text style={[styles.featureText, styles.featureTextPro]}>
                    {f.label}
                  </Text>
                </View>
              ))}
            </View>
            {isPro ? (
              <View style={styles.currentTag}>
                <Text style={styles.currentTagText}>利用中</Text>
              </View>
            ) : (
              <Pressable onPress={handleUpgrade} style={styles.upgradeButtonInCard}>
                <LinearGradient
                  colors={[colors.primary[500], colors.primary[700]]}
                  style={styles.upgradeGradient}
                >
                  <Ionicons name="diamond" size={16} color={colors.white} />
                  <Text style={styles.upgradeButtonText}>アップグレード</Text>
                </LinearGradient>
              </Pressable>
            )}
          </MotiView>
        </View>

        {/* Upgrade CTA (if Free) */}
        {!isPro && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
          >
            <Pressable onPress={handleUpgrade}>
              <LinearGradient
                colors={[colors.primary[500], colors.primary[700]]}
                style={styles.ctaButton}
              >
                <Ionicons name="diamond" size={20} color={colors.white} />
                <Text style={styles.ctaText}>Proにアップグレード - ¥980/月</Text>
              </LinearGradient>
            </Pressable>
          </MotiView>
        )}

        {/* FAQ */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500 }}
        >
          <Text style={styles.faqTitle}>よくある質問</Text>
          <View style={styles.faqCard}>
            {faqs.map((faq, i) => (
              <View
                key={i}
                style={[styles.faqItem, i < faqs.length - 1 && styles.faqItemBorder]}
              >
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="help-circle-outline" size={18} color={colors.primary[500]} />
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                </View>
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              </View>
            ))}
          </View>
        </MotiView>
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
  currentPlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  currentPlanText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[600],
  },
  currentPlanTextPro: {
    color: colors.primary[700],
  },
  planCards: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    ...shadow.sm,
  },
  planCardPro: {
    backgroundColor: colors.primary[900],
    borderColor: colors.primary[700],
  },
  planCardActive: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  recommendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  recommendText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  planName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
  },
  planNamePro: {
    color: colors.white,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: fontWeight.extrabold,
    color: colors.neutral[900],
  },
  priceAmountPro: {
    color: colors.white,
  },
  pricePeriod: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
    marginLeft: 2,
  },
  pricePeriodPro: {
    color: colors.primary[300],
  },
  planDescription: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  planDescriptionPro: {
    color: colors.primary[300],
  },
  featureList: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: fontSize.sm,
    color: colors.neutral[700],
  },
  featureTextDisabled: {
    color: colors.neutral[400],
  },
  featureTextPro: {
    color: colors.primary[100],
  },
  currentTag: {
    alignSelf: 'center',
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  currentTagText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  upgradeButtonInCard: {
    marginTop: spacing.md,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  upgradeButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadow.md,
  },
  ctaText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  faqTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadow.sm,
  },
  faqItem: {
    padding: spacing.md,
  },
  faqItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  faqQuestion: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[800],
  },
  faqAnswer: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    lineHeight: 20,
    paddingLeft: 26,
  },
});
