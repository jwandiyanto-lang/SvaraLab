'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mic,
  MicOff,
  RotateCcw,
  ChevronRight,
  Trophy,
  Loader2,
  Play,
  Zap,
  CheckCircle2,
  Circle,
  Volume2,
  History,
  Trash2,
  Clock,
} from 'lucide-react';
import { evaluateSpeech, EvaluationResult } from '@/services/grok';
import { speak, VOICES } from '@/services/elevenlabs';

// Indonesian to English speaking practice
const PHRASES = [
  { id: 1, english: 'Hello, how are you?', indonesian: 'Halo, apa kabar?', difficulty: 'easy' },
  { id: 2, english: 'Nice to meet you', indonesian: 'Senang bertemu dengan Anda', difficulty: 'easy' },
  { id: 3, english: 'Thank you very much', indonesian: 'Terima kasih banyak', difficulty: 'easy' },
  { id: 4, english: 'Where is the train station?', indonesian: 'Di mana stasiun kereta?', difficulty: 'medium' },
  { id: 5, english: 'I would like to order some food', indonesian: 'Saya ingin memesan makanan', difficulty: 'medium' },
  { id: 6, english: 'Could you please repeat that?', indonesian: 'Bisakah Anda mengulanginya?', difficulty: 'medium' },
  { id: 7, english: 'What time does the meeting start?', indonesian: 'Jam berapa rapat dimulai?', difficulty: 'medium' },
  { id: 8, english: 'I am learning to speak English', indonesian: 'Saya sedang belajar berbicara bahasa Inggris', difficulty: 'hard' },
];

interface Recording {
  id: string;
  phrase: string;
  transcript: string;
  score: number;
  audioUrl?: string;
  timestamp: number;
}

