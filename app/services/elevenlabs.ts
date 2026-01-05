/**
 * ElevenLabs Text-to-Speech Service
 *
 * High-quality TTS for the Listen mode.
 *
 * Docs: https://elevenlabs.io/docs/api-reference
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const API_BASE = 'https://api.elevenlabs.io/v1';

// Available voices (pre-configured for language learning)
export const ELEVENLABS_VOICES = {
  // American English voices
  rachel: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', accent: 'American', gender: 'Female' },
  drew: { id: '29vD33N1CtxCmqQRPOHJ', name: 'Drew', accent: 'American', gender: 'Male' },
  clyde: { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde', accent: 'American', gender: 'Male' },
  paul: { id: '5Q0t7uMcjvnagumLfvZi', name: 'Paul', accent: 'American', gender: 'Male' },

  // British English voices
  charlotte: { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', accent: 'British', gender: 'Female' },
  james: { id: 'ZQe5CZNOzWyzPSCn5a3c', name: 'James', accent: 'British', gender: 'Male' },

  // Australian English voice
  matilda: { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', accent: 'Australian', gender: 'Female' },
} as const;

export type VoiceId = keyof typeof ELEVENLABS_VOICES;

interface TTSOptions {
  voiceId?: VoiceId | string;
  stability?: number; // 0-1, default 0.5
  similarityBoost?: number; // 0-1, default 0.75
  speed?: number; // 0.5-2.0, default 1.0
}

interface TTSResult {
  audioUri: string;
  sound: Audio.Sound;
}

class ElevenLabsService {
  private sound: Audio.Sound | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initAudio();
  }

  private async initAudio() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('[ElevenLabs] Failed to initialize audio:', error);
    }
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!ELEVENLABS_API_KEY;
  }

  /**
   * Generate speech from text
   */
  async speak(text: string, options: TTSOptions = {}): Promise<TTSResult> {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    const {
      voiceId = 'rachel',
      stability = 0.5,
      similarityBoost = 0.75,
      speed = 1.0,
    } = options;

    // Get the actual voice ID if using a preset name
    const actualVoiceId = ELEVENLABS_VOICES[voiceId as VoiceId]?.id || voiceId;

    try {
      // Stop any currently playing audio
      await this.stop();

      console.log('[ElevenLabs] Generating speech for:', text.substring(0, 50) + '...');

      const response = await fetch(
        `${API_BASE}/text-to-speech/${actualVoiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability,
              similarity_boost: similarityBoost,
              style: 0,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('[ElevenLabs] API error:', error);
        throw new Error(`TTS failed: ${response.status}`);
      }

      // Get the audio blob
      const audioBlob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      // Save to temporary file
      const tempUri = `${FileSystem.cacheDirectory}elevenlabs_tts_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(tempUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('[ElevenLabs] Audio saved to:', tempUri);

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: tempUri },
        { shouldPlay: false, rate: speed }
      );

      this.sound = sound;

      return {
        audioUri: tempUri,
        sound,
      };
    } catch (error) {
      console.error('[ElevenLabs] Speech generation error:', error);
      throw error;
    }
  }

  /**
   * Play the generated audio
   */
  async play(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  /**
   * Pause the audio
   */
  async pause(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  /**
   * Stop and unload the audio
   */
  async stop(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch (e) {
        // Ignore errors during cleanup
      }
      this.sound = null;
    }
  }

  /**
   * Set playback rate
   */
  async setRate(rate: number): Promise<void> {
    if (this.sound) {
      await this.sound.setRateAsync(rate, true);
    }
  }

  /**
   * Get available voices
   */
  getVoices() {
    return ELEVENLABS_VOICES;
  }

  /**
   * Get voices by accent
   */
  getVoicesByAccent(accent: 'American' | 'British' | 'Australian') {
    return Object.entries(ELEVENLABS_VOICES)
      .filter(([_, voice]) => voice.accent === accent)
      .map(([key, voice]) => ({ key, voiceId: voice.id, name: voice.name, accent: voice.accent, gender: voice.gender }));
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    if (!ELEVENLABS_API_KEY) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/voices`, {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      });

      if (response.ok) {
        console.log('[ElevenLabs] API connection verified');
        return true;
      }

      console.error('[ElevenLabs] API test failed:', response.status);
      return false;
    } catch (error) {
      console.error('[ElevenLabs] Connection test error:', error);
      return false;
    }
  }

  /**
   * Get remaining character quota (if available)
   */
  async getQuota(): Promise<{ remaining: number; limit: number } | null> {
    if (!ELEVENLABS_API_KEY) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/user/subscription`, {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          remaining: data.character_count || 0,
          limit: data.character_limit || 0,
        };
      }

      return null;
    } catch (error) {
      console.error('[ElevenLabs] Quota check error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const elevenLabs = new ElevenLabsService();

// Export class for testing
export { ElevenLabsService };
