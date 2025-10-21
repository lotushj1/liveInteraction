import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/EventCard';
import { Plus, LogOut, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { events, isLoading, updateEvent, deleteEvent } = useEvents();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateEvent({
      id,
      updates: {
        is_active: isActive,
        started_at: isActive ? new Date().toISOString() : undefined,
        ended_at: !isActive ? new Date().toISOString() : undefined,
      },
    });
  };

  const handleDeleteClick = (id: string) => {
    setSelectedEventId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedEventId) {
      deleteEvent(selectedEventId);
      setDeleteDialogOpen(false);
      setSelectedEventId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 導覽列 */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                LivePulse
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">主持人</p>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 animate-fade-in">歡迎回來！</h1>
          <p className="text-muted-foreground animate-fade-in">管理您的互動活動</p>
        </div>

        {/* 建立新活動按鈕 */}
        <div className="mb-8 animate-fade-in">
          <Button
            size="lg"
            variant="hero"
            onClick={() => navigate('/dashboard/create-event')}
            className="w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            建立新活動
          </Button>
        </div>

        {/* 活動列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onToggleActive={handleToggleActive}
                onView={(id) => navigate(`/dashboard/events/${id}`)}
                onEdit={(id) => navigate(`/dashboard/events/${id}`)}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <h3 className="text-xl font-semibold mb-2">還沒有活動</h3>
            <p className="text-muted-foreground mb-6">
              建立您的第一個互動活動，開始與觀眾連結
            </p>
            <Button
              variant="gradient"
              onClick={() => navigate('/dashboard/create-event')}
            >
              <Plus className="w-4 h-4 mr-2" />
              建立第一個活動
            </Button>
          </div>
        )}
      </main>

      {/* 刪除確認對話框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除此活動？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作無法復原。活動的所有資料（包括參與者、問題、投票等）都將被永久刪除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
