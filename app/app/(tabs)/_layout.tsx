import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography } from '../../constants/theme';

type IconName = 'dashboard' | 'bar-chart' | 'fitness-center';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, IconName> = {
    index: 'dashboard',
    progress: 'bar-chart',
    vocab: 'fitness-center',
  };

  return (
    <View style={styles.tabIconContainer}>
      <MaterialIcons
        name={icons[name] || 'dashboard'}
        size={24}
        color={focused ? colors.primary : colors.textSecondary}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.background,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: typography.semibold,
          fontSize: typography.sm,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Lessons',
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Stats',
          tabBarIcon: ({ focused }) => <TabIcon name="progress" focused={focused} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="vocab"
        options={{
          title: 'Exercise',
          tabBarIcon: ({ focused }) => <TabIcon name="vocab" focused={focused} />,
          headerShown: false,
        }}
      />
      {/* Hide screens from tabs */}
      <Tabs.Screen
        name="settings"
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
});
