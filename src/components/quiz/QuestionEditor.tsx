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
import { Trash2, Plus, AlertCircle } from 'lucide-react';

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
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<Array<{ id: number; text: string; isCorrect: boolean }>>([
    { id: 0, text: '', isCorrect: false },
    { id: 1, text: '', isCorrect: false },
  ]);
  const [timeLimit, setTimeLimit] = useState(30);
  const [points, setPoints] = useState(100);

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
    setQuestionText('');
    setOptions([
      { id: 0, text: '', isCorrect: false },
      { id: 1, text: '', isCorrect: false },
    ]);
    setTimeLimit(30);
    setPoints(100);
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
          <DialogTitle>{question?.id ? '編輯題目' : '新增題目'}</DialogTitle>
          <DialogDescription>
            填寫題目、選項、選擇正確答案，並設定時限與分數
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
        </div>

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
