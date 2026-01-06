import { NextResponse } from 'next/server';

const XAI_API_KEY = process.env.NEXT_PUBLIC_XAI_API_KEY;

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!XAI_API_KEY) {
      // Return a fallback article if no API key
      return NextResponse.json({
        title: `Learning About ${topic}`,
        content: `This is a sample article about ${topic}. To generate custom articles, please configure your xAI API key. In the meantime, you can use the sample articles or paste your own text to practice reading.`,
      });
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [
          {
            role: 'system',
            content: `You are an English language teacher. Generate a short, simple English article (150-200 words) for Indonesian students learning English.

Rules:
- Use simple vocabulary and grammar
- Write about everyday topics
- Include common phrases and expressions
- Make it practical and useful for daily life
- Use present tense mostly, with some past tense
- Keep sentences short (8-15 words each)

Return ONLY a JSON object with this format:
{
  "title": "Article Title",
  "content": "Article content here..."
}`,
          },
          {
            role: 'user',
            content: `Write a simple English article about: ${topic}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Try to parse JSON from response
    try {
      const article = JSON.parse(content);
      return NextResponse.json(article);
    } catch {
      // If JSON parsing fails, extract content manually
      return NextResponse.json({
        title: `Learning About ${topic}`,
        content: content || `This article is about ${topic}.`,
      });
    }
  } catch (error) {
    console.error('Article generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate article' },
      { status: 500 }
    );
  }
}
