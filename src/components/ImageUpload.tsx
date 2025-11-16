import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  bucket?: string;
  folder?: string;
  aspectRatio?: string;
  maxSize?: number; // MB
  className?: string;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket = 'event-images',
  folder = 'covers',
  aspectRatio = '16/9',
  maxSize = 5,
  className = '',
  label = '上傳圖片',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 檢查檔案大小
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: '檔案太大',
        description: `圖片大小不能超過 ${maxSize}MB`,
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
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // 上傳到 Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // 獲取公開 URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setPreviewUrl(publicUrl);
      onChange(publicUrl);

      toast({
        title: '上傳成功',
        description: '圖片已成功上傳',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: '上傳失敗',
        description: '請稍後再試',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!previewUrl) return;

    // 如果是 Supabase URL，嘗試刪除檔案
    if (previewUrl.includes('supabase')) {
      try {
        const urlParts = previewUrl.split('/');
        const fileName = urlParts.slice(-2).join('/'); // folder/filename
        await supabase.storage.from(bucket).remove([fileName]);
      } catch (error) {
        console.error('Error removing image:', error);
      }
    }

    setPreviewUrl(undefined);
    onChange(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative group">
          <div
            className="relative overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50"
            style={{ aspectRatio }}
          >
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-1" />
                更換
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-1" />
                移除
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 hover:border-primary/50 hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ aspectRatio }}
        >
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="text-sm">上傳中...</p>
              </>
            ) : (
              <>
                <ImageIcon className="w-10 h-10" />
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs">點擊上傳或拖曳圖片到此處</p>
                <p className="text-xs">最大 {maxSize}MB</p>
              </>
            )}
          </div>
        </button>
      )}
    </div>
  );
}
