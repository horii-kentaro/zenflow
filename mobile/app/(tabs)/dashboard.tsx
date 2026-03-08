import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { useDashboard } from '@/hooks/useDashboard';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadow } from '@/constants/theme';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'おはようございます';
  if (hour < 18) return 'こんにちは';
  return 'こんばんは';
}

function getDateString(): string {
  const now = new Date();
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${now.getMonth() + 1}月${now.getDate()}日（${days[now.getDay()]}）`;
}

// Daily motivational messages - rotates by day of year
const dailyMessages = [
  { text: '深呼吸から始めましょう。今日も良い一日に。', icon: 'cloud-outline' as const },
  { text: '小さな一歩が大きな変化につながります。', icon: 'footsteps-outline' as const },
  { text: '自分を大切にすることは、誰かのためにもなります。', icon: 'heart-outline' as const },
  { text: '完璧でなくていい。今の自分を認めてあげて。', icon: 'star-outline' as const },
  { text: '昨日より少しだけ前に進めたら十分です。', icon: 'trending-up-outline' as const },
  { text: '水を飲んで、空を見上げてみてください。', icon: 'water-outline' as const },
  { text: 'あなたのペースで大丈夫。焦らなくていいよ。', icon: 'timer-outline' as const },
  { text: '気持ちを書き出すだけで、心が軽くなります。', icon: 'create-outline' as const },
  { text: '今この瞬間を感じてみてください。', icon: 'eye-outline' as const },
  { text: '休むことも、前に進むこと。', icon: 'moon-outline' as const },
  { text: 'あなたは十分頑張っています。', icon: 'sparkles-outline' as const },
  { text: '笑顔は最高のセルフケア。', icon: 'happy-outline' as const },
  { text: '5分のケアが、1日を変えます。', icon: 'leaf-outline' as const },
  { text: '感謝できることを1つ見つけてみて。', icon: 'gift-outline' as const },
];

function getTodayMessage() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dailyMessages[dayOfYear % dailyMessages.length];
}

// Mock weekly mood data (will be replaced by real API data)
function getWeeklyMoodData() {
  const days = ['月', '火', '水', '木', '金', '土', '日'];
  const today = new Date().getDay();
  // Show some mock data for demo - in production this comes from API
  return days.map((label, i) => {
    const dayIndex = (today - 6 + i + 7) % 7;
    // Past days have random scores, future days are null
    const isPast = i < 6;
    return {
      label,
      score: isPast ? Math.floor(Math.random() * 3) + 2 : null, // 2-4 range for demo
      isToday: i === 6,
    };
  });
}

const moodColors: Record<number, string> = {
  1: colors.mood.bad,
  2: colors.mood.low,
  3: colors.mood.neutral,
  4: colors.mood.good,
  5: colors.mood.great,
};

const quickActions = [
  {
    label: '気分を記録',
    icon: 'happy' as const,
    color: colors.mood.great,
    bg: '#f0fdf4',
    route: '/(tabs)/mood' as const,
    statusKey: 'mood' as const,
  },
  {
    label: 'セルフケア',
    icon: 'leaf' as const,
    color: colors.primary[600],
    bg: colors.primary[50],
    route: '/(tabs)/selfcare' as const,
    statusKey: 'selfcare' as const,
  },
  {
    label: 'AI日記',
    icon: 'chatbubble' as const,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    route: '/(tabs)/journal' as const,
    statusKey: 'journal' as const,
  },
];

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const plan = useAppStore((s) => s.plan);
  const setTodayStatus = useAppStore((s) => s.setTodayStatus);
  const isPro = plan === 'premium';
  const { todayStatus, streak, loading } = useDashboard();
  const todayMessage = getTodayMessage();
  const weeklyData = getWeeklyMoodData();

  // Sync todayStatus to app store for tab badges
  useEffect(() => {
    setTodayStatus(todayStatus);
  }, [todayStatus]);

  const progressItems = [
    { label: '気分記録', done: todayStatus.mood, icon: 'happy-outline' as const },
    { label: 'セルフケア', done: todayStatus.selfcare, icon: 'leaf-outline' as const },
    { label: 'ジャーナル', done: todayStatus.journal, icon: 'chatbubble-outline' as const },
  ];

  const milestones = [7, 14, 30, 60, 100];
  const nextMilestone = milestones.find((m) => m > streak.currentStreak) || 100;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.primary[600], colors.primary[700]]}
        style={styles.header}
      >
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name || 'ユーザー'}さん</Text>
          <Text style={styles.date}>{getDateString()}</Text>
        </MotiView>
      </LinearGradient>

      <View style={styles.content}>
        {/* Today's Message */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 50 }}
        >
          <View style={styles.messageCard}>
            <Ionicons name={todayMessage.icon} size={20} color={colors.primary[500]} />
            <Text style={styles.messageText}>{todayMessage.text}</Text>
          </View>
        </MotiView>

        {/* Today's Progress */}
        <AnimatedCard delay={100}>
          <Text style={styles.sectionTitle}>今日の進捗</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary[500]} style={{ paddingVertical: spacing.lg }} />
          ) : (
            <View style={styles.progressRow}>
              {progressItems.map((item, i) => (
                <View key={i} style={styles.progressItem}>
                  <View
                    style={[
                      styles.progressCircle,
                      item.done && styles.progressCircleDone,
                    ]}
                  >
                    <Ionicons
                      name={item.done ? 'checkmark' : item.icon}
                      size={20}
                      color={item.done ? colors.white : colors.neutral[400]}
                    />
                  </View>
                  <Text style={[styles.progressLabel, item.done && styles.progressLabelDone]}>
                    {item.label}
                  </Text>
                  {item.done && (
                    <Text style={styles.progressDoneTag}>完了</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </AnimatedCard>

        {/* Quick Actions with completed state */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 300 }}
        >
          <Text style={styles.sectionTitleOutside}>クイックアクション</Text>
        </MotiView>

        <View style={styles.actionsRow}>
          {quickActions.map((action, i) => {
            const isDone = todayStatus[action.statusKey];
            return (
              <MotiView
                key={action.label}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', damping: 15, delay: 400 + i * 100 }}
                style={styles.actionWrapper}
              >
                <Pressable
                  onPress={() => router.push(action.route)}
                  style={({ pressed }) => [
                    styles.actionCard,
                    { backgroundColor: isDone ? '#f0fdf4' : action.bg },
                    pressed && styles.actionPressed,
                  ]}
                >
                  {isDone ? (
                    <View style={[styles.actionIcon, { backgroundColor: colors.mood.great }]}>
                      <Ionicons name="checkmark" size={22} color={colors.white} />
                    </View>
                  ) : (
                    <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                      <Ionicons name={action.icon} size={22} color={colors.white} />
                    </View>
                  )}
                  <Text style={[styles.actionLabel, isDone && styles.actionLabelDone]}>
                    {isDone ? `${action.label} ✓` : action.label}
                  </Text>
                </Pressable>
              </MotiView>
            );
          })}
        </View>

        {/* Weekly Mood Mini Chart */}
        <AnimatedCard delay={600} style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>今週の気分</Text>
            <Pressable onPress={() => router.push('/(tabs)/mood')}>
              <Text style={styles.chartLink}>詳細</Text>
            </Pressable>
          </View>
          <View style={styles.chartContainer}>
            {weeklyData.map((day, i) => (
              <View key={i} style={styles.chartBar}>
                <View style={styles.chartBarTrack}>
                  {day.score !== null ? (
                    <View
                      style={[
                        styles.chartBarFill,
                        {
                          height: `${(day.score / 5) * 100}%`,
                          backgroundColor: moodColors[day.score] || colors.neutral[300],
                        },
                      ]}
                    />
                  ) : (
                    <View style={styles.chartBarEmpty}>
                      <Ionicons name="remove" size={12} color={colors.neutral[300]} />
                    </View>
                  )}
                </View>
                <Text style={[styles.chartLabel, day.isToday && styles.chartLabelToday]}>
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
        </AnimatedCard>

        {/* AI Weekly Report - Pro Feature */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 650 }}
        >
          <Pressable
            onPress={() => {
              if (isPro) {
                router.push('/weekly-report');
              } else {
                router.push('/pricing');
              }
            }}
            style={({ pressed }) => [
              styles.reportCard,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
          >
            <LinearGradient
              colors={isPro ? [colors.primary[600], colors.primary[800]] : [colors.neutral[600], colors.neutral[800]]}
              style={styles.reportGradient}
            >
              <View style={styles.reportLeft}>
                <View style={styles.reportIconWrap}>
                  <Ionicons name="sparkles" size={22} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reportTitle}>AIウィークリーレポート</Text>
                  <Text style={styles.reportSubtitle}>
                    {isPro
                      ? 'AIがあなたの1週間を分析しました'
                      : 'Proにアップグレードで利用可能'}
                  </Text>
                </View>
              </View>
              <View style={styles.reportRight}>
                {isPro ? (
                  <Ionicons name="chevron-forward" size={20} color={colors.primary[300]} />
                ) : (
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={12} color={colors.white} />
                  </View>
                )}
              </View>
            </LinearGradient>
          </Pressable>
        </MotiView>

        {/* Streak */}
        <AnimatedCard delay={700} style={styles.streakCard}>
          <View style={styles.streakRow}>
            <View style={styles.streakIconWrap}>
              <Ionicons
                name={streak.currentStreak >= 7 ? 'flame' : 'sparkles'}
                size={28}
                color="#f59e0b"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakCount}>
                {streak.currentStreak}日連続
              </Text>
              <Text style={styles.streakLabel}>
                {streak.currentStreak === 0
                  ? '今日の活動を記録して連続記録を始めよう'
                  : `次のマイルストーン: ${nextMilestone}日`}
              </Text>
              {streak.currentStreak > 0 && (
                <View style={styles.streakProgress}>
                  <View
                    style={[
                      styles.streakProgressBar,
                      { width: `${Math.min((streak.currentStreak / nextMilestone) * 100, 100)}%` },
                    ]}
                  />
                </View>
              )}
            </View>
          </View>
        </AnimatedCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  greeting: {
    fontSize: fontSize.md,
    color: colors.primary[200],
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.white,
    marginTop: 2,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.primary[300],
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    marginTop: -spacing.md,
  },
  // Today's message
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginBottom: spacing.md,
  },
  messageText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.primary[700],
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  sectionTitleOutside: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressCircleDone: {
    backgroundColor: colors.primary[500],
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  progressLabelDone: {
    color: colors.primary[600],
    fontWeight: fontWeight.semibold,
  },
  progressDoneTag: {
    fontSize: 10,
    color: colors.mood.great,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionWrapper: {
    flex: 1,
  },
  actionCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.sm,
  },
  actionPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[700],
  },
  actionLabelDone: {
    color: colors.mood.great,
  },
  // Chart
  chartCard: {
    marginTop: spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartLink: {
    fontSize: fontSize.sm,
    color: colors.primary[600],
    fontWeight: fontWeight.semibold,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarTrack: {
    width: 24,
    height: 60,
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 12,
  },
  chartBarEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartLabel: {
    fontSize: 10,
    color: colors.neutral[400],
    marginTop: 4,
  },
  chartLabelToday: {
    color: colors.primary[600],
    fontWeight: fontWeight.bold,
  },
  // Report
  reportCard: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadow.md,
  },
  reportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  reportLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  reportIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  reportSubtitle: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  reportRight: {
    marginLeft: spacing.sm,
  },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Streak
  streakCard: {
    marginTop: spacing.md,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  streakIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakCount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
  },
  streakLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },
  streakProgress: {
    height: 4,
    backgroundColor: '#fef3c7',
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  streakProgressBar: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 2,
  },
});
