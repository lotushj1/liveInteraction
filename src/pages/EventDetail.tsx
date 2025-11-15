import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import { useQuestions } from '@/hooks/useQuestions';
import { useQuizStats } from '@/hooks/useQuizStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, MessageSquare, HelpCircle, Calendar, ExternalLink, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { HostQuestionList } from '@/components/qna/HostQuestionList';
import { QuizManager } from '@/components/quiz/QuizManager';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events } = useEvents();

  const event = events?.find((e) => e.id === id);

  // 只有在活動存在且是 Q&A 類型時才使用 useQuestions
  const {
    questions,
    updateQuestionStatus,
    updateQuestion,
    deleteQuestion,
  } = useQuestions(id || '');

  // 獲取 Quiz 統計資料
  const { data: quizStats } = useQuizStats(id || '');

  // 即時監聽問題變更
  useEffect(() => {
    if (!id || !event || event.event_type !== 'qna') return;

    const channel = supabase
      .channel(`questions:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: `event_id=eq.${id}`,
        },
        () => {
          // 當有變更時，React Query 會自動重新抓取
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, event]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">找不到活動</p>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回控制台
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 返回按鈕 */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回控制台
        </Button>

        {/* 活動標題卡片 */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <Badge variant={event.is_active ? 'default' : 'secondary'}>
                    {event.is_active ? '進行中' : '已結束'}
                  </Badge>
                </div>
                <CardDescription>{event.description || '無描述'}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 活動資訊 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    建立於 {format(new Date(event.created_at), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4" />
                  <span>類型：{event.event_type === 'qna' ? '問答' : '測驗'}</span>
                </div>
                {event.event_type === 'qna' && (
                  <div className="flex items-center gap-2 text-sm">
                    <HelpCircle className="h-4 w-4" />
                    <span>Q&A：{event.qna_enabled ? '已啟用' : '已停用'}</span>
                  </div>
                )}
              </div>

              {/* 參與代碼 */}
              <div className="space-y-2">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">參與代碼</p>
                  <p className="text-2xl font-bold font-mono tracking-wider text-primary">
                    {event.join_code}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* 操作按鈕 */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => window.open(`/display/${event.id}`, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                開啟展示畫面
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/join?code=${event.join_code}`)}
              >
                <Users className="mr-2 h-4 w-4" />
                測試參與者視角
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Q&A 問題管理 - 只在 Q&A 類型活動顯示 */}
        {event.event_type === 'qna' && event.qna_enabled && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Q&A 問題管理</CardTitle>
              <CardDescription>管理參與者提出的問題</CardDescription>
            </CardHeader>
            <CardContent>
              <HostQuestionList
                questions={questions || []}
                onMarkAnswered={(questionId) => {
                  updateQuestionStatus({ questionId, status: 'answered' });
                }}
                onToggleHighlight={(questionId, isHighlighted) => {
                  updateQuestion({ questionId, updates: { is_highlighted: isHighlighted } });
                }}
                onDelete={(questionId) => {
                  if (confirm('確定要刪除這個問題嗎？')) {
                    deleteQuestion(questionId);
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Quiz 測驗管理 - 只在 Quiz 類型活動顯示 */}
        {event.event_type === 'quiz' && (
          <QuizManager eventId={event.id} />
        )}

        {/* 統計資訊 */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>活動統計</CardTitle>
            <CardDescription>目前活動的即時統計資訊</CardDescription>
          </CardHeader>
          <CardContent>
            {event.event_type === 'qna' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">參與人數</p>
                  <p className="text-2xl font-bold">{quizStats?.participantCount || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">提問總數</p>
                  <p className="text-2xl font-bold">{questions?.length || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">已回答</p>
                  <p className="text-2xl font-bold">
                    {questions?.filter(q => q.status === 'answered').length || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">總投票數</p>
                  <p className="text-2xl font-bold">
                    {questions?.reduce((sum, q) => sum + (q.upvote_count || 0), 0) || 0}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">參與人數</p>
                  <p className="text-2xl font-bold">{quizStats?.participantCount || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">測驗題目</p>
                  <p className="text-2xl font-bold">{quizStats?.totalQuestions || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">答題次數</p>
                  <p className="text-2xl font-bold">{quizStats?.totalResponses || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">平均得分</p>
                  <p className="text-2xl font-bold">{quizStats?.averageScore || 0}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
