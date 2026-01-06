'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  Trophy,
  Target,
  Flame,
  BookOpen,
  RefreshCw,
  Loader2,
  GraduationCap,
} from 'lucide-react';

// Notion-style avatar options
const AVATAR_FACES = ['😀', '😊', '🙂', '😎', '🤓', '😇', '🤔', '😏', '🥳', '🤠', '👨', '👩', '🧑', '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰'];
const AVATAR_BG_COLORS = [
  '#FFE4C4', '#DEB887', '#F0E68C', '#E6E6FA', '#FFB6C1', '#98FB98',
  '#87CEEB', '#DDA0DD', '#F5DEB3', '#FFA07A', '#20B2AA', '#778899',
  '#ADD8E6', '#90EE90', '#FFD700', '#FF69B4',
];

// Placement test questions
const PLACEMENT_QUESTIONS = [
  {
    id: 1,
    level: 'beginner',
    indonesian: 'Selamat pagi',
    options: ['Good morning', 'Good night', 'Good afternoon', 'Goodbye'],
    correct: 0,
  },
  {
    id: 2,
    level: 'beginner',
    indonesian: 'Terima kasih',
    options: ['Sorry', 'Please', 'Thank you', 'Excuse me'],
    correct: 2,
  },
  {
    id: 3,
    level: 'beginner',
    indonesian: 'Saya tidak mengerti',
    options: ['I understand', 'I don\'t understand', 'I agree', 'I don\'t know'],
    correct: 1,
  },
  {
    id: 4,
    level: 'intermediate',
    indonesian: 'Saya ingin memesan makanan',
    options: ['I want to pay the bill', 'I want to order food', 'I want to go home', 'I want to see the menu'],
    correct: 1,
  },
  {
    id: 5,
    level: 'intermediate',
    indonesian: 'Berapa harga tiket ke Jakarta?',
    options: ['Where is Jakarta?', 'When does the train leave?', 'How much is the ticket to Jakarta?', 'How long is the trip?'],
    correct: 2,
  },
  {
    id: 6,
    level: 'intermediate',
    indonesian: 'Bisakah Anda berbicara lebih pelan?',
    options: ['Can you speak louder?', 'Can you repeat that?', 'Can you speak more slowly?', 'Can you help me?'],
    correct: 2,
  },
  {
    id: 7,
    level: 'advanced',
    indonesian: 'Saya akan menghadiri rapat besok pagi',
    options: ['I attended the meeting yesterday', 'I will attend the meeting tomorrow morning', 'I am in a meeting right now', 'The meeting was cancelled'],
    correct: 1,
  },
  {
    id: 8,
    level: 'advanced',
    indonesian: 'Apakah Anda keberatan jika saya membuka jendela?',
    options: ['Do you want me to open the window?', 'Would you mind if I opened the window?', 'Please open the window', 'The window is already open'],
    correct: 1,
  },
  {
    id: 9,
    level: 'advanced',
    indonesian: 'Seandainya saya tahu lebih awal, saya akan datang',
    options: ['I knew about it early', 'If I had known earlier, I would have come', 'I will come if I know', 'I didn\'t know about it'],
    correct: 1,
  },
  {
    id: 10,
    level: 'advanced',
    indonesian: 'Dia menyarankan agar saya melamar pekerjaan itu',
    options: ['She applied for the job', 'She suggested that I apply for the job', 'I suggested she apply for the job', 'We both applied for the job'],
    correct: 1,
  },
];

interface UserProfile {
  name: string;
  avatarEmoji: string;
  avatarBgColor: string;
  level: string;
  testScore: number;
  testCompleted: boolean;
  joinDate: string;
}

