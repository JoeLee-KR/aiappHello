'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  // 로그인 처리
  const handleLogin = async () => {
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.nxc');
      return;
    }

    setIsLoading(true);
    console.log('로그인 시도 시작, 쿠키 확인 바랍니다. nxc');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      // 로그인 성공
      console.log('로그인 성공, 쿠키 확인 바람 nxc');
      router.push('/');
      router.refresh();
    } catch (err) {
      alert(`오류 발생: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 재설정 이메일 전송
  const handleResetPassword = async () => {
    if (!email) {
      alert('비밀번호를 재설정할 이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        alert(`비밀번호 재설정 실패: ${error.message}`);
        return;
      }

      alert('비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인해주세요.');
    } catch (err) {
      alert(`오류 발생: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 처리
  const handleSignUp = async () => {
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    // 비밀번호 최소 길이 체크 (Supabase 기본 요구사항)
    if (password.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(`회원가입 실패: ${error.message}`);
        return;
      }

      // 이미 존재하는 이메일인 경우 (identities가 빈 배열)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        const shouldResetPassword = confirm(
          '이미 가입된 이메일입니다.\n비밀번호를 잊으셨나요?\n\n확인을 누르면 비밀번호 재설정 이메일을 보내드립니다.'
        );
        
        if (shouldResetPassword) {
          await handleResetPassword();
        }
        return;
      }

      // 회원가입 성공
      alert('회원가입 성공! 이메일을 확인해주세요.');
      router.push('/');
    } catch (err) {
      alert(`오류 발생: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">로그인</CardTitle>
          <CardDescription>이메일과 비밀번호를 입력하세요 nxclabs.com</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일...</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호...</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '처리중...' : '로그인'}
            </Button>
            <Button
              onClick={handleSignUp}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? '처리중...' : '회원가입'}
            </Button>
            <button
              onClick={handleResetPassword}
              disabled={isLoading}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mt-2"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
