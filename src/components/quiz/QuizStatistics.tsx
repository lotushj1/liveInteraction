import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuestionStats } from '@/hooks/useQuizStats';
import { Clock, Users, Target } from 'lucide-react';

interface QuizStatisticsProps {
  quizId: string;
  quizTitle: string;
}

export function QuizStatistics({ quizId, quizTitle }: QuizStatisticsProps) {
  const { data: questionStats = [], isLoading } = useQuestionStats(quizId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          載入統計中...
        </CardContent>
      </Card>
    );
  }

  if (questionStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 {quizTitle} - 題目統計</CardTitle>
          <CardDescription>尚無答題數據</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          還沒有參與者作答
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 {quizTitle} - 題目統計</CardTitle>
        <CardDescription>各題目的答題情況與正確率分析</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {questionStats.map((stat, index) => (
          <div key={stat.questionId} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-base leading-tight">
                {index + 1}. {stat.questionText}
              </h4>
              <Badge
                variant={stat.correctRate >= 70 ? 'default' : stat.correctRate >= 40 ? 'secondary' : 'destructive'}
              >
                {stat.correctRate}% 正確率
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">正確率</span>
                <span className="font-medium">
                  {stat.correctResponses} / {stat.totalResponses}
                </span>
              </div>
              <Progress value={stat.correctRate} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">作答人數</p>
                  <p className="font-medium">{stat.totalResponses}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">答對人數</p>
                  <p className="font-medium">{stat.correctResponses}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">平均時間</p>
                  <p className="font-medium">{stat.averageTime}秒</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
