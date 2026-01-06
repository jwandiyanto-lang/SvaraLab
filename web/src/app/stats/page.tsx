'use client';

import { useEffect, useState } from 'react';
import { Star, BookOpen, TrendingUp, Flame, Clock, Target, Award, Zap, Brain, Headphones, Store, Volume2 } from 'lucide-react';
import { useProgressStore, WordMastery } from '@/stores/progressStore';

// Get day names for weekly chart
const getDayName = (date: Date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    repeat: { bg: 'bg-repeat-bg', text: 'text-repeat' },
    respond: { bg: 'bg-respond-bg', text: 'text-respond' },
    listen: { bg: 'bg-listen-bg', text: 'text-listen' },
    situation: { bg: 'bg-situation-bg', text: 'text-situation' },
  };

  const colors = colorClasses[color] || colorClasses.respond;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          <p className="text-sm text-text-secondary">{label}</p>
        </div>
      </div>
    </div>
  );
}

function LevelProgress() {
  const { totalXP, currentLevel } = useProgressStore();

  const xpPerLevel = (level: number) => 100 + (level - 1) * 50;
  const xpForCurrentLevel = xpPerLevel(currentLevel);

  // Calculate XP progress within current level
  let xpSpent = 0;
  for (let i = 1; i < currentLevel; i++) {
    xpSpent += xpPerLevel(i);
  }
  const currentLevelXP = totalXP - xpSpent;
  const progress = Math.min((currentLevelXP / xpForCurrentLevel) * 100, 100);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-respond-bg flex items-center justify-center">
            <span className="text-lg font-bold text-respond">{currentLevel}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Level {currentLevel}</p>
            <p className="text-xs text-text-secondary">{currentLevelXP} / {xpForCurrentLevel} XP to next level</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-respond">{totalXP.toLocaleString()}</p>
          <p className="text-xs text-text-secondary">Total XP</p>
        </div>
      </div>
      <div className="h-3 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-respond rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function WeeklyActivity() {
  const { getWeeklyActivity } = useProgressStore();
  const weeklyData = getWeeklyActivity();

  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutesPracticed), 1);
  const totalMinutes = weeklyData.reduce((sum, d) => sum + d.minutesPracticed, 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">This Week</h3>
      <div className="flex items-end justify-between gap-2 h-32">
        {weeklyData.map((day, idx) => {
          const date = new Date(day.date);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    day.minutesPracticed > 0 ? 'bg-listen' : 'bg-border'
                  }`}
                  style={{
                    height: day.minutesPracticed > 0 ? `${(day.minutesPracticed / maxMinutes) * 100}%` : '8px',
                  }}
                />
              </div>
              <span className="text-xs text-text-secondary">{getDayName(date)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-text-secondary">Total this week</span>
        <span className="text-sm font-semibold text-listen">
          {totalMinutes} minutes
        </span>
      </div>
    </div>
  );
}

function ModePerformance() {
  const { modeStats } = useProgressStore();

  const modes = [
    { key: 'speak', name: 'Speak Fast', icon: Zap, color: 'repeat' },
    { key: 'respond', name: 'Think & Answer', icon: Brain, color: 'respond' },
    { key: 'listen', name: 'Listen Sharp', icon: Headphones, color: 'listen' },
    { key: 'situation', name: 'Real Talk', icon: Store, color: 'situation' },
    { key: 'flashDrill', name: 'Flash Drill', icon: Target, color: 'situation' },
  ];

  const colorClasses: Record<string, string> = {
    repeat: 'bg-repeat text-repeat-bg',
    respond: 'bg-respond text-respond-bg',
    listen: 'bg-listen text-listen-bg',
    situation: 'bg-situation text-situation-bg',
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Mode Performance</h3>
      <div className="space-y-4">
        {modes.map((mode) => {
          const stats = modeStats[mode.key];
          const Icon = mode.icon;

          if (!stats || stats.totalSessions === 0) {
            return (
              <div key={mode.key} className="flex items-center gap-3 p-3 bg-background-alt rounded-xl opacity-50">
                <div className="w-10 h-10 rounded-lg bg-border flex items-center justify-center">
                  <Icon className="w-5 h-5 text-text-tertiary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-secondary">{mode.name}</p>
                  <p className="text-xs text-text-tertiary">Not practiced yet</p>
                </div>
              </div>
            );
          }

          return (
            <div key={mode.key} className="flex items-center gap-3 p-3 bg-background-alt rounded-xl">
              <div className={`w-10 h-10 rounded-lg ${colorClasses[mode.color] || 'bg-border'} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-text-primary">{mode.name}</p>
                  <p className="text-sm font-bold text-text-primary">{stats.averageAccuracy}%</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-text-tertiary">{stats.totalSessions} sessions</p>
                  <p className="text-xs text-text-tertiary">Best: {stats.bestScore} pts</p>
                </div>
                <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colorClasses[mode.color]?.split(' ')[0] || 'bg-respond'}`}
                    style={{ width: `${stats.averageAccuracy}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WordProgress() {
  const { words, getWordsByMastery, getWeakWords } = useProgressStore();

  const masteryLevels: { level: WordMastery; label: string; color: string }[] = [
    { level: 'mastered', label: 'Mastered', color: 'bg-success' },
    { level: 'familiar', label: 'Familiar', color: 'bg-listen' },
    { level: 'learning', label: 'Learning', color: 'bg-respond' },
    { level: 'new', label: 'New', color: 'bg-repeat' },
  ];

  const totalWords = Object.keys(words).length;
  const weakWords = getWeakWords(5);

  if (totalWords === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Vocabulary Progress</h3>
        <div className="text-center py-8 text-text-tertiary">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Start practicing to track your vocabulary!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Vocabulary Progress</h3>

      {/* Mastery breakdown */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {masteryLevels.map((m) => {
          const count = getWordsByMastery(m.level).length;
          return (
            <div key={m.level} className="text-center p-3 bg-background-alt rounded-xl">
              <p className="text-xl font-bold text-text-primary">{count}</p>
              <p className="text-xs text-text-tertiary">{m.label}</p>
              <div className={`w-full h-1 ${m.color} rounded-full mt-2`} />
            </div>
          );
        })}
      </div>

      {/* Weak words */}
      {weakWords.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Words to Review
          </p>
          <div className="flex flex-wrap gap-2">
            {weakWords.map((word) => {
              const accuracy = word.totalAttempts > 0
                ? Math.round((word.correctCount / word.totalAttempts) * 100)
                : 0;
              return (
                <span
                  key={word.word}
                  className="px-3 py-1.5 bg-error-bg text-error rounded-full text-xs font-medium"
                >
                  {word.word} ({accuracy}%)
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Achievements() {
  const { currentStreak, longestStreak, totalXP, sessions } = useProgressStore();

  const achievements = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first session',
      icon: Zap,
      unlocked: sessions.length > 0,
    },
    {
      id: 2,
      name: 'Week Warrior',
      description: '7 day streak',
      icon: Flame,
      unlocked: longestStreak >= 7,
    },
    {
      id: 3,
      name: 'Century Club',
      description: 'Earn 100 XP',
      icon: Star,
      unlocked: totalXP >= 100,
    },
    {
      id: 4,
      name: 'Dedicated Learner',
      description: 'Complete 10 sessions',
      icon: Target,
      unlocked: sessions.length >= 10,
    },
    {
      id: 5,
      name: 'Rising Star',
      description: 'Reach Level 5',
      icon: Award,
      unlocked: false, // Will check against currentLevel
    },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Achievements</h3>
      <div className="space-y-3">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <div
              key={achievement.id}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                achievement.unlocked ? 'bg-success-bg' : 'bg-background-alt opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  achievement.unlocked ? 'bg-success/20 text-success' : 'bg-border text-text-tertiary'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${achievement.unlocked ? 'text-success' : 'text-text-secondary'}`}>
                  {achievement.name}
                </p>
                <p className="text-xs text-text-tertiary">{achievement.description}</p>
              </div>
              {achievement.unlocked && (
                <span className="text-xs font-medium text-success">Unlocked</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { currentStreak, longestStreak, sessions, words, getTodayActivity, checkAndUpdateStreak } = useProgressStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  const todayActivity = getTodayActivity();
  const totalWords = Object.keys(words).length;
  const totalSessions = sessions.length;

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Your Progress</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-border rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-border rounded-2xl" />
            <div className="h-24 bg-border rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Your Progress</h1>

      {/* Level Progress */}
      <div className="mb-6">
        <LevelProgress />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard icon={BookOpen} label="Words Practiced" value={totalWords} color="listen" />
        <StatCard icon={Target} label="Sessions" value={totalSessions} color="repeat" />
        <StatCard icon={Flame} label="Current Streak" value={`${currentStreak} days`} color="repeat" />
        <StatCard icon={Clock} label="Today" value={`${todayActivity.minutesPracticed} min`} color="respond" />
      </div>

      {/* Weekly Activity */}
      <div className="mb-6">
        <WeeklyActivity />
      </div>

      {/* Mode Performance */}
      <div className="mb-6">
        <ModePerformance />
      </div>

      {/* Vocabulary Progress */}
      <div className="mb-6">
        <WordProgress />
      </div>

      {/* Achievements */}
      <Achievements />
    </div>
  );
}
