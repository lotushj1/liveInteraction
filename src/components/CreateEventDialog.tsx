import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplateSelector } from '@/components/TemplateSelector';
import { QuizTemplate } from '@/data/templates';
import { Plus, Sparkles } from 'lucide-react';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateNew: () => void;
  onSelectTemplate: (template: QuizTemplate) => void;
}

export function CreateEventDialog({
  open,
  onOpenChange,
  onCreateNew,
  onSelectTemplate,
}: CreateEventDialogProps) {
  const [view, setView] = useState<'choice' | 'templates'>('choice');

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset to choice view when closing
      setTimeout(() => setView('choice'), 300);
    }
    onOpenChange(newOpen);
  };

  const handleTemplateSelect = (template: QuizTemplate) => {
    onSelectTemplate(template);
    handleOpenChange(false);
  };

  const handleCreateNew = () => {
    onCreateNew();
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={view === 'templates' ? 'max-w-6xl' : 'max-w-3xl'}>
        {view === 'choice' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">建立新活動</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* 左邊：從頭建立 */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary"
                onClick={handleCreateNew}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">從頭建立</CardTitle>
                  <CardDescription className="text-base">
                    完全自訂您的活動內容
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      自由設定活動標題和描述
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      選擇 Q&A 或 Quiz 模式
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      從零開始添加題目
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* 右邊：使用模版 */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary"
                onClick={() => setView('templates')}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">使用模版</CardTitle>
                  <CardDescription className="text-base">
                    從現成模版快速開始
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      6 種精選活動模版
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      每個模版包含 5 題完整內容
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      可預覽和修改模版內容
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">選擇活動模版</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <TemplateSelector
                onSelectTemplate={handleTemplateSelect}
                onSkip={handleCreateNew}
              />
            </div>

            <div className="flex justify-start pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setView('choice')}
              >
                返回選擇
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
