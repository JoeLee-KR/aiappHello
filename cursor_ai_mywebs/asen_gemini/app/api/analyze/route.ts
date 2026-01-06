import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ success: false, error: '분석할 텍스트가 필요합니다.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 입력값 길이 제한 (예: 2000자)
    if (text.length > 2000) {
      return new Response(JSON.stringify({ success: false, error: '텍스트가 너무 깁니다. 2000자 이하로 입력해주세요.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { object } = await generateObject({
      model: google('gemini-flash-latest'), // 항상 최신의 안정적인 Flash 모델을 사용하도록 변경
      schema: z.object({
        score: z.number().min(0).max(100).describe('0 to 100 sentiment score'),
        label: z.enum(['긍정적인 감성', '부정적인 감성', '중립적인 감성']).describe('Sentiment label'),
        reason: z.string().describe('Reason for the analysis in Korean'),
      }),
      prompt: `다음 텍스트의 감성을 분석해줘: "${text}"`,
    });

    return new Response(JSON.stringify({ success: true, data: object }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(JSON.stringify({ success: false, error: 'AI 서버와 통신 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
