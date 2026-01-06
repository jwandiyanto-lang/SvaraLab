// ElevenLabs TTS Service for natural-sounding speech
// https://elevenlabs.io/docs/api-reference/text-to-speech

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Best model for natural speech
const MODEL_ID = 'eleven_multilingual_v2'; // Most natural, expressive model

// Voice IDs from ElevenLabs - curated for natural conversational speech
export const VOICES = {
  // Natural conversational voices (best for language learning)
  aria: 'EXAVITQu4vr4xnSDxMaL',    // Aria - expressive, warm female
  roger: 'CwhRBWXzGAHq8TQ4Fs17',   // Roger - confident male
  sarah: 'EXAVITQu4vr4xnSDxMaL',   // Sarah - friendly female
  laura: 'FGY2WhTYpPnrIDTdsKH5',   // Laura - upbeat female
  charlie: 'IKne3meq5aSn9XLyUdCD', // Charlie - casual Australian
  george: 'JBFqnCBsd6RMkjVDRZzb',  // George - warm British male
  callum: 'N2lVS1w4EtoT3dr4eOWO',  // Callum - hoarse male
  river: 'SAz9YHcvj6GT2YYXdXww',   // River - non-binary, calm
  liam: 'TX3LPaxmHKxFdv7VOQHJ',    // Liam - articulate young male
  charlotte: 'XB0fDUnXU5powFXDhCwa', // Charlotte - Swedish female
  alice: 'Xb7hH8MSUJpSbSDYk0k2',   // Alice - confident British
  matilda: 'XrExE9yKIg1WjnnlVkGX', // Matilda - warm friendly female
  will: 'bIHbv24MWmeRgasZH58o',    // Will - friendly young male
  jessica: 'cgSgspJ2msm6clMCkdW9',  // Jessica - expressive American
  eric: 'cjVigY5qzO86Huf0OWal',    // Eric - friendly middle-aged
  chris: 'iP95p4xoKVk53GoZ742B',   // Chris - casual American male
  brian: 'nPczCjzI2devNBz1zQrb',   // Brian - deep American male
  daniel: 'onwK4e9ZLuTAKqWW03F9',  // Daniel - authoritative British
  lily: 'pFZP5JQG7iQjIQuC4Bku',    // Lily - warm British female
  bill: 'pqHfZKP75CvOlQylNhV4',    // Bill - trustworthy American

  // Legacy voice IDs (still work)
  rachel: '21m00Tcm4TlvDq8ikWAM',
  adam: 'pNInz6obpgDQGcFmaJgB',
  bella: 'EXAVITQu4vr4xnSDxMaL',
  josh: 'TxGEqnHWrfWFTfGW9XjX',
  emily: 'LcfcDJNUP1GQjkzn1xUU',
  james: 'ZQe5CZNOzWyzPSCn5a3c',
};

// Default voice for the app - Matilda is warm and friendly
const DEFAULT_VOICE = VOICES.matilda;

interface SpeakOptions {
  voiceId?: string;
  stability?: number;      // 0-1, lower = more expressive/natural
  similarityBoost?: number; // 0-1, higher = closer to original voice
  style?: number;          // 0-1, higher = more expressive
  speakerBoost?: boolean;  // boost speaker clarity
}

// Audio cache to avoid re-fetching same phrases
const audioCache = new Map<string, string>();

/**
 * Convert text to speech using ElevenLabs API
 * Returns a blob URL that can be used with HTML Audio
 */
export async function speak(
  text: string,
  options: SpeakOptions = {}
): Promise<string> {
  const {
    voiceId = DEFAULT_VOICE,
    stability = 0.3,        // Lower = more expressive, natural variation
    similarityBoost = 0.85, // High similarity to original voice
    style = 0.5,            // Add expressiveness
    speakerBoost = true,
  } = options;

  // Check cache first
  const cacheKey = `${voiceId}-${text}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not configured, falling back to browser TTS');
    return fallbackSpeak(text);
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID, // eleven_multilingual_v2 - most natural sounding
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: speakerBoost,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get audio blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Cache the URL
    audioCache.set(cacheKey, audioUrl);

    return audioUrl;
  } catch (error) {
    console.error('ElevenLabs TTS failed:', error);
    return fallbackSpeak(text);
  }
}

/**
 * Play text using ElevenLabs TTS
 * Returns a promise that resolves when playback completes
 */
export async function playText(
  text: string,
  options: SpeakOptions = {}
): Promise<void> {
  const audioUrl = await speak(text, options);

  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);

    audio.onended = () => resolve();
    audio.onerror = (e) => reject(e);

    audio.play().catch(reject);
  });
}

/**
 * Fallback to browser's built-in TTS if ElevenLabs is unavailable
 */
function fallbackSpeak(text: string): string {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
  return ''; // No URL for browser TTS
}

/**
 * Stop all audio playback
 */
export function stopAudio() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Clean up cached audio URLs to free memory
 */
export function clearAudioCache() {
  audioCache.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  audioCache.clear();
}

export default {
  speak,
  playText,
  stopAudio,
  clearAudioCache,
  VOICES,
};
