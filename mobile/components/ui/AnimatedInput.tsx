import { useState } from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, borderRadius, fontSize, spacing } from '@/constants/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function AnimatedInput({ label, error, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusAnim.value,
      [0, 1],
      [colors.neutral[200], colors.primary[500]]
    ),
    borderWidth: 1.5,
  }));

  const handleFocus = () => {
    setFocused(true);
    focusAnim.value = withSpring(1, { damping: 15 });
  };

  const handleBlur = () => {
    setFocused(false);
    focusAnim.value = withSpring(0, { damping: 15 });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, focused && styles.labelFocused]}>
        {label}
      </Text>
      <AnimatedView style={[styles.inputWrapper, borderStyle]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.neutral[400]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </AnimatedView>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  labelFocused: {
    color: colors.primary[600],
  },
  inputWrapper: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  input: {
    fontSize: fontSize.md,
    color: colors.neutral[900],
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.mood.bad,
    marginTop: spacing.xs,
  },
});
