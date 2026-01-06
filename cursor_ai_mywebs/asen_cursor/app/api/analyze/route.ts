import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// POST 요청 처리 (Python Flask의 @app.route('/', methods=['POST'])와 유사)
export async function POST(req: Request) {
  try {
    // 요청 바디에서 데이터 추출 (request.json()과 유사)
    const { text } = await req.json();

    // 입력값 검증: 길이 제한 등
    if (!text || typeof text !== 'string') {
        return Response.json({ success: false, error: '입력 텍스트가 필요합니다.' }, { status: 400 });
    }
    if (text.length > 1000) { // 임의의 길이 제한 설정 (요구사항 반영)
        return Response.json({ success: false, error: '입력 텍스트가 너무 깁니다. (1000자 이내)' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        // API 키 문제는 서버 측 문제이므로 500 상태 코드를 사용합니다.
        return Response.json({ success: false, error: '서버에 API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    // AI SDK를 사용하여 Gemini 모델 호출
    // generateObject는 AI가 JSON 형태로 답하도록 강제합니다. (Structured Output)
    const { object } = await generateObject({
      model: google('gemini-flash-latest'), // 요구사항의 flash 모델 사용
      schema: z.object({
        score: z.number().min(0).max(100).describe('0-100 사이의 감성 점수 (100: 긍정, 0: 부정)'),
        result: z.enum(['긍정적인 감성', '부정적인 감성', '중립적인 감성']).describe('감성 분석 결과 레이블'),
        explanation: z.string().describe('분석 결과에 대한 간단한 한글 설명'),
      }),
      prompt: `다음 텍스트의 감성을 분석해주세요: "${text}"`,
    });

    // 결과 반환 (jsonify와 유사)
    return Response.json({ success: true, data: object });

  } catch (error) {
    console.error('Analysis Error:', error);
    return Response.json({ success: false, error: 'AI 분석 중 서버에서 오류가 발생했습니다.' }, { status: 500 });
  }
}
