import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmbedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  joinCode: string;
  eventTitle: string;
}

export function EmbedDialog({ open, onOpenChange, joinCode, eventTitle }: EmbedDialogProps) {
  const { toast } = useToast();
  const [width, setWidth] = useState('800');
  const [height, setHeight] = useState('600');
  const [copied, setCopied] = useState<'iframe' | 'url' | null>(null);

  const baseUrl = window.location.origin;
  const participantUrl = `${baseUrl}/join/${joinCode}`;

  const iframeCode = `<iframe
  src="${participantUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allowfullscreen
  title="${eventTitle}"
></iframe>`;

  const handleCopy = (type: 'iframe' | 'url', text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast({
      title: '已複製',
      description: type === 'iframe' ? '嵌入代碼已複製到剪貼簿' : '網址已複製到剪貼簿',
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleOpenUrl = () => {
    window.open(participantUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>嵌入活動到簡報</DialogTitle>
          <DialogDescription>
            將此活動嵌入到 PowerPoint、Google Slides 或任何支援 iframe 的平台中
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="iframe" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="iframe">嵌入代碼</TabsTrigger>
            <TabsTrigger value="url">直接連結</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">寬度 (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    min="300"
                    max="1920"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">高度 (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    min="200"
                    max="1080"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>嵌入代碼</Label>
                <div className="relative">
                  <Textarea
                    value={iframeCode}
                    readOnly
                    rows={7}
                    className="font-mono text-xs pr-12"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy('iframe', iframeCode)}
                  >
                    {copied === 'iframe' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  複製此代碼並貼到您的簡報或網頁中
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="text-sm font-semibold">使用說明：</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>PowerPoint：</strong>插入 → 視訊 → 線上視訊 → 從嵌入代碼</li>
                  <li><strong>Google Slides：</strong>插入 → 影片 → 依據網址</li>
                  <li><strong>網頁：</strong>直接貼上 HTML 代碼到您的網頁中</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>參與者連結</Label>
                <div className="flex gap-2">
                  <Input
                    value={participantUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy('url', participantUrl)}
                  >
                    {copied === 'url' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenUrl}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  分享此連結給參與者，或在瀏覽器中直接開啟
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="text-sm font-semibold">使用方式：</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>在簡報中加入超連結，引導參與者前往</li>
                  <li>使用 QR Code 產生器將連結轉換成 QR Code</li>
                  <li>直接在瀏覽器分頁中開啟，搭配簡報使用</li>
                  <li>透過通訊軟體（如 LINE、Teams）分享給參與者</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-1">小提示</h4>
                      <p className="text-xs text-muted-foreground">
                        加入碼：<span className="font-bold text-primary">{joinCode}</span><br />
                        參與者也可以直接在首頁輸入此加入碼來參與活動
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            關閉
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
