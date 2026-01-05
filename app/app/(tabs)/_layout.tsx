import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../constants/theme';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: '🏠',
    progress: '📊',
    settings: '⚙️',
  };

  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {icons[name] || '📱'}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: typography.xs,
          fontWeight: typography.medium,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: typography.bold,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => <TabIcon name="progress" focused={focused} />,
          headerTitle: 'Your Progress',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
          headerTitle: 'Settings',
        }}
      />
      {/* Hide old screens from tabs */}
      <Tabs.Screen
        name="vocab"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="speed"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
});
