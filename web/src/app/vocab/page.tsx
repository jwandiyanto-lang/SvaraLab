'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Check, X, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';

// Vocabulary for Indonesian students learning English
// Shows INDONESIAN first, click to reveal English translation
// This way students practice translating Indonesian → English
const VOCABULARY = [
  { id: 1, english: 'How are you?', indonesian: 'Apa kabar?', category: 'greetings', difficulty: 'easy' },
  { id: 2, english: 'Thank you', indonesian: 'Terima kasih', category: 'greetings', difficulty: 'easy' },
  { id: 3, english: 'Good morning', indonesian: 'Selamat pagi', category: 'greetings', difficulty: 'easy' },
  { id: 4, english: 'See you later', indonesian: 'Sampai jumpa', category: 'greetings', difficulty: 'easy' },
  { id: 5, english: 'Sorry / Excuse me', indonesian: 'Maaf / Permisi', category: 'greetings', difficulty: 'easy' },
  { id: 6, english: 'Please / Help', indonesian: 'Tolong', category: 'requests', difficulty: 'easy' },
  { id: 7, english: 'How much is it?', indonesian: 'Berapa harganya?', category: 'shopping', difficulty: 'medium' },
  { id: 8, english: "I don't understand", indonesian: 'Saya tidak mengerti', category: 'conversation', difficulty: 'medium' },
  { id: 9, english: 'Where is the bathroom?', indonesian: 'Dimana toilet/kamar mandi?', category: 'directions', difficulty: 'medium' },
  { id: 10, english: 'Can you speak Indonesian?', indonesian: 'Bisa bahasa Indonesia?', category: 'conversation', difficulty: 'medium' },
  { id: 11, english: 'Nice to meet you', indonesian: 'Senang bertemu dengan Anda', category: 'greetings', difficulty: 'easy' },
  { id: 12, english: 'What is your name?', indonesian: 'Siapa nama Anda?', category: 'conversation', difficulty: 'easy' },
  { id: 13, english: 'I am learning English', indonesian: 'Saya sedang belajar bahasa Inggris', category: 'conversation', difficulty: 'medium' },
  { id: 14, english: 'Could you repeat that?', indonesian: 'Bisa diulangi?', category: 'conversation', difficulty: 'medium' },
  { id: 15, english: 'Where are you from?', indonesian: 'Dari mana Anda berasal?', category: 'conversation', difficulty: 'easy' },
];

const CATEGORIES = [
  { id: 'all', name: 'All Words' },
  { id: 'greetings', name: 'Greetings' },
  { id: 'requests', name: 'Requests' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'conversation', name: 'Conversation' },
  { id: 'directions', name: 'Directions' },
];

