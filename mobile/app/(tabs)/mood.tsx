import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAppStore } from '@/stores/app-store';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadow } from '@/constants/theme';

const moodColorMap: Record<number, string> = {
  1: colors.mood.bad,
  2: colors.mood.low,
  3: colors.mood.neutral,
  4: colors.mood.good,
  5: colors.mood.great,
};

// Generate mock calendar data for current month
function generateCalendarData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

  const days: { day: number | null; score: number | null }[] = [];

  // Fill leading empty cells (Sun=0 start)
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ day: null, score: null });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isPast = d <= now.getDate();
    // Mock: random scores for past days, ~70% have data
    const hasData = isPast && Math.random() > 0.3;
    days.push({
      day: d,
      score: hasData ? Math.floor(Math.random() * 5) + 1 : null,
    });
  }

  return days;
}

const moods = [
  { score: 1, icon: 'emoticon-cry-outline' as const, label: 'とても悪い', color: colors.mood.bad },
  { score: 2, icon: 'emoticon-sad-outline' as const, label: '悪い', color: colors.mood.low },
  { score: 3, icon: 'emoticon-neutral-outline' as const, label: 'ふつう', color: colors.mood.neutral },
  { score: 4, icon: 'emoticon-happy-outline' as const, label: '良い', color: colors.mood.good },
  { score: 5, icon: 'emoticon-excited-outline' as const, label: 'とても良い', color: colors.mood.great },
];

const contextTags = [
  { id: 'work', label: '仕事', icon: 'briefcase-outline' as const },
  { id: 'relationship', label: '人間関係', icon: 'people-outline' as const },
  { id: 'health', label: '健康', icon: 'medkit-outline' as const },
  { id: 'weather', label: '天気', icon: 'partly-sunny-outline' as const },
  { id: 'sleep', label: '睡眠', icon: 'moon-outline' as const },
  { id: 'exercise', label: '運動', icon: 'fitness-outline' as const },
  { id: 'other', label: 'その他', icon: 'create-outline' as const },
];

