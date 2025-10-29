import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, Check, Trash2, Star } from 'lucide-react';
import { Question } from '@/hooks/useQuestions';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface HostQuestionListProps {
  questions: Question[];
  onMarkAnswered: (questionId: string) => void;
  onToggleHighlight: (questionId: string, isHighlighted: boolean) => void;
  onDelete: (questionId: string) => void;
}

export const HostQuestionList = ({
  questions,
  onMarkAnswered,
  onToggleHighlight,
  onDelete,
}: HostQuestionListProps) => {
  // 分類問題：未回答的和已回答的
  const unansweredQuestions = questions.filter(q => q.status !== 'answered');
  const answeredQuestions = questions.filter(q => q.status === 'answered');

  const renderQuestion = (question: Question) => {
    const isAnswered = question.status === 'answered';

    return (
      <Card
        key={question.id}
        className={`transition-all ${
          isAnswered ? 'opacity-50 bg-muted/30' : ''
        } ${question.is_highlighted ? 'ring-2 ring-primary shadow-primary' : ''}`}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* 問題內容 */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className={`text-base ${isAnswered ? 'text-muted-foreground line-through' : ''}`}>
                  {question.content}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="font-semibold">{question.upvote_count}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: zhTW })}</span>
                  {question.is_highlighted && (
                    <>
                      <span>·</span>
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        精選
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex items-center gap-2">
              {!isAnswered && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onMarkAnswered(question.id)}
                    className="gap-1"
                  >
                    <Check className="h-4 w-4" />
                    標記已回答
                  </Button>
                  <Button
                    size="sm"
                    variant={question.is_highlighted ? 'secondary' : 'outline'}
                    onClick={() => onToggleHighlight(question.id, !question.is_highlighted)}
                    className="gap-1"
                  >
                    <Star className={`h-4 w-4 ${question.is_highlighted ? 'fill-current text-yellow-500' : ''}`} />
                    {question.is_highlighted ? '取消精選' : '精選'}
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(question.id)}
                className="gap-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                刪除
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">還沒有問題</p>
        <p className="text-sm mt-2">等待參與者提問</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 未回答的問題 */}
      <div className="space-y-3">
        {unansweredQuestions.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">待回答問題</h3>
            <Badge variant="secondary">{unansweredQuestions.length} 個</Badge>
          </div>
        )}
        {unansweredQuestions.map(renderQuestion)}
      </div>

      {/* 已回答的問題 */}
      {answeredQuestions.length > 0 && (
        <div className="space-y-3 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-muted-foreground">已回答</h3>
            <Badge variant="outline">{answeredQuestions.length} 個</Badge>
          </div>
          {answeredQuestions.map(renderQuestion)}
        </div>
      )}
    </div>
  );
};
