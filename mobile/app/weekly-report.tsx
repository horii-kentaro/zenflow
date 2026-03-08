import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadow } from '@/constants/theme';

// Mock AI analysis data - in production, fetched from API
const mockReport = {
  period: '3/2 - 3/8',
  avgMood: 3.6,
  moodTrend: 'up' as const,
  totalRecords: 6,
  selfcareCount: 4,
  journalCount: 3,
  insights: [
    {
      icon: 'trending-up' as const,
      title: '気分が上昇傾向です',
      body: '先週と比べて平均気分スコアが0.4ポイント上昇しています。セルフケアの習慣が効果を発揮しているようです。',
      color: colors.mood.great,
    },
    {
      icon: 'moon-outline' as const,
      title: '水曜日に気分が下がりやすい傾向',
      body: '過去3週間のデータから、水曜日に気分スコアが低くなる傾向が見られます。週の中日にリフレッシュの時間を取ることをおすすめします。',
      color: colors.mood.low,
    },
    {
      icon: 'fitness-outline' as const,
      title: '運動と気分の相関',
      body: '「運動」タグを付けた日は、平均スコアが4.2と高い傾向にあります。体を動かすことが気分改善に役立っているようです。',
      color: colors.primary[500],
    },
  ],
  recommendation: '今週は呼吸法を中心にセルフケアを行い、水曜日には少し長めの休憩を取ってみましょう。また、運動の習慣を続けることで、安定した気分を維持できるでしょう。',
  weeklyMood: [
    { day: '月', score: 3 },
    { day: '火', score: 4 },
    { day: '水', score: 2 },
    { day: '木', score: 3 },
    { day: '金', score: 4 },
    { day: '土', score: 5 },
    { day: '日', score: null },
  ],
};

const moodColors: Record<number, string> = {
  1: colors.mood.bad,
  2: colors.mood.low,
  3: colors.mood.neutral,
  4: colors.mood.good,
  5: colors.mood.great,
};

const moodLabels: Record<number, string> = {
  1: 'とても悪い',
  2: '悪い',
  3: 'ふつう',
  4: '良い',
  5: 'とても良い',
};

export default function WeeklyReportScreen() {
  const avgMoodColor = moodColors[Math.round(mockReport.avgMood)] || colors.neutral[400];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary[700], colors.primary[900]]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={styles.proBadge}>
              <Ionicons name="diamond" size={12} color={colors.white} />
              <Text style={styles.proBadgeText}>Pro</Text>
            </View>
            <Text style={styles.headerTitle}>AIウィークリーレポート</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerPeriod}>{mockReport.period}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <MaterialCommunityIcons
                name="emoticon-happy-outline"
                size={28}
                color={avgMoodColor}
              />
              <Text style={styles.summaryValue}>{mockReport.avgMood.toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>平均気分</Text>
              <View style={[styles.trendBadge, { backgroundColor: colors.mood.great + '20' }]}>
                <Ionicons name="trending-up" size={14} color={colors.mood.great} />
                <Text style={[styles.trendText, { color: colors.mood.great }]}>+0.4</Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Ionicons name="calendar-outline" size={28} color={colors.primary[500]} />
              <Text style={styles.summaryValue}>{mockReport.totalRecords}</Text>
              <Text style={styles.summaryLabel}>記録日数</Text>
              <Text style={styles.summarySubLabel}>/ 7日</Text>
            </View>

            <View style={styles.summaryCard}>
              <Ionicons name="leaf" size={28} color={colors.primary[600]} />
              <Text style={styles.summaryValue}>{mockReport.selfcareCount}</Text>
              <Text style={styles.summaryLabel}>セルフケア</Text>
              <Text style={styles.summarySubLabel}>回実施</Text>
            </View>
          </View>
        </MotiView>

        {/* Weekly Chart */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>今週の気分推移</Text>
          <View style={styles.chartContainer}>
            {mockReport.weeklyMood.map((day, i) => (
              <View key={i} style={styles.chartBar}>
                <View style={styles.chartBarTrack}>
                  {day.score !== null ? (
                    <View
                      style={[
                        styles.chartBarFill,
                        {
                          height: `${(day.score / 5) * 100}%`,
                          backgroundColor: moodColors[day.score],
                        },
                      ]}
                    />
                  ) : (
                    <View style={styles.chartBarEmpty}>
                      <Ionicons name="remove" size={12} color={colors.neutral[300]} />
                    </View>
                  )}
                </View>
                <Text style={styles.chartDayLabel}>{day.day}</Text>
                {day.score !== null && (
                  <Text style={[styles.chartScoreLabel, { color: moodColors[day.score] }]}>
                    {day.score}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </MotiView>

        {/* AI Insights */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
        >
          <View style={styles.insightsHeader}>
            <Ionicons name="sparkles" size={20} color={colors.primary[500]} />
            <Text style={styles.cardTitle}>AIの分析</Text>
          </View>

          {mockReport.insights.map((insight, i) => (
            <MotiView
              key={i}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 400 + i * 100 }}
              style={styles.insightCard}
            >
              <View style={[styles.insightIconWrap, { backgroundColor: insight.color + '15' }]}>
                <Ionicons name={insight.icon} size={22} color={insight.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightBody}>{insight.body}</Text>
              </View>
            </MotiView>
          ))}
        </MotiView>

        {/* AI Recommendation */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 700 }}
          style={styles.recommendCard}
        >
          <LinearGradient
            colors={[colors.primary[50], colors.primary[100]]}
            style={styles.recommendGradient}
          >
            <View style={styles.recommendHeader}>
              <Ionicons name="bulb-outline" size={22} color={colors.primary[600]} />
              <Text style={styles.recommendTitle}>今週のアドバイス</Text>
            </View>
            <Text style={styles.recommendBody}>{mockReport.recommendation}</Text>
          </LinearGradient>
        </MotiView>

        {/* Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 800 }}
          style={styles.footer}
        >
          <Ionicons name="sparkles" size={16} color={colors.primary[400]} />
          <Text style={styles.footerText}>
            Claude AIによる分析 - 毎週月曜日に更新
          </Text>
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
    paddingTop: 56,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: spacing.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  headerPeriod: {
    fontSize: fontSize.sm,
    color: colors.primary[300],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  // Summary
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.sm,
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    color: colors.neutral[900],
    marginTop: spacing.xs,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    marginTop: 2,
  },
  summarySubLabel: {
    fontSize: 10,
    color: colors.neutral[400],
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  trendText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  // Chart
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarTrack: {
    width: 28,
    height: 70,
    backgroundColor: colors.neutral[100],
    borderRadius: 14,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 14,
  },
  chartBarEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartDayLabel: {
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 4,
  },
  chartScoreLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },
  // Insights
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadow.sm,
  },
  insightIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  insightBody: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    lineHeight: 20,
  },
  // Recommendation
  recommendCard: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadow.sm,
  },
  recommendGradient: {
    padding: spacing.lg,
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  recommendTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  recommendBody: {
    fontSize: fontSize.sm,
    color: colors.primary[800],
    lineHeight: 22,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
  },
});
