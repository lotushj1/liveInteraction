import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Pencil, Trash2, Clock, Award } from 'lucide-react';

interface QuestionCardProps {
  question: {
    id: string;
    question_text: string;
    options: Array<{ id: number; text: string; isCorrect: boolean }>;
    question_order: number;
    time_limit: number;
    points: number;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
  const correctAnswers = question.options
    .filter((opt) => opt.isCorrect)
    .map((opt) => String.fromCharCode(65 + opt.id))
    .join(', ');

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="cursor-grab active:cursor-grabbing mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-base leading-tight">
                {question.question_order + 1}. {question.question_text}
              </h4>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onDelete}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              {question.options.map((option) => (
                <div
                  key={option.id}
                  className={`text-sm px-2 py-1 rounded ${
                    option.isCorrect
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400 font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {String.fromCharCode(65 + option.id)}. {option.text}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {question.time_limit}秒
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Award className="w-3 h-3" />
                {question.points}分
              </Badge>
              <span className="text-muted-foreground">
                正確答案: {correctAnswers}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
