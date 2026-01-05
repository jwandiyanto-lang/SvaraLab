import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
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

  // Mock weekly data
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = [45, 30, 60, 0, 15, 0, 0]; // minutes practiced each day

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Your Progress</Text>
          <Text style={styles.pageSubtitle}>Track your English speaking journey</Text>
        </View>

        {/* XP Overview Card */}
        <View style={styles.xpCard}>
          <View style={styles.xpContent}>
            <View>
              <Text style={styles.xpLabel}>Total XP</Text>
              <Text style={styles.totalXP}>{stats.totalXP.toLocaleString()}</Text>
            </View>
            <View style={styles.xpIconBg}>
              <MaterialIcons name="star" size={28} color={colors.warning} />
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Next Level Progress</Text>
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
                ? `${progress.required - stats.totalXP} XP to unlock next level`
                : 'All levels unlocked!'}
            </Text>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Activity</Text>
            <Text style={styles.sectionBadge}>This week</Text>
          </View>
          <View style={styles.weeklyCard}>
            <View style={styles.weeklyChart}>
              {weekDays.map((day, index) => {
                const height = weeklyData[index] > 0 ? (weeklyData[index] / 60) * 100 : 4;
                const isActive = weeklyData[index] > 0;
                const isToday = index === 3;

                return (
                  <View key={day} style={styles.chartColumn}>
                    <View style={styles.chartBarContainer}>
                      <View
                        style={[
                          styles.chartBar,
                          { height: `${height}%` },
                          isActive ? styles.chartBarActive : styles.chartBarInactive,
                        ]}
                      />
                    </View>
                    <Text style={[
                      styles.chartLabel,
                      isToday && styles.chartLabelToday
                    ]}>
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.weeklyStats}>
              <View style={styles.weeklyStatItem}>
                <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
                <Text style={styles.weeklyStatValue}>2h 30m</Text>
                <Text style={styles.weeklyStatLabel}>Total Time</Text>
              </View>
              <View style={styles.weeklyStatItem}>
                <MaterialIcons name="local-fire-department" size={16} color={colors.repeat} />
                <Text style={styles.weeklyStatValue}>3</Text>
                <Text style={styles.weeklyStatLabel}>Active Days</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: colors.listenBg }]}>
                <MaterialIcons name="menu-book" size={20} color={colors.listen} />
              </View>
              <Text style={styles.statValue}>{stats.wordsLearned}</Text>
              <Text style={styles.statLabel}>Words Learned</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: colors.respondBg }]}>
                <MaterialIcons name="play-circle" size={20} color={colors.respond} />
              </View>
              <Text style={styles.statValue}>{stats.totalGamesPlayed}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: colors.repeatBg }]}>
                <MaterialIcons name="check-circle" size={20} color={colors.repeat} />
              </View>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: colors.situationBg }]}>
                <MaterialIcons name="local-fire-department" size={20} color={colors.situation} />
              </View>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Level Unlocks */}
        <View style={styles.section}>
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
                    <MaterialIcons
                      name={isUnlocked ? 'check' : 'lock'}
                      size={16}
                      color={isUnlocked ? colors.success : colors.textMuted}
                    />
                  </View>
                  <View style={styles.levelInfo}>
                    <Text style={[styles.levelName, !isUnlocked && styles.textMuted]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                    <Text style={styles.levelXP}>
                      {xpRequired.toLocaleString()} XP required
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
        </View>

        {/* Achievements placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsCard}>
            <View style={styles.achievementIconBg}>
              <MaterialIcons name="emoji-events" size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.achievementTitle}>Coming Soon</Text>
            <Text style={styles.achievementText}>
              Achievements will be available in a future update
            </Text>
          </View>
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
  header: {
    marginBottom: spacing.xxl,
  },
  pageTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  xpCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    ...shadows.notion,
  },
  xpContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  xpIconBg: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalXP: {
    fontSize: 40,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  xpLabel: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  progressSection: {
    width: '100%',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  progressPercent: {
    fontSize: typography.xs,
    color: colors.primary,
    fontWeight: typography.bold,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
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
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    backgroundColor: colors.cardAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weeklyCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.notion,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 100,
    marginBottom: spacing.lg,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarContainer: {
    flex: 1,
    width: 20,
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  chartBar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarActive: {
    backgroundColor: colors.primary,
  },
  chartBarInactive: {
    backgroundColor: colors.border,
  },
  chartLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: typography.medium,
  },
  chartLabelToday: {
    color: colors.textPrimary,
    fontWeight: typography.bold,
  },
  weeklyStats: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  weeklyStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  weeklyStatLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'flex-start',
    ...shadows.sm,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  levelsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.sm,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  levelRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    backgroundColor: colors.successBg,
  },
  levelIconLocked: {
    backgroundColor: colors.cardAlt,
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
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  checkText: {
    fontSize: typography.xs,
    color: colors.success,
    fontWeight: typography.medium,
  },
  achievementsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
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
