import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const PRIMARY = 'gemini-3.8-flash';
const FALLBACKS = [
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-tts-preview',
  'gemini-3.1-flash-lite',
];

const TEXT_MODELS = [PRIMARY, ...FALLBACKS.filter(model => model !== 'gemini-3.1-flash-tts-preview')];

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const body = await request.json();
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const task = body.task === 'tts' ? 'tts' : 'text';

    if (!prompt) return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });

    const ai = new GoogleGenAI({ apiKey });
    const models = task === 'tts' ? ['gemini-3.1-flash-tts-preview'] : TEXT_MODELS;
    const errors: string[] = [];

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: task === 'text'
            ? { temperature: 0.4, maxOutputTokens: 900 }
            : { temperature: 0.4 },
        });

        const text = response.text?.trim();
        if (text) {
          return NextResponse.json({ ok: true, text, model, primary: model === PRIMARY, fallbackUsed: model !== PRIMARY });
        }
        errors.push(`${model}: empty response`);
      } catch (error) {
        errors.push(`${model}: ${error instanceof Error ? error.message : 'request failed'}`);
      }
    }

    return NextResponse.json({
      error: 'All configured Gemini models failed.',
      attempts: errors,
      configuredModels: { primary: PRIMARY, fallbacks: FALLBACKS },
    }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid request.' }, { status: 400 });
  }
}
