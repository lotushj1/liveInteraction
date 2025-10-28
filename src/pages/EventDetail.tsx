import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Users, MessageSquare, HelpCircle, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events } = useEvents();

  const event = events?.find((e) => e.id === id);

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

        {/* 統計資訊 */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>活動統計</CardTitle>
            <CardDescription>目前活動的即時統計資訊</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">參與人數</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">提問數</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">測驗題目</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">活動時長</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              詳細統計功能開發中...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