export default function VocabPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learned, setLearned] = useState<Set<number>>(new Set());
  const [reviewing, setReviewing] = useState<Set<number>>(new Set());

  // Filter vocabulary by category
  const filteredVocab = selectedCategory === 'all'
    ? VOCABULARY
    : VOCABULARY.filter((word) => word.category === selectedCategory);

  const currentWord = filteredVocab[currentIndex];

  // Keyboard shortcuts
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsFlipped((f) => !f);
    } else if (e.key === 'ArrowRight' || e.key === 'l') {
      if (currentIndex < filteredVocab.length - 1) {
        setCurrentIndex((i) => i + 1);
        setIsFlipped(false);
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'h') {
      if (currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
        setIsFlipped(false);
      }
    } else if (e.key === 'g' && currentWord) {
      markAsLearned();
    } else if (e.key === 'r' && currentWord) {
      markForReview();
    }
  }, [currentIndex, filteredVocab.length, currentWord]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Reset when category changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedCategory]);

  const speakWord = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const markAsLearned = () => {
    if (!currentWord) return;
    setLearned((prev) => new Set([...prev, currentWord.id]));
    setReviewing((prev) => {
      const next = new Set(prev);
      next.delete(currentWord.id);
      return next;
    });
    nextCard();
  };

  const markForReview = () => {
    if (!currentWord) return;
    setReviewing((prev) => new Set([...prev, currentWord.id]));
    setLearned((prev) => {
      const next = new Set(prev);
      next.delete(currentWord.id);
      return next;
    });
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < filteredVocab.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  };

  const resetProgress = () => {
    setLearned(new Set());
    setReviewing(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (!currentWord) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-text-secondary">No words found in this category.</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-xl"
          >
            View All Words
          </button>
        </div>
      </div>
    );
  }

  const wordStatus = learned.has(currentWord.id)
    ? 'learned'
    : reviewing.has(currentWord.id)
    ? 'reviewing'
    : 'new';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </Link>
        <button
          onClick={resetProgress}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm font-medium">Reset</span>
        </button>
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Vocabulary Practice</h1>
        <p className="text-sm text-text-secondary mt-1">See Indonesian, translate to English in your head, then click to check!</p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-listen">{learned.size}</p>
          <p className="text-xs text-text-secondary">Learned</p>
        </div>
        <div className="flex-1 bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-repeat">{reviewing.size}</p>
          <p className="text-xs text-text-secondary">To Review</p>
        </div>
        <div className="flex-1 bg-card border border-border rounded-xl p-4">
          <p className="text-2xl font-bold text-text-primary">{filteredVocab.length}</p>
          <p className="text-xs text-text-secondary">Total</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-primary text-white'
                : 'bg-background-alt text-text-secondary hover:bg-border'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-text-secondary">
          {currentIndex + 1} of {filteredVocab.length}
        </span>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          wordStatus === 'learned'
            ? 'bg-listen-bg text-listen'
            : wordStatus === 'reviewing'
            ? 'bg-repeat-bg text-repeat'
            : 'bg-background-alt text-text-secondary'
        }`}>
          {wordStatus === 'learned' ? 'Learned' : wordStatus === 'reviewing' ? 'Reviewing' : 'New'}
        </span>
      </div>

      {/* Flashcard - INDONESIAN first, English when flipped */}
      <div
        className="bg-card border border-border rounded-2xl p-8 mb-6 min-h-[280px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-lg"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {!isFlipped ? (
          // Front: Indonesian word (what they need to translate)
          <>
            <span className="text-xs font-semibold text-listen uppercase tracking-wide mb-4">
              Indonesian
            </span>
            <p className="text-3xl font-bold text-text-primary text-center mb-4">
              {currentWord.indonesian}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              How do you say this in English?
            </p>
            <p className="mt-6 text-xs text-text-tertiary">
              Tap to reveal the English translation
            </p>
          </>
        ) : (
          // Back: English translation with pronunciation
          <>
            <span className="text-xs font-semibold text-respond uppercase tracking-wide mb-2">
              English
            </span>
            <p className="text-3xl font-bold text-respond text-center mb-4">
              {currentWord.english}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakWord(currentWord.english, 'en-US');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-respond/10 rounded-xl text-respond hover:bg-respond/20 transition-colors"
            >
              <Volume2 className="w-5 h-5" />
              <span className="text-sm font-medium">Listen to English</span>
            </button>
            <p className="text-sm text-text-tertiary mt-4">{currentWord.indonesian}</p>
            <p className="mt-4 text-xs text-text-tertiary">
              Tap to see Indonesian again
            </p>
          </>
        )}
      </div>

      {/* Difficulty Badge */}
      <div className="flex justify-center mb-6">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          currentWord.difficulty === 'easy'
            ? 'bg-listen-bg text-listen'
            : currentWord.difficulty === 'medium'
            ? 'bg-repeat-bg text-repeat'
            : 'bg-situation-bg text-situation'
        }`}>
          {currentWord.difficulty}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-3 bg-background-alt rounded-xl text-text-secondary hover:bg-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Prev</span>
        </button>
        <button
          onClick={nextCard}
          disabled={currentIndex === filteredVocab.length - 1}
          className="flex items-center gap-2 px-4 py-3 bg-background-alt rounded-xl text-text-secondary hover:bg-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="font-medium">Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={markForReview}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-repeat-bg text-repeat rounded-xl font-medium hover:bg-repeat/20 transition-colors"
        >
          <X className="w-5 h-5" />
          <span>Review Again</span>
        </button>
        <button
          onClick={markAsLearned}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-listen-bg text-listen rounded-xl font-medium hover:bg-listen/20 transition-colors"
        >
          <Check className="w-5 h-5" />
          <span>I Know This!</span>
        </button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-8 p-4 bg-background-alt rounded-xl">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
          Keyboard Shortcuts
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-text-tertiary">
          <span><kbd className="px-1.5 py-0.5 bg-card border border-border rounded">Space</kbd> Flip card</span>
          <span><kbd className="px-1.5 py-0.5 bg-card border border-border rounded">←</kbd> Previous</span>
          <span><kbd className="px-1.5 py-0.5 bg-card border border-border rounded">→</kbd> Next</span>
          <span><kbd className="px-1.5 py-0.5 bg-card border border-border rounded">G</kbd> Got it</span>
          <span><kbd className="px-1.5 py-0.5 bg-card border border-border rounded">R</kbd> Review</span>
        </div>
      </div>
    </div>
  );
}
