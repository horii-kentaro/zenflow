import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, FlatList } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAppStore } from '@/stores/app-store';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: 'leaf' as const,
    iconType: 'ionicons' as const,
    color: colors.primary[500],
    bg: colors.primary[100],
    title: '毎日5分のセルフケア',
    description: '呼吸法・ストレッチ・マインドフルネスなど\nあなたに合ったルーティンをAIが提案します',
  },
  {
    icon: 'emoticon-happy-outline' as const,
    iconType: 'material' as const,
    color: '#f59e0b',
    bg: '#fef3c7',
    title: '気分を見える化',
    description: '毎日の気分を記録して変化を把握\n週間チャートで傾向がわかります',
  },
  {
    icon: 'chatbubble' as const,
    iconType: 'ionicons' as const,
    color: '#8b5cf6',
    bg: '#ede9fe',
    title: 'AIジャーナル',
    description: 'AIと対話しながら気持ちを整理\nあなたの心に寄り添います',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    await SecureStore.setItemAsync('onboarding_done', 'true');
    setOnboardingDone(true);
    router.replace('/(tabs)/dashboard');
  };

  return (
    <View style={styles.container}>
      <View style={styles.skipArea}>
        {currentIndex < slides.length - 1 && (
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>スキップ</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <MotiView
              from={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                {item.iconType === 'material' ? (
                  <MaterialCommunityIcons name={item.icon as any} size={64} color={item.color} />
                ) : (
                  <Ionicons name={item.icon as any} size={64} color={item.color} />
                )}
              </View>
            </MotiView>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDescription}>{item.description}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Button */}
      <Pressable onPress={handleNext} style={styles.nextButtonWrap}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[700]]}
          style={styles.nextButton}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? 'はじめる' : '次へ'}
          </Text>
          <Ionicons
            name={currentIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
            size={20}
            color={colors.white}
          />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  skipArea: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    alignItems: 'flex-end',
    height: 90,
  },
  skipButton: {
    padding: spacing.sm,
  },
  skipText: {
    fontSize: fontSize.md,
    color: colors.neutral[400],
    fontWeight: fontWeight.medium,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  slideTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideDescription: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[200],
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary[500],
  },
  nextButtonWrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 48,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  nextButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
