import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';

export type RecordingState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  state: RecordingState;
  transcript: string;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
}

/**
 * Custom hook for speech recognition
 *
 * Note: This is a mock implementation for development.
 * In production, integrate with:
 * - expo-speech-recognition (device native)
 * - OpenAI Whisper API (better accuracy)
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const { onResult, onError, language = 'en-US' } = options;

  const [isListening, setIsListening] = useState(false);
  const [state, setState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback(async () => {
    try {
      setState('listening');
      setIsListening(true);
      setTranscript('');

      // Mock implementation - simulates recording for 3 seconds
      // In production, this would use actual speech recognition
      console.log('[SpeechRecognition] Started listening...');

      // For development: Show alert that this is a mock
      if (__DEV__) {
        console.log('[SpeechRecognition] Development mode - using mock recognition');
      }
    } catch (error) {
      console.error('[SpeechRecognition] Start error:', error);
      setState('error');
      setIsListening(false);
      onError?.('Failed to start speech recognition');
    }
  }, [onError]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setState('processing');

    // Mock processing delay
    setTimeout(() => {
      // In development, return a mock transcript
      // In production, this would be the actual transcript from the API
      const mockTranscript = 'mock transcript';
      setTranscript(mockTranscript);
      setState('idle');
      onResult?.(mockTranscript);
    }, 500);
  }, [onResult]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setState('idle');
  }, []);

  return {
    isListening,
    state,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  };
}

/**
 * Fuzzy string comparison for checking pronunciation
 * Returns a score from 0 to 1 (1 = perfect match)
 */
export function comparePronunciation(
  spoken: string,
  expected: string,
  threshold: number = 0.7
): { isCorrect: boolean; score: number } {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');

  const spokenNorm = normalize(spoken);
  const expectedNorm = normalize(expected);

  // Exact match
  if (spokenNorm === expectedNorm) {
    return { isCorrect: true, score: 1 };
  }

  // Calculate Levenshtein distance-based similarity
  const distance = levenshteinDistance(spokenNorm, expectedNorm);
  const maxLength = Math.max(spokenNorm.length, expectedNorm.length);
  const score = maxLength > 0 ? 1 - distance / maxLength : 1;

  return {
    isCorrect: score >= threshold,
    score,
  };
}

/**
 * Levenshtein distance calculation
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if speech recognition is available on the device
 */
export async function checkSpeechRecognitionAvailable(): Promise<boolean> {
  // In development, always return true for testing
  if (__DEV__) {
    return true;
  }

  // In production, check actual availability
  // This would check for expo-speech-recognition or Whisper API availability
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
