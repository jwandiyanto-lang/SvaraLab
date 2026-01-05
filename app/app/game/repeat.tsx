import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Timer from '../../components/Timer';
import SpeechButton, { RecordingState } from '../../components/SpeechButton';
import {
  useGameStore,
  Level,
  LEVEL_TIMERS,
} from '../../stores/gameStore';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

// Mock content - will be replaced with actual JSON data
const REPEAT_CONTENT: Record<Level, ContentItem[]> = {
  beginner: [
    { id: 'rep-beg-001', indonesian: 'Selamat pagi', english: 'Good morning', xp: 10 },
    { id: 'rep-beg-002', indonesian: 'Terima kasih', english: 'Thank you', xp: 10 },
    { id: 'rep-beg-003', indonesian: 'Apa kabar?', english: 'How are you?', xp: 10 },
    { id: 'rep-beg-004', indonesian: 'Nama saya...', english: 'My name is...', xp: 10 },
    { id: 'rep-beg-005', indonesian: 'Selamat malam', english: 'Good night', xp: 10 },
  ],
  elementary: [
    { id: 'rep-ele-001', indonesian: 'Berapa harganya?', english: 'How much is it?', xp: 15 },
    { id: 'rep-ele-002', indonesian: 'Di mana toilet?', english: 'Where is the bathroom?', xp: 15 },
    { id: 'rep-ele-003', indonesian: 'Saya tidak mengerti', english: 'I do not understand', xp: 15 },
    { id: 'rep-ele-004', indonesian: 'Bisa bicara lebih pelan?', english: 'Can you speak slower?', xp: 15 },
    { id: 'rep-ele-005', indonesian: 'Tolong bantu saya', english: 'Please help me', xp: 15 },
  ],
  intermediate: [
    { id: 'rep-int-001', indonesian: 'Saya sedang mencari pekerjaan', english: 'I am looking for a job', xp: 20 },
    { id: 'rep-int-002', indonesian: 'Bisakah kita jadwalkan pertemuan?', english: 'Can we schedule a meeting?', xp: 20 },
    { id: 'rep-int-003', indonesian: 'Saya sangat menghargai bantuan Anda', english: 'I really appreciate your help', xp: 20 },
  ],
  advanced: [
    { id: 'rep-adv-001', indonesian: 'Saya ingin menyampaikan presentasi tentang proyek ini', english: 'I would like to present this project', xp: 30 },
    { id: 'rep-adv-002', indonesian: 'Mari kita diskusikan strategi pemasaran', english: 'Let us discuss the marketing strategy', xp: 30 },
  ],
};

type ContentItem = {
  id: string;
  indonesian: string;
  english: string;
  xp: number;
};

type GamePhase = 'ready' | 'playing' | 'feedback' | 'complete';

