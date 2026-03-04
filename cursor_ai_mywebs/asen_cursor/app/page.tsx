"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// API 응답 타입 정의 (Python의 dataclass나 TypedDict와 유사)
interface AnalysisResult {
  score: number;
  result: "긍정적인 감성" | "부정적인 감성" | "중립적인 감성";
  explanation: string;
}

interface HistoryItem {
  id: string;
  text: string;
  timestamp: Date;
}

// 날짜/시간 포맷팅
function formatDateTime(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

// 텍스트 자르기 (30자)
function truncateText(text: string, maxLength: number = 30): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

const HISTORY_STORAGE_KEY = "sentiment-history";
const MAX_HISTORY_COUNT = 5;

// 기록 저장 함수를 컴포넌트 밖으로 이동시켜 불필요한 재생성을 방지합니다.
function saveHistory(newHistory: HistoryItem[]) {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
}

// 스타일링 관련 헬퍼 함수들을 컴포넌트 밖으로 이동시킵니다.
const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case "긍정적인 감성":
      return "text-emerald-600";
    case "부정적인 감성":
      return "text-rose-600";
    default:
      return "text-slate-600";
  }
};

const getScoreBarColor = (score: number) => {
  if (score >= 60) return "bg-emerald-500";
  if (score <= 40) return "bg-rose-500";
  return "bg-slate-500";
};

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null); // 에러 상태 추가
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // localStorage에서 기록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setHistory(parsed.map((item: { id: string; text: string; timestamp: string }) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      })));
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
      if (!inputText.trim()) return;

      setIsAnalyzing(true);
      setResult(null);
      setError(null);

      // 기록 추가 (최대 5개)
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        text: inputText.trim(),
        timestamp: new Date(),
      };
      const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_COUNT);
      setHistory(newHistory);
      saveHistory(newHistory);

      try {
        // API 호출 (Python requests.post와 유사)
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: inputText }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || '분석 요청 실패');
        }

        //const data = await response.json();
        if (!data?.success) {
          throw new Error(data?.error || "분석에 실패했습니다.");
        }
        //setResult(data);
        setResult(data.data as AnalysisResult);

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsAnalyzing(false);
      }
    }, [inputText, history]); // inputText와 history가 변경될 때만 함수를 재생성합니다.

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
              AI 감성분석기
            </h1>
            <p className="text-slate-600 text-base sm:text-lg">
              Gemini AI가 분석한 감성을 표시합니다.
            </p>
          </div>

          {/* 입력 카드 */}
          <Card className="mb-6 shadow-md border-slate-200 bg-white animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800">텍스트 입력</CardTitle>
              <CardDescription className="text-slate-500">
                분석하고 싶은 텍스트를 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 분석 기록 */}
              {history.length > 0 && (
                <div className="space-y-1 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-400 mb-2">최근 분석 기록</p>
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="text-xs text-slate-600 truncate hover:text-slate-900 cursor-pointer transition-colors"
                      onClick={() => setInputText(item.text)}
                      title={item.text}
                    >
                      <span className="text-slate-400 mr-2">{formatDateTime(item.timestamp)}</span>
                      {truncateText(item.text)}
                    </div>
                  ))}
                </div>
              )}

              <textarea
                className="w-full min-h-[120px] p-4 border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
                placeholder="여기에 감성을 분석할 텍스트를 입력하세요..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              {/* 에러 메시지 표시 */}
              {error && (
                <div className="p-3 text-sm text-rose-600 bg-rose-50 rounded-md border border-rose-100">
                  ⚠️ {error}
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isAnalyzing}
                className="w-full h-11 text-base font-medium bg-slate-900 hover:bg-slate-800 text-white border-0 transition-all duration-300"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI 분석 중...
                  </span>
                ) : (
                  "분석하기"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 결과 카드 */}
          {result && (
            <Card className="shadow-md border-slate-200 bg-white animate-result-appear">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">분석 결과</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 감성 분류 */}
                <div className="text-center animate-fade-in-delay-1">
                  <span
                    className={`text-2xl sm:text-3xl font-bold ${getSentimentColor(
                      result.result
                    )} transition-colors duration-500`}
                  >
                    {result.result}
                  </span>
                </div>

                {/* 점수 표시 */}
                <div className="space-y-3 animate-fade-in-delay-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">감성 점수</span>
                    <span className="font-semibold text-lg text-slate-800">{result.score}점</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBarColor(
                        result.score
                      )} transition-all duration-1000 ease-out rounded-full`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>부정적 (0)</span>
                    <span>중립 (50)</span>
                    <span>긍정적 (100)</span>
                  </div>
                </div>

                {/* 설명 */}
                <div className="p-4 bg-slate-50 rounded-lg animate-fade-in-delay-3">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
