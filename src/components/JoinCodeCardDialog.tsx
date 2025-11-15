import { useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { useToast } from '@/hooks/use-toast';

interface JoinCodeCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  joinCode: string;
  eventTitle: string;
}

export function JoinCodeCardDialog({
  open,
  onOpenChange,
  joinCode,
  eventTitle,
}: JoinCodeCardDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const baseUrl = window.location.origin;
  const participantUrl = `${baseUrl}/join/${joinCode}`;

  useEffect(() => {
    if (open && canvasRef.current) {
      generateCard();
    }
  }, [open, joinCode, eventTitle]);

  const generateCard = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 設定 canvas 尺寸 (1920x1080 for HD presentation)
    const width = 1920;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // 背景漸層
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 白色圓角矩形背景
    const cardX = width * 0.1;
    const cardY = height * 0.15;
    const cardWidth = width * 0.8;
    const cardHeight = height * 0.7;
    const borderRadius = 40;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, borderRadius);
    ctx.fill();

    // 標題
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('掃描 QR Code 或輸入加入碼', width / 2, cardY + 120);

    // 活動標題
    ctx.fillStyle = '#4b5563';
    ctx.font = '60px sans-serif';
    const maxTitleWidth = cardWidth * 0.8;
    let fontSize = 60;
    ctx.font = `${fontSize}px sans-serif`;
    while (ctx.measureText(eventTitle).width > maxTitleWidth && fontSize > 30) {
      fontSize -= 2;
      ctx.font = `${fontSize}px sans-serif`;
    }
    ctx.fillText(eventTitle, width / 2, cardY + 210);

    // 分隔線
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cardX + 100, cardY + 270);
    ctx.lineTo(cardX + cardWidth - 100, cardY + 270);
    ctx.stroke();

    // 生成 QR Code
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(participantUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff',
        },
      });

      const qrImage = new Image();
      qrImage.src = qrCodeDataUrl;
      await new Promise((resolve) => {
        qrImage.onload = resolve;
      });

      // QR Code 位置（左側）
      const qrSize = 400;
      const qrX = cardX + cardWidth * 0.2 - qrSize / 2;
      const qrY = cardY + 350;
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // QR Code 說明
      ctx.fillStyle = '#6b7280';
      ctx.font = '40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('掃描加入', qrX + qrSize / 2, qrY + qrSize + 60);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }

    // 加入碼（右側）
    const codeX = cardX + cardWidth * 0.65;
    const codeY = cardY + 450;

    // 加入碼背景
    ctx.fillStyle = '#f3f4f6';
    ctx.beginPath();
    ctx.roundRect(codeX - 200, codeY - 100, 400, 220, 20);
    ctx.fill();

    // 加入碼標籤
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('加入碼', codeX, codeY - 40);

    // 加入碼數字
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 90px monospace';
    ctx.fillText(joinCode, codeX, codeY + 60);

    // 網址說明
    ctx.fillStyle = '#9ca3af';
    ctx.font = '35px sans-serif';
    ctx.fillText('或前往', codeX, codeY + 150);

    // 底部說明
    ctx.fillStyle = '#9ca3af';
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LivePulse 互動平台', width / 2, cardY + cardHeight - 50);

    // Logo/品牌標誌
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 45px sans-serif';
    ctx.fillText(`${baseUrl}/join`, width / 2, codeY + 200);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);
    try {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${eventTitle}-加入碼-${joinCode}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);

          toast({
            title: '下載成功',
            description: '加入碼圖片已下載',
          });
        }
        setIsGenerating(false);
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: '下載失敗',
        description: '請稍後再試',
        variant: 'destructive',
      });
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>下載加入碼圖片</DialogTitle>
          <DialogDescription>
            下載包含 QR Code 和加入碼的圖片，可直接插入簡報中使用
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <div className="border rounded-lg overflow-hidden shadow-lg">
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-w-3xl"
              style={{ display: 'block' }}
            />
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">使用說明：</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>圖片尺寸：1920 x 1080 (Full HD)，適合直接插入簡報</li>
            <li>參與者可以掃描 QR Code 快速加入活動</li>
            <li>也可以手動輸入 6 位數加入碼參與</li>
            <li>建議在簡報中使用全螢幕顯示此圖片</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                產生中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                下載圖片
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
