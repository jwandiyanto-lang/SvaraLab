import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore, LEVEL_XP_REQUIREMENTS, Level } from '../../stores/gameStore';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

const LEVELS: Level[] = ['beginner', 'elementary', 'intermediate', 'advanced'];

export default function ProgressScreen() {
  const { stats, getNextLevelProgress, getUnlockedLevels } = useGameStore();
  const progress = getNextLevelProgress();
  const unlockedLevels = getUnlockedLevels();

  const accuracy = stats.totalAnswers > 0
    ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* XP Overview */}
        <View style={styles.xpCard}>
          <View style={styles.xpIconBg}>
            <Text style={styles.xpEmoji}>⭐</Text>
          </View>
          <Text style={styles.totalXP}>{stats.totalXP}</Text>
          <Text style={styles.xpLabel}>Total XP</Text>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Next Level</Text>
              <Text style={styles.progressPercent}>
                {Math.round(progress.percentage)}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.max(5, progress.percentage)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressDetail}>
              {progress.required > stats.totalXP
                ? `${progress.required - stats.totalXP} XP to unlock`
                : 'All levels unlocked!'}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📚</Text>
            <Text style={styles.statValue}>{stats.wordsLearned}</Text>
            <Text style={styles.statLabel}>Words Learned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎮</Text>
            <Text style={styles.statValue}>{stats.totalGamesPlayed}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Level Unlocks */}
        <Text style={styles.sectionTitle}>Levels</Text>
        <View style={styles.levelsCard}>
          {LEVELS.map((level, index) => {
            const isUnlocked = unlockedLevels.includes(level);
            const xpRequired = LEVEL_XP_REQUIREMENTS[level];
            const isLast = index === LEVELS.length - 1;

            return (
              <View
                key={level}
                style={[styles.levelRow, !isLast && styles.levelRowBorder]}
              >
                <View style={[
                  styles.levelIcon,
                  isUnlocked ? styles.levelIconUnlocked : styles.levelIconLocked
                ]}>
                  <Text style={styles.levelIconText}>
                    {isUnlocked ? '✓' : '🔒'}
                  </Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelName, !isUnlocked && styles.textMuted]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                  <Text style={styles.levelXP}>
                    {xpRequired} XP required
                  </Text>
                </View>
                {isUnlocked && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>Unlocked</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Achievements placeholder */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsCard}>
          <View style={styles.achievementIconBg}>
            <Text style={styles.achievementEmoji}>🏆</Text>
          </View>
          <Text style={styles.achievementTitle}>Coming Soon</Text>
          <Text style={styles.achievementText}>
            Achievements will be available in a future update
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
  },
  xpCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadows.md,
  },
  xpIconBg: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.warning + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  xpEmoji: {
    fontSize: 32,
  },
  totalXP: {
    fontSize: 48,
    fontWeight: typography.bold,
    color: colors.warning,
  },
  xpLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  progressSection: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  progressPercent: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressDetail: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  levelsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    ...shadows.sm,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  levelRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  levelIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  levelIconUnlocked: {
    backgroundColor: colors.success + '15',
  },
  levelIconLocked: {
    backgroundColor: colors.cardAlt,
  },
  levelIconText: {
    fontSize: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  levelXP: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  textMuted: {
    color: colors.textMuted,
  },
  checkBadge: {
    backgroundColor: colors.success + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  checkText: {
    fontSize: typography.xs,
    color: colors.success,
    fontWeight: typography.medium,
  },
  achievementsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.sm,
  },
  achievementIconBg: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  achievementEmoji: {
    fontSize: 32,
    opacity: 0.5,
  },
  achievementTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  achievementText: {
    fontSize: typography.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
