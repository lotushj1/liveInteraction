import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JoinCodeDisplayProps {
  code: string;
}

export const JoinCodeDisplay = ({ code }: JoinCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "已複製！",
        description: "加入碼已複製到剪貼簿",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "複製失敗",
        description: "請手動複製加入碼",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass-card glow-border shadow-primary">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground font-medium">活動加入碼</p>
          <div className="glass inline-block px-8 py-4 rounded-xl border border-primary/30">
            <div className="text-6xl font-bold text-primary tracking-wider">
              {code}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="mt-4"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                已複製
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                複製代碼
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            參與者可以使用此代碼加入活動
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
