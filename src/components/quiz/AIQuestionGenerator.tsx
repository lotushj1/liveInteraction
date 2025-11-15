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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, AlertCircle, Crown, FileText, Lightbulb } from 'lucide-react';
import { useMembership } from '@/contexts/MembershipContext';
import { useToast } from '@/hooks/use-toast';

interface QuestionData {
  question_text: string;
  options: Array<{ id: number; text: string; isCorrect: boolean }>;
  time_limit: number;
  points: number;
}

interface AIQuestionGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (questions: QuestionData[]) => void;
}

export function AIQuestionGenerator({ open, onOpenChange, onGenerate }: AIQuestionGeneratorProps) {
  const { isPremium } = useMembership();
  const { toast } = useToast();

  const [mode, setMode] = useState<'topic' | 'paste'>('topic');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(3);
  const [pastedText, setPastedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionData[]>([]);

  const handleGenerate = async () => {
    if (!isPremium) {
      toast({
        title: '需要升級會員',
        description: 'AI 生成問題功能僅限付費會員使用',
        variant: 'destructive',
      });
      return;
    }

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      toast({
        title: '設定錯誤',
        description: '請設定 VITE_ANTHROPIC_API_KEY 環境變數',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedQuestions([]);

    try {
      const prompt = mode === 'topic'
        ? `請生成 ${numQuestions} 道關於「${topic}」的測驗選擇題。

要求：
1. 每題要有 4 個選項（A, B, C, D）
2. 每題只有一個正確答案
3. 題目要有教育意義且適合互動測驗
4. 難度適中，不要太簡單也不要太難
5. 選項要清楚明確，避免模糊
6. 題目要用繁體中文

請以 JSON 格式回覆，格式如下：
{
  "questions": [
    {
      "question_text": "題目文字",
      "options": [
        {"text": "選項A", "isCorrect": false},
        {"text": "選項B", "isCorrect": true},
        {"text": "選項C", "isCorrect": false},
        {"text": "選項D", "isCorrect": false}
      ],
      "time_limit": 30,
      "points": 100
    }
  ]
}`
        : `請從以下文字中生成測驗選擇題：

${pastedText}

要求：
1. 根據文字內容生成 3-5 道選擇題
2. 每題要有 4 個選項（A, B, C, D）
3. 每題只有一個正確答案
4. 題目要基於文字內容，測試理解程度
5. 選項要清楚明確
6. 題目要用繁體中文

請以 JSON 格式回覆，格式如下：
{
  "questions": [
    {
      "question_text": "題目文字",
      "options": [
        {"text": "選項A", "isCorrect": false},
        {"text": "選項B", "isCorrect": true},
        {"text": "選項C", "isCorrect": false},
        {"text": "選項D", "isCorrect": false}
      ],
      "time_limit": 30,
      "points": 100
    }
  ]
}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API 請求失敗: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0].text;

      // 解析 JSON，支援 markdown code block 格式
      let jsonText = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonText);

      // 轉換格式
      const questions: QuestionData[] = parsed.questions.map((q: any) => ({
        question_text: q.question_text,
        options: q.options.map((opt: any, idx: number) => ({
          id: idx,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
        time_limit: q.time_limit || 30,
        points: q.points || 100,
      }));

      setGeneratedQuestions(questions);
      toast({
        title: '生成成功',
        description: `已生成 ${questions.length} 道題目`,
      });
    } catch (error) {
      console.error('生成問題失敗:', error);
      toast({
        title: '生成失敗',
        description: error instanceof Error ? error.message : '未知錯誤',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddQuestions = () => {
    onGenerate(generatedQuestions);
    onOpenChange(false);
    setGeneratedQuestions([]);
    setTopic('');
    setPastedText('');
  };

  const canGenerate = mode === 'topic'
    ? topic.trim().length > 0 && numQuestions > 0 && numQuestions <= 10
    : pastedText.trim().length > 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI 問題生成器
            {isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
          </DialogTitle>
          <DialogDescription>
            使用 AI 快速生成測驗問題，支援主題生成或文本解析
          </DialogDescription>
        </DialogHeader>

        {!isPremium && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <Crown className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              此功能為付費會員專屬功能。升級會員後即可使用 AI 自動生成測驗問題。
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'topic' | 'paste')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topic" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              主題生成
            </TabsTrigger>
            <TabsTrigger value="paste" className="gap-2">
              <FileText className="w-4 h-4" />
              文本解析
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">主題</Label>
              <Input
                id="topic"
                placeholder="例如：台灣歷史、程式設計、數學..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={!isPremium}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="num-questions">題目數量（1-10）</Label>
              <Input
                id="num-questions"
                type="number"
                min={1}
                max={10}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                disabled={!isPremium}
              />
            </div>
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pasted-text">貼上文字內容</Label>
              <Textarea
                id="pasted-text"
                placeholder="貼上您想要生成測驗的文字內容..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={8}
                disabled={!isPremium}
              />
              <p className="text-xs text-muted-foreground">
                AI 會根據您提供的文字內容，自動生成 3-5 道相關的測驗題目
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {generatedQuestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">生成的題目預覽：</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {generatedQuestions.map((q, idx) => (
                <Card key={idx}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">
                      Q{idx + 1}. {q.question_text}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-2 rounded ${
                            opt.isCorrect
                              ? 'bg-green-100 dark:bg-green-900 border border-green-300'
                              : 'bg-muted'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}. {opt.text}
                        </div>
                      ))}
                    </div>
                    <CardDescription className="text-xs mt-2">
                      ⏱️ {q.time_limit}秒 | 🏆 {q.points}分
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {generatedQuestions.length === 0 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating || !isPremium}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    生成題目
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedQuestions([]);
                  setTopic('');
                  setPastedText('');
                }}
              >
                重新生成
              </Button>
              <Button onClick={handleAddQuestions} className="gap-2">
                添加到測驗
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
