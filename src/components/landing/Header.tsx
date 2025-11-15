import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-primary transition-transform group-hover:scale-105">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LivePulse
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            功能特色
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            使用方式
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            價格方案
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/join')}
            className="hidden sm:inline-flex"
          >
            加入活動
          </Button>
          <Button
            variant="gradient"
            onClick={() => navigate('/auth')}
          >
            登入 / 註冊
          </Button>
        </div>
      </div>
    </header>
  );
};