interface TodayHistory {
  date: string;
  recordings: Recording[];
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: { error: string }) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function SpeakPage() {
  // Game states
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete' | 'history'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedPhrases, setCompletedPhrases] = useState<Set<number>>(new Set());
  const [phraseScores, setPhraseScores] = useState<Record<number, number>>({});

  // Speech states
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Recording states
  const [todayHistory, setTodayHistory] = useState<TodayHistory | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  // Audio playback
  const [playingId, setPlayingId] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentPhrase = PHRASES[currentIndex];

  // Get today's date string
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Load history and clean old entries
  useEffect(() => {
    const today = getTodayDate();
    const stored = localStorage.getItem('svaralab-speak-history');

    if (stored) {
      const history: TodayHistory = JSON.parse(stored);
      // Auto-delete if not today
      if (history.date !== today) {
        localStorage.removeItem('svaralab-speak-history');
        setTodayHistory({ date: today, recordings: [] });
      } else {
        setTodayHistory(history);
      }
    } else {
      setTodayHistory({ date: today, recordings: [] });
    }
  }, []);

  // Save history
  const saveHistory = useCallback((recordings: Recording[]) => {
    const history: TodayHistory = {
      date: getTodayDate(),
      recordings,
    };
    localStorage.setItem('svaralab-speak-history', JSON.stringify(history));
    setTodayHistory(history);
  }, []);

  // Add recording to history
  const addRecording = useCallback((recording: Recording) => {
    const newRecordings = [...(todayHistory?.recordings || []), recording];
    saveHistory(newRecordings);
  }, [todayHistory, saveHistory]);

  // Clear history
  const clearHistory = () => {
    localStorage.removeItem('svaralab-speak-history');
    setTodayHistory({ date: getTodayDate(), recordings: [] });
  };

  // Initialize Speech Recognition with continuous mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep listening
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onend = () => {
          setIsListening(false);
          // Auto-restart if still in playing state
          if (gameState === 'playing' && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Already started
            }
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'no-speech' || event.error === 'audio-capture') {
            // Restart on these errors
            if (gameState === 'playing' && recognitionRef.current) {
              setTimeout(() => {
                try {
                  recognitionRef.current?.start();
                } catch (e) {
                  // Ignore
                }
              }, 100);
            }
          }
        };

        recognition.onresult = (event) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += result;
            } else {
              interim += result;
            }
          }

          setInterimTranscript(interim);

          if (final) {
            setTranscript(final);
            setInterimTranscript('');
          }
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [gameState]);

  // Setup audio recording
  const setupRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(prev => [...prev, e.data]);
        }
      };
      setMediaRecorder(recorder);
      return recorder;
    } catch (error) {
      console.error('Could not setup recording:', error);
      return null;
    }
  };

  // Start game
  const startGame = async () => {
    setGameState('playing');
    setCurrentIndex(0);
    setCompletedPhrases(new Set());
    setPhraseScores({});
    setTranscript('');
    setInterimTranscript('');
    setEvaluation(null);

    // Start continuous listening
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started
      }
    }

    // Setup recording
    await setupRecording();
  };

  // Evaluate current phrase
  const evaluatePhrase = useCallback(async () => {
    if (!transcript.trim()) return;

    setIsEvaluating(true);

    // Start recording this attempt
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      setAudioChunks([]);
      mediaRecorder.start();
    }

    try {
      const result = await evaluateSpeech(
        currentPhrase.english,
        transcript,
        currentPhrase.indonesian
      );

      setEvaluation(result);
      setPhraseScores(prev => ({ ...prev, [currentIndex]: result.score }));

      // Save to history
      const recording: Recording = {
        id: `${Date.now()}-${currentIndex}`,
        phrase: currentPhrase.english,
        transcript: transcript,
        score: result.score,
        timestamp: Date.now(),
      };

      // Stop recording and save audio
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        // Audio will be available after ondataavailable fires
      }

      addRecording(recording);

      if (result.score >= 50) {
        setCompletedPhrases(prev => new Set(prev).add(currentIndex));
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      const similarity = calculateSimilarity(currentPhrase.english, transcript);
      const result = {
        score: similarity,
        feedback: similarity >= 80 ? 'Great job!' : similarity >= 50 ? 'Good try!' : 'Keep practicing!',
        pronunciation: similarity >= 80 ? 'Clear' : 'Needs practice',
        grammar: 'N/A',
        suggestions: similarity < 80 ? ['Speak slowly and clearly'] : [],
      };
      setEvaluation(result);
      setPhraseScores(prev => ({ ...prev, [currentIndex]: similarity }));

      addRecording({
        id: `${Date.now()}-${currentIndex}`,
        phrase: currentPhrase.english,
        transcript: transcript,
        score: similarity,
        timestamp: Date.now(),
      });

      if (similarity >= 50) {
        setCompletedPhrases(prev => new Set(prev).add(currentIndex));
      }
    } finally {
      setIsEvaluating(false);
    }
  }, [transcript, currentPhrase, currentIndex, mediaRecorder, addRecording]);

  // Auto-evaluate when speech is detected
  useEffect(() => {
    if (transcript && gameState === 'playing' && !isEvaluating && !evaluation) {
      const timer = setTimeout(() => {
        evaluatePhrase();
      }, 1500); // Wait 1.5s after speech stops

      return () => clearTimeout(timer);
    }
  }, [transcript, gameState, isEvaluating, evaluation, evaluatePhrase]);

  // Basic similarity calculation
  const calculateSimilarity = (expected: string, spoken: string): number => {
    const expectedWords = expected.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    const spokenWords = spoken.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);

    let matches = 0;
    expectedWords.forEach((word) => {
      if (spokenWords.some((sw) => sw.includes(word) || word.includes(sw))) {
        matches++;
      }
    });

    return Math.round((matches / expectedWords.length) * 100);
  };

  // Go to next phrase
  const nextPhrase = () => {
    if (currentIndex < PHRASES.length - 1) {
      setCurrentIndex(i => i + 1);
      setTranscript('');
      setInterimTranscript('');
      setEvaluation(null);
    } else {
      // Game complete
      setGameState('complete');
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    }
  };

  // Skip to specific phrase
  const goToPhrase = (index: number) => {
    setCurrentIndex(index);
    setTranscript('');
    setInterimTranscript('');
    setEvaluation(null);
  };

  // Play phrase audio
  const playPhrase = async (text: string) => {
    try {
      const settings = localStorage.getItem('svaralab-settings');
      const selectedVoice = settings ? JSON.parse(settings).selectedVoice : 'matilda';
      const voiceKey = selectedVoice as keyof typeof VOICES;

      const audioUrl = await speak(text, {
        voiceId: VOICES[voiceKey] || VOICES.matilda,
        stability: 0.3,
        similarityBoost: 0.85,
        style: 0.5,
      });

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Calculate total score
  const totalScore = Object.values(phraseScores).reduce((sum, score) => sum + Math.round(score / 10), 0);

  if (!isSupported) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-error-bg border border-error/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-error mb-2">Browser Not Supported</h2>
          <p className="text-text-secondary">
            Your browser doesn&apos;t support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-xl">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  // Intro screen with test overview
  if (gameState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
          <button
            onClick={() => setGameState('history')}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <History className="w-5 h-5" />
            <span className="text-sm font-medium">Today&apos;s History</span>
          </button>
        </div>

        {/* Game Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-repeat to-repeat/60 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Speak Fast</h1>
          <p className="text-text-secondary">Indonesian to English speaking challenge</p>
        </div>

        {/* Test Overview */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
            Today&apos;s Challenge ({PHRASES.length} phrases)
          </h2>
          <div className="space-y-2">
            {PHRASES.map((phrase, index) => (
              <div
                key={phrase.id}
                className="flex items-center gap-3 p-3 bg-background-alt rounded-xl"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  phrase.difficulty === 'easy'
                    ? 'bg-listen-bg text-listen'
                    : phrase.difficulty === 'medium'
                    ? 'bg-repeat-bg text-repeat'
                    : 'bg-situation-bg text-situation'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{phrase.indonesian}</p>
                  <p className="text-xs text-text-tertiary">{phrase.difficulty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-respond/5 border border-respond/20 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-respond mb-3">How it works</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-respond font-bold">1.</span>
              See the Indonesian phrase
            </li>
            <li className="flex items-start gap-2">
              <span className="text-respond font-bold">2.</span>
              Speak the English translation (mic is always on)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-respond font-bold">3.</span>
              Get instant AI feedback on your pronunciation
            </li>
            <li className="flex items-start gap-2">
              <span className="text-respond font-bold">4.</span>
              Your attempts are saved in today&apos;s history
            </li>
          </ul>
        </div>

        {/* Start Button */}
        <button
          onClick={startGame}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-repeat text-white rounded-xl font-semibold text-lg hover:bg-repeat/90 transition-all hover:scale-[1.02] shadow-lg"
        >
          <Play className="w-6 h-6" />
          Start Challenge
        </button>
      </div>
    );
  }

  // History view
  if (gameState === 'history') {
    const recordings = todayHistory?.recordings || [];

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setGameState('intro')}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          {recordings.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 text-situation hover:text-situation/80 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Clear</span>
            </button>
          )}
        </div>

        <div className="text-center mb-8">
          <History className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Today&apos;s Practice</h1>
          <p className="text-text-secondary text-sm">
            {recordings.length} attempt{recordings.length !== 1 ? 's' : ''} recorded
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            <Clock className="w-3 h-3 inline mr-1" />
            Auto-clears at midnight
          </p>
        </div>

        {recordings.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-text-secondary mb-4">No recordings yet today</p>
            <button
              onClick={() => setGameState('intro')}
              className="px-6 py-3 bg-repeat text-white rounded-xl font-medium hover:bg-repeat/90 transition-colors"
            >
              Start Practicing
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.slice().reverse().map((recording) => (
              <div
                key={recording.id}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary mb-1">{recording.phrase}</p>
                    <p className="text-xs text-text-tertiary">
                      You said: &ldquo;{recording.transcript}&rdquo;
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    recording.score >= 80
                      ? 'bg-success-bg text-success'
                      : recording.score >= 50
                      ? 'bg-respond-bg text-respond'
                      : 'bg-error-bg text-error'
                  }`}>
                    {recording.score}%
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => playPhrase(recording.phrase)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-background-alt rounded-lg text-xs font-medium text-text-secondary hover:bg-border transition-colors"
                  >
                    <Volume2 className="w-3 h-3" />
                    Listen
                  </button>
                  <span className="text-xs text-text-tertiary">
                    {new Date(recording.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Complete screen
  if (gameState === 'complete') {
    const completedCount = completedPhrases.size;
    const avgScore = Object.values(phraseScores).length > 0
      ? Math.round(Object.values(phraseScores).reduce((a, b) => a + b, 0) / Object.values(phraseScores).length)
      : 0;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Challenge Complete!</h2>
          <p className="text-text-secondary mb-6">
            You completed {completedCount} of {PHRASES.length} phrases
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-background-alt rounded-xl p-4">
              <p className="text-3xl font-bold text-repeat">{totalScore}</p>
              <p className="text-xs text-text-tertiary">Points earned</p>
            </div>
            <div className="bg-background-alt rounded-xl p-4">
              <p className="text-3xl font-bold text-respond">{avgScore}%</p>
              <p className="text-xs text-text-tertiary">Avg accuracy</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={() => setGameState('history')}
              className="flex items-center gap-2 px-6 py-3 bg-background-alt text-text-primary rounded-xl font-medium hover:bg-border transition-colors"
            >
              <History className="w-4 h-4" />
              View History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing state
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            if (recognitionRef.current) recognitionRef.current.abort();
            setGameState('intro');
          }}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
            isListening ? 'bg-success-bg' : 'bg-border'
          }`}>
            {isListening ? (
              <Mic className="w-4 h-4 text-success animate-pulse" />
            ) : (
              <MicOff className="w-4 h-4 text-text-tertiary" />
            )}
            <span className={`text-xs font-medium ${isListening ? 'text-success' : 'text-text-tertiary'}`}>
              {isListening ? 'Listening' : 'Off'}
            </span>
          </div>
          <div className="px-3 py-1 bg-repeat-bg rounded-full">
            <span className="text-sm font-semibold text-repeat">{totalScore} pts</span>
          </div>
        </div>
      </div>

      {/* Progress Pills */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
        {PHRASES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToPhrase(index)}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              index === currentIndex
                ? 'bg-repeat text-white scale-110'
                : completedPhrases.has(index)
                ? 'bg-success text-white'
                : 'bg-border text-text-tertiary hover:bg-border/80'
            }`}
          >
            {completedPhrases.has(index) ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              index + 1
            )}
          </button>
        ))}
      </div>

      {/* Current Phrase Card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-listen uppercase tracking-wide">
            Translate to English
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            currentPhrase.difficulty === 'easy'
              ? 'bg-listen-bg text-listen'
              : currentPhrase.difficulty === 'medium'
              ? 'bg-repeat-bg text-repeat'
              : 'bg-situation-bg text-situation'
          }`}>
            {currentPhrase.difficulty}
          </span>
        </div>

        {/* Indonesian */}
        <p className="text-2xl font-bold text-text-primary mb-4">{currentPhrase.indonesian}</p>

        {/* English Answer (shown after evaluation or as hint) */}
        {evaluation && (
          <div className="p-4 bg-respond/5 rounded-xl border border-respond/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-respond uppercase">English</span>
              <button
                onClick={() => playPhrase(currentPhrase.english)}
                className="p-1.5 rounded-lg bg-respond/10 text-respond hover:bg-respond/20 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-lg font-bold text-respond">{currentPhrase.english}</p>
          </div>
        )}
      </div>

      {/* Live Speech Display */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-success animate-pulse' : 'bg-border'}`} />
          <span className="text-xs font-semibold text-text-secondary uppercase">Your Speech</span>
        </div>

        <div className="min-h-[60px] flex items-center justify-center">
          {isEvaluating ? (
            <div className="flex items-center gap-2 text-text-tertiary">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Analyzing...</span>
            </div>
          ) : transcript || interimTranscript ? (
            <p className="text-xl text-text-primary text-center">
              {transcript && <span className="font-medium">{transcript}</span>}
              {interimTranscript && (
                <span className="text-text-tertiary"> {interimTranscript}</span>
              )}
            </p>
          ) : (
            <p className="text-text-tertiary text-center">
              {isListening ? 'Start speaking...' : 'Mic is off'}
            </p>
          )}
        </div>
      </div>

      {/* Evaluation Result */}
      {evaluation && (
        <div className={`rounded-2xl mb-4 overflow-hidden border ${
          evaluation.score >= 80
            ? 'bg-success-bg border-success/20'
            : evaluation.score >= 50
            ? 'bg-respond-bg border-respond/20'
            : 'bg-error-bg border-error/20'
        }`}>
          <div className={`p-4 ${
            evaluation.score >= 80 ? 'bg-success/10' : evaluation.score >= 50 ? 'bg-respond/10' : 'bg-error/10'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${
                evaluation.score >= 80 ? 'text-success' : evaluation.score >= 50 ? 'text-respond' : 'text-error'
              }`}>
                {evaluation.feedback}
              </span>
              <span className={`text-2xl font-bold ${
                evaluation.score >= 80 ? 'text-success' : evaluation.score >= 50 ? 'text-respond' : 'text-error'
              }`}>
                {evaluation.score}%
              </span>
            </div>
          </div>

          {evaluation.suggestions && evaluation.suggestions.length > 0 && (
            <div className="p-4 border-t border-border/30">
              <ul className="space-y-1">
                {evaluation.suggestions.map((tip, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                    <span className="text-respond">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {evaluation ? (
          <>
            <button
              onClick={() => {
                setTranscript('');
                setInterimTranscript('');
                setEvaluation(null);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-background-alt text-text-primary rounded-xl font-medium hover:bg-border transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={nextPhrase}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
            >
              {currentIndex < PHRASES.length - 1 ? 'Next' : 'Finish'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => playPhrase(currentPhrase.english)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-respond/10 text-respond rounded-xl font-medium hover:bg-respond/20 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            Hear Answer (Hint)
          </button>
        )}
      </div>
    </div>
  );
}
