import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, DevSettings } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

export default function SettingsScreen() {
  const { settings, updateSettings, resetStats } = useGameStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const accents = [
    { id: 'us', name: 'USA', flag: '🇺🇸' },
    { id: 'uk', name: 'UK', flag: '🇬🇧' },
    { id: 'au', name: 'AUS', flag: '🇦🇺' },
    { id: 'sg', name: 'SG', flag: '🇸🇬' },
  ];

  const durations = [
    { id: 5, label: '5', name: 'Casual', icon: 'local-cafe' as const, color: colors.repeat },
    { id: 15, label: '15', name: 'Regular', icon: 'psychology' as const, color: colors.listen, checked: true },
    { id: 30, label: '30', name: 'Serious', icon: 'fitness-center' as const, color: colors.respond },
    { id: 45, label: '45', name: 'Intense', icon: 'rocket-launch' as const, color: colors.situation },
  ];

  const [selectedDuration, setSelectedDuration] = useState(15);
  const [weeklyGoal, setWeeklyGoal] = useState(4);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Set Training Comfort Level</Text>
          <Text style={styles.pageSubtitle}>
            Choose a training schedule that fits your daily routine. Consistency beats intensity when learning a new accent.
          </Text>
        </View>

        {/* Dream Destination */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Destination</Text>
          <View style={styles.accentGrid}>
            {accents.map((accent) => (
              <TouchableOpacity
                key={accent.id}
                style={[
                  styles.accentCard,
                  settings.accent === accent.id && styles.accentCardActive,
                ]}
                onPress={() => updateSettings({ accent: accent.id as 'us' | 'uk' | 'au' })}
              >
                <Text style={styles.accentFlag}>{accent.flag}</Text>
                <Text style={[
                  styles.accentLabel,
                  settings.accent === accent.id && styles.accentLabelActive,
                ]}>
                  {accent.name}
                </Text>
                {settings.accent === accent.id && (
                  <View style={styles.checkBadge}>
                    <MaterialIcons name="check" size={12} color={colors.textLight} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Commitment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Commitment</Text>
          <View style={styles.durationGrid}>
            {durations.map((duration) => (
              <TouchableOpacity
                key={duration.id}
                style={[
                  styles.durationCard,
                  selectedDuration === duration.id && styles.durationCardActive,
                ]}
                onPress={() => setSelectedDuration(duration.id)}
              >
                <View style={styles.durationHeader}>
                  <MaterialIcons name={duration.icon} size={22} color={duration.color} />
                  <Text style={styles.durationName}>{duration.name}</Text>
                </View>
                <Text style={styles.durationValue}>
                  {duration.label} <Text style={styles.durationUnit}>min/day</Text>
                </Text>
                {selectedDuration === duration.id && (
                  <View style={styles.durationCheck}>
                    <MaterialIcons name="check-circle" size={20} color={colors.respond} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weekly Goal */}
        <View style={styles.section}>
          <View style={styles.weeklyHeader}>
            <Text style={styles.sectionTitle}>Weekly Goal</Text>
            <View style={styles.weeklyBadge}>
              <Text style={styles.weeklyBadgeText}>{weeklyGoal} days / week</Text>
            </View>
          </View>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${(weeklyGoal / 7) * 100}%` }]} />
            </View>
            <View style={styles.sliderLabels}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => setWeeklyGoal(day)}
                  style={styles.sliderLabel}
                >
                  <Text style={[
                    styles.sliderLabelText,
                    day === weeklyGoal && styles.sliderLabelActive,
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.tipRow}>
            <MaterialIcons name="info" size={16} color={colors.textSecondary} />
            <Text style={styles.tipText}>
              Based on your profile, we recommend at least <Text style={styles.tipBold}>3 days</Text> per week to maintain progress.
            </Text>
          </View>
        </View>

        {/* Projected Result */}
        <View style={styles.projectionCard}>
          <View style={styles.projectionHeader}>
            <View style={styles.projectionIcon}>
              <MaterialIcons name="trending-up" size={14} color={colors.textLight} />
            </View>
            <Text style={styles.projectionLabel}>Projected Result</Text>
          </View>
          <Text style={styles.projectionText}>
            With this schedule, you'll feel comfortable speaking with locals in <Text style={styles.projectionBold}>about 3 months</Text>.
          </Text>
        </View>

        {/* Sound Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound & Feedback</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Sound Effects</Text>
              <Text style={styles.toggleSubtext}>Play sounds for correct/incorrect answers</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => updateSettings({ soundEnabled: value })}
              trackColor={{ false: colors.border, true: colors.respond }}
              thumbColor={settings.soundEnabled ? colors.textLight : colors.textMuted}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Haptic Feedback</Text>
              <Text style={styles.toggleSubtext}>Vibration on button presses</Text>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={(value) => updateSettings({ hapticEnabled: value })}
              trackColor={{ false: colors.border, true: colors.respond }}
              thumbColor={settings.hapticEnabled ? colors.textLight : colors.textMuted}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Auto-play Pronunciation</Text>
              <Text style={styles.toggleSubtext}>Automatically play audio for each word</Text>
            </View>
            <Switch
              value={settings.autoPlayAudio}
              onValueChange={(value) => updateSettings({ autoPlayAudio: value })}
              trackColor={{ false: colors.border, true: colors.respond }}
              thumbColor={settings.autoPlayAudio ? colors.textLight : colors.textMuted}
            />
          </View>
        </View>

        {/* Reset Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          {!showResetConfirm ? (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => setShowResetConfirm(true)}
            >
              <Text style={styles.resetButtonText}>Reset Progress</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.confirmContainer}>
              <Text style={styles.confirmText}>Are you sure? This cannot be undone.</Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowResetConfirm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmResetButton}
                  onPress={() => {
                    resetStats();
                    setShowResetConfirm(false);
                    Alert.alert(
                      'Progress Reset',
                      'All progress has been reset to 5000 XP (all levels unlocked).',
                      [
                        {
                          text: 'Reload App',
                          onPress: () => {
                            if (__DEV__ && DevSettings) {
                              DevSettings.reload();
                            }
                          },
                        },
                        { text: 'OK' },
                      ]
                    );
                  }}
                >
                  <Text style={styles.confirmResetText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>SvaraLab</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appTagline}>Practice speaking English with confidence</Text>
        </View>
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
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: spacing.xxl,
  },
  pageTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  pageSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginLeft: 4,
  },
  accentGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  accentCard: {
    flex: 1,
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    position: 'relative',
  },
  accentCardActive: {
    backgroundColor: colors.background,
    borderColor: colors.respond,
    ...shadows.sm,
  },
  accentFlag: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  accentLabel: {
    fontSize: 10,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  accentLabelActive: {
    color: colors.textPrimary,
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.respond,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  durationCard: {
    width: '47%',
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    position: 'relative',
  },
  durationCardActive: {
    backgroundColor: colors.background,
    borderColor: colors.respond,
    ...shadows.sm,
  },
  durationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  durationName: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  durationValue: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  durationUnit: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    letterSpacing: 0,
  },
  durationCheck: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weeklyBadge: {
    backgroundColor: colors.infoBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weeklyBadgeText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  sliderContainer: {
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    width: 24,
    alignItems: 'center',
  },
  sliderLabelText: {
    fontSize: 10,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  sliderLabelActive: {
    color: colors.primary,
    fontWeight: typography.bold,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginLeft: 4,
  },
  tipText: {
    flex: 1,
    fontSize: typography.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  tipBold: {
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  projectionCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    overflow: 'hidden',
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
    lineHeight: 20,
  },
  projectionBold: {
    fontWeight: typography.bold,
    color: colors.textLight,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.lg,
  },
  toggleLabel: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  toggleSubtext: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  resetButton: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.lg,
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.error,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  confirmContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  confirmText: {
    color: colors.textPrimary,
    fontSize: typography.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontWeight: typography.semibold,
  },
  confirmResetButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  confirmResetText: {
    color: colors.textLight,
    fontWeight: typography.semibold,
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  appName: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  appVersion: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  appTagline: {
    fontSize: typography.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
