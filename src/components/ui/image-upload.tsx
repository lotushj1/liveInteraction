import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  bucket?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  bucket = 'quiz-images',
  maxSizeMB = 5
}: ImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 檢查檔案大小
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: '檔案太大',
        description: `圖片大小不能超過 ${maxSizeMB}MB`,
        variant: 'destructive',
      });
      return;
    }

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '檔案格式錯誤',
        description: '請上傳圖片檔案',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // 生成唯一檔名
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 上傳到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 取得公開 URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(data.publicUrl);

      toast({
        title: '上傳成功',
        description: '圖片已成功上傳',
      });
    } catch (error) {
      console.error('上傳失敗:', error);
      toast({
        title: '上傳失敗',
        description: error instanceof Error ? error.message : '未知錯誤',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onChange(imageUrl.trim());
      setImageUrl('');
      toast({
        title: '圖片已設定',
        description: '圖片 URL 已設定成功',
      });
    }
  };

  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden group">
          <img
            src={value}
            alt="上傳的圖片"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E圖片載入失敗%3C/text%3E%3C/svg%3E';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground truncate">{value}</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">
          <Upload className="w-4 h-4 mr-1" />
          上傳圖片
        </TabsTrigger>
        <TabsTrigger value="url">
          <LinkIcon className="w-4 h-4 mr-1" />
          貼上網址
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="space-y-2">
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="image-upload"
            disabled={isUploading}
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">上傳中...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  點擊選擇圖片或拖曳至此
                </p>
                <p className="text-xs text-muted-foreground">
                  支援 JPG、PNG、GIF（最大 {maxSizeMB}MB）
                </p>
              </div>
            )}
          </label>
        </div>
      </TabsContent>

      <TabsContent value="url" className="space-y-2">
        <div className="space-y-2">
          <Label htmlFor="image-url">圖片網址</Label>
          <div className="flex gap-2">
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUrlSubmit();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!imageUrl.trim()}
            >
              確定
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            貼上圖片的完整網址（包含 https://）
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
