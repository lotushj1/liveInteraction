import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvents';
import { useQuizzes, useCreateQuiz, useUpdateQuiz } from '@/hooks/useQuiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { QuizEditor } from '@/components/quiz/QuizEditor';
import { EmbedDialog } from '@/components/EmbedDialog';
import { ArrowLeft, Loader2, Calendar, Users, Copy, CheckCircle2, Code2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { event, isLoading } = useEvent(id!);
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuizzes(id!);
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);

  // Auto-create quiz for quiz-type events if none exists
  useEffect(() => {
    if (event?.event_type === 'quiz' && !quizzesLoading && quizzes.length === 0) {
      createQuiz.mutate({
        eventId: event.id,
        title: event.title,
      });
    }
  }, [event, quizzes, quizzesLoading]);

  const handleCopyJoinCode = () => {
    if (event?.join_code) {
      navigator.clipboard.writeText(event.join_code);
      setCopied(true);
      toast({
        title: "已複製加入碼",
        description: `加入碼 ${event.join_code} 已複製到剪貼簿`,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>找不到活動</CardTitle>
            <CardDescription>此活動不存在或已被刪除</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')}>返回儀表板</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回儀表板
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Event Info Card */}
        <Card className="mb-8 animate-fade-in shadow-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-3xl">{event.title}</CardTitle>
                  <Badge
                    variant={event.event_type === 'quiz' ? 'default' : 'outline'}
                    className={event.event_type === 'quiz'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-0'
                      : 'border-blue-500 text-blue-500'
                    }
                  >
                    {event.event_type === 'quiz' ? '🎯 Quiz' : '💬 Q&A'}
                  </Badge>
                  <Badge
                    variant={event.is_active ? "default" : "secondary"}
                    className={event.is_active ? "" : "text-muted-foreground"}
                  >
                    {event.is_active ? '進行中' : '未啟動'}
                  </Badge>
                </div>
                {event.description && (
                  <CardDescription className="text-base mt-2">
                    {event.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>建立於 {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: zhTW })}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground mr-2">加入碼：</span>
                  <div className="glass px-3 py-1 rounded-lg border border-primary/30">
                    <span className="text-xl font-bold text-primary tracking-wide">
                      {event.join_code}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyJoinCode}
                    className="ml-2"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {event.qna_enabled && (
                  <div className="col-span-full">
                    <Badge variant="outline">Q&A 功能已開啟</Badge>
                  </div>
                )}
              </div>

              {/* Embed Button */}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => setEmbedDialogOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Code2 className="w-4 h-4 mr-2" />
                  嵌入到簡報
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  取得嵌入代碼，將此活動嵌入到 PowerPoint、Google Slides 或任何簡報中
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Editor for Quiz Type Events */}
        {event.event_type === 'quiz' && quizzes[0] && (
          <div className="animate-fade-in">
            <QuizEditor
              quiz={quizzes[0]}
              onUpdateTitle={(title) => updateQuiz.mutate({ id: quizzes[0].id, title })}
            />
          </div>
        )}

        {event.event_type === 'quiz' && quizzesLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Q&A Type Event Info */}
        {event.event_type === 'qna' && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Q&A 互動問答</CardTitle>
              <CardDescription>
                參與者可以在活動進行時提問和對問題按讚
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                此活動已設定為 Q&A 模式。參與者可以使用加入碼 <span className="font-bold text-primary">{event.join_code}</span> 加入活動。
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Embed Dialog */}
      {event && (
        <EmbedDialog
          open={embedDialogOpen}
          onOpenChange={setEmbedDialogOpen}
          joinCode={event.join_code}
          eventTitle={event.title}
        />
      )}
    </div>
  );
}
