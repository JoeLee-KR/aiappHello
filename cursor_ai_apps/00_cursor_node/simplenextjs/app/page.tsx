'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 로그인 상태 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500">로딩중...</p>
      </div>
    );
  }

  // 로그인 상태
  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 dark:bg-black">
        <h1 className="text-4xl font-bold text-black dark:text-white">
          환영합니다, {user.email}님
        </h1>
        <Button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3"
        >
          로그아웃
        </Button>
      </div>
    );
  }

  // 비로그인 상태
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            nxclabs.com<br />서비스에 오신 것을 환영합니다
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            로그인하여 더 많은 기능을 이용해보세요.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Button
            onClick={() => router.push('/login')}
            className="h-12 w-full md:w-[158px]"
          >
            로그인
          </Button>
          <Button
            onClick={() => router.push('/login')}
            variant="outline"
            className="h-12 w-full md:w-[158px]"
          >
            회원가입
          </Button>
        </div>
      </main>
    </div>
  );
}