function AvatarSelector({
  currentEmoji,
  currentBg,
  onSelect
}: {
  currentEmoji: string;
  currentBg: string;
  onSelect: (emoji: string, bg: string) => void;
}) {
  const [selectedEmoji, setSelectedEmoji] = useState(currentEmoji);
  const [selectedBg, setSelectedBg] = useState(currentBg);
  const [showSelector, setShowSelector] = useState(false);

  const handleSave = () => {
    onSelect(selectedEmoji, selectedBg);
    setShowSelector(false);
  };

  if (!showSelector) {
    return (
      <button
        onClick={() => setShowSelector(true)}
        className="relative group"
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-transform group-hover:scale-105"
          style={{ backgroundColor: currentBg }}
        >
          {currentEmoji}
        </div>
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <Camera className="w-4 h-4 text-white" />
        </div>
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-text-secondary mb-4">Choose Your Avatar</h3>

      {/* Preview */}
      <div className="flex justify-center mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{ backgroundColor: selectedBg }}
        >
          {selectedEmoji}
        </div>
      </div>

      {/* Emoji Selection */}
      <div className="mb-4">
        <p className="text-xs text-text-tertiary mb-2">Face</p>
        <div className="grid grid-cols-9 gap-1">
          {AVATAR_FACES.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedEmoji(emoji)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors ${
                selectedEmoji === emoji ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-background-alt'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Background Color Selection */}
      <div className="mb-6">
        <p className="text-xs text-text-tertiary mb-2">Background Color</p>
        <div className="grid grid-cols-8 gap-1">
          {AVATAR_BG_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedBg(color)}
              className={`w-8 h-8 rounded-full transition-transform ${
                selectedBg === color ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowSelector(false)}
          className="flex-1 py-2 bg-background-alt rounded-xl text-sm font-medium text-text-secondary hover:bg-border transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2 bg-primary rounded-xl text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function PlacementTest({ onComplete }: { onComplete: (score: number, level: string) => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const question = PLACEMENT_QUESTIONS[currentQuestion];

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < PLACEMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      let correct = 0;
      newAnswers.forEach((ans, idx) => {
        if (ans === PLACEMENT_QUESTIONS[idx].correct) {
          correct++;
        }
      });
      const finalScore = Math.round((correct / PLACEMENT_QUESTIONS.length) * 100);
      setScore(finalScore);
      setShowResult(true);
    }
  };

  const getLevel = (score: number): string => {
    if (score >= 80) return 'Advanced';
    if (score >= 50) return 'Intermediate';
    return 'Beginner';
  };

  if (showResult) {
    const level = getLevel(score);
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-listen-bg flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-10 h-10 text-listen" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Test Complete!</h2>
        <p className="text-text-secondary mb-6">
          You scored {score}% - Your level is <strong className="text-respond">{level}</strong>
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => onComplete(score, level)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
          >
            <Check className="w-4 h-4" />
            Save Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-primary">Placement Test</h3>
        <span className="text-sm text-text-secondary">
          {currentQuestion + 1} / {PLACEMENT_QUESTIONS.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-border rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-respond rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / PLACEMENT_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-listen uppercase tracking-wide">Indonesian</span>
        <p className="text-2xl font-bold text-text-primary mt-2">{question.indonesian}</p>
        <p className="text-sm text-text-secondary mt-2">Select the correct English translation:</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            className="w-full p-4 bg-background-alt rounded-xl text-left text-text-primary hover:bg-border transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Learner',
    avatarEmoji: '😊',
    avatarBgColor: '#FFE4C4',
    level: 'Not tested',
    testScore: 0,
    testCompleted: false,
    joinDate: new Date().toISOString(),
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [tempName, setTempName] = useState(profile.name);

  // Load profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('svaralab-profile');
    if (saved) {
      setProfile(JSON.parse(saved));
      setTempName(JSON.parse(saved).name);
    }
  }, []);

  // Save profile
  const saveProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    localStorage.setItem('svaralab-profile', JSON.stringify(newProfile));
  };

  const handleTestComplete = (score: number, level: string) => {
    saveProfile({
      testScore: score,
      level,
      testCompleted: true,
    });
    setShowTest(false);
  };

  const handleAvatarSelect = (emoji: string, bg: string) => {
    saveProfile({
      avatarEmoji: emoji,
      avatarBgColor: bg,
    });
  };

  const handleNameSave = () => {
    saveProfile({ name: tempName });
    setIsEditing(false);
  };

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
      </div>

      {showTest ? (
        <PlacementTest onComplete={handleTestComplete} />
      ) : (
        <>
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-6 text-center">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <AvatarSelector
                currentEmoji={profile.avatarEmoji}
                currentBg={profile.avatarBgColor}
                onSelect={handleAvatarSelect}
              />
            </div>

            {/* Name */}
            {isEditing ? (
              <div className="flex items-center justify-center gap-2 mb-4">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-4 py-2 bg-background-alt rounded-xl text-center text-xl font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <button
                  onClick={handleNameSave}
                  className="p-2 bg-listen rounded-lg text-white"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-2xl font-bold text-text-primary hover:text-respond transition-colors mb-2"
              >
                {profile.name}
              </button>
            )}

            {/* Level Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-respond/10 rounded-full">
              <GraduationCap className="w-4 h-4 text-respond" />
              <span className="text-sm font-medium text-respond">{profile.level}</span>
            </div>

            {profile.testCompleted && (
              <p className="text-xs text-text-tertiary mt-2">
                Placement test score: {profile.testScore}%
              </p>
            )}
          </div>

          {/* Take Placement Test */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-respond-bg flex items-center justify-center">
                  <Target className="w-6 h-6 text-respond" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Placement Test</h3>
                  <p className="text-xs text-text-tertiary">
                    {profile.testCompleted ? 'Retake to update your level' : 'Find your starting level'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-respond text-white rounded-xl font-medium hover:bg-respond/90 transition-colors"
              >
                {profile.testCompleted ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Retake
                  </>
                ) : (
                  <>
                    Start Test
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-repeat-bg flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-5 h-5 text-repeat" />
              </div>
              <p className="text-xl font-bold text-text-primary">1,250</p>
              <p className="text-xs text-text-secondary">Total XP</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-listen-bg flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-5 h-5 text-listen" />
              </div>
              <p className="text-xl font-bold text-text-primary">42</p>
              <p className="text-xs text-text-secondary">Words</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-situation-bg flex items-center justify-center mx-auto mb-2">
                <Flame className="w-5 h-5 text-situation" />
              </div>
              <p className="text-xl font-bold text-text-primary">7</p>
              <p className="text-xs text-text-secondary">Day Streak</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <Link
              href="/settings"
              className="flex items-center justify-between p-4 hover:bg-background-alt transition-colors border-b border-border"
            >
              <span className="text-sm font-medium text-text-primary">Settings</span>
              <ChevronRight className="w-4 h-4 text-text-tertiary" />
            </Link>
            <Link
              href="/stats"
              className="flex items-center justify-between p-4 hover:bg-background-alt transition-colors border-b border-border"
            >
              <span className="text-sm font-medium text-text-primary">View Statistics</span>
              <ChevronRight className="w-4 h-4 text-text-tertiary" />
            </Link>
            <Link
              href="/vocab"
              className="flex items-center justify-between p-4 hover:bg-background-alt transition-colors"
            >
              <span className="text-sm font-medium text-text-primary">Vocabulary</span>
              <ChevronRight className="w-4 h-4 text-text-tertiary" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
