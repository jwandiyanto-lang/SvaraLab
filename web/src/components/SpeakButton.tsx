'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, Loader2, VolumeX } from 'lucide-react';
import { playText, stopAudio, VOICES } from '@/services/elevenlabs';

interface SpeakButtonProps {
  text: string;
  voiceId?: string;
  className?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SpeakButton({
  text,
  voiceId = VOICES.matilda, // Default to Matilda - warm friendly female
  className = '',
  label = 'Listen',
  size = 'md',
}: SpeakButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleClick = async () => {
    if (isPlaying) {
      // Stop playback
      stopAudio();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      // Use ElevenLabs for natural voice
      const { speak } = await import('@/services/elevenlabs');
      const audioUrl = await speak(text, { voiceId });

      if (audioUrl) {
        // Play the ElevenLabs audio
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };

        audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
        };

        audio.onerror = () => {
          console.error('Audio playback error');
          setIsPlaying(false);
          setIsLoading(false);
          audioRef.current = null;
        };

        await audio.play();
      } else {
        // Fallback was used (browser TTS)
        setIsPlaying(true);
        setIsLoading(false);

        // Estimate duration and reset state
        const estimatedDuration = Math.max(text.length * 80, 1000);
        setTimeout(() => {
          setIsPlaying(false);
        }, estimatedDuration);
      }
    } catch (error) {
      console.error('Speech error:', error);
      setIsLoading(false);
      setIsPlaying(false);

      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 gap-1',
    md: 'p-2 gap-2',
    lg: 'p-3 gap-2',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center rounded-lg transition-colors ${sizeClasses[size]} ${
        isPlaying
          ? 'bg-respond/10 text-respond'
          : 'text-text-secondary hover:text-respond hover:bg-background-alt'
      } ${isLoading ? 'opacity-50 cursor-wait' : ''} ${className}`}
      title={isPlaying ? 'Stop' : 'Listen to pronunciation'}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : isPlaying ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
      {label && <span className={`font-medium ${textSizes[size]}`}>{isPlaying ? 'Stop' : label}</span>}
    </button>
  );
}
