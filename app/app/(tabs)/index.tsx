import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore, LEVEL_XP_REQUIREMENTS } from '../../stores/gameStore';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

type ModeInfo = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  route: string;
};

const MODES: ModeInfo[] = [
  {
    id: 'repeat',
    name: 'Svara 1: Ucapkan',
    emoji: '🔁',
    description: 'Lihat Indonesia, ucapkan Inggris',
    color: colors.repeat,
    route: '/course/repeat',
  },
  {
    id: 'respond',
    name: 'Svara 2: Jawab',
    emoji: '💬',
    description: 'Jawab pertanyaan dengan natural',
    color: colors.respond,
    route: '/course/respond',
  },
  {
    id: 'listen',
    name: 'Svara 3: Simak',
    emoji: '👂',
    description: 'Dengarkan dan ulangi',
    color: colors.listen,
    route: '/course/listen',
  },
  {
    id: 'situation',
    name: 'Svara 4: Situasi',
    emoji: '🎭',
    description: 'Praktik percakapan nyata',
    color: colors.situation,
    route: '/course/situation',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { stats, getNextLevelProgress } = useGameStore();
  const progress = getNextLevelProgress();

  const accuracy = stats.totalAnswers > 0
    ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.title}>SvaraLab</Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>{stats.totalXP} XP</Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressPercent}>{Math.round(progress.percentage)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(5, progress.percentage)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressSubtext}>
            {progress.required > stats.totalXP
              ? `${progress.required - stats.totalXP} XP to unlock next level`
              : 'All levels unlocked!'}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📚</Text>
            <Text style={styles.statValue}>{stats.wordsLearned}</Text>
            <Text style={styles.statLabel}>Learned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        {/* Game Modes */}
        <Text style={styles.sectionTitle}>Practice Modes</Text>
        <Text style={styles.sectionSubtitle}>Choose how you want to practice today</Text>

        <View style={styles.modesContainer}>
          {MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={styles.modeCard}
              onPress={() => router.push(mode.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.modeIconContainer, { backgroundColor: mode.color + '15' }]}>
                <Text style={styles.modeEmoji}>{mode.emoji}</Text>
              </View>
              <View style={styles.modeContent}>
                <Text style={styles.modeName}>{mode.name}</Text>
                <Text style={styles.modeDescription}>{mode.description}</Text>
              </View>
              <View style={[styles.modeArrow, { backgroundColor: mode.color + '15' }]}>
                <Text style={[styles.modeArrowText, { color: mode.color }]}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Level Requirements */}
        <Text style={styles.sectionTitle}>Difficulty Levels</Text>
        <View style={styles.levelsCard}>
          {(['beginner', 'elementary', 'intermediate', 'advanced'] as const).map((level, index) => {
            const isUnlocked = stats.totalXP >= LEVEL_XP_REQUIREMENTS[level];
            const isLast = index === 3;
            return (
              <View
                key={level}
                style={[styles.levelRow, !isLast && styles.levelRowBorder]}
              >
                <View style={[
                  styles.levelIcon,
                  isUnlocked ? styles.levelIconUnlocked : styles.levelIconLocked
                ]}>
                  <Text style={styles.levelIconText}>{isUnlocked ? '✓' : '🔒'}</Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelName, !isUnlocked && styles.textMuted]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                  <Text style={styles.levelXp}>
                    {LEVEL_XP_REQUIREMENTS[level]} XP required
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bottom spacing */}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  greeting: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  xpBadge: {
    backgroundColor: colors.warning + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  xpBadgeText: {
    color: colors.warning,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  progressPercent: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.primary,
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
  progressSubtext: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  modesContainer: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  modeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeEmoji: {
    fontSize: 24,
  },
  modeContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  modeName: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  modeDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  modeArrow: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeArrowText: {
    fontSize: 18,
    fontWeight: typography.bold,
  },
  levelsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
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
    borderBottomColor: colors.borderLight,
  },
  levelIcon: {
    width: 32,
    height: 32,
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
    fontSize: 14,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  levelXp: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  textMuted: {
    color: colors.textMuted,
  },
});