function MoodButton({
  mood,
  selected,
  onPress,
}: {
  mood: { score: number; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; color: string };
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={() => {
          scale.value = withSpring(1.2, { damping: 8 }, () => {
            scale.value = withSpring(1);
          });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        style={[
          styles.moodButton,
          selected && { backgroundColor: mood.color + '20', borderColor: mood.color },
        ]}
      >
        <MaterialCommunityIcons name={mood.icon} size={36} color={selected ? mood.color : colors.neutral[400]} />
        <Text style={[styles.moodLabel, selected && { color: mood.color }]}>
          {mood.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function MoodScreen() {
  const plan = useAppStore((s) => s.plan);
  const isPro = plan === 'premium';
  const setTodayStatus = useAppStore((s) => s.setTodayStatus);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const calendarData = generateCalendarData();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (id: string) => {
    Haptics.selectionAsync();
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!selectedScore) return;
    setSubmitting(true);
    try {
      await api.post('/api/mood', {
        score: selectedScore,
        context: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTodayStatus({ mood: true });
      setSubmitted(true);
    } catch (e: any) {
      Alert.alert('エラー', e.message || '記録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMood = moods.find((m) => m.score === selectedScore);

  if (submitted) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={styles.successContent}
        >
          <View style={[styles.successIconWrap, { backgroundColor: (selectedMood?.color || colors.primary[500]) + '20' }]}>
            <MaterialCommunityIcons name={selectedMood?.icon || 'emoticon-happy-outline'} size={48} color={selectedMood?.color || colors.primary[500]} />
          </View>
          <Text style={styles.successTitle}>記録しました！</Text>
          <Text style={styles.successSubtitle}>
            今日の気分: {selectedMood?.label}
          </Text>
          <Pressable
            onPress={() => {
              setSubmitted(false);
              setSelectedScore(null);
              setSelectedTags([]);
            }}
            style={styles.resetButton}
          >
            <Text style={styles.resetButtonText}>もう一度記録する</Text>
          </Pressable>
        </MotiView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerArea}>
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <Text style={styles.title}>今の気分は？</Text>
          <Text style={styles.subtitle}>タップして今の気持ちを記録しましょう</Text>
        </MotiView>
      </View>

      <View style={styles.content}>
        {/* Mood Selector */}
        <AnimatedCard delay={100}>
          <View style={styles.moodRow}>
            {moods.map((mood) => (
              <MoodButton
                key={mood.score}
                mood={mood}
                selected={selectedScore === mood.score}
                onPress={() => setSelectedScore(mood.score)}
              />
            ))}
          </View>

          {selectedMood && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ type: 'timing', duration: 300 }}
            >
              <View
                style={[
                  styles.selectedBanner,
                  { backgroundColor: selectedMood.color + '15' },
                ]}
              >
                <View style={styles.selectedRow}>
                  <MaterialCommunityIcons name={selectedMood.icon} size={22} color={selectedMood.color} />
                  <Text style={[styles.selectedText, { color: selectedMood.color }]}>
                    {selectedMood.label}
                  </Text>
                </View>
              </View>
            </MotiView>
          )}
        </AnimatedCard>

        {/* Context Tags */}
        <AnimatedCard delay={200}>
          <Text style={styles.sectionTitle}>きっかけは？</Text>
          <View style={styles.tagsGrid}>
            {contextTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <Pressable
                  key={tag.id}
                  onPress={() => toggleTag(tag.id)}
                  style={[
                    styles.tag,
                    isSelected && styles.tagSelected,
                  ]}
                >
                  <Ionicons name={tag.icon} size={16} color={isSelected ? colors.primary[600] : colors.neutral[500]} />
                  <Text
                    style={[
                      styles.tagLabel,
                      isSelected && styles.tagLabelSelected,
                    ]}
                  >
                    {tag.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </AnimatedCard>

        {/* Submit */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
          style={styles.submitArea}
        >
          <GradientButton
            title={submitting ? '記録中...' : '記録する'}
            onPress={handleSubmit}
            variant="mood"
            disabled={!selectedScore || submitting}
          />
        </MotiView>

        {/* Monthly Mood Map - Pro Feature */}
        <AnimatedCard delay={500}>
          <View style={styles.calendarHeader}>
            <View style={styles.calendarTitleRow}>
              <Ionicons name="calendar" size={20} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>月間ムードマップ</Text>
            </View>
            {!isPro && (
              <View style={styles.proTag}>
                <Ionicons name="diamond" size={10} color={colors.white} />
                <Text style={styles.proTagText}>Pro</Text>
              </View>
            )}
          </View>

          {isPro ? (
            <View>
              {/* Day of week headers */}
              <View style={styles.calendarWeekRow}>
                {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
                  <Text key={d} style={styles.calendarWeekLabel}>{d}</Text>
                ))}
              </View>
              {/* Calendar grid */}
              <View style={styles.calendarGrid}>
                {calendarData.map((cell, i) => (
                  <View key={i} style={styles.calendarCell}>
                    {cell.day !== null ? (
                      <View
                        style={[
                          styles.calendarDot,
                          cell.score !== null
                            ? { backgroundColor: moodColorMap[cell.score] }
                            : { backgroundColor: colors.neutral[100] },
                        ]}
                      >
                        <Text style={[
                          styles.calendarDayText,
                          cell.score !== null && styles.calendarDayTextActive,
                        ]}>
                          {cell.day}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
              {/* Legend */}
              <View style={styles.calendarLegend}>
                {[
                  { label: 'とても悪い', color: colors.mood.bad },
                  { label: '悪い', color: colors.mood.low },
                  { label: 'ふつう', color: colors.mood.neutral },
                  { label: '良い', color: colors.mood.good },
                  { label: 'とても良い', color: colors.mood.great },
                ].map((item) => (
                  <View key={item.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => router.push('/pricing')}
              style={styles.lockedContent}
            >
              <LinearGradient
                colors={[colors.neutral[100], colors.neutral[50]]}
                style={styles.lockedGradient}
              >
                <Ionicons name="lock-closed" size={32} color={colors.neutral[400]} />
                <Text style={styles.lockedTitle}>Proプランで利用可能</Text>
                <Text style={styles.lockedSubtitle}>
                  月間カレンダーで気分の傾向を可視化
                </Text>
                <View style={styles.lockedButton}>
                  <Ionicons name="diamond" size={14} color={colors.primary[600]} />
                  <Text style={styles.lockedButtonText}>アップグレード</Text>
                </View>
              </LinearGradient>
            </Pressable>
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
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodIconWrap: {
    marginBottom: spacing.xs,
  },
  moodLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    fontWeight: fontWeight.medium,
  },
  selectedBanner: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectedText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[50],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    gap: spacing.xs,
  },
  tagSelected: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  tagIcon: {
    width: 16,
  },
  tagLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    fontWeight: fontWeight.medium,
  },
  tagLabelSelected: {
    color: colors.primary[700],
  },
  submitArea: {
    marginTop: spacing.sm,
  },
  // Success state
  successContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
    marginBottom: spacing.xl,
  },
  resetButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  resetButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary[700],
    fontWeight: fontWeight.semibold,
  },
  // Calendar
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  calendarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  proTagText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  calendarWeekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  calendarWeekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    color: colors.neutral[400],
    fontWeight: fontWeight.semibold,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  calendarDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayText: {
    fontSize: 11,
    color: colors.neutral[400],
    fontWeight: fontWeight.medium,
  },
  calendarDayTextActive: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 10,
    color: colors.neutral[500],
  },
  // Locked
  lockedContent: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  lockedGradient: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  lockedTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.neutral[600],
    marginTop: spacing.md,
  },
  lockedSubtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[400],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  lockedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginTop: spacing.md,
  },
  lockedButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary[600],
  },
});