export default function RepeatGameScreen() {
  const router = useRouter();
  const { level } = useLocalSearchParams<{ level: Level }>();
  const currentLevel = (level as Level) || 'beginner';

  const { settings, addXP, incrementWordsLearned } = useGameStore();
  const content = REPEAT_CONTENT[currentLevel] || REPEAT_CONTENT.beginner;
  const timerSeconds = LEVEL_TIMERS[currentLevel];

  const [phase, setPhase] = useState<GamePhase>('ready');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  const currentItem = content[currentIndex];

  const { startListening, stopListening, resetTranscript } = useSpeechRecognition({
    onResult: (transcript) => {
      handleSpeechResult(transcript);
    },
  });

  const startRound = useCallback(() => {
    setPhase('playing');
    setIsTimerRunning(true);
    setFeedbackType(null);
    setRecordingState('idle');
    resetTranscript();
  }, [resetTranscript]);

  const handleStart = () => {
    setCurrentIndex(0);
    setEarnedXP(0);
    setCorrectCount(0);
    startRound();
  };

  const handleTimerComplete = useCallback(() => {
    setIsTimerRunning(false);
    if (recordingState === 'listening') {
      stopListening();
    }
    if (phase === 'playing') {
      handleIncorrect();
    }
  }, [recordingState, phase, stopListening]);

  const handleSpeechPress = async () => {
    if (recordingState === 'idle') {
      setRecordingState('listening');
      await startListening();

      setTimeout(() => {
        handleSpeechResult('mock user speech');
      }, (timerSeconds - 0.5) * 1000);
    } else if (recordingState === 'listening') {
      stopListening();
      setRecordingState('processing');
    }
  };

  const handleSpeechResult = async (transcript: string) => {
    if (!currentItem || phase !== 'playing') return;

    setRecordingState('processing');
    setIsTimerRunning(false);

    const isCorrect = Math.random() > 0.3;

    setTimeout(() => {
      if (isCorrect) {
        handleCorrect();
      } else {
        handleIncorrect();
      }
    }, 300);
  };

  const handleCorrect = async () => {
    if (settings.hapticEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const xpGained = currentItem.xp;
    setEarnedXP((prev) => prev + xpGained);
    setCorrectCount((prev) => prev + 1);
    setRecordingState('success');
    setFeedbackType('correct');
    setPhase('feedback');
    addXP(xpGained);
    incrementWordsLearned();

    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleIncorrect = async () => {
    if (settings.hapticEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setRecordingState('error');
    setFeedbackType('incorrect');
    setPhase('feedback');
  };

  const handleNext = () => {
    if (currentIndex < content.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      startRound();
    } else {
      setPhase('complete');
    }
  };

  const levelTitle = currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1);

  return (
    <>
      <Stack.Screen
        options={{
          title: `Svara 1: Ucapkan • ${levelTitle}`,
          headerBackTitle: 'Kembali',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / content.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{content.length}
          </Text>
        </View>

        <View style={styles.gameContent}>
          {/* Ready Phase */}
          {phase === 'ready' && (
            <View style={styles.readyContainer}>
              <View style={styles.readyIconBg}>
                <Text style={styles.readyEmoji}>🔁</Text>
              </View>
              <Text style={styles.readyTitle}>Repeat Mode</Text>
              <Text style={styles.readySubtitle}>Level: {levelTitle}</Text>
              <Text style={styles.readyInfo}>
                {content.length} items • {timerSeconds}s per item
              </Text>

              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Start Practice</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Playing/Feedback Phase */}
          {(phase === 'playing' || phase === 'feedback') && currentItem && (
            <>
              {/* XP Counter */}
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>+{earnedXP} XP</Text>
              </View>

              {/* Word Card */}
              <View style={styles.wordCard}>
                <Text style={styles.instructionText}>Say in English:</Text>
                <Text style={styles.indonesianText}>{currentItem.indonesian}</Text>

                {phase === 'feedback' && (
                  <View style={styles.answerReveal}>
                    <Text style={styles.answerLabel}>Answer:</Text>
                    <Text style={styles.englishText}>{currentItem.english}</Text>
                  </View>
                )}
              </View>

              {/* Timer */}
              <View style={styles.timerContainer}>
                <Timer
                  seconds={timerSeconds}
                  isRunning={isTimerRunning}
                  onComplete={handleTimerComplete}
                  size="large"
                />
              </View>

              {/* Speech Button or Feedback */}
              {phase === 'playing' && (
                <SpeechButton
                  state={recordingState}
                  onPress={handleSpeechPress}
                  disabled={false}
                  size="large"
                />
              )}

              {phase === 'feedback' && (
                <View style={styles.feedbackContainer}>
                  <View
                    style={[
                      styles.feedbackBadge,
                      feedbackType === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect,
                    ]}
                  >
                    <Text style={styles.feedbackText}>
                      {feedbackType === 'correct' ? '✓ Correct!' : '✗ Try Again'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.nextButtonText}>
                      {currentIndex < content.length - 1 ? 'Next →' : 'Finish'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* Complete Phase */}
          {phase === 'complete' && (
            <View style={styles.completeContainer}>
              <View style={styles.completeIconBg}>
                <Text style={styles.completeEmoji}>🎉</Text>
              </View>
              <Text style={styles.completeTitle}>Practice Complete!</Text>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Correct</Text>
                  <Text style={styles.summaryValue}>
                    {correctCount} / {content.length}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Accuracy</Text>
                  <Text style={styles.summaryValue}>
                    {Math.round((correctCount / content.length) * 100)}%
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryRowLast]}>
                  <Text style={styles.summaryLabel}>XP Earned</Text>
                  <Text style={styles.xpEarned}>+{earnedXP} XP</Text>
                </View>
              </View>

              <View style={styles.completeActions}>
                <TouchableOpacity
                  style={styles.practiceAgainButton}
                  onPress={handleStart}
                  activeOpacity={0.8}
                >
                  <Text style={styles.practiceAgainText}>Practice Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>← Back to Levels</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.repeat,
    borderRadius: borderRadius.full,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
  gameContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  readyContainer: {
    alignItems: 'center',
  },
  readyIconBg: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.repeat + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  readyEmoji: {
    fontSize: 48,
  },
  readyTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  readySubtitle: {
    fontSize: typography.base,
    color: colors.repeat,
    fontWeight: typography.semibold,
    marginBottom: spacing.sm,
  },
  readyInfo: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xxxl,
  },
  startButton: {
    backgroundColor: colors.repeat,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  startButtonText: {
    color: colors.textLight,
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  xpBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.warning + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  xpText: {
    color: colors.warning,
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  wordCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadows.md,
  },
  instructionText: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  indonesianText: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  answerReveal: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
    width: '100%',
  },
  answerLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  englishText: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.repeat,
    textAlign: 'center',
  },
  timerContainer: {
    marginBottom: spacing.xxl,
  },
  feedbackContainer: {
    alignItems: 'center',
  },
  feedbackBadge: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
  },
  feedbackCorrect: {
    backgroundColor: colors.success + '15',
  },
  feedbackIncorrect: {
    backgroundColor: colors.error + '15',
  },
  feedbackText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  nextButtonText: {
    color: colors.textLight,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  completeContainer: {
    alignItems: 'center',
    width: '100%',
  },
  completeIconBg: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  completeEmoji: {
    fontSize: 48,
  },
  completeTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xxl,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    marginBottom: spacing.xxl,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  summaryRowLast: {
    borderBottomWidth: 0,
    paddingTop: spacing.md,
  },
  summaryLabel: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.base,
    color: colors.textPrimary,
    fontWeight: typography.semibold,
  },
  xpEarned: {
    fontSize: typography.lg,
    color: colors.warning,
    fontWeight: typography.bold,
  },
  completeActions: {
    width: '100%',
    gap: spacing.md,
  },
  practiceAgainButton: {
    backgroundColor: colors.repeat,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  practiceAgainText: {
    color: colors.textLight,
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  backButton: {
    backgroundColor: colors.cardAlt,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: typography.base,
    fontWeight: typography.medium,
  },
});
