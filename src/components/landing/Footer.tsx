import { useNavigate } from "react-router-dom";
import { Zap, Github, Twitter, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-primary">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LivePulse
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              一站式即時現場互動平台，讓您的活動更精彩、更有趣、更難忘。
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">產品</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  功能特色
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  價格方案
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  使用方式
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate('/join')}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  加入活動
                </button>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">關於</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  關於我們
                </button>
              </li>
              <li>
                <a
                  href="#blog"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  部落格
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  聯絡我們
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">法律條款</h3>
            <ul className="space-y-3 text-sm mb-6">
              <li>
                <button
                  onClick={() => navigate('/privacy')}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  隱私權政策
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/terms')}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  服務條款
                </button>
              </li>
            </ul>

            {/* Social Links */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">關注我們</h4>
              <div className="flex gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg glass border transition-colors hover:border-primary hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg glass border transition-colors hover:border-primary hover:text-primary"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="mailto:contact@livepulse.com"
                  className="flex h-9 w-9 items-center justify-center rounded-lg glass border transition-colors hover:border-primary hover:text-primary"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>© {currentYear} LivePulse. All rights reserved.</p>
          <div className="flex gap-6">
            <button
              onClick={() => navigate('/privacy')}
              className="transition-colors hover:text-primary"
            >
              隱私權
            </button>
            <button
              onClick={() => navigate('/terms')}
              className="transition-colors hover:text-primary"
            >
              條款
            </button>
            <button
              onClick={() => navigate('/privacy#cookies')}
              className="transition-colors hover:text-primary"
            >
              Cookie 設定
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
