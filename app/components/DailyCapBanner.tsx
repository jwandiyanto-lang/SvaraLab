import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';
import { useGameStore, FREE_DAILY_SESSIONS, FREE_DAILY_MINUTES } from '../stores/gameStore';

interface DailyCapBannerProps {
  onUpgradePress?: () => void;
  showUpgrade?: boolean;
}

export default function DailyCapBanner({ onUpgradePress, showUpgrade = true }: DailyCapBannerProps) {
  const { canStartSession, stats } = useGameStore();
  const usageStatus = canStartSession();

  // Calculate progress percentages
  const sessionsProgress = ((FREE_DAILY_SESSIONS - usageStatus.sessionsLeft) / FREE_DAILY_SESSIONS) * 100;
  const minutesProgress = ((FREE_DAILY_MINUTES - usageStatus.minutesLeft) / FREE_DAILY_MINUTES) * 100;

  // Determine if user is close to limit
  const isLowSessions = usageStatus.sessionsLeft <= 1;
  const isLowMinutes = usageStatus.minutesLeft <= 5;
  const isLimited = !usageStatus.allowed;

  if (isLimited) {
    return (
      <View style={styles.limitedContainer}>
        <View style={styles.limitedIcon}>
          <MaterialIcons name="hourglass-empty" size={24} color={colors.warning} />
        </View>
        <View style={styles.limitedContent}>
          <Text style={styles.limitedTitle}>Daily Limit Reached</Text>
          <Text style={styles.limitedSubtitle}>
            {usageStatus.reason === 'daily_sessions'
              ? "You've completed all 3 free sessions today"
              : "You've used all 15 free minutes today"}
          </Text>
          <Text style={styles.resetText}>Resets at midnight</Text>
        </View>
        {showUpgrade && (
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgradePress}>
            <MaterialIcons name="star" size={16} color={colors.textLight} />
            <Text style={styles.upgradeText}>Upgrade</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Warning state - close to limit
  if (isLowSessions || isLowMinutes) {
    return (
      <View style={styles.warningContainer}>
        <View style={styles.warningHeader}>
          <MaterialIcons name="schedule" size={16} color={colors.warning} />
          <Text style={styles.warningTitle}>Free Tier</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${sessionsProgress}%`, backgroundColor: isLowSessions ? colors.warning : colors.success }]} />
            </View>
            <Text style={[styles.statText, isLowSessions && styles.statTextWarning]}>
              {usageStatus.sessionsLeft}/{FREE_DAILY_SESSIONS} sessions
            </Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${minutesProgress}%`, backgroundColor: isLowMinutes ? colors.warning : colors.success }]} />
            </View>
            <Text style={[styles.statText, isLowMinutes && styles.statTextWarning]}>
              {usageStatus.minutesLeft}/{FREE_DAILY_MINUTES} min
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Normal state - compact display
  return (
    <View style={styles.normalContainer}>
      <View style={styles.normalLeft}>
        <MaterialIcons name="bolt" size={16} color={colors.success} />
        <Text style={styles.normalText}>
          {usageStatus.sessionsLeft} sessions left today
        </Text>
      </View>
      <View style={styles.dots}>
        {[...Array(FREE_DAILY_SESSIONS)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < FREE_DAILY_SESSIONS - usageStatus.sessionsLeft
                ? styles.dotUsed
                : styles.dotAvailable,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Limited state
  limitedContainer: {
    backgroundColor: colors.warningBg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  limitedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitedContent: {
    flex: 1,
  },
  limitedTitle: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  limitedSubtitle: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resetText: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  upgradeText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textLight,
  },

  // Warning state
  warningContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warningBg,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  warningTitle: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.warning,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statItem: {
    flex: 1,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  statText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  statTextWarning: {
    color: colors.warning,
    fontWeight: typography.medium,
  },

  // Normal state
  normalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  normalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  normalText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotAvailable: {
    backgroundColor: colors.success,
  },
  dotUsed: {
    backgroundColor: colors.border,
  },
});
