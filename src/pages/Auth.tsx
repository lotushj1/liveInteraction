import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap } from 'lucide-react';
import { z } from 'zod';
const loginSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件').max(255),
  password: z.string().min(6, '密碼至少需要 6 個字元')
});
const signupSchema = loginSchema.extend({
  displayName: z.string().min(1, '請輸入您的名稱').max(100),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: '密碼不一致',
  path: ['confirmPassword']
});
export default function Auth() {
  const navigate = useNavigate();
  const {
    signIn,
    signUp,
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 如果已登入，重導向到儀表板
  if (user) {
    navigate('/dashboard', {
      replace: true
    });
    return null;
  }
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const validated = loginSchema.parse(loginForm);
      setIsLoading(true);
      const {
        error
      } = await signIn(validated.email, validated.password);
      if (error) {
        toast({
          title: "登入失敗",
          description: error.message === 'Invalid login credentials' ? '電子郵件或密碼錯誤' : error.message,
          variant: "destructive"
        });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach(error => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const validated = signupSchema.parse(signupForm);
      setIsLoading(true);
      const {
        error
      } = await signUp(validated.email, validated.password, validated.displayName);
      if (error) {
        toast({
          title: "註冊失敗",
          description: error.message === 'User already registered' ? '此電子郵件已被註冊' : error.message,
          variant: "destructive"
        });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach(error => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          
          <p className="text-muted-foreground">即時互動平台 - 主持人登入</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登入</TabsTrigger>
            <TabsTrigger value="signup">註冊</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>歡迎回來</CardTitle>
                <CardDescription>登入您的主持人帳號</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">電子郵件</Label>
                    <Input id="login-email" type="email" placeholder="your@email.com" value={loginForm.email} onChange={e => setLoginForm({
                    ...loginForm,
                    email: e.target.value
                  })} disabled={isLoading} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">密碼</Label>
                    <Input id="login-password" type="password" value={loginForm.password} onChange={e => setLoginForm({
                    ...loginForm,
                    password: e.target.value
                  })} disabled={isLoading} />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  
                  <Button type="submit" className="w-full" variant="gradient" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    登入
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>建立帳號</CardTitle>
                <CardDescription>註冊成為主持人，開始創建互動活動</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">顯示名稱</Label>
                    <Input id="signup-name" type="text" placeholder="您的名稱" value={signupForm.displayName} onChange={e => setSignupForm({
                    ...signupForm,
                    displayName: e.target.value
                  })} disabled={isLoading} />
                    {errors.displayName && <p className="text-sm text-destructive">{errors.displayName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">電子郵件</Label>
                    <Input id="signup-email" type="email" placeholder="your@email.com" value={signupForm.email} onChange={e => setSignupForm({
                    ...signupForm,
                    email: e.target.value
                  })} disabled={isLoading} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">密碼</Label>
                    <Input id="signup-password" type="password" placeholder="至少 6 個字元" value={signupForm.password} onChange={e => setSignupForm({
                    ...signupForm,
                    password: e.target.value
                  })} disabled={isLoading} />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">確認密碼</Label>
                    <Input id="signup-confirm" type="password" value={signupForm.confirmPassword} onChange={e => setSignupForm({
                    ...signupForm,
                    confirmPassword: e.target.value
                  })} disabled={isLoading} />
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>
                  
                  <Button type="submit" className="w-full" variant="gradient" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    註冊
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate('/')}>
            返回首頁
          </Button>
        </div>
      </div>
    </div>;
}