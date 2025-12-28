"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisResult {
  score: number;
  sentiment: "긍정적인 감성" | "부정적인 감성" | "중립적인 감성";
  description: string;
}

interface HistoryItem {
  id: string;
  text: string;
  timestamp: Date;
}

// 간단한 감성 분석 시뮬레이션 함수
function analyzeSentiment(text: string): AnalysisResult {
  const positiveWords = ["좋아", "행복", "사랑", "기쁨", "감사", "최고", "훌륭", "멋져", "좋은", "기뻐", "즐거", "만족", "성공", "희망", "축하", "대박", "완벽", "예쁘", "아름다", "따뜻"];
  const negativeWords = ["싫어", "슬픔", "화나", "짜증", "나쁜", "최악", "실망", "후회", "불안", "걱정", "힘들", "어려", "무서", "두려", "미움", "괴로", "아파", "지겨", "답답", "우울"];

  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) positiveCount++;
  });

  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) negativeCount++;
  });

  const total = positiveCount + negativeCount;
  let score: number;

  if (total === 0) {
    score = 50;
  } else {
    score = Math.round((positiveCount / total) * 100);
  }

  let sentiment: AnalysisResult["sentiment"];
  let description: string;

  if (score >= 60) {
    sentiment = "긍정적인 감성";
    description = "입력하신 텍스트에서 긍정적인 감정이 감지되었습니다.";
  } else if (score <= 40) {
    sentiment = "부정적인 감성";
    description = "입력하신 텍스트에서 부정적인 감정이 감지되었습니다.";
  } else {
    sentiment = "중립적인 감성";
    description = "입력하신 텍스트에서 특별한 감정 편향이 감지되지 않았습니다.";
  }

  return { score, sentiment, description };
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

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // localStorage에서 기록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("sentiment-history");
    if (saved) {
      const parsed = JSON.parse(saved);
      setHistory(parsed.map((item: { id: string; text: string; timestamp: string }) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      })));
    }
  }, []);

  // 기록 저장
  const saveHistory = (newHistory: HistoryItem[]) => {
    localStorage.setItem("sentiment-history", JSON.stringify(newHistory));
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    // 기록 추가 (최대 5개)
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date(),
    };
    const newHistory = [newItem, ...history].slice(0, 5);
    setHistory(newHistory);
    saveHistory(newHistory);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const analysisResult = analyzeSentiment(inputText);
    setResult(analysisResult);
    setIsAnalyzing(false);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "긍정적인 감성":
        return "text-emerald-400";
      case "부정적인 감성":
        return "text-rose-400";
      default:
        return "text-slate-400";
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 60) return "bg-emerald-500";
    if (score <= 40) return "bg-rose-500";
    return "bg-slate-500";
  };

  return (
    <div className="min-h-screen bg-[#0d0a1a]">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-200 mb-3">
              AI 감성분석기
            </h1>
            <p className="text-indigo-200/70 text-base sm:text-lg">
              AI가 분석한 감성을 표시합니다.
            </p>
          </div>

          {/* 입력 카드 */}
          <Card className="mb-6 shadow-xl border-0 bg-slate-800/60 backdrop-blur-sm animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg text-indigo-100">텍스트 입력</CardTitle>
              <CardDescription className="text-indigo-300/60">
                분석하고 싶은 텍스트를 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 분석 기록 */}
              {history.length > 0 && (
                <div className="space-y-1 mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <p className="text-xs text-indigo-300/50 mb-2">최근 분석 기록</p>
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="text-xs text-slate-400 truncate hover:text-indigo-300 cursor-pointer transition-colors"
                      onClick={() => setInputText(item.text)}
                      title={item.text}
                    >
                      <span className="text-indigo-400/60 mr-2">{formatDateTime(item.timestamp)}</span>
                      {truncateText(item.text)}
                    </div>
                  ))}
                </div>
              )}

              <textarea
                className="w-full min-h-[120px] p-4 border border-slate-600/50 rounded-lg bg-slate-900/50 text-slate-100 placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                placeholder="여기에 감성을 분석할 텍스트를 입력하세요..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isAnalyzing}
                className="w-full h-11 text-base font-medium bg-indigo-600 hover:bg-indigo-500 border-0 transition-all duration-300"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    분석 중...
                  </span>
                ) : (
                  "분석하기"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 결과 카드 */}
          {result && (
            <Card className="shadow-xl border-0 bg-slate-800/60 backdrop-blur-sm animate-result-appear">
              <CardHeader>
                <CardTitle className="text-lg text-indigo-100">분석 결과</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 감성 분류 */}
                <div className="text-center animate-fade-in-delay-1">
                  <span
                    className={`text-2xl sm:text-3xl font-bold ${getSentimentColor(
                      result.sentiment
                    )} transition-colors duration-500`}
                  >
                    {result.sentiment}
                  </span>
                </div>

                {/* 점수 표시 */}
                <div className="space-y-3 animate-fade-in-delay-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">감성 점수</span>
                    <span className="font-semibold text-lg text-indigo-100">{result.score}점</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBarColor(
                        result.score
                      )} transition-all duration-1000 ease-out rounded-full`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>부정적 (0)</span>
                    <span>중립 (50)</span>
                    <span>긍정적 (100)</span>
                  </div>
                </div>

                {/* 설명 */}
                <div className="p-4 bg-slate-900/50 rounded-lg animate-fade-in-delay-3">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {result.description}
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
