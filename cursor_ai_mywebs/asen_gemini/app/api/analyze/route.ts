import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response('Text is required', { status: 400 });
    }

    const { text: resultText } = await generateText({
      //model: google('gemini-1.5-pro-latest'),
      model: google('gemini-2.5-flash'),
      prompt: `다음 텍스트의 감성을 분석해서 JSON 형식으로 응답해줘.
      응답 형식: { "score": 0-100 사이의 숫자, "label": "긍정적인 감성" | "부정적인 감성" | "중립적인 감성", "reason": "분석 이유" }
      분석할 텍스트: "${text}"`,
    });

    // Extract JSON from the response if it's wrapped in code blocks
    const jsonMatch = resultText.match(/\{.*\}/s);
    const jsonString = jsonMatch ? jsonMatch[0] : resultText;

    return new Response(jsonString, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(JSON.stringify({ error: '분석 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
