'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, Volume2, ChevronRight, Trophy, RotateCcw, Loader2, Mic, MicOff, Timer, Repeat, MessageSquare, Target } from 'lucide-react';
import { speak, VOICES } from '@/services/elevenlabs';
import { evaluateSpeech } from '@/services/grok';
import { useProgressStore } from '@/stores/progressStore';

// Listening modes
type ListenMode = 'comprehension' | 'shadow';

// Audio prompts for listening comprehension - using natural conversational voices
const PROMPTS = [
  {
    id: 1,
    text: 'Hello, my name is John. I am from America and I work as a software engineer.',
    question: 'Where is John from?',
    answer: 'America',
    voiceId: VOICES.brian,
  },
  {
    id: 2,
    text: 'The weather today is sunny and warm. Perfect for a walk in the park.',
    question: 'How is the weather today?',
    answer: 'sunny and warm',
    voiceId: VOICES.jessica,
  },
  {
    id: 3,
    text: 'I work as a teacher at the local elementary school. I teach mathematics to children.',
    question: 'What subject does the person teach?',
    answer: 'mathematics',
    voiceId: VOICES.matilda,
  },
  {
    id: 4,
    text: 'The meeting starts at three PM in the main conference room on the second floor.',
    question: 'What time does the meeting start?',
    answer: '3 PM',
    voiceId: VOICES.daniel,
  },
  {
    id: 5,
    text: 'Please bring two bottles of water and some healthy snacks for the trip tomorrow.',
    question: 'How many bottles of water should you bring?',
    answer: 'two',
    voiceId: VOICES.lily,
  },
  {
    id: 6,
    text: 'The train to London departs at half past nine from platform number five.',
    question: 'Which platform does the train depart from?',
    answer: 'five',
    voiceId: VOICES.george,
  },
];

// Shadow speaking prompts - shorter phrases for repetition
const SHADOW_PROMPTS = [
  { id: 1, text: 'Nice to meet you.', voiceId: VOICES.matilda, accent: 'American' },
  { id: 2, text: 'How are you doing today?', voiceId: VOICES.brian, accent: 'American' },
  { id: 3, text: 'Could you help me, please?', voiceId: VOICES.daniel, accent: 'British' },
  { id: 4, text: 'What time does the bus arrive?', voiceId: VOICES.lily, accent: 'British' },
  { id: 5, text: 'I would like a cup of coffee.', voiceId: VOICES.jessica, accent: 'American' },
  { id: 6, text: 'Where is the nearest station?', voiceId: VOICES.george, accent: 'British' },
  { id: 7, text: 'Thank you very much for your help.', voiceId: VOICES.matilda, accent: 'American' },
  { id: 8, text: 'Excuse me, is this seat taken?', voiceId: VOICES.daniel, accent: 'British' },
  { id: 9, text: 'Can you repeat that, please?', voiceId: VOICES.jessica, accent: 'American' },
  { id: 10, text: 'It was lovely meeting you.', voiceId: VOICES.lily, accent: 'British' },
];

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

