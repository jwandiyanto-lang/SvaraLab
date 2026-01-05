import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useGameStore,
  Level,
  LEVEL_XP_REQUIREMENTS,
  LEVEL_TIMERS,
} from '../../stores/gameStore';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

type ModeConfig = {
  name: string;
  emoji: string;
  color: string;
  description: string;
};

const MODE_CONFIG: Record<string, ModeConfig> = {
  repeat: {
    name: 'Svara 1: Ucapkan',
    emoji: '🔁',
    color: colors.repeat,
    description: 'Lihat teks Indonesia, ucapkan terjemahan Inggrisnya',
  },
  respond: {
    name: 'Svara 2: Jawab',
    emoji: '💬',
    color: colors.respond,
    description: 'Jawab pertanyaan dengan bahasa Inggris yang natural',
  },
  listen: {
    name: 'Svara 3: Simak',
    emoji: '👂',
    color: colors.listen,
    description: 'Dengarkan audio, lalu ulangi atau jawab',
  },
  situation: {
    name: 'Svara 4: Situasi',
    emoji: '🎭',
    color: colors.situation,
    description: 'Praktik skenario profesional dan sosial dunia nyata',
  },
};

const LEVELS: { id: Level; name: string; description: string }[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Simple words and greetings',
  },
  {
    id: 'elementary',
    name: 'Elementary',
    description: 'Common phrases and sentences',
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Complex sentences and idioms',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Formal speech and technical terms',
  },
];

export default function LevelSelectionScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const { stats, isLevelUnlocked } = useGameStore();

  const config = MODE_CONFIG[mode] || MODE_CONFIG.repeat;

  const handleLevelPress = (level: Level) => {
    if (!isLevelUnlocked(level)) return;
    router.push(`/game/${mode}?level=${level}` as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: config.name,
          headerBackTitle: 'Home',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Mode Header */}
          <View style={[styles.modeHeader, { borderColor: config.color }]}>
            <View style={[styles.modeIconBg, { backgroundColor: config.color + '15' }]}>
              <Text style={styles.modeEmoji}>{config.emoji}</Text>
            </View>
            <Text style={styles.modeName}>{config.name}</Text>
            <Text style={styles.modeDescription}>{config.description}</Text>
          </View>

          {/* Level Cards */}
          <Text style={styles.sectionTitle}>Select Level</Text>

          <View style={styles.levelsContainer}>
            {LEVELS.map((level) => {
              const unlocked = isLevelUnlocked(level.id);
              const xpRequired = LEVEL_XP_REQUIREMENTS[level.id];
              const timer = LEVEL_TIMERS[level.id];

              return (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelCard,
                    unlocked && styles.levelCardUnlocked,
                  ]}
                  onPress={() => handleLevelPress(level.id)}
                  disabled={!unlocked}
                  activeOpacity={0.7}
                >
                  <View style={styles.levelHeader}>
                    <View style={[
                      styles.levelIcon,
                      unlocked ? { backgroundColor: config.color + '15' } : styles.levelIconLocked
                    ]}>
                      <Text style={styles.levelIconText}>
                        {unlocked ? '✓' : '🔒'}
                      </Text>
                    </View>
                    <View style={styles.levelInfo}>
                      <Text style={[styles.levelName, !unlocked && styles.textMuted]}>
                        {level.name}
                      </Text>
                      <Text style={styles.levelDescription}>
                        {level.description}
                      </Text>
                    </View>
                    <View style={styles.timerBadge}>
                      <Text style={styles.timerText}>⏱️ {timer}s</Text>
                    </View>
                  </View>

                  {!unlocked && (
                    <View style={styles.lockOverlay}>
                      <Text style={styles.lockText}>
                        Requires {xpRequired} XP • {xpRequired - stats.totalXP} more needed
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Your XP */}
          <View style={styles.xpCard}>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>Your XP</Text>
              <Text style={styles.xpValue}>{stats.totalXP} XP</Text>
            </View>
          </View>
        </ScrollView>
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
    padding: spacing.xl,
  },
  modeHeader: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    borderWidth: 2,
    ...shadows.md,
  },
  modeIconBg: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modeEmoji: {
    fontSize: 36,
  },
  modeName: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modeDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  levelsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  levelCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  levelCardUnlocked: {
    // No additional styles needed
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
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
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  levelDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  timerBadge: {
    backgroundColor: colors.cardAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  timerText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  textMuted: {
    color: colors.textMuted,
  },
  lockOverlay: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  lockText: {
    fontSize: typography.sm,
    color: colors.warning,
    textAlign: 'center',
  },
  xpCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLabel: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  xpValue: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.warning,
  },
});
