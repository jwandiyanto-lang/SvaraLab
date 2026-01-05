import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

export default function SituationGameScreen() {
  const router = useRouter();
  const { level } = useLocalSearchParams<{ level: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Svara 4: Situasi',
          headerBackTitle: 'Kembali',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.content}>
          <View style={styles.iconBg}>
            <Text style={styles.emoji}>🎭</Text>
          </View>
          <Text style={styles.title}>Svara 4: Situasi</Text>
          <Text style={styles.subtitle}>Segera Hadir</Text>
          <Text style={styles.description}>
            Praktik skenario profesional dan sosial dunia nyata.
            {'\n\n'}
            Berlatih menjadi banker, customer service, atau navigasi
            situasi kehidupan sehari-hari dalam bahasa Inggris.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.checkBg}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <Text style={styles.featureText}>Professional scenarios</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.checkBg}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <Text style={styles.featureText}>Daily life situations</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.checkBg}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <Text style={styles.featureText}>Social interactions</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.checkBg}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <Text style={styles.featureText}>Extended speaking time</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back to Levels</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  iconBg: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.situation + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.situation,
    fontWeight: typography.semibold,
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  featureList: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xxl,
    ...shadows.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkBg: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkIcon: {
    fontSize: 12,
    color: colors.success,
    fontWeight: typography.bold,
  },
  featureText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
  },
  backButton: {
    backgroundColor: colors.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: typography.base,
    fontWeight: typography.medium,
  },
});
