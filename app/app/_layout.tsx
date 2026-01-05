import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useGameStore } from '../stores/gameStore';
import { colors, typography } from '../constants/theme';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { onboarding } = useGameStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to let the store hydrate from AsyncStorage
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inOnboarding = segments[0] === 'onboarding';
    const hasCompletedOnboarding = onboarding.hasCompletedOnboarding;

    // If user hasn't completed onboarding and is not in onboarding flow, redirect
    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding/profile');
    }
    // If user has completed onboarding and is in onboarding flow, redirect to tabs
    else if (hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isReady, onboarding.hasCompletedOnboarding, segments]);

  // Show loading while checking onboarding status
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
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
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="course" options={{ headerShown: false }} />
        <Stack.Screen name="game" options={{ headerShown: false }} />
        <Stack.Screen
          name="vocab-game"
          options={{
            title: 'Vocabulary Practice',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="speed-game"
          options={{
            title: 'Speed Challenge',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}
