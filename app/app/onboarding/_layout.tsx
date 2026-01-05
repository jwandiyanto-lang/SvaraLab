import { Stack } from 'expo-router';
import { colors, typography } from '../../constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: typography.semibold,
          fontSize: typography.sm,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    />
  );
}
