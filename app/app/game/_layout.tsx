import { Stack } from 'expo-router';
import { colors, typography } from '../../constants/theme';

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: typography.semibold,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        presentation: 'modal',
      }}
    />
  );
}
