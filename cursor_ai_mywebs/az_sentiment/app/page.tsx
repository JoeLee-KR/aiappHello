"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisResult {
  score: number;
  sentiment: "긍정적인 감성" | "부정적인 감성" | "중립적인 감성";
  description: string;
}

// 간단한 감성 분석 시뮬레이션 함수
function analyzeSentiment(text: string): AnalysisResult {
  // 긍정/부정 키워드 기반 간단한 분석
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

  // 점수 계산 (0-100)
  const total = positiveCount + negativeCount;
  let score: number;

  if (total === 0) {
    score = 50; // 중립
  } else {
    score = Math.round((positiveCount / total) * 100);
  }

  // 감성 분류
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

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    // 분석 시뮬레이션 (실제 API 호출처럼 딜레이)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const analysisResult = analyzeSentiment(inputText);
    setResult(analysisResult);
    setIsAnalyzing(false);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "긍정적인 감성":
        return "text-emerald-500";
      case "부정적인 감성":
        return "text-rose-500";
      default:
        return "text-slate-500";
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 60) return "bg-emerald-500";
    if (score <= 40) return "bg-rose-500";
    return "bg-slate-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              AI 감성분석기
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              AI가 분석한 감성을 표시합니다.
            </p>
          </div>

          {/* 입력 카드 */}
          <Card className="mb-6 shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg">텍스트 입력</CardTitle>
              <CardDescription>
                분석하고 싶은 텍스트를 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full min-h-[120px] p-4 border border-input rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
                placeholder="여기에 감성을 분석할 텍스트를 입력하세요..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isAnalyzing}
                className="w-full h-11 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
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
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm animate-result-appear">
              <CardHeader>
                <CardTitle className="text-lg">분석 결과</CardTitle>
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
                    <span className="text-muted-foreground">감성 점수</span>
                    <span className="font-semibold text-lg">{result.score}점</span>
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBarColor(
                        result.score
                      )} transition-all duration-1000 ease-out rounded-full`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>부정적 (0)</span>
                    <span>중립 (50)</span>
                    <span>긍정적 (100)</span>
                  </div>
                </div>

                {/* 설명 */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg animate-fade-in-delay-3">
                  <p className="text-muted-foreground text-sm leading-relaxed">
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
