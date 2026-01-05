import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useGameStore, LEVEL_XP_REQUIREMENTS, FREE_DAILY_MINUTES } from '../../stores/gameStore';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import WordOfDay from '../../components/WordOfDay';
import DailyCapBanner from '../../components/DailyCapBanner';

type ModeInfo = {
  id: string;
  name: string;
  nameId: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  description: string;
  color: string;
  bgColor: string;
  tag: string;
  route: string;
};

const MODES: ModeInfo[] = [
  {
    id: 'repeat',
    name: 'Speak Fast',
    nameId: 'Ucapkan',
    icon: 'bolt',
    description: 'Boost your speaking speed and fluidity with rapid-fire drills.',
    color: colors.repeat,
    bgColor: colors.repeatBg,
    tag: 'Speed',
    route: '/course/repeat',
  },
  {
    id: 'respond',
    name: 'Think & Answer',
    nameId: 'Jawab',
    icon: 'psychology',
    description: 'Sharpen cognitive reflexes to respond instantly in conversation.',
    color: colors.respond,
    bgColor: colors.respondBg,
    tag: 'Logic',
    route: '/course/respond',
  },
  {
    id: 'listen',
    name: 'Listen Sharp',
    nameId: 'Simak',
    icon: 'headphones',
    description: 'Train your ears to catch details in different English accents.',
    color: colors.listen,
    bgColor: colors.listenBg,
    tag: 'Focus',
    route: '/course/listen',
  },
  {
    id: 'situation',
    name: 'Real Talk',
    nameId: 'Situasi',
    icon: 'storefront',
    description: 'Practical scenarios for travel, work, and social interactions.',
    color: colors.situation,
    bgColor: colors.situationBg,
    tag: 'Real World',
    route: '/course/situation',
  },
];

// Get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export default function HomeScreen() {
  const router = useRouter();
  const { stats, profile, getNextLevelProgress, canStartSession, resetDailyUsageIfNeeded } = useGameStore();
  const progress = getNextLevelProgress();
  const usageStatus = canStartSession();

  // Reset daily usage if needed (on app open)
  resetDailyUsageIfNeeded();

  // Calculate daily goal progress from actual usage
  const dailyGoalMinutes = profile.dailyCommitment || 15;
  const completedMinutes = stats.dailyUsage.minutesUsed;
  const dailyProgress = Math.min((completedMinutes / dailyGoalMinutes) * 100, 100);

  const userName = profile.name || 'Learner';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => router.push('/(tabs)/settings')}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <View style={styles.avatarInner}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{userName}</Text>
              <MaterialIcons name="chevron-right" size={16} color={colors.textTertiary} />
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          {/* Streak Badge */}
          {stats.currentDayStreak > 0 && (
            <View style={styles.streakBadge}>
              <MaterialIcons name="local-fire-department" size={16} color={colors.repeat} />
              <Text style={styles.streakText}>{stats.currentDayStreak}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.reminderBtn}
            onPress={() => {
              // TODO: Open reminder settings
            }}
          >
            <MaterialIcons name="alarm" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Cap Banner */}
        <View style={styles.capBannerContainer}>
          <DailyCapBanner />
        </View>

        {/* Daily Goal Progress */}
        <View style={styles.dailyGoalSection}>
          <View style={styles.dailyGoalHeader}>
            <Text style={styles.dailyGoalLabel}>Daily Goal</Text>
            <Text style={styles.dailyGoalTime}>{completedMinutes}/{dailyGoalMinutes} mins</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${dailyProgress}%` }]} />
          </View>
        </View>

        {/* Word of the Day */}
        <View style={styles.wordOfDayContainer}>
          <WordOfDay />
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Training Modules</Text>

        {/* Game Mode Cards */}
        <View style={styles.modesContainer}>
          {MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeCard,
                !usageStatus.allowed && styles.modeCardDisabled,
              ]}
              onPress={() => {
                if (usageStatus.allowed) {
                  router.push(mode.route as any);
                }
              }}
              activeOpacity={usageStatus.allowed ? 0.7 : 1}
            >
              <View style={styles.modeCardContent}>
                <View style={[styles.modeIconContainer, { backgroundColor: mode.bgColor }]}>
                  <MaterialIcons name={mode.icon} size={26} color={mode.color} />
                </View>
                <View style={styles.modeInfo}>
                  <View style={styles.modeHeader}>
                    <Text style={styles.modeName}>{mode.nameId}</Text>
                    <View style={[styles.modeTag, { backgroundColor: mode.bgColor }]}>
                      <Text style={[styles.modeTagText, { color: mode.color }]}>{mode.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.modeSubtitle}>{mode.name}</Text>
                  <Text style={styles.modeDescription}>{mode.description}</Text>
                </View>
              </View>
              {!usageStatus.allowed && (
                <View style={styles.lockedOverlay}>
                  <MaterialIcons name="lock" size={16} color={colors.textTertiary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <View style={[styles.quickStatIcon, { backgroundColor: colors.repeatBg }]}>
              <MaterialIcons name="star" size={18} color={colors.repeat} />
            </View>
            <View>
              <Text style={styles.quickStatValue}>{stats.totalXP.toLocaleString()}</Text>
              <Text style={styles.quickStatLabel}>Total XP</Text>
            </View>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <View style={[styles.quickStatIcon, { backgroundColor: colors.listenBg }]}>
              <MaterialIcons name="menu-book" size={18} color={colors.listen} />
            </View>
            <View>
              <Text style={styles.quickStatValue}>{stats.wordsLearned}</Text>
              <Text style={styles.quickStatLabel}>Words</Text>
            </View>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <View style={[styles.quickStatIcon, { backgroundColor: colors.respondBg }]}>
              <MaterialIcons name="trending-up" size={18} color={colors.respond} />
            </View>
            <View>
              <Text style={styles.quickStatValue}>{progress.currentLevel}</Text>
              <Text style={styles.quickStatLabel}>Level</Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.repeatBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    gap: 2,
  },
  greeting: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.repeatBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  streakText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.repeat,
  },
  reminderBtn: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  capBannerContainer: {
    marginBottom: spacing.lg,
  },
  dailyGoalSection: {
    marginBottom: spacing.lg,
  },
  dailyGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dailyGoalLabel: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dailyGoalTime: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  wordOfDayContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  modesContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  modeCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.notion,
  },
  modeCardDisabled: {
    opacity: 0.6,
  },
  modeCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  modeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeInfo: {
    flex: 1,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modeName: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  modeTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  modeTagText: {
    fontSize: 10,
    fontWeight: typography.semibold,
  },
  modeSubtitle: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    opacity: 0.8,
  },
  lockedOverlay: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  quickStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatValue: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  quickStatLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  quickStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
});
