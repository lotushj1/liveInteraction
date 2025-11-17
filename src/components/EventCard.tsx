import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Play, Square, Eye, Trash2, Edit, Copy, Check } from 'lucide-react';
import { Event } from '@/hooks/useEvents';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

interface EventCardProps {
  event: Event;
  onToggleActive: (id: string, isActive: boolean) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const EventCard = ({ event, onToggleActive, onView, onEdit, onDelete, onDuplicate }: EventCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(event.join_code);
      setCopied(true);
      toast.success('編號已複製到剪貼板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('複製失敗，請重試');
    }
  };

  return (
    <Card className="hover-scale shadow-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <Badge 
                variant={event.event_type === 'quiz' ? 'default' : 'outline'}
                className={event.event_type === 'quiz' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-0' 
                  : 'border-blue-500 text-blue-500'
                }
              >
                {event.event_type === 'quiz' ? '🎯 Quiz' : '💬 Q&A'}
              </Badge>
            </div>
            {event.description && (
              <CardDescription className="line-clamp-2">
                {event.description}
              </CardDescription>
            )}
          </div>
          <Badge
            variant={event.is_active ? "default" : "secondary"}
            className={event.is_active ? "ml-4" : "ml-4 text-muted-foreground"}
          >
            {event.is_active ? '進行中' : '未啟動'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>建立於 {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: zhTW })}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div
                className="glass px-3 py-1 rounded-lg border border-primary/30 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-2"
                onClick={handleCopyJoinCode}
                title="點擊複製編號"
              >
                <span className="text-xl font-bold text-primary tracking-wide">
                  {event.join_code}
                </span>
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-primary/60" />
                )}
              </div>
            </div>
            {event.qna_enabled && (
              <Badge variant="outline">Q&A 開啟</Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={event.is_active ? "destructive" : "default"}
          onClick={() => onToggleActive(event.id, !event.is_active)}
        >
          {event.is_active ? (
            <>
              <Square className="w-4 h-4 mr-1" />
              結束
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1" />
              啟動
            </>
          )}
        </Button>

        <Button size="sm" variant="outline" onClick={() => onView(event.id)}>
          <Eye className="w-4 h-4 mr-1" />
          查看
        </Button>

        <Button size="sm" variant="ghost" onClick={() => onEdit(event.id)}>
          <Edit className="w-4 h-4" />
        </Button>

        <Button size="sm" variant="ghost" onClick={() => onDuplicate(event.id)}>
          <Copy className="w-4 h-4" />
        </Button>

        <Button size="sm" variant="ghost" onClick={() => onDelete(event.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
