import { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { colors, borderRadius, spacing, shadow } from '@/constants/theme';

type Props = {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
};

export function AnimatedCard({ children, delay = 0, style }: Props) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 120,
        delay,
      }}
      style={[styles.card, style]}
    >
      {children}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadow.md,
  },
});
