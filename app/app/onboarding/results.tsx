import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useGameStore, Level } from '../../stores/gameStore';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

const LEVEL_INFO: Record<Level, { title: string; description: string; color: string; bgColor: string }> = {
  beginner: {
    title: 'Beginner',
    description: 'You\'re starting your English journey. We\'ll focus on basic phrases and common expressions.',
    color: colors.repeat,
    bgColor: colors.repeatBg,
  },
  elementary: {
    title: 'Elementary',
    description: 'You have basic understanding. We\'ll build on common phrases and introduce more complex sentences.',
    color: colors.listen,
    bgColor: colors.listenBg,
  },
  intermediate: {
    title: 'Intermediate',
    description: 'You can handle most situations. We\'ll focus on fluency, idioms, and natural expressions.',
    color: colors.respond,
    bgColor: colors.respondBg,
  },
  advanced: {
    title: 'Advanced',
    description: 'You\'re highly proficient. We\'ll polish your accent and work on professional contexts.',
    color: colors.situation,
    bgColor: colors.situationBg,
  },
};

export default function ResultsScreen() {
  const router = useRouter();
  const { onboarding, profile, completeOnboarding } = useGameStore();
  const result = onboarding.placementTestResult;

  if (!result) {
    router.replace('/onboarding/placement-test');
    return null;
  }

  const levelInfo = LEVEL_INFO[result.overallLevel];
  const avgScore = Math.round((result.grammarScore + result.listeningScore + result.speakingScore) / 3);

  const handleContinue = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.celebrationIcon}>
              <MaterialIcons name="emoji-events" size={48} color={levelInfo.color} />
            </View>
            <Text style={styles.title}>Assessment Complete!</Text>
            <Text style={styles.subtitle}>
              Great job, {profile.name || 'Learner'}! Here's your personalized learning path.
            </Text>
          </View>

          {/* Level Result Card */}
          <View style={[styles.levelCard, { borderColor: levelInfo.color }]}>
            <View style={[styles.levelBadge, { backgroundColor: levelInfo.bgColor }]}>
              <Text style={[styles.levelBadgeText, { color: levelInfo.color }]}>Your Level</Text>
            </View>
            <Text style={styles.levelTitle}>{levelInfo.title}</Text>
            <Text style={styles.levelDescription}>{levelInfo.description}</Text>

            {/* Score Breakdown */}
            <View style={styles.scoresContainer}>
              <View style={styles.scoreItem}>
                <View style={[styles.scoreIcon, { backgroundColor: colors.respondBg }]}>
                  <MaterialIcons name="edit-note" size={16} color={colors.respond} />
                </View>
                <Text style={styles.scoreLabel}>Grammar</Text>
                <Text style={styles.scoreValue}>{result.grammarScore}%</Text>
              </View>

              <View style={styles.scoreItem}>
                <View style={[styles.scoreIcon, { backgroundColor: colors.repeatBg }]}>
                  <MaterialIcons name="headphones" size={16} color={colors.repeat} />
                </View>
                <Text style={styles.scoreLabel}>Listening</Text>
                <Text style={styles.scoreValue}>{result.listeningScore}%</Text>
              </View>

              <View style={styles.scoreItem}>
                <View style={[styles.scoreIcon, { backgroundColor: colors.listenBg }]}>
                  <MaterialIcons name="mic" size={16} color={colors.listen} />
                </View>
                <Text style={styles.scoreLabel}>Speaking</Text>
                <Text style={styles.scoreValue}>{result.speakingScore}%</Text>
              </View>
            </View>

            {/* Overall Score */}
            <View style={styles.overallScore}>
              <Text style={styles.overallLabel}>Overall Score</Text>
              <Text style={[styles.overallValue, { color: levelInfo.color }]}>{avgScore}%</Text>
            </View>
          </View>

          {/* What's Next */}
          <View style={styles.nextSection}>
            <Text style={styles.nextTitle}>What's Next?</Text>

            <View style={styles.nextCard}>
              <View style={styles.nextIcon}>
                <MaterialIcons name="school" size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.nextContent}>
                <Text style={styles.nextCardTitle}>Personalized Curriculum</Text>
                <Text style={styles.nextCardText}>
                  We've customized lessons based on your {levelInfo.title.toLowerCase()} level.
                </Text>
              </View>
            </View>

            <View style={styles.nextCard}>
              <View style={styles.nextIcon}>
                <MaterialIcons name="trending-up" size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.nextContent}>
                <Text style={styles.nextCardTitle}>Track Progress</Text>
                <Text style={styles.nextCardText}>
                  Earn XP, unlock levels, and watch your speaking confidence grow.
                </Text>
              </View>
            </View>

            <View style={styles.nextCard}>
              <View style={styles.nextIcon}>
                <MaterialIcons name="schedule" size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.nextContent}>
                <Text style={styles.nextCardTitle}>Daily Practice</Text>
                <Text style={styles.nextCardText}>
                  Just {profile.dailyCommitment} minutes a day to reach your goals.
                </Text>
              </View>
            </View>
          </View>

          {/* Projected Timeline */}
          <View style={styles.projectionCard}>
            <View style={styles.projectionHeader}>
              <View style={styles.projectionIcon}>
                <MaterialIcons name="auto-awesome" size={14} color={colors.textLight} />
              </View>
              <Text style={styles.projectionLabel}>Your Journey</Text>
            </View>
            <Text style={styles.projectionText}>
              Based on your profile and commitment, you could reach{' '}
              <Text style={styles.projectionBold}>
                {result.overallLevel === 'advanced' ? 'native-like fluency' : 'the next level'}
              </Text>{' '}
              in about{' '}
              <Text style={styles.projectionBold}>
                {result.overallLevel === 'beginner' ? '3 months' :
                 result.overallLevel === 'elementary' ? '2 months' : '1 month'}
              </Text>
              .
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.startText}>Start Learning</Text>
            <MaterialIcons name="arrow-forward" size={18} color={colors.textLight} />
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 120,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  celebrationIcon: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.notion,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  levelCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    ...shadows.notion,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: typography.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelTitle: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  levelDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  scoresContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  scoreItem: {
    flex: 1,
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  scoreIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: typography.medium,
    marginBottom: spacing.xs,
  },
  scoreValue: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  overallScore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  overallLabel: {
    fontSize: typography.base,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  overallValue: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
  },
  nextSection: {
    marginBottom: spacing.xxl,
  },
  nextTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  nextIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextContent: {
    flex: 1,
  },
  nextCardTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  nextCardText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  projectionCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  projectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    opacity: 0.9,
  },
  projectionIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 4,
    borderRadius: borderRadius.full,
  },
  projectionLabel: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projectionText: {
    fontSize: typography.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
  projectionBold: {
    fontWeight: typography.bold,
    color: colors.textLight,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  startText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textLight,
  },
});
