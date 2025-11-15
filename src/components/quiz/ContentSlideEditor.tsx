import { useState, useEffect } from 'react';
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
import { Slider } from '@/components/ui/slider';
import { ImageUpload } from '@/components/ui/image-upload';
import { AlertCircle, Film } from 'lucide-react';

interface ContentSlideData {
  title?: string;
  description?: string;
  image_url?: string;
  youtube_url?: string;
  duration: number;
}

interface ContentSlideEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide?: ContentSlideData & { id?: string };
  onSave: (slide: ContentSlideData) => void;
}

export function ContentSlideEditor({ open, onOpenChange, slide, onSave }: ContentSlideEditorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [duration, setDuration] = useState(10);

  useEffect(() => {
    if (slide) {
      setTitle(slide.title || '');
      setDescription(slide.description || '');
      setImageUrl(slide.image_url || '');
      setYoutubeUrl(slide.youtube_url || '');
      setDuration(slide.duration || 10);
    } else {
      resetForm();
    }
  }, [slide, open]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setYoutubeUrl('');
    setDuration(10);
  };

  const handleSave = () => {
    onSave({
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      image_url: imageUrl || undefined,
      youtube_url: youtubeUrl || undefined,
      duration,
    });

    resetForm();
    onOpenChange(false);
  };

  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const getYoutubeEmbedUrl = (url: string): string | null => {
    const videoId = extractYoutubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const hasContent = title.trim() || description.trim() || imageUrl || youtubeUrl;
  const embedUrl = youtubeUrl ? getYoutubeEmbedUrl(youtubeUrl) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {slide?.id ? '編輯內容穿插' : '新增內容穿插'}
          </DialogTitle>
          <DialogDescription>
            新增展示內容或串場卡片，可包含圖片或 YouTube 影片
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="slide-title">標題（選填）</Label>
            <Input
              id="slide-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="輸入標題..."
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slide-description">說明文字（選填）</Label>
            <Textarea
              id="slide-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="輸入說明或串場文字..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 字
            </p>
          </div>

          <div className="space-y-2">
            <Label>圖片（選填）</Label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              onRemove={() => setImageUrl('')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube 影片網址（選填）</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="youtube-url"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {youtubeUrl && !embedUrl && (
                  <p className="text-xs text-destructive mt-1">
                    無效的 YouTube 網址
                  </p>
                )}
              </div>
              {youtubeUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setYoutubeUrl('')}
                >
                  清除
                </Button>
              )}
            </div>
            {embedUrl && (
              <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={embedUrl}
                  title="YouTube 預覽"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              支援 YouTube、YouTube Shorts 連結
            </p>
          </div>

          <div className="space-y-2">
            <Label>⏱️ 顯示時長：{duration} 秒</Label>
            <Slider
              value={[duration]}
              onValueChange={([value]) => setDuration(value)}
              min={5}
              max={60}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              內容穿插在畫面上顯示的秒數
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!hasContent && (
            <div className="flex items-start gap-2 text-sm text-destructive w-full sm:mr-auto">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>請至少填寫標題、說明文字、圖片或 YouTube 影片</div>
            </div>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!hasContent}>
            儲存內容
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
