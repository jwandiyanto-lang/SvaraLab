'use client';

import { useState, useEffect } from 'react';
import { User, Bell, Clock, Volume2, Palette, Trash2, ChevronRight, Mic, Play } from 'lucide-react';
import { VOICES, speak } from '@/services/elevenlabs';

// Voice options for TTS
const VOICE_OPTIONS = [
  { id: 'matilda', name: 'Matilda', description: 'Warm, friendly female', gender: 'female' },
  { id: 'jessica', name: 'Jessica', description: 'Expressive American female', gender: 'female' },
  { id: 'lily', name: 'Lily', description: 'Warm British female', gender: 'female' },
  { id: 'brian', name: 'Brian', description: 'Deep American male', gender: 'male' },
  { id: 'daniel', name: 'Daniel', description: 'Authoritative British male', gender: 'male' },
  { id: 'george', name: 'George', description: 'Warm British male', gender: 'male' },
  { id: 'chris', name: 'Chris', description: 'Casual American male', gender: 'male' },
  { id: 'alice', name: 'Alice', description: 'Confident British female', gender: 'female' },
];

export default function SettingsPage() {
  const [name, setName] = useState('Learner');
  const [dailyGoal, setDailyGoal] = useState(15);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('matilda');
  const [isPlayingPreview, setIsPlayingPreview] = useState<string | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('svaralab-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      if (settings.name) setName(settings.name);
      if (settings.dailyGoal) setDailyGoal(settings.dailyGoal);
      if (settings.notifications !== undefined) setNotifications(settings.notifications);
      if (settings.soundEffects !== undefined) setSoundEffects(settings.soundEffects);
      if (settings.selectedVoice) setSelectedVoice(settings.selectedVoice);
    }
  }, []);

  // Preview voice
  const previewVoice = async (voiceId: string) => {
    setIsPlayingPreview(voiceId);
    try {
      const voiceKey = voiceId as keyof typeof VOICES;
      const audioUrl = await speak('Hello, how are you doing today?', {
        voiceId: VOICES[voiceKey] || VOICES.matilda
      });
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlayingPreview(null);
        audio.play();
      } else {
        setIsPlayingPreview(null);
      }
    } catch (error) {
      console.error('Preview error:', error);
      setIsPlayingPreview(null);
    }
  };

  const handleSave = () => {
    // Save to localStorage - will integrate with store later
    localStorage.setItem('svaralab-settings', JSON.stringify({
      name,
      dailyGoal,
      notifications,
      soundEffects,
      selectedVoice,
    }));
    alert('Settings saved!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      localStorage.clear();
      alert('Progress reset. Refreshing...');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>

      {/* Profile Section */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-repeat-bg flex items-center justify-center">
            <User className="w-5 h-5 text-repeat" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Profile</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-background-alt rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your name"
            />
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-listen-bg flex items-center justify-center">
            <Clock className="w-5 h-5 text-listen" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Daily Goal</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Practice time per day (minutes)
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDailyGoal(mins)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                    dailyGoal === mins
                      ? 'bg-primary text-white'
                      : 'bg-background-alt text-text-secondary hover:bg-border'
                  }`}
                >
                  {mins}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-respond-bg flex items-center justify-center">
            <Mic className="w-5 h-5 text-respond" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Voice Selection</h2>
            <p className="text-xs text-text-tertiary">Choose your preferred TTS voice</p>
          </div>
        </div>

        <div className="grid gap-2">
          {VOICE_OPTIONS.map((voice) => (
            <div
              key={voice.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer ${
                selectedVoice === voice.id
                  ? 'border-respond bg-respond/5'
                  : 'border-border hover:border-respond/50'
              }`}
              onClick={() => setSelectedVoice(voice.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  voice.gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <span className="text-xs font-bold">{voice.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{voice.name}</p>
                  <p className="text-xs text-text-tertiary">{voice.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedVoice === voice.id && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-respond/10 text-respond">
                    Selected
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    previewVoice(voice.id);
                  }}
                  disabled={isPlayingPreview === voice.id}
                  className="p-2 rounded-lg bg-background-alt hover:bg-border transition-colors disabled:opacity-50"
                >
                  <Play className={`w-4 h-4 ${isPlayingPreview === voice.id ? 'animate-pulse text-respond' : 'text-text-secondary'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-text-tertiary text-center">
          Powered by ElevenLabs - Natural AI voices
        </p>
      </div>

      {/* Preferences Section */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-listen-bg flex items-center justify-center">
            <Palette className="w-5 h-5 text-listen" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Preferences</h2>
        </div>

        <div className="space-y-4">
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-text-secondary" />
              <div>
                <p className="text-sm font-medium text-text-primary">Notifications</p>
                <p className="text-xs text-text-tertiary">Daily reminders to practice</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-7 rounded-full transition-colors ${
                notifications ? 'bg-listen' : 'bg-border'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between py-3 border-t border-border">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-text-secondary" />
              <div>
                <p className="text-sm font-medium text-text-primary">Sound Effects</p>
                <p className="text-xs text-text-tertiary">Play sounds for correct answers</p>
              </div>
            </div>
            <button
              onClick={() => setSoundEffects(!soundEffects)}
              className={`w-12 h-7 rounded-full transition-colors ${
                soundEffects ? 'bg-listen' : 'bg-border'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  soundEffects ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Section */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-situation-bg flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-situation" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Data</h2>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center justify-between w-full py-3 text-situation hover:bg-situation-bg rounded-xl px-4 transition-colors"
        >
          <span className="text-sm font-medium">Reset All Progress</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
      >
        Save Changes
      </button>

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-text-tertiary">
          SvaraLab v1.0.0 - English Speaking Practice for Indonesian Students
        </p>
        <p className="text-xs text-text-tertiary mt-1">
          Made with love for language learners
        </p>
      </div>
    </div>
  );
}
