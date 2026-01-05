import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Timer from '../../components/Timer';
import SpeechButton from '../../components/SpeechButton';
import {
  useGameStore,
  Level,
  LEVEL_TIMERS,
} from '../../stores/gameStore';
import { useGrokVoice, RecordingState } from '../../hooks/useGrokVoice';
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
  const [lastTranscript, setLastTranscript] = useState('');

  const currentItem = content[currentIndex];

  // Grok Voice hook for speech recognition
  const {
    state: grokState,
    isConnected,
    transcript,
    startListening,
    stopListening,
    reset: resetGrok,
    connect,
    disconnect,
  } = useGrokVoice({
    expectedAnswer: currentItem?.english || '',
    matchThreshold: 0.6,
    systemPrompt: 'Transcribe exactly what the user says in English. Do not correct or modify their speech.',
    onTranscript: (text, isFinal) => {
      setLastTranscript(text);
      if (isFinal) {
        handleSpeechResult(text);
      }
    },
    onResult: ({ isCorrect, transcript: finalTranscript, score }) => {
      console.log(`[Repeat] Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'} (${Math.round(score * 100)}%)`);
      console.log(`[Repeat] Expected: "${currentItem?.english}" | Got: "${finalTranscript}"`);
    },
    onError: (error) => {
      console.error('[Repeat] Grok error:', error);
      setRecordingState('error');
    },
  });

  // Sync grok state to local state
  useEffect(() => {
    if (grokState === 'listening') setRecordingState('listening');
    else if (grokState === 'processing') setRecordingState('processing');
    else if (grokState === 'success') setRecordingState('success');
    else if (grokState === 'error') setRecordingState('error');
  }, [grokState]);

  // Connect to Grok when component mounts
  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  const startRound = useCallback(() => {
    setPhase('playing');
    setIsTimerRunning(true);
    setFeedbackType(null);
    setRecordingState('idle');
    setLastTranscript('');
    resetGrok();
  }, [resetGrok]);

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
    } else if (recordingState === 'listening') {
      await stopListening();
      setRecordingState('processing');
    }
  };

  const handleSpeechResult = async (spokenText: string) => {
    if (!currentItem || phase !== 'playing') return;

    setRecordingState('processing');
    setIsTimerRunning(false);

    const normalize = (str: string) =>
      str.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');

    const spokenNorm = normalize(spokenText);
    const expectedNorm = normalize(currentItem.english);

    let score = 0;
    if (spokenNorm === expectedNorm) {
      score = 1;
    } else {
      const spokenWords = spokenNorm.split(' ');
      const expectedWords = expectedNorm.split(' ');
      const matchedWords = spokenWords.filter(w => expectedWords.includes(w));
      score = matchedWords.length / Math.max(expectedWords.length, 1);
    }

    const isCorrect = score >= 0.6;

    console.log(`[Repeat] Evaluation: "${spokenText}" vs "${currentItem.english}" = ${Math.round(score * 100)}%`);

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
          title: `Ucapkan • ${levelTitle}`,
          headerBackTitle: 'Back',
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
                <MaterialIcons name="bolt" size={48} color={colors.repeat} />
              </View>
              <Text style={styles.readyTitle}>Ucapkan Mode</Text>
              <Text style={styles.readySubtitle}>Speak Fast</Text>
              <Text style={styles.readyInfo}>
                {content.length} items • {timerSeconds}s per item
              </Text>

              {/* Connection status */}
              <View style={styles.connectionStatus}>
                <View style={[
                  styles.connectionDot,
                  isConnected ? styles.connectionDotConnected : styles.connectionDotDisconnected
                ]} />
                <Text style={styles.connectionText}>
                  {isConnected ? 'Voice Ready' : 'Connecting...'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.startButton, !isConnected && styles.startButtonDisabled]}
                onPress={handleStart}
                activeOpacity={0.8}
                disabled={!isConnected}
              >
                <Text style={styles.startButtonText}>
                  {isConnected ? 'Start Practice' : 'Connecting...'}
                </Text>
                <MaterialIcons name="arrow-forward" size={18} color={colors.textLight} />
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
                <View style={styles.wordCardHeader}>
                  <MaterialIcons name="translate" size={16} color={colors.textSecondary} />
                  <Text style={styles.instructionText}>Translate & Speak</Text>
                </View>
                <View style={styles.wordCardContent}>
                  <Text style={styles.indonesianText}>"{currentItem.indonesian}"</Text>
                </View>

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
                <>
                  <SpeechButton
                    state={recordingState}
                    onPress={handleSpeechPress}
                    disabled={false}
                    size="large"
                  />
                  {recordingState === 'listening' && (
                    <View style={styles.listeningBadge}>
                      <MaterialIcons name="mic" size={16} color={colors.textPrimary} />
                      <Text style={styles.listeningText}>Listening...</Text>
                    </View>
                  )}
                </>
              )}

              {phase === 'feedback' && (
                <View style={styles.feedbackContainer}>
                  <View
                    style={[
                      styles.feedbackBadge,
                      feedbackType === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect,
                    ]}
                  >
                    <MaterialIcons
                      name={feedbackType === 'correct' ? 'check' : 'close'}
                      size={16}
                      color={feedbackType === 'correct' ? colors.success : colors.error}
                    />
                    <Text style={[
                      styles.feedbackText,
                      { color: feedbackType === 'correct' ? colors.success : colors.error }
                    ]}>
                      {feedbackType === 'correct' ? 'Excellent!' : 'Try Again'}
                    </Text>
                    {feedbackType === 'correct' && (
                      <Text style={styles.feedbackScore}>98% Match</Text>
                    )}
                  </View>

                  {/* Show what was heard */}
                  {lastTranscript && (
                    <View style={styles.transcriptContainer}>
                      <Text style={styles.transcriptLabel}>You said:</Text>
                      <Text style={styles.transcriptText}>"{lastTranscript}"</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.nextButtonText}>
                      {currentIndex < content.length - 1 ? 'Next Phrase' : 'Finish'}
                    </Text>
                    <MaterialIcons name="arrow-forward" size={16} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* Complete Phase */}
          {phase === 'complete' && (
            <View style={styles.completeContainer}>
              <Text style={styles.completeEmoji}>📊</Text>
              <Text style={styles.completeTitle}>Great job!</Text>
              <Text style={styles.completeSubtitle}>Session Complete</Text>

              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryLabel}>Total Score</Text>
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                </View>
                <Text style={styles.summaryScore}>
                  {Math.round((correctCount / content.length) * 100)}%
                </Text>
                <View style={styles.summaryProgress}>
                  <View style={[styles.summaryProgressFill, { width: `${(correctCount / content.length) * 100}%` }]} />
                </View>

                <View style={styles.summaryStats}>
                  <View style={styles.summaryStatItem}>
                    <MaterialIcons name="speed" size={16} color={colors.textSecondary} />
                    <Text style={styles.summaryStatLabel}>Speed</Text>
                    <Text style={styles.summaryStatValue}>145 WPM</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <MaterialIcons name="record-voice-over" size={16} color={colors.textSecondary} />
                    <Text style={styles.summaryStatLabel}>Accuracy</Text>
                    <Text style={styles.summaryStatValue}>{Math.round((correctCount / content.length) * 100)}%</Text>
                  </View>
                </View>

                <View style={styles.xpEarnedRow}>
                  <Text style={styles.xpEarnedLabel}>XP Earned</Text>
                  <Text style={styles.xpEarnedValue}>+{earnedXP} XP</Text>
                </View>
              </View>

              <View style={styles.completeActions}>
                <TouchableOpacity
                  style={styles.practiceAgainButton}
                  onPress={handleStart}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="replay" size={18} color={colors.textLight} />
                  <Text style={styles.practiceAgainText}>Practice Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>Back to Dashboard</Text>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
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
    color: colors.textSecondary,
    fontSize: typography.xs,
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
    backgroundColor: colors.repeatBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  readyTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
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
    marginBottom: spacing.lg,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    backgroundColor: colors.cardAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  connectionDotConnected: {
    backgroundColor: colors.success,
  },
  connectionDotDisconnected: {
    backgroundColor: colors.warning,
  },
  connectionText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  startButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.7,
  },
  startButtonText: {
    color: colors.textLight,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  xpBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  xpText: {
    color: colors.warning,
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  wordCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    width: '100%',
    marginBottom: spacing.xxl,
    ...shadows.notion,
  },
  wordCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  instructionText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: typography.semibold,
  },
  wordCardContent: {
    borderLeftWidth: 2,
    borderLeftColor: colors.textPrimary,
    paddingLeft: spacing.lg,
    paddingVertical: spacing.xs,
  },
  indonesianText: {
    fontSize: typography.xl,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  answerReveal: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  listeningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
  },
  listeningText: {
    fontSize: typography.xs,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  feedbackContainer: {
    alignItems: 'center',
    width: '100%',
  },
  feedbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  feedbackCorrect: {
    backgroundColor: colors.successBg,
    borderColor: colors.success + '30',
  },
  feedbackIncorrect: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error + '30',
  },
  feedbackText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  feedbackScore: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    color: colors.success,
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.success + '30',
    marginLeft: spacing.sm,
  },
  transcriptContainer: {
    backgroundColor: colors.cardAlt,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  transcriptLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  transcriptText: {
    fontSize: typography.base,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  nextButtonText: {
    color: colors.textLight,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  completeContainer: {
    alignItems: 'center',
    width: '100%',
  },
  completeEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  completeTitle: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  completeSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    width: '100%',
    marginBottom: spacing.xxl,
    ...shadows.notion,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  summaryScore: {
    fontSize: 40,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  summaryProgress: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  summaryProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryStatItem: {
    flex: 1,
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  summaryStatLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.medium,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  summaryStatValue: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  xpEarnedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  xpEarnedLabel: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  xpEarnedValue: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.warning,
  },
  completeActions: {
    width: '100%',
    gap: spacing.md,
  },
  practiceAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  practiceAgainText: {
    color: colors.textLight,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
});
