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

function cleanDecisionResponse(input: string) {
  const cleaned = input
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^\s*[-•]\s*/gm, '• ')
    .replace(/^\s*\d+[.)]\s*/gm, '• ')
    .replace(/\\([*_])/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const sections = ['Verdict', 'Evidence', 'Risk', 'Action'];
  let result = cleaned;
  for (const section of sections) {
    const re = new RegExp(`(?:^|\\n)\\s*${section}\\s*:?\\s*`, 'i');
    result = result.replace(re, `\n\n${section.toUpperCase()}: `);
  }

  return result.replace(/\n{2,}/g, '  |  ').replace(/\s+/g, ' ').trim();
}

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

    const finalPrompt = task === 'text'
      ? `${prompt}\n\nFormatting requirement: Return plain text only. Do not use Markdown, hashtags, bold markers, code fences, or backslash escapes. Use exactly these four section labels: Verdict, Evidence, Risk, Action. Keep each section concise and use short bullet points where useful.`
      : prompt;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: finalPrompt,
          config: task === 'text'
            ? { temperature: 0.4, maxOutputTokens: 900 }
            : { temperature: 0.4 },
        });

        const rawText = response.text?.trim();
        const text = rawText ? cleanDecisionResponse(rawText) : '';
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
