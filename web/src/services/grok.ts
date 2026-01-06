// Grok API Service for SvaraLab
// Uses xAI's Grok API for speech evaluation and language learning

const XAI_API_KEY = process.env.NEXT_PUBLIC_XAI_API_KEY;
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GrokResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface EvaluationResult {
  score: number; // 0-100
  feedback: string;
  pronunciation: string;
  grammar: string;
  suggestions: string[];
}

// Call Grok API
async function callGrok(messages: GrokMessage[]): Promise<string> {
  if (!XAI_API_KEY) {
    console.warn('XAI API key not configured');
    return '';
  }

  try {
    const response = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data: GrokResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Grok API call failed:', error);
    throw error;
  }
}

// Evaluate English speech/text for Indonesian learners
export async function evaluateSpeech(
  expectedEnglish: string,
  spokenText: string,
  indonesianContext: string
): Promise<EvaluationResult> {
  const systemPrompt = `You are an English language tutor helping Indonesian students learn English.
Your task is to evaluate their English speech/text and provide constructive feedback.
Be encouraging but honest. Focus on helping them improve.

Respond in JSON format only:
{
  "score": <0-100>,
  "feedback": "<brief encouraging feedback>",
  "pronunciation": "<pronunciation notes or 'Good' if correct>",
  "grammar": "<grammar notes or 'Correct' if fine>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>"]
}`;

  const userPrompt = `The student was asked to say: "${expectedEnglish}"
(Indonesian context: ${indonesianContext})

They said: "${spokenText}"

Evaluate their response.`;

  try {
    const response = await callGrok([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if parsing fails
    return {
      score: 70,
      feedback: 'Good attempt! Keep practicing.',
      pronunciation: 'Could not analyze',
      grammar: 'Could not analyze',
      suggestions: ['Try speaking more clearly', 'Practice the phrase again'],
    };
  } catch (error) {
    console.error('Evaluation failed:', error);
    // Return fallback evaluation
    return getFallbackEvaluation(expectedEnglish, spokenText);
  }
}

// Evaluate written English response
export async function evaluateResponse(
  question: string,
  response: string,
  context?: string
): Promise<EvaluationResult> {
  const systemPrompt = `You are an English language tutor helping Indonesian students learn English.
Evaluate their written English response to a question.
Be encouraging and provide actionable feedback.

Respond in JSON format only:
{
  "score": <0-100>,
  "feedback": "<brief encouraging feedback>",
  "pronunciation": "N/A",
  "grammar": "<grammar notes>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>"]
}`;

  const userPrompt = `Question: "${question}"
${context ? `Context: ${context}` : ''}

Student's response: "${response}"

Evaluate their English response.`;

  try {
    const grokResponse = await callGrok([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const jsonMatch = grokResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      score: 70,
      feedback: 'Good response! Keep practicing.',
      pronunciation: 'N/A',
      grammar: 'Could not analyze',
      suggestions: ['Try adding more detail', 'Use varied vocabulary'],
    };
  } catch (error) {
    console.error('Response evaluation failed:', error);
    return getFallbackResponseEvaluation(response);
  }
}

// Generate conversation for situation practice
export async function generateSituationResponse(
  scenario: string,
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const systemPrompt = `You are playing a role in a conversation scenario to help Indonesian students practice English.
Stay in character and respond naturally. Keep responses brief (1-2 sentences).
If the student makes mistakes, gently correct them in your response.

Scenario: ${scenario}`;

  const messages: GrokMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    return await callGrok(messages);
  } catch (error) {
    console.error('Situation response failed:', error);
    return "I understand. Could you tell me more?";
  }
}

// Fallback evaluation when API fails
function getFallbackEvaluation(expected: string, spoken: string): EvaluationResult {
  const expectedWords = expected.toLowerCase().split(/\s+/);
  const spokenWords = spoken.toLowerCase().split(/\s+/);

  let matchCount = 0;
  expectedWords.forEach((word) => {
    if (spokenWords.some((sw) => sw.includes(word) || word.includes(sw))) {
      matchCount++;
    }
  });

  const similarity = expectedWords.length > 0 ? matchCount / expectedWords.length : 0;
  const score = Math.round(similarity * 100);

  if (score >= 80) {
    return {
      score,
      feedback: 'Excellent! Your pronunciation is very clear.',
      pronunciation: 'Good clarity',
      grammar: 'Correct',
      suggestions: ['Keep up the great work!'],
    };
  } else if (score >= 50) {
    return {
      score,
      feedback: 'Good attempt! Some words need practice.',
      pronunciation: 'Needs improvement',
      grammar: 'Check word order',
      suggestions: ['Practice speaking slowly', 'Listen to native speakers'],
    };
  } else {
    return {
      score,
      feedback: "Keep trying! Practice makes perfect.",
      pronunciation: 'Needs work',
      grammar: 'Review the phrase',
      suggestions: ['Listen to the correct pronunciation first', 'Break the sentence into smaller parts'],
    };
  }
}

function getFallbackResponseEvaluation(response: string): EvaluationResult {
  const wordCount = response.split(/\s+/).length;
  const hasCapitalization = /^[A-Z]/.test(response);
  const hasPunctuation = /[.!?]$/.test(response);

  let score = 50;
  if (wordCount >= 10) score += 20;
  else if (wordCount >= 5) score += 10;
  if (hasCapitalization) score += 10;
  if (hasPunctuation) score += 10;

  return {
    score: Math.min(score, 100),
    feedback: wordCount >= 10 ? 'Good detailed response!' : 'Try adding more detail.',
    pronunciation: 'N/A',
    grammar: hasCapitalization && hasPunctuation ? 'Good formatting' : 'Check capitalization and punctuation',
    suggestions: [
      wordCount < 10 ? 'Expand your answer with more details' : 'Good length!',
      'Use varied vocabulary',
    ],
  };
}

export default {
  evaluateSpeech,
  evaluateResponse,
  generateSituationResponse,
};
