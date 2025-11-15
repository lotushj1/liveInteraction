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
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, AlertCircle, Sparkles, Loader2, Crown } from 'lucide-react';
import { useMembership } from '@/contexts/MembershipContext';
import { useToast } from '@/hooks/use-toast';

interface QuestionData {
  question_text: string;
  options: Array<{ id: number; text: string; isCorrect: boolean }>;
  time_limit: number;
  points: number;
}

interface QuestionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: QuestionData & { id?: string };
  onSave: (question: QuestionData) => void;
}

export function QuestionEditor({ open, onOpenChange, question, onSave }: QuestionEditorProps) {
  const { isPremium } = useMembership();
  const { toast } = useToast();

  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<Array<{ id: number; text: string; isCorrect: boolean }>>([
    { id: 0, text: '', isCorrect: false },
    { id: 1, text: '', isCorrect: false },
  ]);
  const [timeLimit, setTimeLimit] = useState(30);
  const [points, setPoints] = useState(100);

  // AI 生成相關狀態
  const [aiTopic, setAiTopic] = useState('');
  const [aiContext, setAiContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text);
      setOptions(question.options);
      setTimeLimit(question.time_limit);
      setPoints(question.points);
    } else {
      resetForm();
    }
  }, [question, open]);

  const resetForm = () => {
    setMode('manual');
    setQuestionText('');
    setOptions([
      { id: 0, text: '', isCorrect: false },
      { id: 1, text: '', isCorrect: false },
    ]);
    setTimeLimit(30);
    setPoints(100);
    setAiTopic('');
    setAiContext('');
  };

  const handleAddOption = () => {
    setOptions([...options, { id: options.length, text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (id: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((opt) => opt.id !== id).map((opt, idx) => ({ ...opt, id: idx })));
  };

  const handleOptionChange = (id: number, text: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  };

  const handleToggleCorrect = (id: number) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt)));
  };

  const handleAIGenerate = async () => {
    if (!isPremium) {
      toast({
        title: '需要升級會員',
        description: 'AI 生成功能僅限付費會員使用',
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

    if (!aiTopic.trim() && !aiContext.trim()) {
      toast({
        title: '請輸入內容',
        description: '請輸入題目主題或相關內容',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = aiContext.trim()
        ? `請根據以下內容生成 1 道選擇題測驗：

${aiContext}

要求：
1. 要有 4 個選項（A, B, C, D）
2. 只有一個正確答案
3. 題目要基於內容，測試理解程度
4. 選項要清楚明確
5. 題目要用繁體中文

請以 JSON 格式回覆：
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
}`
        : `請生成 1 道關於「${aiTopic}」的選擇題測驗。

要求：
1. 要有 4 個選項（A, B, C, D）
2. 只有一個正確答案
3. 題目要有教育意義
4. 難度適中
5. 選項要清楚明確
6. 題目要用繁體中文

請以 JSON 格式回覆：
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
          max_tokens: 2048,
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

      // 解析 JSON
      let jsonText = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonText);

      // 填入表單
      setQuestionText(parsed.question_text);
      setOptions(
        parsed.options.map((opt: any, idx: number) => ({
          id: idx,
          text: opt.text,
          isCorrect: opt.isCorrect,
        }))
      );
      setTimeLimit(parsed.time_limit || 30);
      setPoints(parsed.points || 100);

      // 切換到手動模式以便查看和修改
      setMode('manual');

      toast({
        title: '生成成功',
        description: '已自動填入題目內容，請檢查並視需要調整',
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

  const handleSave = () => {
    if (!questionText.trim()) return;
    if (options.some((opt) => !opt.text.trim())) return;
    if (!options.some((opt) => opt.isCorrect)) return;

    onSave({
      question_text: questionText,
      options,
      time_limit: timeLimit,
      points,
    });

    resetForm();
    onOpenChange(false);
  };

  const isValid =
    questionText.trim() &&
    options.every((opt) => opt.text.trim()) &&
    options.some((opt) => opt.isCorrect);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {question?.id ? '編輯題目' : '新增題目'}
            {isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
          </DialogTitle>
          <DialogDescription>
            填寫題目、選項、選擇正確答案，並設定時限與分數
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'manual' | 'ai')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">手動輸入</TabsTrigger>
            <TabsTrigger value="ai" disabled={!isPremium}>
              <Sparkles className="w-4 h-4 mr-1" />
              AI 建立
              {!isPremium && <span className="ml-1 text-xs">👑</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-topic">主題（擇一填寫）</Label>
                <Input
                  id="ai-topic"
                  placeholder="例如：台灣歷史、JavaScript 基礎..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  disabled={isGenerating || !!aiContext.trim()}
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">或</div>

              <div className="space-y-2">
                <Label htmlFor="ai-context">貼上內容</Label>
                <Textarea
                  id="ai-context"
                  placeholder="貼上想要出題的文字內容..."
                  value={aiContext}
                  onChange={(e) => setAiContext(e.target.value)}
                  rows={6}
                  disabled={isGenerating || !!aiTopic.trim()}
                />
                <p className="text-xs text-muted-foreground">
                  AI 會根據您提供的內容生成相關測驗題目
                </p>
              </div>

              <Button
                onClick={handleAIGenerate}
                disabled={isGenerating || (!aiTopic.trim() && !aiContext.trim())}
                className="w-full gap-2"
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
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="question-text">題目</Label>
            <Input
              id="question-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="輸入題目內容..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                選項 <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                disabled={options.length >= 6}
              >
                <Plus className="w-4 h-4 mr-1" />
                新增選項
              </Button>
            </div>

            <div className="space-y-2">
              {options.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={option.isCorrect}
                    onCheckedChange={() => handleToggleCorrect(option.id)}
                    className="shrink-0"
                  />
                  <span className="text-sm font-medium w-6 shrink-0">
                    {String.fromCharCode(65 + option.id)}.
                  </span>
                  <Input
                    value={option.text}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    placeholder={`選項 ${String.fromCharCode(65 + option.id)}`}
                    className={`flex-1 ${!option.text.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOption(option.id)}
                    disabled={options.length <= 2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              勾選方框標記正確答案（至少選擇一個）
            </p>
          </div>

          <div className="space-y-2">
            <Label>⏱️ 答題時限：{timeLimit} 秒</Label>
            <Slider
              value={[timeLimit]}
              onValueChange={([value]) => setTimeLimit(value)}
              min={10}
              max={120}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">🏆 題目分數</Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(Math.max(50, Math.min(1000, Number(e.target.value))))}
              min={50}
              max={1000}
              step={10}
            />
          </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!isValid && (
            <div className="flex items-start gap-2 text-sm text-destructive w-full sm:mr-auto">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="space-y-1">
                {!questionText.trim() && <div>• 請填寫題目文字</div>}
                {!options.every(opt => opt.text.trim()) && <div>• 請填寫所有選項內容</div>}
                {!options.some(opt => opt.isCorrect) && <div>• 請勾選至少一個正確答案</div>}
              </div>
            </div>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            儲存題目
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
