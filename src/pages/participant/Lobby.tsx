import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParticipantContext } from '@/contexts/ParticipantContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, Clock, LogOut } from 'lucide-react';
import { useParticipant } from '@/hooks/useParticipant';

const Lobby = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { event, participant, isLoading } = useParticipantContext();
  const { leaveEvent } = useParticipant();
  const [participantCount, setParticipantCount] = useState(0);

  // 如果沒有 event 或 participant，重定向到 join 頁面
  useEffect(() => {
    if (!isLoading && (!event || !participant)) {
      navigate('/join');
    }
  }, [event, participant, isLoading, navigate]);

  // 獲取參與者人數
  useEffect(() => {
    if (!eventId) return;

    const fetchParticipantCount = async () => {
      const { count } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);
      
      if (count !== null) setParticipantCount(count);
    };

    fetchParticipantCount();

    // 監聽參與者變化
    const channel = supabase
      .channel(`participants:${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'event_participants',
        filter: `event_id=eq.${eventId}`
      }, () => {
        fetchParticipantCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  // 監聽活動模式變化，自動導航
  useEffect(() => {
    if (!event) return;

    if (event.current_mode !== 'lobby') {
      navigate(`/participant/${eventId}/${event.current_mode}`);
    }
  }, [event, eventId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!event || !participant) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col p-4">
      {/* Header */}
      <header className="mb-8 flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground mt-1">歡迎，{participant.nickname}！</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={leaveEvent}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          離開
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto">
              {/* Pulse Animation */}
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="relative w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-16 h-16 text-primary animate-pulse" />
                </div>
              </div>
            </div>

            <div>
              <CardTitle className="text-2xl">等候室</CardTitle>
              <CardDescription className="text-base mt-2">
                等待主持人啟動互動...
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Event Description */}
            {event.description && (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">{event.description}</p>
              </div>
            )}

            {/* Participant Count */}
            <div className="flex items-center justify-center gap-3 p-6 bg-primary/5 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{participantCount}</p>
                <p className="text-sm text-muted-foreground mt-1">位參與者已加入</p>
              </div>
            </div>

            {/* Tips */}
            <div className="space-y-2 text-sm text-muted-foreground text-center">
              <p>💡 請保持此頁面開啟</p>
              <p>活動開始時會自動切換畫面</p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Join Code: <span className="font-mono font-bold text-foreground">{event.join_code}</span></p>
      </footer>
    </div>
  );
};

export default Lobby;
