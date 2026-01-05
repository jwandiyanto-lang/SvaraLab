import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Timer from '../components/Timer';
import SpeechButton, { RecordingState } from '../components/SpeechButton';
import { useGameStore, Difficulty } from '../stores/gameStore';
import { useSpeechRecognition, comparePronunciation } from '../hooks/useSpeechRecognition';
import vocabularyData from '../data/vocabulary.json';

type VocabItem = {
  id: number;
  indonesian: string;
  english: string;
  difficulty: string;
  timerSeconds: number;
  category: string;
};

type GamePhase = 'ready' | 'playing' | 'feedback' | 'gameover';

const DIFFICULTY_TIMERS: Record<Difficulty, number> = {
  easy: 5,
  medium: 3,
  hard: 2,
};

const POINTS_PER_WORD: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

export default function SpeedGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const difficulty = (params.difficulty as Difficulty) || 'medium';

  const {
    gameState,
    settings,
    startGame,
    endGame,
    answerCorrect,
    answerIncorrect,
    updateHighScore,
  } = useGameStore();

  const vocabulary = vocabularyData.vocabulary as VocabItem[];

  const [phase, setPhase] = useState<GamePhase>('ready');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [shuffledVocab, setShuffledVocab] = useState<VocabItem[]>([]);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  const currentWord = shuffledVocab[currentIndex];
  const timerSeconds = DIFFICULTY_TIMERS[difficulty];
  const basePoints = POINTS_PER_WORD[difficulty];

  // Shuffle vocabulary on mount
  useEffect(() => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    setShuffledVocab(shuffled);
  }, []);

  const { startListening, stopListening, resetTranscript } = useSpeechRecognition({
    onResult: (transcript) => {
      handleSpeechResult(transcript);
    },
  });

  const startNewRound = useCallback(() => {
    setPhase('playing');
    setIsTimerRunning(true);
    setFeedbackType(null);
    setRecordingState('idle');
    resetTranscript();
  }, [resetTranscript]);

  const handleStart = () => {
    startGame('speed');
    setScore(0);
    setLives(3);
    setStreak(0);
    setCurrentIndex(0);
    startNewRound();
  };

  const handleTimerComplete = async () => {
    setIsTimerRunning(false);
    if (recordingState === 'listening') {
      stopListening();
    }

    // Time's up = incorrect
    if (phase === 'playing') {
      await handleIncorrect();
    }
  };

  const handleSpeechPress = async () => {
    if (recordingState === 'idle') {
      setRecordingState('listening');
      await startListening();

      // Auto-stop after timer - 0.5s
      setTimeout(() => {
        // Mock for development - always trigger result
        handleSpeechResult('mock user speech');
      }, (timerSeconds - 0.5) * 1000);
    } else if (recordingState === 'listening') {
      stopListening();
      setRecordingState('processing');
    }
  };

  const handleSpeechResult = async (transcript: string) => {
    if (!currentWord || phase !== 'playing') return;

    setRecordingState('processing');
    setIsTimerRunning(false);

    // Mock comparison (70% success for testing)
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

    const streakBonus = Math.floor(streak / 3) * 5;
    const points = basePoints + streakBonus;

    setScore((prev) => prev + points);
    setStreak((prev) => prev + 1);
    setRecordingState('success');
    setFeedbackType('correct');
    setPhase('feedback');
    answerCorrect(points);

    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleIncorrect = async () => {
    if (settings.hapticEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    const newLives = lives - 1;
    setLives(newLives);
    setStreak(0);
    setRecordingState('error');
    setFeedbackType('incorrect');
    answerIncorrect();

    if (newLives <= 0) {
      setPhase('gameover');
      endGame();
      updateHighScore(score);
    } else {
      setPhase('feedback');
    }
  };

  const handleNextWord = () => {
    if (currentIndex < shuffledVocab.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      startNewRound();
    } else {
      // Completed all words!
      setPhase('gameover');
      endGame();
      updateHighScore(score);
    }
  };

  const renderLives = () => {
    return (
      <View style={styles.livesContainer}>
        {[1, 2, 3].map((i) => (
          <Text key={i} style={[styles.heart, i > lives && styles.heartEmpty]}>
            {i <= lives ? '❤️' : '🖤'}
          </Text>
        ))}
      </View>
    );
  };

  if (!currentWord && phase !== 'ready' && phase !== 'gameover') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Animated.Text style={[styles.scoreValue, { transform: [{ scale: pulseAnim }] }]}>
            {score}
          </Animated.Text>
        </View>
        {renderLives()}
        <View style={styles.streakContainer}>
          <Text style={styles.streakLabel}>Streak</Text>
          <Text style={styles.streakValue}>🔥 {streak}</Text>
        </View>
      </View>

      {/* Game Content */}
      <View style={styles.gameContent}>
        {/* Ready Phase */}
        {phase === 'ready' && (
          <View style={styles.readyContainer}>
            <Text style={styles.readyEmoji}>⚡</Text>
            <Text style={styles.readyTitle}>Speed Challenge</Text>
            <Text style={styles.readySubtitle}>
              Difficulty: {difficulty.toUpperCase()}
            </Text>
            <Text style={styles.readyTimer}>{timerSeconds} seconds per word</Text>

            <TouchableOpacity style={styles.startGameButton} onPress={handleStart}>
              <Text style={styles.startGameButtonText}>🚀 Start Game</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Playing Phase */}
        {(phase === 'playing' || phase === 'feedback') && currentWord && (
          <>
            <View style={styles.wordContainer}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>
                  {currentWord.category.replace('_', ' ')}
                </Text>
              </View>

              <Text style={styles.indonesianText}>{currentWord.indonesian}</Text>

              {phase === 'feedback' && (
                <View style={styles.answerReveal}>
                  <Text style={styles.answerLabel}>Answer:</Text>
                  <Text style={styles.englishText}>{currentWord.english}</Text>
                </View>
              )}
            </View>

            <View style={styles.timerContainer}>
              <Timer
                seconds={timerSeconds}
                isRunning={isTimerRunning}
                onComplete={handleTimerComplete}
                size="large"
              />
            </View>

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
                    {feedbackType === 'correct' ? '✓ Correct!' : '✗ Wrong'}
                  </Text>
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={handleNextWord}>
                  <Text style={styles.nextButtonText}>Next Word →</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Game Over Phase */}
        {phase === 'gameover' && (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverEmoji}>🎮</Text>
            <Text style={styles.gameOverTitle}>Game Over!</Text>

            <View style={styles.finalScoreCard}>
              <Text style={styles.finalScoreLabel}>Final Score</Text>
              <Text style={styles.finalScoreValue}>{score}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentIndex}</Text>
                <Text style={styles.statLabel}>Words</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>Best Streak</Text>
              </View>
            </View>

            <View style={styles.gameOverActions}>
              <TouchableOpacity style={styles.playAgainButton} onPress={handleStart}>
                <Text style={styles.playAgainText}>🔄 Play Again</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
                <Text style={styles.exitButtonText}>← Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  scoreValue: {
    color: '#f59e0b',
    fontSize: 28,
    fontWeight: 'bold',
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  heart: {
    fontSize: 24,
  },
  heartEmpty: {
    opacity: 0.3,
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  streakValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  readyContainer: {
    alignItems: 'center',
  },
  readyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  readyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  readySubtitle: {
    fontSize: 18,
    color: '#f59e0b',
    fontWeight: '600',
    marginBottom: 8,
  },
  readyTimer: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 32,
  },
  startGameButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 16,
  },
  startGameButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  wordContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  categoryTag: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryText: {
    color: '#9ca3af',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  indonesianText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  answerReveal: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    alignItems: 'center',
  },
  answerLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  englishText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  timerContainer: {
    marginBottom: 32,
  },
  feedbackContainer: {
    alignItems: 'center',
  },
  feedbackBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 24,
  },
  feedbackCorrect: {
    backgroundColor: '#166534',
  },
  feedbackIncorrect: {
    backgroundColor: '#991b1b',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameOverContainer: {
    alignItems: 'center',
  },
  gameOverEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  finalScoreCard: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#f59e0b',
    width: '100%',
  },
  finalScoreLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  finalScoreValue: {
    color: '#f59e0b',
    fontSize: 64,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  gameOverActions: {
    gap: 12,
    width: '100%',
  },
  playAgainButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  playAgainText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exitButton: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
