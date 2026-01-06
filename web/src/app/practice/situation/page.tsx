'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Trophy, RotateCcw, MapPin, Loader2, MessageCircle, Mic, MicOff, Play, Timer } from 'lucide-react';
import { generateSituationResponse, evaluateResponse, EvaluationResult } from '@/services/grok';

// Real-world scenarios for Indonesian students to practice
const SCENARIOS = [
  {
    id: 1,
    title: 'At the Coffee Shop',
    context: 'You are at a coffee shop and want to order a drink.',
    npcRole: 'barista',
    opening: "Hi there! Welcome to JavaBean Coffee. What can I get for you today?",
    hint: 'Order your favorite coffee drink politely',
  },
  {
    id: 2,
    title: 'Asking for Directions',
    context: 'You are lost in a new city and need to find the train station.',
    npcRole: 'friendly local',
    opening: "You look a bit lost. Can I help you find something?",
    hint: 'Ask for directions to the train station',
  },
  {
    id: 3,
    title: 'Job Interview',
    context: 'You are in a job interview for a marketing position.',
    npcRole: 'interviewer',
    opening: "Thank you for coming in today. Please, have a seat. So, tell me about yourself.",
    hint: 'Introduce yourself professionally',
  },
  {
    id: 4,
    title: 'Hotel Check-in',
    context: 'You have arrived at your hotel after a long flight.',
    npcRole: 'hotel receptionist',
    opening: "Good evening and welcome to the Grand Hotel! Do you have a reservation with us?",
    hint: 'Confirm your reservation and ask about check-in',
  },
  {
    id: 5,
    title: 'Restaurant Ordering',
    context: 'You are at a restaurant for dinner.',
    npcRole: 'waiter',
    opening: "Good evening! Here are your menus. Can I start you off with something to drink?",
    hint: 'Order drinks and ask about menu recommendations',
  },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
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

export default function SituationPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Timer states
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canSpeak, setCanSpeak] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentScenario = SCENARIOS[currentIndex];

  const THINK_TIME = 5; // seconds to think before speaking

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

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
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
    }
  };

  const startConversation = () => {
    setMessages([{ role: 'assistant', content: currentScenario.opening }]);
    setConversationStarted(true);
    // Auto-start the ready flow for first response
    setIsReady(true);
    setCountdown(THINK_TIME);
  };

  const sendMessage = async () => {
    if (!transcript.trim() || isLoading) return;

    const userMessage = transcript.trim();
    setTranscript('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    // Reset for next turn
    setIsReady(false);
    setCanSpeak(false);

    try {
      // Get AI response using Grok
      const response = await generateSituationResponse(
        `${currentScenario.title}: ${currentScenario.context}. You are the ${currentScenario.npcRole}.`,
        userMessage,
        messages
      );

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);

      // After 3 exchanges, evaluate the conversation
      if (messages.length >= 4) {
        const evalResult = await evaluateResponse(
          `Conversation in scenario: ${currentScenario.title}`,
          messages.map((m) => `${m.role}: ${m.content}`).join('\n') + `\nuser: ${userMessage}`,
          currentScenario.context
        );
        setEvaluation(evalResult);
        setScore((s) => s + Math.round(evalResult.score / 10));
      } else {
        // Start ready flow for next response
        setIsReady(true);
        setCountdown(THINK_TIME);
      }
    } catch (error) {
      console.error('Conversation error:', error);
      // Fallback response
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I see. Could you tell me more about that?" },
      ]);
      // Start ready flow for next response
      setIsReady(true);
      setCountdown(THINK_TIME);
    } finally {
      setIsLoading(false);
    }
  };

  const nextScenario = () => {
    if (currentIndex < SCENARIOS.length - 1) {
      setCurrentIndex((i) => i + 1);
      setMessages([]);
      setTranscript('');
      setEvaluation(null);
      setConversationStarted(false);
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
    setMessages([]);
    setTranscript('');
    setEvaluation(null);
    setIsComplete(false);
    setConversationStarted(false);
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
            You practiced {SCENARIOS.length} real-world scenarios and scored {score} points.
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
          <div className="px-3 py-1 bg-situation-bg rounded-full">
            <span className="text-sm font-semibold text-situation">{score} pts</span>
          </div>
          <div className="text-sm text-text-secondary">
            {currentIndex + 1} / {SCENARIOS.length}
          </div>
        </div>
      </div>

      {/* Powered by Grok Badge */}
      <div className="flex items-center justify-center gap-2 mb-4 px-3 py-1.5 bg-background-alt rounded-full w-fit mx-auto">
        <div className="w-2 h-2 rounded-full bg-situation animate-pulse" />
        <span className="text-xs font-medium text-text-secondary">Powered by xAI Grok</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-border rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-situation rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / SCENARIOS.length) * 100}%` }}
        />
      </div>

      {/* Scenario Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
        <div className="bg-situation-bg p-4 border-b border-situation/20">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-situation" />
            <span className="text-sm font-semibold text-situation">{currentScenario.title}</span>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-text-secondary mb-4 italic">{currentScenario.context}</p>
          <p className="text-xs text-text-tertiary">Hint: {currentScenario.hint}</p>
        </div>
      </div>

      {/* Start Conversation or Chat */}
      {!conversationStarted ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <MessageCircle className="w-12 h-12 text-situation mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">Ready to Practice?</h3>
          <p className="text-sm text-text-secondary mb-6">
            You&apos;ll have a spoken conversation with an AI playing the role of a {currentScenario.npcRole}.
          </p>
          <button
            onClick={startConversation}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-situation text-white rounded-xl font-medium hover:bg-situation/90 transition-all hover:scale-[1.02] mx-auto"
          >
            <Play className="w-5 h-5" />
            <span>Start Conversation</span>
          </button>
        </div>
      ) : (
        <>
          {/* Chat Messages */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-4 min-h-[200px] max-h-[300px] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-situation text-white rounded-br-md'
                        : 'bg-background-alt text-text-primary rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <p className="text-xs text-text-tertiary mb-1 capitalize">{currentScenario.npcRole}</p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-background-alt p-3 rounded-2xl rounded-bl-md">
                    <Loader2 className="w-5 h-5 text-text-tertiary animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Speech Input Area */}
          {!evaluation && !isLoading && (
            <div className="bg-card border border-border rounded-2xl p-6">
              {/* Countdown Timer */}
              {isReady && countdown > 0 && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-situation/10 border-4 border-situation mb-4">
                    <span className="text-4xl font-bold text-situation">{countdown}</span>
                  </div>
                  <p className="text-sm text-text-secondary">Think about your response...</p>
                </div>
              )}

              {/* Speech Input */}
              {canSpeak && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Timer className="w-4 h-4 text-situation" />
                    <span className="text-sm font-medium text-situation">Speak your response now!</span>
                  </div>

                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 mx-auto ${
                      isListening
                        ? 'bg-error text-white animate-pulse scale-110'
                        : 'bg-situation text-white hover:bg-situation/90 hover:scale-105'
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-7 h-7" />
                    ) : (
                      <Mic className="w-7 h-7" />
                    )}
                  </button>

                  <p className="mt-3 text-sm text-text-secondary">
                    {isListening ? 'Listening... Click to stop' : 'Click to start speaking'}
                  </p>

                  {/* Transcript */}
                  {transcript && (
                    <div className="mt-4 p-3 bg-background-alt rounded-xl text-left">
                      <p className="text-sm text-text-secondary mb-1">You&apos;re saying:</p>
                      <p className="text-base text-text-primary">&ldquo;{transcript}&rdquo;</p>
                    </div>
                  )}

                  {/* Send Button */}
                  {transcript && !isListening && (
                    <button
                      onClick={sendMessage}
                      className="mt-4 px-6 py-3 bg-situation text-white rounded-xl font-medium hover:bg-situation/90 transition-colors"
                    >
                      Send Response
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Grok AI Evaluation */}
      {evaluation && (
        <div className={`rounded-2xl mb-6 overflow-hidden border mt-4 ${
          evaluation.score >= 80
            ? 'bg-success-bg border-success/20'
            : evaluation.score >= 50
            ? 'bg-situation-bg border-situation/20'
            : 'bg-error-bg border-error/20'
        }`}>
          <div className={`p-4 ${
            evaluation.score >= 80 ? 'bg-success/10' : evaluation.score >= 50 ? 'bg-situation/10' : 'bg-error/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-situation" />
                <span className={`text-sm font-semibold ${
                  evaluation.score >= 80 ? 'text-success' : evaluation.score >= 50 ? 'text-situation' : 'text-error'
                }`}>
                  Grok AI Evaluation
                </span>
              </div>
              <span className={`text-2xl font-bold ${
                evaluation.score >= 80 ? 'text-success' : evaluation.score >= 50 ? 'text-situation' : 'text-error'
              }`}>
                {evaluation.score}/100
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <p className={`text-sm font-medium ${
              evaluation.score >= 80 ? 'text-success' : evaluation.score >= 50 ? 'text-situation' : 'text-error'
            }`}>
              {evaluation.feedback}
            </p>

            {evaluation.suggestions && evaluation.suggestions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs font-semibold text-text-secondary mb-2">Tips:</p>
                <ul className="space-y-1">
                  {evaluation.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                      <span className="text-situation">•</span>
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
          onClick={nextScenario}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
        >
          <span>{currentIndex < SCENARIOS.length - 1 ? 'Next Scenario' : 'Finish'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
