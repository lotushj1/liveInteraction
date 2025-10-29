import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, User } from 'lucide-react';
import { Question } from '@/hooks/useQuestions';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface QuestionListProps {
  questions: Question[];
  userUpvotes: string[];
  onUpvote: (questionId: string) => void;
  showActions?: boolean;
}

export const QuestionList = ({ questions, userUpvotes, onUpvote, showActions = true }: QuestionListProps) => {
  // 分類問題：未回答的和已回答的
  const unansweredQuestions = questions.filter(q => q.status !== 'answered');
  const answeredQuestions = questions.filter(q => q.status === 'answered');

  const renderQuestion = (question: Question) => {
    const hasUpvoted = userUpvotes.includes(question.id);
    const isAnswered = question.status === 'answered';

    return (
      <Card
        key={question.id}
        className={`transition-all ${
          isAnswered ? 'opacity-50 bg-muted/30' : 'hover:shadow-md'
        } ${question.is_highlighted ? 'ring-2 ring-primary' : ''}`}
      >
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* 投票按鈕 */}
            {showActions && (
              <div className="flex flex-col items-center gap-1">
                <Button
                  size="sm"
                  variant={hasUpvoted ? 'default' : 'outline'}
                  className="h-8 w-8 p-0"
                  onClick={() => onUpvote(question.id)}
                  disabled={isAnswered}
                >
                  <ThumbsUp className={`h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />
                </Button>
                <span className={`text-sm font-semibold ${hasUpvoted ? 'text-primary' : 'text-muted-foreground'}`}>
                  {question.upvote_count}
                </span>
              </div>
            )}

            {/* 問題內容 */}
            <div className="flex-1 space-y-2">
              <p className={`text-base ${isAnswered ? 'text-muted-foreground' : ''}`}>
                {question.content}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>匿名</span>
                <span>·</span>
                <span>{formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: zhTW })}</span>
                {isAnswered && (
                  <>
                    <span>·</span>
                    <span className="text-green-600 font-medium">已回答</span>
                  </>
                )}
              </div>
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
        <p className="text-sm mt-2">成為第一個提問的人吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 未回答的問題 */}
      {unansweredQuestions.map(renderQuestion)}

      {/* 已回答的問題（如果有的話，顯示在最下方） */}
      {answeredQuestions.length > 0 && (
        <>
          {unansweredQuestions.length > 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              ─── 已回答的問題 ───
            </div>
          )}
          {answeredQuestions.map(renderQuestion)}
        </>
      )}
    </div>
  );
};
