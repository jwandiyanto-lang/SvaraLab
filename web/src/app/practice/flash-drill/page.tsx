'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mic,
  MicOff,
  Zap,
  Trophy,
  RotateCcw,
  Loader2,
  Play,
  Timer,
  Target,
  Flame,
  Volume2,
} from 'lucide-react';
import { evaluateSpeech } from '@/services/grok';
import { speak, VOICES } from '@/services/elevenlabs';
import { useProgressStore } from '@/stores/progressStore';

// Flash drill items - Indonesian to English
const DRILL_SETS = {
  beginner: [
    { indonesian: 'Selamat pagi', english: 'Good morning', category: 'greetings' },
    { indonesian: 'Terima kasih', english: 'Thank you', category: 'greetings' },
    { indonesian: 'Sama-sama', english: "You're welcome", category: 'greetings' },
    { indonesian: 'Maaf', english: 'Sorry', category: 'greetings' },
    { indonesian: 'Ya', english: 'Yes', category: 'basics' },
    { indonesian: 'Tidak', english: 'No', category: 'basics' },
    { indonesian: 'Air', english: 'Water', category: 'nouns' },
    { indonesian: 'Makanan', english: 'Food', category: 'nouns' },
    { indonesian: 'Rumah', english: 'House', category: 'nouns' },
    { indonesian: 'Mobil', english: 'Car', category: 'nouns' },
  ],
  intermediate: [
    { indonesian: 'Bagaimana kabarmu?', english: 'How are you?', category: 'questions' },
    { indonesian: 'Di mana toilet?', english: 'Where is the toilet?', category: 'questions' },
    { indonesian: 'Berapa harganya?', english: 'How much is it?', category: 'shopping' },
    { indonesian: 'Saya lapar', english: "I'm hungry", category: 'feelings' },
    { indonesian: 'Saya lelah', english: "I'm tired", category: 'feelings' },
    { indonesian: 'Tolong bantu saya', english: 'Please help me', category: 'requests' },
    { indonesian: 'Saya tidak mengerti', english: "I don't understand", category: 'communication' },
    { indonesian: 'Bisa bicara pelan?', english: 'Can you speak slowly?', category: 'communication' },
    { indonesian: 'Jam berapa sekarang?', english: 'What time is it?', category: 'time' },
    { indonesian: 'Sampai jumpa', english: 'See you later', category: 'greetings' },
  ],
  advanced: [
    { indonesian: 'Saya sedang belajar bahasa Inggris', english: "I'm learning English", category: 'learning' },
    { indonesian: 'Bisakah Anda mengulanginya?', english: 'Can you repeat that?', category: 'communication' },
    { indonesian: 'Saya ingin memesan makanan', english: 'I would like to order food', category: 'restaurant' },
    { indonesian: 'Kapan pesawat berangkat?', english: 'When does the plane depart?', category: 'travel' },
    { indonesian: 'Saya perlu bantuan dokter', english: 'I need a doctor', category: 'emergency' },
    { indonesian: 'Di mana stasiun kereta terdekat?', english: 'Where is the nearest train station?', category: 'directions' },
    { indonesian: 'Bolehkah saya minta bon?', english: 'May I have the bill?', category: 'restaurant' },
    { indonesian: 'Maaf, saya terlambat', english: "Sorry, I'm late", category: 'apologies' },
    { indonesian: 'Senang bertemu dengan Anda', english: 'Nice to meet you', category: 'greetings' },
    { indonesian: 'Apa pekerjaan Anda?', english: 'What is your job?', category: 'conversation' },
  ],
};

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type GameMode = 'practice' | 'blitz';