export default function ListenPage() {
  // Mode selection
  const [mode, setMode] = useState<ListenMode | null>(null);

  // Comprehension mode state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  // Timer states
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canSpeak, setCanSpeak] = useState(false);

  // Shadow mode specific
  const [shadowIndex, setShadowIndex] = useState(0);
  const [shadowPhase, setShadowPhase] = useState<'listen' | 'repeat' | 'feedback'>('listen');
  const [shadowScore, setShadowScore] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [shadowResults, setShadowResults] = useState<Array<{ text: string; score: number; spoken: string }>>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { recordSession } = useProgressStore();

  const currentPrompt = PROMPTS[currentIndex];
  const currentShadow = SHADOW_PROMPTS[shadowIndex];

  const THINK_TIME = 3;

  // Timer countdown effect
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && isReady && !canSpeak) {
      setCanSpeak(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown, isReady, canSpeak]);

  const startReady = () => {
    setIsReady(true);
    setCountdown(THINK_TIME);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(finalTranscript);
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
    };
  }, []);

  // Cleanup audio on unmount or when changing prompts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentIndex]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const playAudio = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      const audioUrl = await speak(currentPrompt.text, {
        voiceId: currentPrompt.voiceId,
        stability: 0.6,
        similarityBoost: 0.8,
      });

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };

        audio.onended = () => {
          setIsPlaying(false);
          setHasListened(true);
          setPlayCount((c) => c + 1);
          audioRef.current = null;
        };

        audio.onerror = () => {
          console.error('Audio playback error');
          setIsPlaying(false);
          setIsLoading(false);
          fallbackPlay();
        };

        await audio.play();
      } else {
        fallbackPlay();
      }
    } catch (error) {
      console.error('ElevenLabs error:', error);
      fallbackPlay();
    }
  };

  const fallbackPlay = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentPrompt.text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setHasListened(true);
        setPlayCount((c) => c + 1);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const checkAnswer = useCallback(() => {
    const userAnswer = transcript.toLowerCase().trim();
    const correctAnswer = currentPrompt.answer.toLowerCase();

    if (userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer)) {
      const bonus = playCount === 1 ? 5 : 0;
      setFeedback({ correct: true, message: playCount === 1 ? 'Perfect! First try!' : 'Correct! Great listening!' });
      setScore((s) => s + 10 + bonus);
    } else {
      setFeedback({
        correct: false,
        message: `Not quite. The answer was: "${currentPrompt.answer}"`,
      });
    }
  }, [transcript, currentPrompt, playCount]);

  const nextPrompt = () => {
    if (currentIndex < PROMPTS.length - 1) {
      setCurrentIndex((i) => i + 1);
      setTranscript('');
      setFeedback(null);
      setHasListened(false);
      setPlayCount(0);
      setIsReady(false);
      setCountdown(0);
      setCanSpeak(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsComplete(true);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setScore(0);
    setTranscript('');
    setFeedback(null);
    setHasListened(false);
    setPlayCount(0);
    setIsComplete(false);
    setIsReady(false);
    setCountdown(0);
    setCanSpeak(false);
    setShadowIndex(0);
    setShadowPhase('listen');
    setShadowScore(null);
    setShadowResults([]);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  // Shadow Speaking Functions
  const playShadowAudio = async () => {
    if (isPlaying) return;

    setIsLoading(true);
    setShadowPhase('listen');

    try {
      const audioUrl = await speak(currentShadow.text, {
        voiceId: currentShadow.voiceId,
        stability: 0.5,
        similarityBoost: 0.8,
        style: 0.3,
      });

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };

        audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
          // Auto-start recording after audio ends
          setShadowPhase('repeat');
          setCountdown(2); // 2 second countdown before recording
        };

        await audio.play();
      }
    } catch (error) {
      console.error('Shadow audio error:', error);
      setIsLoading(false);
      fallbackShadowPlay();
    }
  };

  const fallbackShadowPlay = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentShadow.text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setShadowPhase('repeat');
        setCountdown(2);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Shadow countdown effect
  useEffect(() => {
    if (mode === 'shadow' && shadowPhase === 'repeat' && countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (mode === 'shadow' && shadowPhase === 'repeat' && countdown === 0 && !isListening) {
      // Start listening
      startShadowListening();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mode, shadowPhase, countdown, isListening]);

  const startShadowListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopShadowListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Auto-evaluate shadow after speech
  useEffect(() => {
    if (mode === 'shadow' && shadowPhase === 'repeat' && transcript && !isListening && !isEvaluating) {
      evaluateShadow();
    }
  }, [mode, shadowPhase, transcript, isListening, isEvaluating]);

  const evaluateShadow = async () => {
    setIsEvaluating(true);

    let evalScore = 0;

    try {
      const result = await evaluateSpeech(
        currentShadow.text,
        transcript,
        `Shadow speaking: student should repeat exactly what they heard. Focus on pronunciation and accent.`
      );
      evalScore = result.score;
    } catch {
      // Fallback scoring
      const expected = currentShadow.text.toLowerCase().replace(/[^\w\s]/g, '');
      const spoken = transcript.toLowerCase().replace(/[^\w\s]/g, '');
      const expectedWords = expected.split(/\s+/);
      const spokenWords = spoken.split(/\s+/);

      let matches = 0;
      expectedWords.forEach(word => {
        if (spokenWords.includes(word)) matches++;
      });

      evalScore = Math.round((matches / expectedWords.length) * 100);
    }

    setShadowScore(evalScore);
    setShadowPhase('feedback');
    setScore(s => s + Math.round(evalScore / 10));

    // Save result
    setShadowResults(prev => [...prev, {
      text: currentShadow.text,
      score: evalScore,
      spoken: transcript,
    }]);

    setIsEvaluating(false);
  };

  const nextShadow = () => {
    if (shadowIndex < SHADOW_PROMPTS.length - 1) {
      setShadowIndex(i => i + 1);
      setShadowPhase('listen');
      setShadowScore(null);
      setTranscript('');
    } else {
      // Complete
      setIsComplete(true);
      const totalScore = shadowResults.reduce((sum, r) => sum + r.score, 0) + (shadowScore || 0);
      const avgAccuracy = Math.round(totalScore / SHADOW_PROMPTS.length);

      recordSession({
        mode: 'listen',
        score: score + Math.round((shadowScore || 0) / 10),
        accuracy: avgAccuracy,
        itemsCompleted: SHADOW_PROMPTS.length,
        duration: SHADOW_PROMPTS.length * 10, // Estimate
      });
    }
  };

  const startMode = (selectedMode: ListenMode) => {
    setMode(selectedMode);
    resetSession();
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

  // Mode selection screen
  if (mode === null) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-listen to-listen/60 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Volume2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Listen Sharp</h1>
          <p className="text-text-secondary">Train your ears and improve your accent</p>
        </div>

        <div className="space-y-4">
          {/* Comprehension Mode */}
          <button
            onClick={() => startMode('comprehension')}
            className="w-full bg-card border border-border rounded-2xl p-6 text-left hover:border-listen/50 hover:shadow-lg transition-all"
          >
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-xl bg-listen-bg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-7 h-7 text-listen" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-text-primary mb-1">Comprehension</h3>
                <p className="text-sm text-text-secondary">
                  Listen to sentences and answer questions about what you heard. Test your understanding.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-listen-bg text-listen">
                    {PROMPTS.length} prompts
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Shadow Speaking Mode */}
          <button
            onClick={() => startMode('shadow')}
            className="w-full bg-card border border-border rounded-2xl p-6 text-left hover:border-respond/50 hover:shadow-lg transition-all"
          >
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-xl bg-respond-bg flex items-center justify-center flex-shrink-0">
                <Repeat className="w-7 h-7 text-respond" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-text-primary">Shadow Speaking</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-respond/20 text-respond">
                    Accent
                  </span>
                </div>
                <p className="text-sm text-text-secondary">
                  Listen to native speakers and repeat immediately. Train your accent and pronunciation.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-respond-bg text-respond">
                    {SHADOW_PROMPTS.length} phrases
                  </span>
                  <span className="text-xs text-text-tertiary">American & British accents</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Shadow speaking complete screen
  if (mode === 'shadow' && isComplete) {
    const totalScore = shadowResults.reduce((sum, r) => sum + r.score, 0);
    const avgAccuracy = shadowResults.length > 0 ? Math.round(totalScore / shadowResults.length) : 0;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Shadow Practice Complete!</h2>
          <p className="text-text-secondary mb-6">
            You practiced {shadowResults.length} phrases
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background-alt rounded-xl p-4">
              <p className="text-3xl font-bold text-respond">{score}</p>
              <p className="text-xs text-text-tertiary">Points</p>
            </div>
            <div className="bg-background-alt rounded-xl p-4">
              <p className="text-3xl font-bold text-listen">{avgAccuracy}%</p>
              <p className="text-xs text-text-tertiary">Avg Accuracy</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => { setMode('shadow'); resetSession(); }}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Practice Again
            </button>
            <button
              onClick={() => setMode(null)}
              className="flex items-center gap-2 px-6 py-3 bg-background-alt text-text-primary rounded-xl font-medium hover:bg-border transition-colors"
            >
              Change Mode
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Results</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {shadowResults.map((result, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  result.score >= 80 ? 'bg-success-bg/50' : result.score >= 50 ? 'bg-respond-bg/50' : 'bg-error-bg/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{result.text}</p>
                  <p className="text-xs text-text-tertiary truncate">You: &ldquo;{result.spoken}&rdquo;</p>
                </div>
                <span className={`text-sm font-bold ${
                  result.score >= 80 ? 'text-success' : result.score >= 50 ? 'text-respond' : 'text-error'
                }`}>
                  {result.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Shadow speaking mode
  if (mode === 'shadow') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setMode(null)}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-respond-bg rounded-full">
              <span className="text-sm font-semibold text-respond">{score} pts</span>
            </div>
            <div className="text-sm text-text-secondary">
              {shadowIndex + 1} / {SHADOW_PROMPTS.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-border rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-respond rounded-full transition-all duration-300"
            style={{ width: `${((shadowIndex + 1) / SHADOW_PROMPTS.length) * 100}%` }}
          />
        </div>

        {/* Shadow Card */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Shadow Speaking
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-respond-bg text-respond">
              {currentShadow.accent} Accent
            </span>
          </div>

          {/* Phase: Listen */}
          {shadowPhase === 'listen' && (
            <div className="text-center">
              <p className="text-lg text-text-secondary mb-6">Listen carefully, then repeat</p>

              <button
                onClick={playShadowAudio}
                disabled={isLoading || isPlaying}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 mx-auto ${
                  isLoading
                    ? 'bg-border cursor-wait'
                    : isPlaying
                    ? 'bg-respond/20 text-respond animate-pulse'
                    : 'bg-respond text-white hover:bg-respond/90 hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-10 h-10 animate-spin text-respond" />
                ) : isPlaying ? (
                  <Volume2 className="w-10 h-10" />
                ) : (
                  <Play className="w-10 h-10 ml-1" />
                )}
              </button>

              <p className="mt-4 text-sm text-text-tertiary">
                {isLoading ? 'Loading...' : isPlaying ? 'Playing...' : 'Tap to listen'}
              </p>
            </div>
          )}

          {/* Phase: Countdown to Repeat */}
          {shadowPhase === 'repeat' && countdown > 0 && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-respond/10 border-4 border-respond mb-4">
                <span className="text-4xl font-bold text-respond">{countdown}</span>
              </div>
              <p className="text-sm text-text-secondary">Get ready to speak...</p>
            </div>
          )}

          {/* Phase: Recording */}
          {shadowPhase === 'repeat' && countdown === 0 && !isEvaluating && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-situation animate-pulse' : 'bg-respond'}`} />
                <span className="text-sm font-medium text-respond">Repeat now!</span>
              </div>

              <button
                onClick={stopShadowListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 mx-auto ${
                  isListening
                    ? 'bg-situation text-white animate-pulse scale-110'
                    : 'bg-respond text-white'
                }`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <p className="mt-4 text-sm text-text-secondary">
                {isListening ? 'Listening... Click to stop' : 'Waiting for speech...'}
              </p>

              {transcript && (
                <div className="mt-4 p-3 bg-background-alt rounded-xl">
                  <p className="text-base text-text-primary">&ldquo;{transcript}&rdquo;</p>
                </div>
              )}
            </div>
          )}

          {/* Phase: Evaluating */}
          {isEvaluating && (
            <div className="text-center py-6">
              <Loader2 className="w-12 h-12 animate-spin text-respond mx-auto mb-4" />
              <p className="text-sm text-text-secondary">Analyzing your pronunciation...</p>
            </div>
          )}

          {/* Phase: Feedback */}
          {shadowPhase === 'feedback' && shadowScore !== null && (
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                shadowScore >= 80 ? 'bg-success-bg' : shadowScore >= 50 ? 'bg-respond-bg' : 'bg-error-bg'
              }`}>
                <span className={`text-4xl font-bold ${
                  shadowScore >= 80 ? 'text-success' : shadowScore >= 50 ? 'text-respond' : 'text-error'
                }`}>
                  {shadowScore}%
                </span>
              </div>

              <p className={`text-sm font-medium mb-2 ${
                shadowScore >= 80 ? 'text-success' : shadowScore >= 50 ? 'text-respond' : 'text-error'
              }`}>
                {shadowScore >= 80 ? 'Excellent pronunciation!' : shadowScore >= 50 ? 'Good effort!' : 'Keep practicing!'}
              </p>

              <div className="p-4 bg-background-alt rounded-xl mb-4">
                <p className="text-xs text-text-tertiary mb-1">Target phrase:</p>
                <p className="text-base font-medium text-text-primary">&ldquo;{currentShadow.text}&rdquo;</p>
              </div>

              {transcript && (
                <div className="p-4 bg-background-alt rounded-xl mb-4">
                  <p className="text-xs text-text-tertiary mb-1">You said:</p>
                  <p className="text-base text-text-secondary">&ldquo;{transcript}&rdquo;</p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={playShadowAudio}
                  className="flex items-center gap-2 px-4 py-2 bg-respond/10 text-respond rounded-xl font-medium hover:bg-respond/20 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  Listen Again
                </button>
                <button
                  onClick={nextShadow}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
                >
                  {shadowIndex < SHADOW_PROMPTS.length - 1 ? 'Next' : 'Finish'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Session Complete!</h2>
          <p className="text-text-secondary mb-6">
            You completed {PROMPTS.length} listening exercises and scored {score} points.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={resetSession}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Practice Again
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-background-alt text-text-primary rounded-xl font-medium hover:bg-border transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-listen-bg rounded-full">
            <span className="text-sm font-semibold text-listen">{score} pts</span>
          </div>
          <div className="text-sm text-text-secondary">
            {currentIndex + 1} / {PROMPTS.length}
          </div>
        </div>
      </div>

      {/* Powered by ElevenLabs Badge */}
      <div className="flex items-center justify-center gap-2 mb-4 px-3 py-1.5 bg-background-alt rounded-full w-fit mx-auto">
        <div className="w-2 h-2 rounded-full bg-listen animate-pulse" />
        <span className="text-xs font-medium text-text-secondary">Powered by ElevenLabs</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-border rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-listen rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / PROMPTS.length) * 100}%` }}
        />
      </div>

      {/* Listen Card */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            Listen Carefully
          </span>
          {playCount > 0 && (
            <span className="text-xs text-text-tertiary">
              Played {playCount} time{playCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Play Button */}
        <div className="flex flex-col items-center mb-8">
          <button
            onClick={playAudio}
            disabled={isLoading}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 ${
              isLoading
                ? 'bg-border cursor-wait'
                : isPlaying
                ? 'bg-listen/20 text-listen'
                : 'bg-listen text-white hover:bg-listen/90 hover:scale-105'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-10 h-10 animate-spin text-listen" />
            ) : isPlaying ? (
              <Pause className="w-10 h-10" />
            ) : (
              <Play className="w-10 h-10 ml-1" />
            )}
          </button>
          <p className="mt-4 text-sm text-text-secondary flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            {isLoading ? 'Loading audio...' : isPlaying ? 'Playing...' : 'Tap to listen'}
          </p>
          <p className="mt-2 text-xs text-text-tertiary">
            Natural voice by ElevenLabs AI
          </p>
        </div>

        {/* Question - Show after listening */}
        {hasListened && !feedback && (
          <div className="border-t border-border pt-6">
            <p className="text-lg font-semibold text-text-primary mb-4">{currentPrompt.question}</p>

            {/* Ready Button */}
            {!isReady && (
              <button
                onClick={startReady}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-listen text-white rounded-xl font-medium hover:bg-listen/90 transition-all hover:scale-[1.02]"
              >
                <Play className="w-5 h-5" />
                <span>I&apos;m Ready to Answer!</span>
              </button>
            )}

            {/* Countdown Timer */}
            {isReady && countdown > 0 && (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-listen/10 border-4 border-listen mb-4">
                  <span className="text-4xl font-bold text-listen">{countdown}</span>
                </div>
                <p className="text-sm text-text-secondary">Think of your answer...</p>
              </div>
            )}

            {/* Speech Input */}
            {canSpeak && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Timer className="w-4 h-4 text-listen" />
                  <span className="text-sm font-medium text-listen">Speak your answer now!</span>
                </div>

                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isListening
                      ? 'bg-situation text-white animate-pulse scale-110'
                      : 'bg-listen text-white hover:bg-listen/90 hover:scale-105'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-7 h-7" />
                  ) : (
                    <Mic className="w-7 h-7" />
                  )}
                </button>

                <p className="mt-3 text-sm text-text-secondary">
                  {isListening ? 'Listening... Click to stop' : 'Click to speak your answer'}
                </p>

                {/* Transcript */}
                {transcript && (
                  <div className="mt-4 p-3 bg-background-alt rounded-xl">
                    <p className="text-sm text-text-secondary mb-1">You said:</p>
                    <p className="text-base font-medium text-text-primary">&ldquo;{transcript}&rdquo;</p>
                  </div>
                )}

                {/* Submit Button */}
                {transcript && !isListening && (
                  <button
                    onClick={checkAnswer}
                    className="mt-4 px-6 py-3 bg-listen text-white rounded-xl font-medium hover:bg-listen/90 transition-colors"
                  >
                    Check Answer
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl mb-6 ${
            feedback.correct
              ? 'bg-success-bg border border-success/20'
              : 'bg-error-bg border border-error/20'
          }`}
        >
          <p
            className={`text-sm font-medium ${
              feedback.correct ? 'text-success' : 'text-error'
            }`}
          >
            {feedback.message}
          </p>
        </div>
      )}

      {/* Next Button */}
      {feedback && (
        <button
          onClick={nextPrompt}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
        >
          <span>{currentIndex < PROMPTS.length - 1 ? 'Next' : 'Finish'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
