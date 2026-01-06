"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

interface AnalysisResult {
  score: number;
  label: string;
  reason: string;
}

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "분석 중 오류가 발생했습니다.");
      }

      setResult(resData.data);
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            AI 감성분석기
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            AI가 분석한 감성을 표시합니다.
          </p>
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">텍스트 입력</CardTitle>
            <CardDescription>분석하고 싶은 문장을 입력해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="여기에 텍스트를 입력하세요..."
              className="min-h-[150px] resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
            <Button
              className="w-full"
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  분석 중...
                </>
              ) : (
                "분석하기"
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">분석 결과</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">감성 상태</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{result.label}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">감성 점수</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{result.score} / 100</p>
                </div>
              </div>

              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                  style={{ width: `${result.score}%` }}
                ></div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">분석 이유</p>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {result.reason}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
