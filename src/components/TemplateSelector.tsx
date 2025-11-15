import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { templates, QuizTemplate, templateCategories } from '@/data/templates';
import { ChevronRight, Eye } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (template: QuizTemplate) => void;
  onSkip: () => void;
}

export function TemplateSelector({ onSelectTemplate, onSkip }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<QuizTemplate | null>(null);

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">選擇活動模版</h2>
        <p className="text-muted-foreground">
          使用現成模版快速建立活動，或從頭開始自訂
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          全部
        </Button>
        {templateCategories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="text-4xl mb-2">{template.icon}</div>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <CardTitle className="text-lg">{template.title}</CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <span>📝 {template.questions.length} 道題目</span>
                {template.qna_enabled && <span>💬 Q&A</span>}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  預覽
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => onSelectTemplate(template)}
                >
                  使用
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skip Button */}
      <div className="text-center pt-4">
        <Button variant="ghost" onClick={onSkip}>
          跳過，從頭開始建立
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {previewTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{previewTemplate.icon}</span>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{previewTemplate.title}</DialogTitle>
                    <DialogDescription className="text-base mt-1">
                      {previewTemplate.description}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{previewTemplate.category}</Badge>
                  <Badge variant="outline">
                    {previewTemplate.event_type === 'quiz' ? '🎯 Quiz' : '💬 Q&A'}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <h3 className="font-semibold">題目預覽：</h3>
                {previewTemplate.questions.map((question, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Q{idx + 1}. {question.question_text}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {question.options.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-lg text-sm ${
                              option.isCorrect
                                ? 'bg-green-100 dark:bg-green-900 border-2 border-green-500'
                                : 'bg-muted'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {option.text}
                            {option.isCorrect && ' ✓'}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>⏱️ {question.time_limit}秒</span>
                        <span>🏆 {question.points}分</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPreviewTemplate(null)}
                >
                  關閉
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => {
                    onSelectTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                >
                  使用此模版
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
