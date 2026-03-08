import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAppStore } from '@/stores/app-store';
import { api } from '@/lib/api';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadow } from '@/constants/theme';

type HistoryEntry = {
  type: string;
  title: string;
  durationSec: number;
  completedAt: string;
};

const routineTypes = [
  { id: 'random', label: 'おまかせ', icon: 'shuffle' as const, color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'breathing', label: '呼吸法', icon: 'cloud' as const, color: colors.primary[600], bg: colors.primary[50] },
  { id: 'stretch', label: 'ストレッチ', icon: 'body' as const, color: '#f59e0b', bg: '#fffbeb' },
  { id: 'mindfulness', label: 'マインドフルネス', icon: 'eye' as const, color: '#3b82f6', bg: '#eff6ff' },
  { id: 'bodyscan', label: 'ボディスキャン', icon: 'man' as const, color: '#ec4899', bg: '#fdf2f8' },
];

type Routine = {
  type: string;
  title: string;
  description: string;
  durationMin: number;
  steps: string[];
};

type TimerState = 'idle' | 'loading' | 'running' | 'paused' | 'completed';

export default function SelfcareScreen() {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const plan = useAppStore((s) => s.plan);
  const isPro = plan === 'premium';
  const setTodayStatus = useAppStore((s) => s.setTodayStatus);

  // Breathing animation
  const breathScale = useSharedValue(1);
  const breathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.get<{ history: HistoryEntry[] }>('/api/selfcare/history?days=7');
      setHistory(data.history || []);
    } catch {
      // silently fail
    }
  };

  const startRoutine = async (typeId: string) => {
    setTimerState('loading');
    try {
      const type = typeId === 'random' ? undefined : typeId;
      const data = await api.get<Routine>(`/api/selfcare${type ? `?type=${type}` : ''}`);
      setRoutine(data);
      setCurrentStep(0);
      setElapsed(0);
      setTimerState('running');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Start breathing animation
      breathScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
    } catch (e: any) {
      Alert.alert('エラー', e.message || 'ルーティンの取得に失敗しました');
      setTimerState('idle');
    }
  };

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState]);

  const handleComplete = async () => {
    setTimerState('completed');
    breathScale.value = withTiming(1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTodayStatus({ selfcare: true });

    try {
      await api.post('/api/selfcare/complete', {
        routineType: routine?.type || 'breathing',
        routineTitle: routine?.title || 'セルフケア',
        durationSec: elapsed,
      });
      fetchHistory();
    } catch {
      // silently fail - still show completion
    }
  };

  const resetTimer = () => {
    setTimerState('idle');
    setRoutine(null);
    setCurrentStep(0);
    setElapsed(0);
    breathScale.value = withTiming(1);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Timer / Active screen
  if (timerState === 'loading') {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>ルーティンを準備中...</Text>
      </View>
    );
  }

  if (timerState === 'completed') {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={styles.completedContent}
        >
          <View style={styles.completedIconWrap}>
            <Ionicons name="trophy" size={48} color="#f59e0b" />
          </View>
          <Text style={styles.completedTitle}>お疲れさまでした！</Text>
          <Text style={styles.completedSubtitle}>
            {routine?.title} - {formatTime(elapsed)}
          </Text>
          <GradientButton
            title="戻る"
            onPress={resetTimer}
            variant="primary"
          />
        </MotiView>
      </View>
    );
  }

  if (timerState === 'running' || timerState === 'paused') {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.timerHeader}>
          <Pressable onPress={resetTimer} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.neutral[600]} />
          </Pressable>
          <Text style={styles.timerTitle}>{routine?.title}</Text>
        </View>

        {/* Breathing circle */}
        <Animated.View style={[styles.breathCircle, breathStyle]}>
          <Text style={styles.breathTimer}>{formatTime(elapsed)}</Text>
          <Text style={styles.breathLabel}>
            {timerState === 'paused' ? '一時停止中' : '深く呼吸して'}
          </Text>
        </Animated.View>

        {/* Steps */}
        {routine && (
          <View style={styles.stepsContainer}>
            <Text style={styles.stepIndicator}>
              ステップ {currentStep + 1} / {routine.steps.length}
            </Text>
            <Text style={styles.stepText}>{routine.steps[currentStep]}</Text>
            <View style={styles.stepDots}>
              {routine.steps.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.stepDot,
                    i === currentStep && styles.stepDotActive,
                    i < currentStep && styles.stepDotDone,
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Controls */}
        <View style={styles.timerControls}>
          {currentStep > 0 && (
            <Pressable
              onPress={() => setCurrentStep((p) => p - 1)}
              style={styles.controlButton}
            >
              <Ionicons name="chevron-back" size={24} color={colors.neutral[600]} />
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (timerState === 'running') {
                setTimerState('paused');
                breathScale.value = withTiming(1);
              } else {
                setTimerState('running');
                breathScale.value = withRepeat(
                  withSequence(
                    withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
                  ),
                  -1
                );
              }
            }}
            style={styles.playPauseButton}
          >
            <Ionicons
              name={timerState === 'running' ? 'pause' : 'play'}
              size={32}
              color={colors.white}
            />
          </Pressable>

          {routine && currentStep < routine.steps.length - 1 ? (
            <Pressable
              onPress={() => setCurrentStep((p) => p + 1)}
              style={styles.controlButton}
            >
              <Ionicons name="chevron-forward" size={24} color={colors.neutral[600]} />
            </Pressable>
          ) : (
            <Pressable onPress={handleComplete} style={styles.completeButton}>
              <Ionicons name="checkmark" size={24} color={colors.white} />
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  // Idle - routine selection
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerArea}>
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <Text style={styles.title}>セルフケア</Text>
          <Text style={styles.subtitle}>5分間のルーティンで心身を整えましょう</Text>
        </MotiView>
      </View>

      <View style={styles.content}>
        {/* AI Personalized Recommendation - Pro */}
        {isPro ? (
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 50 }}
          >
            <Pressable
              onPress={() => startRoutine('breathing')}
              style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
            >
              <LinearGradient
                colors={[colors.primary[500], colors.primary[700]]}
                style={styles.aiRecommendCard}
              >
                <View style={styles.aiRecommendHeader}>
                  <View style={styles.aiRecommendBadge}>
                    <Ionicons name="sparkles" size={12} color={colors.white} />
                    <Text style={styles.aiRecommendBadgeText}>AIおすすめ</Text>
                  </View>
                </View>
                <Text style={styles.aiRecommendTitle}>呼吸法 - 4-7-8リラックス</Text>
                <Text style={styles.aiRecommendReason}>
                  最近の気分データから、リラックス系のルーティンが効果的です
                </Text>
                <View style={styles.aiRecommendAction}>
                  <Text style={styles.aiRecommendActionText}>今すぐ始める</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.white} />
                </View>
              </LinearGradient>
            </Pressable>
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 50 }}
          >
            <Pressable
              onPress={() => router.push('/pricing')}
              style={({ pressed }) => [
                styles.aiLockedCard,
                pressed && { opacity: 0.9 },
              ]}
            >
              <View style={styles.aiLockedRow}>
                <Ionicons name="sparkles" size={20} color={colors.neutral[400]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiLockedTitle}>AIパーソナライズ提案</Text>
                  <Text style={styles.aiLockedSubtitle}>Proであなた専用のおすすめを表示</Text>
                </View>
                <View style={styles.aiLockedProTag}>
                  <Ionicons name="diamond" size={10} color={colors.white} />
                  <Text style={styles.aiLockedProText}>Pro</Text>
                </View>
              </View>
            </Pressable>
          </MotiView>
        )}

        <AnimatedCard delay={100}>
          <Text style={styles.sectionTitle}>ルーティンを選ぶ</Text>
          <View style={styles.routineGrid}>
            {routineTypes.map((routine, i) => (
              <MotiView
                key={routine.id}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 15, delay: 200 + i * 80 }}
              >
                <Pressable
                  onPress={() => startRoutine(routine.id)}
                  style={({ pressed }) => [
                    styles.routineCard,
                    { backgroundColor: routine.bg },
                    pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <View style={[styles.routineIcon, { backgroundColor: routine.color }]}>
                    <Ionicons name={routine.icon} size={24} color={colors.white} />
                  </View>
                  <Text style={styles.routineLabel}>{routine.label}</Text>
                </Pressable>
              </MotiView>
            ))}
          </View>
        </AnimatedCard>

        <AnimatedCard delay={500}>
          <Text style={styles.sectionTitle}>最近の記録</Text>
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={colors.neutral[300]} />
              <Text style={styles.emptyText}>まだ記録がありません</Text>
              <Text style={styles.emptySubtext}>上からルーティンを選んで始めましょう</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {history.slice(0, 5).map((entry, i) => (
                <View key={i} style={[styles.historyItem, i < Math.min(history.length, 5) - 1 && styles.historyItemBorder]}>
                  <View style={styles.historyIconWrap}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary[500]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>{entry.title}</Text>
                    <Text style={styles.historyMeta}>
                      {Math.floor(entry.durationSec / 60)}分{entry.durationSec % 60}秒
                      {' '}・{' '}
                      {new Date(entry.completedAt).toLocaleDateString('ja-JP')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerArea: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  routineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  routineCard: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 95,
    ...shadow.sm,
  },
  routineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  routineLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.neutral[400],
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  historyList: {
    gap: 0,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  historyIconWrap: {
    width: 32,
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[800],
  },
  historyMeta: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    marginTop: 2,
  },
  // AI Recommend
  aiRecommendCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.md,
  },
  aiRecommendHeader: {
    marginBottom: spacing.sm,
  },
  aiRecommendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  aiRecommendBadgeText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  aiRecommendTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  aiRecommendReason: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  aiRecommendAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-end',
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  aiRecommendActionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  // AI Locked
  aiLockedCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
  },
  aiLockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  aiLockedTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[600],
  },
  aiLockedSubtitle: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    marginTop: 2,
  },
  aiLockedProTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  aiLockedProText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  // Loading
  loadingText: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
    marginTop: spacing.md,
  },
  // Timer
  timerHeader: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  timerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
    textAlign: 'center',
    marginRight: 40,
  },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary[300],
  },
  breathTimer: {
    fontSize: 36,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  breathLabel: {
    fontSize: fontSize.sm,
    color: colors.primary[500],
    marginTop: spacing.xs,
  },
  stepsContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  stepIndicator: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    marginBottom: spacing.sm,
  },
  stepText: {
    fontSize: fontSize.md,
    color: colors.neutral[700],
    textAlign: 'center',
    lineHeight: 24,
  },
  stepDots: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[200],
  },
  stepDotActive: {
    backgroundColor: colors.primary[500],
    width: 24,
  },
  stepDotDone: {
    backgroundColor: colors.primary[300],
  },
  // Controls
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.md,
  },
  completeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.mood.great,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Completed
  completedContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  completedIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  completedTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  completedSubtitle: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
    marginBottom: spacing.xl,
  },
});
