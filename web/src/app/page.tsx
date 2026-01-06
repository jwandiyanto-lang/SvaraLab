'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Brain,
  Headphones,
  Store,
  Star,
  BookOpen,
  TrendingUp,
  Volume2,
  Lock,
  FileText,
  Target,
  Flame,
} from 'lucide-react';

// Training modes configuration
const MODES = [
  {
    id: 'speak',
    name: 'Speak Fast',
    nameId: 'Ucapkan',
    icon: Zap,
    description: 'Boost your speaking speed and fluidity with rapid-fire drills.',
    color: 'repeat',
    tag: 'Speed',
    href: '/practice/speak',
  },
  {
    id: 'respond',
    name: 'Think & Answer',
    nameId: 'Jawab',
    icon: Brain,
    description: 'Sharpen cognitive reflexes to respond instantly in conversation.',
    color: 'respond',
    tag: 'Logic',
    href: '/practice/respond',
  },
  {
    id: 'listen',
    name: 'Listen Sharp',
    nameId: 'Simak',
    icon: Headphones,
    description: 'Train your ears to catch details in different English accents.',
    color: 'listen',
    tag: 'Focus',
    href: '/practice/listen',
  },
  {
    id: 'situation',
    name: 'Real Talk',
    nameId: 'Situasi',
    icon: Store,
    description: 'Practical scenarios for travel, work, and social interactions.',
    color: 'situation',
    tag: 'Real World',
    href: '/practice/situation',
  },
];

// Word of the Day component - Shows INDONESIAN first, click to reveal English
function WordOfDay() {
  const [showTranslation, setShowTranslation] = useState(false);

  // Today's word - Indonesian students need to learn the English equivalent
  const word = {
    indonesian: 'Bagaimana kabarmu hari ini?',
    english: 'How are you doing today?',
    difficulty: 'easy' as const,
    example: 'Hey John, how are you doing today?',
  };

  const speakEnglish = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word.english);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
          Phrase of the Day
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-listen-bg text-listen`}>
          {word.difficulty}
        </span>
      </div>
      <div className="space-y-3">
        {/* Indonesian shown first */}
        <div>
          <span className="text-xs font-semibold text-listen uppercase tracking-wide">Indonesian</span>
          <p className="text-2xl font-bold text-text-primary mt-1">{word.indonesian}</p>
        </div>

        <p className="text-sm text-text-secondary">How do you say this in English?</p>

        {/* Click to reveal English */}
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="text-sm text-respond hover:text-respond/80 transition-colors"
        >
          {showTranslation ? 'Hide' : 'Show'} English translation
        </button>

        {showTranslation && (
          <div className="p-4 bg-respond/5 rounded-xl border border-respond/20">
            <span className="text-xs font-semibold text-respond uppercase tracking-wide">English</span>
            <p className="text-xl font-bold text-respond mt-1">{word.english}</p>
            <button
              onClick={speakEnglish}
              className="flex items-center gap-2 mt-3 text-sm text-respond hover:text-respond/80 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              Listen to pronunciation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Daily Cap Banner
function DailyCapBanner() {
  const sessionsLeft = 3;
  const totalSessions = 3;

  return (
    <div className="bg-respond-bg border border-respond/20 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-respond/10 flex items-center justify-center">
            <Star className="w-5 h-5 text-respond" />
          </div>
          <div>
            <p className="text-sm font-semibold text-respond">Free Daily Practice</p>
            <p className="text-xs text-respond/70">{sessionsLeft} of {totalSessions} sessions remaining today</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[...Array(totalSessions)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < sessionsLeft ? 'bg-respond' : 'bg-respond/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Daily Progress
function DailyProgress() {
  const completedMinutes = 5;
  const goalMinutes = 15;
  const progress = Math.min((completedMinutes / goalMinutes) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
          Daily Goal
        </span>
        <span className="text-xs font-medium text-text-secondary">
          {completedMinutes}/{goalMinutes} mins
        </span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Quick Stats
function QuickStats() {
  const stats = {
    totalXP: 1250,
    wordsLearned: 42,
    level: 3,
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-around">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-repeat-bg flex items-center justify-center">
            <Star className="w-5 h-5 text-repeat" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">{stats.totalXP.toLocaleString()}</p>
            <p className="text-xs text-text-secondary">Total XP</p>
          </div>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-listen-bg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-listen" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">{stats.wordsLearned}</p>
            <p className="text-xs text-text-secondary">Words</p>
          </div>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-respond-bg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-respond" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">{stats.level}</p>
            <p className="text-xs text-text-secondary">Level</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Training Mode Card
function ModeCard({ mode, disabled = false }: { mode: typeof MODES[0]; disabled?: boolean }) {
  const Icon = mode.icon;

  const colorClasses = {
    repeat: { bg: 'bg-repeat-bg', text: 'text-repeat', border: 'border-repeat/20' },
    respond: { bg: 'bg-respond-bg', text: 'text-respond', border: 'border-respond/20' },
    listen: { bg: 'bg-listen-bg', text: 'text-listen', border: 'border-listen/20' },
    situation: { bg: 'bg-situation-bg', text: 'text-situation', border: 'border-situation/20' },
  };

  const colors = colorClasses[mode.color as keyof typeof colorClasses];

  return (
    <Link
      href={disabled ? '#' : mode.href}
      className={`block bg-card border border-border rounded-2xl p-6 transition-all duration-200 ${
        disabled
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:shadow-lg hover:border-border-light hover:-translate-y-0.5'
      }`}
      onClick={(e) => disabled && e.preventDefault()}
    >
      <div className="flex gap-4">
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-text-primary">{mode.nameId}</h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                {mode.tag}
              </span>
              {disabled && <Lock className="w-4 h-4 text-text-tertiary" />}
            </div>
          </div>
          <p className="text-xs font-medium text-text-secondary mb-1">{mode.name}</p>
          <p className="text-xs text-text-tertiary line-clamp-2">{mode.description}</p>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const isSessionAllowed = true; // Will come from store

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Daily Cap Banner */}
      <div className="mb-6">
        <DailyCapBanner />
      </div>

      {/* Daily Progress */}
      <div className="mb-6">
        <DailyProgress />
      </div>

      {/* Word of the Day */}
      <div className="mb-8">
        <WordOfDay />
      </div>

      {/* Flash Drill - Featured Reflex Trainer */}
      <div className="mb-6">
        <Link
          href="/practice/flash-drill"
          className="block bg-gradient-to-r from-situation/10 to-repeat/10 border border-situation/20 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-situation to-repeat flex items-center justify-center flex-shrink-0 shadow-sm">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-text-primary">Flash Drill</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-situation/20 text-situation flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Reflex
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                Rapid-fire speaking practice! See Indonesian, speak English instantly. Build reflexes with timed challenges.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Story Reader */}
      <div className="mb-8">
        <Link
          href="/reader"
          className="block bg-gradient-to-r from-respond/10 to-listen/10 border border-respond/20 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm">
              <FileText className="w-7 h-7 text-respond" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-text-primary">Story Reader</h3>
              </div>
              <p className="text-sm text-text-secondary">
                Learn English through cultural tales from around the world. Click any word to see translation and hear pronunciation.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Training Modules */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-4">Training Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {MODES.map((mode) => (
            <ModeCard key={mode.id} mode={mode} disabled={!isSessionAllowed} />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-8">
        <QuickStats />
      </div>
    </div>
  );
}
