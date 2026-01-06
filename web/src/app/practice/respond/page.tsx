'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, MicOff, ChevronRight, Trophy, RotateCcw, Loader2, Play, Timer } from 'lucide-react';
import { evaluateResponse, EvaluationResult } from '@/services/grok';

// Questions for Indonesian students to practice answering in English
const QUESTIONS = [
  { id: 1, question: 'What is your favorite food and why?', hint: 'Describe food you enjoy eating', topic: 'Personal' },
  { id: 2, question: 'Where do you live and what do you like about it?', hint: 'Describe your home or city', topic: 'Location' },
  { id: 3, question: 'What do you do for work or study?', hint: 'Describe your job or education', topic: 'Career' },
  { id: 4, question: 'What are your hobbies?', hint: 'Share your interests and free time activities', topic: 'Hobbies' },
  { id: 5, question: 'Tell me about your family.', hint: 'Describe your family members', topic: 'Family' },
  { id: 6, question: 'What did you do last weekend?', hint: 'Describe past activities', topic: 'Past Tense' },
  { id: 7, question: 'What are your plans for the future?', hint: 'Talk about goals and dreams', topic: 'Future' },
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

export default function RespondPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Timer states for quick-think mode
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canSpeak, setCanSpeak] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestion = QUESTIONS[currentIndex];

  const THINK_TIME = 5; // seconds to think before speaking (more time for open questions)

  // Timer countdown effect
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && isReady && !canSpeak) {
      // Countdown finished - enable speaking
      setCanSpeak(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown, isReady, canSpeak]);

  // Start the ready countdown
  const startReady = () => {
    setIsReady(true);
    setCountdown(THINK_TIME);
  };

  // Evaluate speech with Grok API
  const evaluateWithGrok = useCallback(async (spokenText: string) => {
    setIsEvaluating(true);

    try {
      const result = await evaluateResponse(
        currentQuestion.question,
        spokenText,
        `Topic: ${currentQuestion.topic}. Hint: ${currentQuestion.hint}`
      );

      setEvaluation(result);
      setScore((s) => s + Math.round(result.score / 10));
    } catch (error) {
      console.error('Evaluation error:', error);
      // Fallback evaluation
      const wordCount = spokenText.trim().split(/\s+/).length;
      const fallbackScore = Math.min(wordCount * 8, 100);

      setEvaluation({
        score: fallbackScore,
        feedback: wordCount >= 10 ? 'Good detailed response!' : 'Try adding more detail.',
        pronunciation: 'N/A',
        grammar: 'Review your response for any errors',
        suggestions: wordCount < 10 ? ['Expand your answer', 'Add examples'] : ['Great job!'],
      });
      setScore((s) => s + Math.round(fallbackScore / 10));
    } finally {
      setIsEvaluating(false);
    }
  }, [currentQuestion]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Allow longer responses
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('');
          setEvaluation(null);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error !== 'aborted') {
            setEvaluation({
              score: 0,
              feedback: `Microphone error: ${event.error}. Please try again.`,
              pronunciation: '',
              grammar: '',
              suggestions: ['Check your microphone permissions', 'Try speaking closer to the mic'],
            });
          }
        };

        recognition.onresult = (event) => {
          let fullTranscript = '';

          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }

          setTranscript(fullTranscript);
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

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      // Evaluate when done speaking
      if (transcript.trim()) {
        evaluateWithGrok(transcript);
      }
    }
  };

  const nextQuestion = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
      setTranscript('');
      setEvaluation(null);
      // Reset timer states
      setIsReady(false);
      setCountdown(0);
      setCanSpeak(false);
    } else {
      setIsComplete(true);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setScore(0);
    setTranscript('');
    setEvaluation(null);
    setIsComplete(false);
    // Reset timer states
    setIsReady(false);
    setCountdown(0);
    setCanSpeak(false);
  };

  if (!isSupported) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-error-bg border border-error/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-error mb-2">Browser Not Supported</h2>
          <p className="text-text-secondary">
            Your browser doesn&apos;t support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Link>
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
            You answered {QUESTIONS.length} questions and scored {score} points.
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
          <div className="px-3 py-1 bg-respond-bg rounded-full">
            <span className="text-sm font-semibold text-respond">{score} pts</span>
          </div>
          <div className="text-sm text-text-secondary">
            {currentIndex + 1} / {QUESTIONS.length}
          </div>
        </div>
      </div>

      {/* Powered by Grok Badge */}
      <div className="flex items-center justify-center gap-2 mb-4 px-3 py-1.5 bg-background-alt rounded-full w-fit mx-auto">
        <div className="w-2 h-2 rounded-full bg-respond animate-pulse" />
        <span className="text-xs font-medium text-text-secondary">Powered by xAI Grok</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-border rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-respond rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            Answer in English
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-respond-bg text-respond">
            {currentQuestion.topic}
          </span>
        </div>
        <p className="text-2xl font-bold text-text-primary mb-4">{currentQuestion.question}</p>
        <p className="text-sm text-text-tertiary mb-6">Hint: {currentQuestion.hint}</p>

        {/* Ready Button */}
        {!isReady && !evaluation && (
          <button
            onClick={startReady}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-respond text-white rounded-xl font-medium hover:bg-respond/90 transition-all hover:scale-[1.02]"
          >
            <Play className="w-5 h-5" />
            <span>I&apos;m Ready to Answer!</span>
          </button>
        )}

        {/* Countdown Timer */}
        {isReady && countdown > 0 && (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-respond/10 border-4 border-respond mb-4">
              <span className="text-5xl font-bold text-respond">{countdown}</span>
            </div>
            <p className="text-sm text-text-secondary">Think about your answer...</p>
          </div>
        )}
      </div>

      {/* Speech Input - Only show after countdown */}
      {canSpeak && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="text-center">
            {/* Time indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Timer className="w-4 h-4 text-respond" />
              <span className="text-sm font-medium text-respond">Speak your answer now!</span>
            </div>

            {/* Mic Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isEvaluating}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                isEvaluating
                  ? 'bg-border text-text-tertiary cursor-not-allowed'
                  : isListening
                  ? 'bg-situation text-white animate-pulse scale-110'
                  : 'bg-respond text-white hover:bg-respond/90 hover:scale-105'
              }`}
            >
              {isEvaluating ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isListening ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>

            <p className="mt-4 text-sm text-text-secondary">
              {isEvaluating
                ? 'Grok AI is analyzing your response...'
                : isListening
                ? 'Listening... Click to stop and submit'
                : 'Click to start speaking your answer'}
            </p>

            {/* Transcript */}
            {transcript && (
              <div className="mt-4 p-4 bg-background-alt rounded-xl text-left">
                <p className="text-sm text-text-secondary mb-1">Your answer:</p>
                <p className="text-base text-text-primary">&ldquo;{transcript}&rdquo;</p>
                <p className="text-xs text-text-tertiary mt-2">
                  {transcript.trim().split(/\s+/).filter(Boolean).length} words
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Waiting for ready state message */}
      {!isReady && !evaluation && (
        <div className="bg-background-alt border border-border rounded-2xl p-6 mb-6 text-center">
          <Timer className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
          <p className="text-sm text-text-secondary">
            Click &quot;I&apos;m Ready&quot; to start the quick-think challenge!
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            You&apos;ll have {THINK_TIME} seconds to think before speaking
          </p>
        </div>
      )}

      {/* Grok AI Evaluation */}
      {evaluation && (
        <div className={`rounded-2xl mb-6 overflow-hidden border ${
          evaluation.score >= 80
            ? 'bg-success-bg border-success/20'
            : evaluation.score >= 50
            ? 'bg-respond-bg border-respond/20'
            : 'bg-error-bg border-error/20'
        }`}>
          {/* Score Header */}
          <div className={`p-4 ${
            evaluation.score >= 80 ? 'bg-success/10' : evaluation.score >= 50 ? 'bg-respond/10' : 'bg-error/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-respond" />
                <span className={`text-sm font-semibold ${
                  evaluation.score >= 80 ? 'text-success' : evaluation.score >= 50 ? 'text-respond' : 'text-error'
                }`}>
                  Grok AI Evaluation
                </span>
              </div>
              <span className={`text-2xl font-bold ${
                evaluation.score >= 80 ? 'text-success' : evaluation.score >= 50 ? 'text-respond' : 'text-error'
              }`}>
                {evaluation.score}/100
              </span>
            </div>
          </div>

          {/* Feedback Details */}
          <div className="p-4 space-y-3">
            <p className={`text-sm font-medium ${
              evaluation.score >= 80 ? 'text-success' : evaluation.score >= 50 ? 'text-respond' : 'text-error'
            }`}>
              {evaluation.feedback}
            </p>

            {evaluation.grammar && evaluation.grammar !== 'N/A' && (
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold text-text-secondary w-20">Grammar:</span>
                <span className="text-xs text-text-primary">{evaluation.grammar}</span>
              </div>
            )}

            {evaluation.suggestions && evaluation.suggestions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs font-semibold text-text-secondary mb-2">Tips to improve:</p>
                <ul className="space-y-1">
                  {evaluation.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                      <span className="text-respond">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Button */}
      {evaluation && (
        <button
          onClick={nextQuestion}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
        >
          <span>{currentIndex < QUESTIONS.length - 1 ? 'Next Question' : 'Finish'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
