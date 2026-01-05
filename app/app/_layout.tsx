import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
