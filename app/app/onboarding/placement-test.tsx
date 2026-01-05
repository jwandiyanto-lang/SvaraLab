import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useGameStore, Level, PlacementTestResult } from '../../stores/gameStore';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

// Test questions
const GRAMMAR_QUESTION = {
  prompt: 'Complete the sentence:',
  sentence: '"I usually ______ coffee in the morning, but today I had tea."',
  options: ['drink', 'drinking', 'drank'],
  correct: 0, // 'drink'
};

const LISTENING_QUESTION = {
  prompt: 'Listen and choose the correct word.',
  audioLength: '0:04',
  options: ['Ship', 'Sheep', 'Chip', 'Cheap'],
  correct: 1, // 'Sheep'
};

const SPEAKING_QUESTION = {
  prompt: 'Read the sentence aloud:',
  sentence: '"The quick brown fox jumps over the lazy dog."',
};

export default function PlacementTestScreen() {
  const router = useRouter();
  const { completePlacementTest, completeOnboarding, skipOnboarding } = useGameStore();

  const [grammarAnswer, setGrammarAnswer] = useState<number | null>(null);
  const [listeningAnswer, setListeningAnswer] = useState<number | null>(null);
  const [speakingCompleted, setSpeakingCompleted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const progress = calculateProgress();

  function calculateProgress() {
    let completed = 0;
    if (grammarAnswer !== null) completed++;
    if (listeningAnswer !== null) completed++;
    if (speakingCompleted) completed++;
    return (completed / 3) * 100;
  }

  const handleSkip = () => {
    skipOnboarding();
    router.replace('/(tabs)');
  };

  const handleAnalyze = () => {
    // Calculate scores
    const grammarScore = grammarAnswer === GRAMMAR_QUESTION.correct ? 100 : 0;
    const listeningScore = listeningAnswer === LISTENING_QUESTION.correct ? 100 : 0;
    const speakingScore = speakingCompleted ? 80 : 0; // Mock score for speaking

    const avgScore = (grammarScore + listeningScore + speakingScore) / 3;

    // Determine level based on average score
    let level: Level = 'beginner';
    if (avgScore >= 90) level = 'advanced';
    else if (avgScore >= 70) level = 'intermediate';
    else if (avgScore >= 50) level = 'elementary';

    const result: PlacementTestResult = {
      grammarScore,
      listeningScore,
      speakingScore,
      overallLevel: level,
      completedAt: new Date().toISOString(),
    };

    completePlacementTest(result);
    router.push('/onboarding/results');
  };

  const handleRecordPress = () => {
    if (isRecording) {
      setIsRecording(false);
      setSpeakingCompleted(true);
    } else {
      setIsRecording(true);
      // Auto-stop after 3 seconds for demo
      setTimeout(() => {
        setIsRecording(false);
        setSpeakingCompleted(true);
      }, 3000);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Placement Test</Text>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Let's check your level</Text>
            <Text style={styles.subtitle}>
              Complete these 3 quick tasks so we can personalize your learning path appropriately.
            </Text>
          </View>

          {/* Task 1: Grammar */}
          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={[styles.taskBadge, { backgroundColor: colors.respondBg }]}>
                <MaterialIcons name="edit-note" size={14} color={colors.respond} />
                <Text style={[styles.taskBadgeText, { color: colors.respond }]}>Grammar</Text>
              </View>
              <Text style={styles.taskCount}>1 of 3</Text>
            </View>

            <Text style={styles.taskPrompt}>{GRAMMAR_QUESTION.prompt}</Text>

            <View style={styles.sentenceBox}>
              <Text style={styles.sentenceText}>{GRAMMAR_QUESTION.sentence}</Text>
            </View>

            <View style={styles.optionsContainer}>
              {GRAMMAR_QUESTION.options.map((option, index) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    grammarAnswer === index && styles.optionButtonActive,
                  ]}
                  onPress={() => setGrammarAnswer(index)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    grammarAnswer === index && styles.optionTextActive,
                  ]}>
                    {option}
                  </Text>
                  <View style={[
                    styles.radioOuter,
                    grammarAnswer === index && styles.radioOuterActive,
                  ]}>
                    {grammarAnswer === index && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Task 2: Listening */}
          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={[styles.taskBadge, { backgroundColor: colors.repeatBg }]}>
                <MaterialIcons name="headphones" size={14} color={colors.repeat} />
                <Text style={[styles.taskBadgeText, { color: colors.repeat }]}>Listening</Text>
              </View>
              <Text style={styles.taskCount}>2 of 3</Text>
            </View>

            <Text style={styles.taskPrompt}>{LISTENING_QUESTION.prompt}</Text>

            <TouchableOpacity style={styles.audioButton} activeOpacity={0.7}>
              <View style={styles.playIconCircle}>
                <MaterialIcons name="play-arrow" size={20} color={colors.textPrimary} />
              </View>
              <View style={styles.audioProgress}>
                <View style={styles.audioProgressFill} />
              </View>
              <Text style={styles.audioDuration}>{LISTENING_QUESTION.audioLength}</Text>
            </TouchableOpacity>

            <View style={styles.listeningOptionsGrid}>
              {LISTENING_QUESTION.options.map((option, index) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.listeningOption,
                    listeningAnswer === index && styles.listeningOptionActive,
                  ]}
                  onPress={() => setListeningAnswer(index)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.listeningOptionText,
                    listeningAnswer === index && styles.listeningOptionTextActive,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Task 3: Speaking */}
          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={[styles.taskBadge, { backgroundColor: colors.listenBg }]}>
                <MaterialIcons name="mic" size={14} color={colors.listen} />
                <Text style={[styles.taskBadgeText, { color: colors.listen }]}>Speaking</Text>
              </View>
              <Text style={styles.taskCount}>3 of 3</Text>
            </View>

            <Text style={styles.taskPrompt}>{SPEAKING_QUESTION.prompt}</Text>

            <View style={styles.speakingBox}>
              <Text style={styles.speakingText}>{SPEAKING_QUESTION.sentence}</Text>
            </View>

            <View style={styles.recordContainer}>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                  speakingCompleted && styles.recordButtonCompleted,
                ]}
                onPress={handleRecordPress}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={speakingCompleted ? 'check' : 'mic'}
                  size={28}
                  color={isRecording ? colors.situation : (speakingCompleted ? colors.success : colors.textSecondary)}
                />
              </TouchableOpacity>
              <Text style={styles.recordLabel}>
                {speakingCompleted ? 'Recording complete' : (isRecording ? 'Recording...' : 'Tap to record')}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={handleAnalyze}
            activeOpacity={0.8}
          >
            <Text style={styles.analyzeText}>Analyze Results</Text>
            <MaterialIcons name="auto-awesome" size={16} color={colors.textLight} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  skipButton: {
    padding: spacing.xs,
  },
  skipText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  progressContainer: {
    paddingHorizontal: 0,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.cardAlt,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 120,
  },
  titleSection: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.notion,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  taskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  taskBadgeText: {
    fontSize: 10,
    fontWeight: typography.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskCount: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  taskPrompt: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sentenceBox: {
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  sentenceText: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  optionButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.cardAlt,
  },
  optionText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  optionTextActive: {
    color: colors.primary,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textLight,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  playIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  audioProgress: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  audioProgressFill: {
    width: '33%',
    height: '100%',
    backgroundColor: colors.textPrimary,
  },
  audioDuration: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  listeningOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  listeningOption: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  listeningOptionActive: {
    borderColor: colors.repeat,
    backgroundColor: colors.repeatBg,
  },
  listeningOptionText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  listeningOptionTextActive: {
    color: colors.repeat,
  },
  speakingBox: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  speakingText: {
    fontSize: typography.lg,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  recordContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  recordButtonActive: {
    backgroundColor: colors.situationBg,
    borderColor: colors.situation,
  },
  recordButtonCompleted: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
  },
  recordLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.medium,
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
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  analyzeText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textLight,
  },
});
