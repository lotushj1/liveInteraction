import { useParams, useNavigate } from 'react-router-dom';
import { useParticipantContext } from '@/contexts/ParticipantContext';
import { useQuestions } from '@/hooks/useQuestions';
import { AskQuestion } from '@/components/qna/AskQuestion';
import { QuestionList } from '@/components/qna/QuestionList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useParticipant } from '@/hooks/useParticipant';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const QnA = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { event, participant, isLoading } = useParticipantContext();
  const { leaveEvent } = useParticipant();

  const {
    questions,
    isLoading: questionsLoading,
    createQuestion,
    isCreating,
    upvote,
    userUpvotes,
  } = useQuestions(eventId || '');

  // 即時更新問題列表
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`questions:${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'questions',
        filter: `event_id=eq.${eventId}`
      }, () => {
        // 問題有變更時，重新獲取
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  // 監聽活動模式變化
  useEffect(() => {
    if (!event) return;

    if (event.current_mode === 'lobby') {
      navigate(`/participant/${eventId}/lobby`);
    }
  }, [event, eventId, navigate]);

  const handleSubmitQuestion = (content: string) => {
    if (!participant) return;
    createQuestion({ content, participantId: participant.id });
  };

  const handleUpvote = (questionId: string) => {
    if (!participant) return;
    upvote({ questionId, participantId: participant.id });
  };

  const handleLeave = async () => {
    await leaveEvent();
    navigate('/join');
  };

  if (isLoading || !event || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <p className="text-sm text-muted-foreground">Q&A 提問</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLeave}>
              <LogOut className="w-4 h-4 mr-2" />
              離開
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* 提問表單 */}
          <AskQuestion onSubmit={handleSubmitQuestion} isSubmitting={isCreating} />

          {/* 問題列表 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">所有問題</h2>
              <span className="text-sm text-muted-foreground">
                {questions.length} 個問題
              </span>
            </div>

            {questionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse-soft">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            ) : (
              <QuestionList
                questions={questions}
                userUpvotes={userUpvotes}
                onUpvote={handleUpvote}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QnA;
