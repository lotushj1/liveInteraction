import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Users, Heart, Target, Rocket, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="gradient-hero relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl">
              關於 <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">LivePulse</span>
            </h1>
            <p className="text-xl text-muted-foreground lg:text-2xl">
              我們致力於打造最輕量、最直覺的即時互動平台
              <br />
              讓每個現場活動都充滿活力與參與感
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold lg:text-5xl">我們的使命</h2>
              <p className="text-lg text-muted-foreground">
                讓互動體驗變得簡單而強大
              </p>
            </div>

            <Card className="glass-card border-2 border-primary/20 p-8 lg:p-12">
              <CardContent className="space-y-6 p-0">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">願景</h3>
                    <p className="text-muted-foreground">
                      成為全球最受歡迎的即時互動平台，讓每個活動主持人都能輕鬆創造難忘的互動體驗。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">使命</h3>
                    <p className="text-muted-foreground">
                      透過創新技術降低互動門檻，讓演講者與觀眾之間的距離變得更近，創造真正有價值的交流。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">價值觀</h3>
                    <p className="text-muted-foreground">
                      用戶至上、持續創新、追求卓越、開放透明。我們相信好的產品應該簡單易用，而非複雜難懂。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-muted/30 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-5xl">為什麼選擇 LivePulse？</h2>
            <p className="text-lg text-muted-foreground">
              我們與其他平台的差異
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="glass-card group transition-all hover:shadow-primary">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Zap className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold">極致輕量</h3>
                <p className="text-muted-foreground">
                  無需下載 App，掃描 QR Code 即可參與。極簡設計，專注於核心功能。
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card group transition-all hover:shadow-primary">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold">使用者導向</h3>
                <p className="text-muted-foreground">
                  簡潔直覺的介面設計，讓主持人和參與者都能快速上手，專注於互動本身。
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card group transition-all hover:shadow-primary">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Award className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold">專業可靠</h3>
                <p className="text-muted-foreground">
                  即時同步技術確保零延遲，穩定的系統架構支援大規模活動。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold lg:text-5xl">我們的故事</h2>
            </div>

            <div className="space-y-8">
              <Card className="glass-card border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="mb-2 text-sm font-semibold text-primary">起點</div>
                  <p className="text-muted-foreground">
                    LivePulse 誕生於一個簡單的想法：讓現場活動的互動變得更簡單。我們觀察到許多主持人在使用現有工具時遇到的困難，決定打造一個真正好用的解決方案。
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-accent">
                <CardContent className="p-6">
                  <div className="mb-2 text-sm font-semibold text-accent">發展</div>
                  <p className="text-muted-foreground">
                    從第一個版本到現在，我們持續傾聽用戶的聲音，不斷優化產品。每一次更新都是為了讓互動體驗更加流暢、更加有趣。
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-success">
                <CardContent className="p-6">
                  <div className="mb-2 text-sm font-semibold text-success">未來</div>
                  <p className="text-muted-foreground">
                    我們正在開發更多創新功能，包括 AI 輔助問答、多語言即時翻譯、進階數據分析等。我們的目標是成為每個活動主持人的最佳夥伴。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/30 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <Card className="glass-card glow-border relative overflow-hidden border-2 border-primary/30 p-12 text-center shadow-primary lg:p-20">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
            <div className="relative">
              <h2 className="mb-6 text-3xl font-bold text-primary lg:text-5xl">
                加入我們，創造精彩互動
              </h2>
              <p className="mb-8 text-lg text-foreground lg:text-xl">
                立即開始使用 LivePulse，體驗前所未有的互動方式
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  variant="gradient"
                  size="xl"
                  className="shadow-primary"
                  onClick={() => navigate('/auth')}
                >
                  免費開始使用
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  onClick={() => navigate('/#pricing')}
                >
                  查看價格方案
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
