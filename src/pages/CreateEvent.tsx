import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { z } from 'zod';

const createEventSchema = z.object({
  title: z.string().min(1, '請輸入活動標題').max(100, '標題不能超過 100 字'),
  description: z.string().max(500, '描述不能超過 500 字').optional(),
  event_type: z.enum(['qna', 'quiz']),
  qna_enabled: z.boolean().optional(),
});

export default function CreateEvent() {
  const navigate = useNavigate();
  const { createEvent, isCreating } = useEvents();
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'qna' as 'qna' | 'quiz',
    qna_enabled: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = createEventSchema.parse(form);
      createEvent({
        title: validated.title,
        description: validated.description,
        event_type: validated.event_type,
        qna_enabled: validated.event_type === 'qna' ? validated.qna_enabled : false,
      }, {
        onSuccess: () => {
          navigate('/dashboard');
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回儀表板
        </Button>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">建立新活動</h1>
          <p className="text-muted-foreground">設定您的互動活動資訊</p>
        </div>

        <Card className="animate-fade-in shadow-card">
          <CardHeader>
            <CardTitle>活動資訊</CardTitle>
            <CardDescription>
              輸入活動的基本資訊。建立後系統會自動生成 6 位數的加入碼。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label>活動類型 *</Label>
                <RadioGroup
                  value={form.event_type}
                  onValueChange={(value) => setForm({ ...form, event_type: value as 'qna' | 'quiz' })}
                  disabled={isCreating}
                >
                  <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="qna" id="type-qna" />
                    <Label htmlFor="type-qna" className="flex-1 cursor-pointer">
                      <div className="font-medium">Q&A 互動問答</div>
                      <p className="text-sm text-muted-foreground">參與者可以提問和對問題按讚</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="quiz" id="type-quiz" />
                    <Label htmlFor="type-quiz" className="flex-1 cursor-pointer">
                      <div className="font-medium">Quiz 競賽問答</div>
                      <p className="text-sm text-muted-foreground">類似 Kahoot 的即時競賽問答</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">活動標題 *</Label>
                <Input
                  id="title"
                  placeholder="例如：年會互動問答"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  disabled={isCreating}
                  maxLength={100}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {form.title.length}/100 字
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">活動描述（選填）</Label>
                <Textarea
                  id="description"
                  placeholder="簡短描述這個活動的目的或主題..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  disabled={isCreating}
                  maxLength={500}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {form.description.length}/500 字
                </p>
              </div>

              {form.event_type === 'qna' && (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="qna-enabled" className="text-base">
                      啟用 Q&A 功能
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      允許參與者提問和對問題按讚
                    </p>
                  </div>
                  <Switch
                    id="qna-enabled"
                    checked={form.qna_enabled}
                    onCheckedChange={(checked) => setForm({ ...form, qna_enabled: checked })}
                    disabled={isCreating}
                  />
                </div>
              )}

              {form.event_type === 'quiz' && (
                <div className="space-y-4 rounded-lg border p-4 bg-accent/20">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Quiz 活動設定</h4>
                    <p className="text-xs text-muted-foreground">
                      建立活動後，您可以在活動詳情頁面新增測驗題目
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isCreating}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  建立活動
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
