/**
 * Grok Voice API Service
 *
 * Uses xAI's REST API for audio transcription and evaluation.
 * More reliable than WebSocket in React Native.
 *
 * Docs: https://docs.x.ai/api
 */

const XAI_API_KEY = process.env.EXPO_PUBLIC_XAI_API_KEY;
const API_ENDPOINT = 'https://api.x.ai/v1/chat/completions';

// Available voices (for TTS integration later)
export type GrokVoice = 'Ara' | 'Rex' | 'Sal' | 'Eve' | 'Leo';

export const GROK_VOICES = {
  Ara: { type: 'Female', tone: 'Warm, friendly', description: 'Default voice, balanced and conversational' },
  Rex: { type: 'Male', tone: 'Confident, clear', description: 'Professional, ideal for business' },
  Sal: { type: 'Neutral', tone: 'Smooth, balanced', description: 'Versatile for various contexts' },
  Eve: { type: 'Female', tone: 'Energetic, upbeat', description: 'Engaging, great for interactive experiences' },
  Leo: { type: 'Male', tone: 'Authoritative, strong', description: 'Decisive, suitable for instructional content' },
} as const;

// Session configuration
interface SessionConfig {
  voice?: GrokVoice;
  systemPrompt?: string;
  language?: string;
}

// Callbacks for handling events
interface GrokVoiceCallbacks {
  onSessionCreated?: (sessionId: string) => void;
  onSpeechStarted?: () => void;
  onSpeechStopped?: () => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onAudioChunk?: (base64Audio: string) => void;
  onAudioDone?: () => void;
  onResponseDone?: (fullTranscript: string) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

// Transcription result
export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  evaluation?: {
    isCorrect: boolean;
    score: number;
    feedback: string;
  };
}

class GrokVoiceService {
  private callbacks: GrokVoiceCallbacks = {};
  private sessionId: string | null = null;
  private config: SessionConfig = {};
  private connected: boolean = false;

  /**
   * Initialize the service (simulates connection for API compatibility)
   */
  async connect(config: SessionConfig = {}): Promise<void> {
    if (!XAI_API_KEY) {
      throw new Error('XAI_API_KEY not configured');
    }

    this.config = config;
    this.sessionId = `session_${Date.now()}`;
    this.connected = true;

    console.log('[GrokVoice] Initialized with REST API');

    // Verify API key works
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-2-latest',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[GrokVoice] API verification failed:', error);
        throw new Error(`API verification failed: ${response.status}`);
      }

      console.log('[GrokVoice] API key verified');
      this.callbacks.onConnectionChange?.(true);
      this.callbacks.onSessionCreated?.(this.sessionId);
    } catch (error) {
      console.error('[GrokVoice] Connection error:', error);
      this.connected = false;
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Connection failed');
      throw error;
    }
  }

  /**
   * Transcribe audio using Grok LLM
   * Since xAI doesn't have a dedicated STT endpoint, we use the LLM
   * to evaluate spoken text that we get from device speech recognition
   */
  async evaluateSpeech(
    spokenText: string,
    expectedAnswer: string,
    context?: string
  ): Promise<TranscriptionResult> {
    if (!this.connected) {
      throw new Error('Not connected - call connect() first');
    }

    const systemPrompt = this.config.systemPrompt || `You are an English language tutor evaluating pronunciation and accuracy.
Compare the spoken text with the expected answer and provide feedback.
Be encouraging but accurate. Focus on meaning over exact wording.`;

    const userPrompt = `Expected answer: "${expectedAnswer}"
Spoken text: "${spokenText}"
${context ? `Context: ${context}` : ''}

Evaluate if the spoken text matches the expected answer.
Return JSON only:
{
  "isCorrect": boolean (true if meaning matches, minor differences OK),
  "score": number (0-1, how close the match is),
  "feedback": string (brief, encouraging feedback)
}`;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-2-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[GrokVoice] Evaluation failed:', error);
        throw new Error(`Evaluation failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Parse the JSON response
      try {
        // Extract JSON from the response (handle markdown code blocks)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const evaluation = JSON.parse(jsonMatch[0]);
          return {
            transcript: spokenText,
            confidence: 1,
            evaluation: {
              isCorrect: evaluation.isCorrect ?? false,
              score: evaluation.score ?? 0,
              feedback: evaluation.feedback ?? 'Keep practicing!',
            },
          };
        }
      } catch (parseError) {
        console.warn('[GrokVoice] Could not parse evaluation:', content);
      }

      // Fallback: simple string matching
      const normalize = (s: string) => s.toLowerCase().trim().replace(/[^\w\s]/g, '');
      const isCorrect = normalize(spokenText) === normalize(expectedAnswer);

      return {
        transcript: spokenText,
        confidence: 1,
        evaluation: {
          isCorrect,
          score: isCorrect ? 1 : 0.5,
          feedback: isCorrect ? 'Perfect!' : 'Good try, keep practicing!',
        },
      };
    } catch (error) {
      console.error('[GrokVoice] Evaluation error:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Evaluation failed');
      throw error;
    }
  }

  /**
   * Generate feedback for pronunciation
   */
  async generateFeedback(
    spokenText: string,
    targetPhrase: string
  ): Promise<string> {
    if (!this.connected) {
      throw new Error('Not connected');
    }

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-2-latest',
          messages: [
            {
              role: 'system',
              content: 'You are a friendly English tutor. Give brief, encouraging feedback (1-2 sentences) on pronunciation.',
            },
            {
              role: 'user',
              content: `Student tried to say: "${targetPhrase}"\nWhat they said: "${spokenText}"\n\nGive brief feedback.`,
            },
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Good effort! Keep practicing.';
    } catch (error) {
      console.error('[GrokVoice] Feedback generation error:', error);
      return 'Keep practicing!';
    }
  }

  /**
   * Compatibility methods for existing code
   */
  sendAudio(_base64Audio: string): void {
    // Not used in REST mode - handled by device speech recognition
    console.log('[GrokVoice] sendAudio called - using device speech recognition instead');
  }

  commitAudio(): void {
    // Not used in REST mode
    console.log('[GrokVoice] commitAudio called - using device speech recognition instead');
  }

  sendText(text: string): void {
    this.callbacks.onTranscript?.(text, true);
    this.callbacks.onResponseDone?.(text);
  }

  cancelResponse(): void {
    // No-op in REST mode
  }

  clearAudioBuffer(): void {
    // No-op in REST mode
  }

  setCallbacks(callbacks: GrokVoiceCallbacks): void {
    this.callbacks = callbacks;
  }

  disconnect(): void {
    this.connected = false;
    this.sessionId = null;
    this.callbacks.onConnectionChange?.(false);
    console.log('[GrokVoice] Disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// Export singleton instance
export const grokVoice = new GrokVoiceService();

// Export class for testing
export { GrokVoiceService };
