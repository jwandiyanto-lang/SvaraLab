import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import Timer from '../components/Timer';
import SpeechButton, { RecordingState } from '../components/SpeechButton';
import { useGameStore } from '../stores/gameStore';
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

export default function VocabGameScreen() {
  const router = useRouter();
  const { settings, incrementWordsLearned } = useGameStore();
  const vocabulary = vocabularyData.vocabulary as VocabItem[];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [shuffledVocab, setShuffledVocab] = useState<VocabItem[]>([]);

  const currentWord = shuffledVocab[currentIndex];

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

  const speakWord = useCallback(() => {
    if (!currentWord) return;

    const voiceMap: Record<string, string> = {
      us: 'en-US',
      uk: 'en-GB',
      au: 'en-AU',
    };

    Speech.speak(currentWord.english, {
      language: voiceMap[settings.accent] || 'en-US',
      rate: settings.playbackSpeed,
    });
  }, [currentWord, settings.accent, settings.playbackSpeed]);

  const handleStart = () => {
    setIsTimerRunning(true);
    setShowAnswer(false);
    setFeedback(null);
    resetTranscript();

    if (settings.autoPlayAudio) {
      speakWord();
    }
  };

  const handleTimerComplete = () => {
    setIsTimerRunning(false);
    if (recordingState === 'listening') {
      stopListening();
    }
  };

  const handleSpeechPress = async () => {
    if (recordingState === 'idle') {
      setRecordingState('listening');
      await startListening();

      // Auto-stop after 3 seconds for this demo
      setTimeout(() => {
        // Mock for development - always trigger result
        handleSpeechResult('mock user speech');
      }, 3000);
    } else if (recordingState === 'listening') {
      stopListening();
      setRecordingState('processing');
    }
  };

  const handleSpeechResult = (transcript: string) => {
    if (!currentWord) return;

    setRecordingState('processing');

    // Compare pronunciation (mock for development)
    // In production, use actual transcript from Whisper API
    const { isCorrect, score } = comparePronunciation(
      transcript,
      currentWord.english,
      0.6 // Lower threshold for development
    );

    setTimeout(() => {
      if (isCorrect || Math.random() > 0.3) {
        // Mock: 70% success rate for testing
        setRecordingState('success');
        setFeedback('correct');
        incrementWordsLearned();
      } else {
        setRecordingState('error');
        setFeedback('incorrect');
      }

      setShowAnswer(true);
      setIsTimerRunning(false);
    }, 500);
  };

  const handleNext = () => {
    if (currentIndex < shuffledVocab.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setFeedback(null);
      setRecordingState('idle');
      setIsTimerRunning(false);
    } else {
      // End of vocabulary
      router.back();
    }
  };

  const handleSkip = () => {
    setShowAnswer(true);
    setFeedback('incorrect');
    setIsTimerRunning(false);
  };

  if (!currentWord) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Progress */}
        <View style={styles.progressBar}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / shuffledVocab.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {shuffledVocab.length}
          </Text>
        </View>

        {/* Word Card */}
        <View style={styles.wordCard}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{currentWord.difficulty}</Text>
          </View>

          <Text style={styles.indonesianText}>{currentWord.indonesian}</Text>

          {showAnswer && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerLabel}>Answer:</Text>
              <Text style={styles.englishText}>{currentWord.english}</Text>
            </View>
          )}

          {/* Feedback */}
          {feedback && (
            <View
              style={[
                styles.feedbackBadge,
                feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect,
              ]}
            >
              <Text style={styles.feedbackText}>
                {feedback === 'correct' ? '✓ Correct!' : '✗ Try Again'}
              </Text>
            </View>
          )}
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Timer
            seconds={currentWord.timerSeconds}
            isRunning={isTimerRunning}
            onComplete={handleTimerComplete}
            size="large"
          />
        </View>

        {/* Speech Button */}
        <View style={styles.speechContainer}>
          <SpeechButton
            state={recordingState}
            onPress={handleSpeechPress}
            disabled={showAnswer}
            size="large"
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {!isTimerRunning && !showAnswer && (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>▶️ Start</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.speakButton} onPress={speakWord}>
            <Text style={styles.speakButtonText}>🔊 Listen</Text>
          </TouchableOpacity>

          {isTimerRunning && !showAnswer && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip →</Text>
            </TouchableOpacity>
          )}

          {showAnswer && (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentIndex < shuffledVocab.length - 1 ? 'Next →' : 'Finish'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  progressBar: {
    width: '100%',
    marginBottom: 24,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  wordCard: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  difficultyBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  difficultyText: {
    color: '#9ca3af',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  indonesianText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  answerContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    width: '100%',
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
    textAlign: 'center',
  },
  feedbackBadge: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  feedbackCorrect: {
    backgroundColor: '#166534',
  },
  feedbackIncorrect: {
    backgroundColor: '#991b1b',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerContainer: {
    marginBottom: 32,
  },
  speechContainer: {
    marginBottom: 32,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  startButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  speakButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  speakButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: '#4b5563',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});
