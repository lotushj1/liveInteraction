import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, MessageSquare, BarChart3, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="container relative mx-auto px-4 py-20 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 glass px-4 py-2 text-sm text-primary animate-pulse-soft">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">零阻礙 · 極致輕量 · 即時互動</span>
            </div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-7xl">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LivePulse
              </span>
            </h1>
            
            <p className="mb-4 text-xl text-muted-foreground lg:text-2xl">
              一站式即時現場互動平台
            </p>
            
            <p className="mb-10 text-lg text-muted-foreground lg:text-xl">
              問答競賽 · 觀眾提問 · 即時投票
              <br />
              創造令人難忘的互動體驗
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="xl" className="group" onClick={() => navigate('/auth')}>
                立即開始
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="xl" onClick={() => navigate('/join')}>
                觀看示範
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-5xl">
              三大核心功能
            </h2>
            <p className="text-lg text-muted-foreground">
              讓現場活動充滿活力與參與感
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Quiz Feature */}
            <Card className="glass-card group relative overflow-hidden border-2 p-8 transition-all hover:border-yellow-500 hover:shadow-[0_10px_40px_-10px_rgb(234_179_8_/_0.4)]">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-yellow-500/10 blur-3xl transition-all group-hover:scale-150" />
              <div className="relative">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl glass border-2 border-yellow-500/50 text-yellow-500 shadow-[0_10px_40px_-10px_rgb(234_179_8_/_0.3)]">
                  <Zap className="h-8 w-8 fill-yellow-500" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">問答競賽</h3>
                <p className="text-muted-foreground">
                  即時問答、排行榜、計時答題，讓全場嗨起來！支援多種題型與即時統計。
                </p>
              </div>
            </Card>

            {/* Q&A Feature */}
            <Card className="glass-card group relative overflow-hidden border-2 p-8 transition-all hover:border-accent hover:shadow-accent">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-accent/10 blur-3xl transition-all group-hover:scale-150" />
              <div className="relative">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl glass border-2 border-accent/50 text-accent shadow-accent">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">觀眾提問</h3>
                <p className="text-muted-foreground">
                  匿名提問、按讚排序、審核機制，快速聚焦高熱度問題，讓互動更有質量。
                </p>
              </div>
            </Card>

            {/* Polls Feature */}
            <Card className="glass-card group relative overflow-hidden border-2 p-8 transition-all hover:border-success hover:shadow-card">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-success/10 blur-3xl transition-all group-hover:scale-150" />
              <div className="relative">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl glass border-2 border-success/50 text-success shadow-card">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">即時投票</h3>
                <p className="text-muted-foreground">
                  單選、多選、文字雲、評分，即時圖表展示投票結果，視覺化呈現全場意見。
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted/30 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-5xl">
              使用超簡單
            </h2>
            <p className="text-lg text-muted-foreground">
              三步驟開啟精彩互動
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full glass border-2 border-primary/50 text-2xl font-bold text-primary shadow-primary">
                1
              </div>
              <h3 className="mb-2 text-xl font-bold">建立活動</h3>
              <p className="text-muted-foreground">
                設定問答、Q&A 或投票內容
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full glass border-2 border-accent/50 text-2xl font-bold text-accent shadow-accent">
                2
              </div>
              <h3 className="mb-2 text-xl font-bold">觀眾加入</h3>
              <p className="text-muted-foreground">
                掃描 QR Code 立即參與
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full glass border-2 border-success/50 text-2xl font-bold text-success">
                3
              </div>
              <h3 className="mb-2 text-xl font-bold">即時互動</h3>
              <p className="text-muted-foreground">
                大螢幕展示，全場參與
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <Card className="glass-card glow-border relative overflow-hidden p-12 text-center shadow-primary lg:p-20 border-2 border-primary/30">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
            <div className="relative">
              <h2 className="mb-6 text-3xl font-bold text-primary lg:text-5xl">
                準備好創造難忘的互動體驗了嗎？
              </h2>
              <p className="mb-8 text-lg text-foreground lg:text-xl">
                立即開始使用 LivePulse，讓你的活動更精彩
              </p>
              <Button variant="default" size="xl" className="shadow-primary" onClick={() => navigate('/auth')}>
                免費開始使用
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
