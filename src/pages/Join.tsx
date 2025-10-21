import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParticipant } from '@/hooks/useParticipant';
import { ArrowLeft, Users } from 'lucide-react';

const Join = () => {
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  const [joinCode, setJoinCode] = useState('');
  const [nickname, setNickname] = useState('');
  const { joinEvent, isJoining } = useParticipant();
  const nicknameInputRef = useRef<HTMLInputElement>(null);

  // 自動填入 URL 參數中的活動代碼
  useEffect(() => {
    if (codeFromUrl && /^\d{6}$/.test(codeFromUrl)) {
      setJoinCode(codeFromUrl);
      // 代碼填入後，自動 focus 到暱稱輸入框
      setTimeout(() => {
        nicknameInputRef.current?.focus();
      }, 100);
    }
  }, [codeFromUrl]);

  const handleJoinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^0-9]/g, '').slice(0, 6);
    setJoinCode(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length === 6 && nickname.trim()) {
      joinEvent({ joinCode, nickname: nickname.trim() });
    }
  };

  const isValid = joinCode.length === 6 && nickname.trim().length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>返回首頁</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl">加入互動活動</CardTitle>
              <CardDescription className="text-base mt-2">
                輸入 6 位數 Join Code 即可參與
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Join Code Input */}
              <div className="space-y-2">
                <Label htmlFor="joinCode" className="text-base">活動代碼</Label>
                <Input
                  id="joinCode"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={joinCode}
                  onChange={handleJoinCodeChange}
                  className="text-center text-2xl font-bold tracking-widest h-14"
                  maxLength={6}
                  required
                />
                <p className="text-sm text-muted-foreground text-center">
                  {codeFromUrl && joinCode === codeFromUrl 
                    ? '✓ 活動代碼已自動帶入' 
                    : `${joinCode.length}/6 位數字`
                  }
                </p>
              </div>

              {/* Nickname Input */}
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-base">暱稱</Label>
                <Input
                  ref={nicknameInputRef}
                  id="nickname"
                  type="text"
                  placeholder="輸入你的暱稱"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="text-lg h-12"
                  maxLength={20}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  最少 2 個字，最多 20 個字
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full text-lg h-14"
                disabled={!isValid || isJoining}
              >
                {isJoining ? '加入中...' : '加入活動'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        <p>請向活動主持人索取 Join Code</p>
      </footer>
    </div>
  );
};

export default Join;