interface DrillResult {
  indonesian: string;
  english: string;
  spoken: string;
  score: number;
  timeSpent: number;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [key: number]: {
      [key: number]: { transcript: string; confidence: number };
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

export default function FlashDrillPage() {
  // Game state
  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'playing' | 'result'>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [gameMode, setGameMode] = useState<GameMode>('practice');

  // Drill state
  const [drillItems, setDrillItems] = useState<typeof DRILL_SETS.beginner>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<DrillResult[]>([]);

  // Timer state
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(3); // seconds per item
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(60); // 60 seconds for blitz mode
  const [itemStartTime, setItemStartTime] = useState(0);

  // Speech state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Streak and combo
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [combo, setCombo] = useState(1);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const blitzTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { recordSession, updateWordProgress } = useProgressStore();

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => {
          setIsListening(false);
          // Auto-restart in playing state
          if (gameState === 'playing' && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Already started
            }
          }
        };

        recognition.onerror = (event) => {
          if (event.error === 'no-speech' || event.error === 'audio-capture') {
            if (gameState === 'playing' && recognitionRef.current) {
              setTimeout(() => {
                try {
                  recognitionRef.current?.start();
                } catch (e) {}
              }, 100);
            }
          }
        };

        recognition.onresult = (event) => {
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            }
          }
          if (final) {
            setTranscript(final);
          }
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (blitzTimerRef.current) clearInterval(blitzTimerRef.current);
    };
  }, [gameState]);

  // Countdown effect
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (gameState === 'countdown' && countdown === 0) {
      startDrill();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, countdown]);

  // Per-item timer (practice mode)
  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'practice' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (gameState === 'playing' && gameMode === 'practice' && timeLeft === 0 && !isEvaluating) {
      // Time's up - evaluate what we have
      evaluateAnswer();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, gameMode, timeLeft, isEvaluating]);

  // Blitz timer
  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'blitz') {
      blitzTimerRef.current = setInterval(() => {
        setBlitzTimeLeft(t => {
          if (t <= 1) {
            endGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => {
      if (blitzTimerRef.current) clearInterval(blitzTimerRef.current);
    };
  }, [gameState, gameMode]);

  // Auto-evaluate when speech is detected
  useEffect(() => {
    if (transcript && gameState === 'playing' && !isEvaluating && currentScore === null) {
      const timer = setTimeout(() => {
        evaluateAnswer();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [transcript, gameState, isEvaluating, currentScore]);

  const startGame = (mode: GameMode, diff: Difficulty) => {
    setGameMode(mode);
    setDifficulty(diff);

    // Shuffle and pick items
    const items = [...DRILL_SETS[diff]].sort(() => Math.random() - 0.5);
    setDrillItems(mode === 'blitz' ? items : items.slice(0, 10));

    setCurrentIndex(0);
    setResults([]);
    setStreak(0);
    setMaxStreak(0);
    setCombo(1);
    setCountdown(3);
    setGameState('countdown');
  };

  const startDrill = () => {
    setGameState('playing');
    setTimeLeft(difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 4 : 3);
    setBlitzTimeLeft(60);
    setItemStartTime(Date.now());
    setTranscript('');
    setCurrentScore(null);

    // Start listening
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  };

  const evaluateAnswer = useCallback(async () => {
    if (isEvaluating) return;

    setIsEvaluating(true);
    const currentItem = drillItems[currentIndex];
    const timeSpent = (Date.now() - itemStartTime) / 1000;

    let score = 0;

    if (transcript.trim()) {
      try {
        const result = await evaluateSpeech(
          currentItem.english,
          transcript,
          currentItem.indonesian
        );
        score = result.score;
      } catch {
        // Fallback scoring
        const expected = currentItem.english.toLowerCase();
        const spoken = transcript.toLowerCase();
        const similarity = calculateSimilarity(expected, spoken);
        score = similarity;
      }
    }

    // Time bonus for blitz mode
    if (gameMode === 'blitz' && timeSpent < 2) {
      score = Math.min(100, score + 10);
    }

    // Update streak
    if (score >= 70) {
      setStreak(s => s + 1);
      setMaxStreak(m => Math.max(m, streak + 1));
      setCombo(c => Math.min(c + 0.2, 3)); // Max 3x combo
    } else {
      setStreak(0);
      setCombo(1);
    }

    // Apply combo multiplier
    const finalScore = Math.round(score * combo);
    setCurrentScore(finalScore);

    // Save result
    const result: DrillResult = {
      indonesian: currentItem.indonesian,
      english: currentItem.english,
      spoken: transcript,
      score: finalScore,
      timeSpent,
    };

    setResults(prev => [...prev, result]);

    // Update word progress
    updateWordProgress(currentItem.english, score >= 70, currentItem.indonesian);

    setIsEvaluating(false);

    // Auto-advance after showing score
    setTimeout(() => {
      if (currentIndex < drillItems.length - 1) {
        nextItem();
      } else {
        endGame();
      }
    }, gameMode === 'blitz' ? 500 : 1000);
  }, [transcript, drillItems, currentIndex, itemStartTime, gameMode, combo, streak, isEvaluating, updateWordProgress]);

  const calculateSimilarity = (expected: string, spoken: string): number => {
    const expectedWords = expected.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    const spokenWords = spoken.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);

    let matches = 0;
    expectedWords.forEach(word => {
      if (spokenWords.some(sw => sw.includes(word) || word.includes(sw))) {
        matches++;
      }
    });

    return Math.round((matches / expectedWords.length) * 100);
  };

  const nextItem = () => {
    setCurrentIndex(i => i + 1);
    setTranscript('');
    setCurrentScore(null);
    setTimeLeft(difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 4 : 3);
    setItemStartTime(Date.now());
  };

  const endGame = () => {
    setGameState('result');
    if (recognitionRef.current) recognitionRef.current.abort();
    if (blitzTimerRef.current) clearInterval(blitzTimerRef.current);

    // Calculate totals
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const avgAccuracy = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      : 0;

    // Record session
    recordSession({
      mode: 'flashDrill',
      score: totalScore,
      accuracy: avgAccuracy,
      itemsCompleted: results.length,
      duration: gameMode === 'blitz' ? 60 : results.reduce((sum, r) => sum + r.timeSpent, 0),
    });
  };

  const playPronunciation = async (text: string) => {
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
    } catch {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

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

  // Menu screen
  if (gameState === 'menu') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-situation to-repeat flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Flash Drill</h1>
          <p className="text-text-secondary">Train your reflexes - See Indonesian, speak English instantly!</p>
        </div>

        {/* Game Mode Selection */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Choose Mode</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setGameMode('practice')}
              className={`p-4 rounded-xl border-2 transition-all ${
                gameMode === 'practice'
                  ? 'border-respond bg-respond/5'
                  : 'border-border hover:border-border-light'
              }`}
            >
              <Target className={`w-8 h-8 mb-2 ${gameMode === 'practice' ? 'text-respond' : 'text-text-tertiary'}`} />
              <h3 className={`font-bold ${gameMode === 'practice' ? 'text-respond' : 'text-text-primary'}`}>Practice</h3>
              <p className="text-xs text-text-tertiary">10 items, timed per item</p>
            </button>
            <button
              onClick={() => setGameMode('blitz')}
              className={`p-4 rounded-xl border-2 transition-all ${
                gameMode === 'blitz'
                  ? 'border-situation bg-situation/5'
                  : 'border-border hover:border-border-light'
              }`}
            >
              <Flame className={`w-8 h-8 mb-2 ${gameMode === 'blitz' ? 'text-situation' : 'text-text-tertiary'}`} />
              <h3 className={`font-bold ${gameMode === 'blitz' ? 'text-situation' : 'text-text-primary'}`}>Blitz</h3>
              <p className="text-xs text-text-tertiary">60 seconds, as many as you can!</p>
            </button>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Difficulty</h2>
          <div className="space-y-2">
            {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map(diff => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  difficulty === diff
                    ? 'border-listen bg-listen/5'
                    : 'border-border hover:border-border-light'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    diff === 'beginner' ? 'bg-listen' :
                    diff === 'intermediate' ? 'bg-repeat' : 'bg-situation'
                  }`} />
                  <span className={`font-medium capitalize ${difficulty === diff ? 'text-listen' : 'text-text-primary'}`}>
                    {diff}
                  </span>
                </div>
                <span className="text-xs text-text-tertiary">
                  {diff === 'beginner' ? '5s per item' :
                   diff === 'intermediate' ? '4s per item' : '3s per item'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => startGame(gameMode, difficulty)}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 text-white rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] shadow-lg ${
            gameMode === 'blitz' ? 'bg-situation hover:bg-situation/90' : 'bg-respond hover:bg-respond/90'
          }`}
        >
          <Play className="w-6 h-6" />
          Start {gameMode === 'blitz' ? 'Blitz' : 'Practice'}
        </button>
      </div>
    );
  }

  // Countdown screen
  if (gameState === 'countdown') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 border-4 ${
            gameMode === 'blitz' ? 'border-situation bg-situation/10' : 'border-respond bg-respond/10'
          }`}>
            <span className={`text-6xl font-bold ${gameMode === 'blitz' ? 'text-situation' : 'text-respond'}`}>
              {countdown}
            </span>
          </div>
          <p className="text-lg text-text-secondary">Get ready to speak!</p>
          <p className="text-sm text-text-tertiary mt-2">
            {gameMode === 'blitz' ? '60 seconds - Go fast!' : `${drillItems.length} items - Take your time`}
          </p>
        </div>
      </div>
    );
  }

  // Playing screen
  if (gameState === 'playing') {
    const currentItem = drillItems[currentIndex];

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={endGame}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-repeat-bg rounded-full">
                <Flame className="w-4 h-4 text-repeat" />
                <span className="text-sm font-bold text-repeat">{streak}</span>
              </div>
            )}
            {/* Combo */}
            {combo > 1 && (
              <div className="px-3 py-1 bg-situation-bg rounded-full">
                <span className="text-sm font-bold text-situation">{combo.toFixed(1)}x</span>
              </div>
            )}
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${
              gameMode === 'blitz'
                ? blitzTimeLeft <= 10 ? 'bg-situation text-white' : 'bg-situation-bg text-situation'
                : timeLeft <= 1 ? 'bg-situation text-white' : 'bg-respond-bg text-respond'
            }`}>
              <Timer className="w-4 h-4" />
              {gameMode === 'blitz' ? blitzTimeLeft : timeLeft}s
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-tertiary">
              {currentIndex + 1} / {drillItems.length}
            </span>
            <span className="text-xs text-text-tertiary">
              {results.reduce((sum, r) => sum + r.score, 0)} pts
            </span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                gameMode === 'blitz' ? 'bg-situation' : 'bg-respond'
              }`}
              style={{ width: `${((currentIndex + 1) / drillItems.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Item */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-6">
          <div className="text-center">
            <span className="text-xs font-semibold text-listen uppercase tracking-wide mb-2 block">
              Say in English:
            </span>
            <p className="text-3xl font-bold text-text-primary mb-6">{currentItem.indonesian}</p>

            {/* Mic indicator */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className={`w-4 h-4 rounded-full ${isListening ? 'bg-listen animate-pulse' : 'bg-border'}`} />
              <span className={`text-sm font-medium ${isListening ? 'text-listen' : 'text-text-tertiary'}`}>
                {isListening ? 'Listening...' : 'Waiting...'}
              </span>
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="p-4 bg-background-alt rounded-xl mb-4">
                <p className="text-lg text-text-primary">&ldquo;{transcript}&rdquo;</p>
              </div>
            )}

            {/* Score display */}
            {currentScore !== null && (
              <div className={`p-4 rounded-xl ${
                currentScore >= 70 ? 'bg-success-bg' : currentScore >= 40 ? 'bg-respond-bg' : 'bg-error-bg'
              }`}>
                <div className="flex items-center justify-center gap-4">
                  <span className={`text-3xl font-bold ${
                    currentScore >= 70 ? 'text-success' : currentScore >= 40 ? 'text-respond' : 'text-error'
                  }`}>
                    {currentScore}%
                  </span>
                  <button
                    onClick={() => playPronunciation(currentItem.english)}
                    className="p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
                  >
                    <Volume2 className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
                <p className="text-sm text-text-secondary mt-2">
                  Correct: &ldquo;{currentItem.english}&rdquo;
                </p>
              </div>
            )}

            {isEvaluating && (
              <div className="flex items-center justify-center gap-2 text-text-tertiary">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Checking...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  if (gameState === 'result') {
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const avgAccuracy = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      : 0;
    const perfectCount = results.filter(r => r.score >= 90).length;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-2xl p-8 text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {gameMode === 'blitz' ? 'Blitz Complete!' : 'Drill Complete!'}
          </h2>
          <p className="text-text-secondary mb-6">
            You completed {results.length} items
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-background-alt rounded-xl p-4">
              <p className="text-3xl font-bold text-respond">{totalScore}</p>
              <p className="text-xs text-text-tertiary">Total Points</p>
            </div>
            <div className="bg-background-alt rounded-xl p-4">
              <p className="text-3xl font-bold text-listen">{avgAccuracy}%</p>
              <p className="text-xs text-text-tertiary">Accuracy</p>
            </div>
            <div className="bg-background-alt rounded-xl p-4">
              <p className="text-3xl font-bold text-repeat">{maxStreak}</p>
              <p className="text-xs text-text-tertiary">Best Streak</p>
            </div>
          </div>

          {perfectCount > 0 && (
            <div className="mb-6 p-3 bg-success-bg rounded-xl">
              <p className="text-sm font-medium text-success">
                {perfectCount} perfect {perfectCount === 1 ? 'answer' : 'answers'}!
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => startGame(gameMode, difficulty)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="flex items-center gap-2 px-6 py-3 bg-background-alt text-text-primary rounded-xl font-medium hover:bg-border transition-colors"
            >
              Change Mode
            </button>
          </div>
        </div>

        {/* Results breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Results</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  result.score >= 70 ? 'bg-success-bg/50' : result.score >= 40 ? 'bg-respond-bg/50' : 'bg-error-bg/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{result.indonesian}</p>
                  <p className="text-xs text-text-tertiary truncate">
                    {result.spoken || '(no response)'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playPronunciation(result.english)}
                    className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-text-tertiary" />
                  </button>
                  <span className={`text-sm font-bold ${
                    result.score >= 70 ? 'text-success' : result.score >= 40 ? 'text-respond' : 'text-error'
                  }`}>
                    {result.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
