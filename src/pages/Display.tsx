import { useParams } from 'react-router-dom';
import { useDisplayData } from '@/hooks/useDisplayData';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Loader2, Users, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export default function Display() {
  const { id } = useParams<{ id: string }>();
  const { event, participants, isLoading } = useDisplayData(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
          <p className="text-xl text-muted-foreground">載入中...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">找不到活動</h2>
          <p className="text-muted-foreground">請確認活動連結是否正確</p>
        </div>
      </div>
    );
  }

  // 根據活動模式渲染不同的內容
  const renderContent = () => {
    switch (event.current_mode) {
      case 'lobby':
        return <LobbyContent event={event} participants={participants} />;
      case 'qna':
        return <div className="text-center text-4xl font-bold">Q&A 模式</div>;
      case 'poll':
        return <div className="text-center text-4xl font-bold">投票模式</div>;
      case 'quiz':
        return <div className="text-center text-4xl font-bold">問答模式</div>;
      default:
        return <div className="text-center text-4xl font-bold">等候中...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* 頂部資訊欄 */}
      <div className="glass-header border-b border-border/50">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDistanceToNow(new Date(), { addSuffix: true, locale: zhTW })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{participants.length} 位參與者</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant={event.is_active ? "default" : "secondary"}
                className="text-lg px-6 py-3"
              >
                {event.is_active ? '進行中' : '等候中'}
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區 */}
      <div className="container mx-auto px-8 py-12">
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// Lobby 內容組件
function LobbyContent({ event, participants }: { event: any; participants: any[] }) {
  return (
    <div className="space-y-12">
      {/* 歡迎標題 */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full glass border-2 border-primary/50 animate-pulse">
          <Users className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-5xl font-bold">歡迎參加</h2>
        <p className="text-2xl text-muted-foreground">
          正在等候主持人啟動活動...
        </p>
      </div>

      {/* 參與者統計 */}
      <div className="max-w-md mx-auto">
        <div className="glass-card rounded-2xl p-8 border-2 border-primary/30 shadow-primary text-center">
          <p className="text-lg text-muted-foreground mb-2">目前參與人數</p>
          <p className="text-7xl font-bold text-primary">{participants.length}</p>
        </div>
      </div>

      {/* 參與者網格（簡化版） */}
      {participants.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {participants.slice(0, 20).map((participant) => (
              <div
                key={participant.id}
                className="glass rounded-lg p-4 border border-primary/20 text-center hover:shadow-primary transition-all"
              >
                <div className="w-12 h-12 rounded-full glass border border-primary/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold text-primary">
                    {participant.nickname.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">{participant.nickname}</p>
              </div>
            ))}
          </div>
          {participants.length > 20 && (
            <p className="text-center text-muted-foreground mt-4">
              還有 {participants.length - 20} 位參與者...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
