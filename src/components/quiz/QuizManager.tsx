import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { QuizEditor } from './QuizEditor';
import { useQuizzes, useCreateQuiz, useUpdateQuiz, useDeleteQuiz } from '@/hooks/useQuiz';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QuizManagerProps {
  eventId: string;
}

export function QuizManager({ eventId }: QuizManagerProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<{ id: string; title: string } | null>(null);

  const { data: quizzes = [], isLoading } = useQuizzes(eventId);
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  const deleteQuiz = useDeleteQuiz();

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

  const handleCreateQuiz = () => {
    if (!newQuizTitle.trim()) return;
    createQuiz.mutate(
      { eventId, title: newQuizTitle },
      {
        onSuccess: (data) => {
          setSelectedQuizId(data.id);
          setCreateDialogOpen(false);
          setNewQuizTitle('');
        },
      }
    );
  };

  const handleUpdateQuizTitle = (title: string) => {
    if (selectedQuizId) {
      updateQuiz.mutate({ id: selectedQuizId, title });
    }
  };

  const handleDeleteClick = (quiz: { id: string; title: string }) => {
    setQuizToDelete(quiz);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (quizToDelete) {
      deleteQuiz.mutate({ id: quizToDelete.id, eventId });
      if (selectedQuizId === quizToDelete.id) {
        setSelectedQuizId(null);
      }
    }
    setDeleteConfirmOpen(false);
    setQuizToDelete(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          載入中...
        </CardContent>
      </Card>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz 測驗管理</CardTitle>
          <CardDescription>建立測驗並設計題目</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">還沒有建立測驗</p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            建立第一個測驗
          </Button>
        </CardContent>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>建立新測驗</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-title">測驗名稱</Label>
                <Input
                  id="quiz-title"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  placeholder="例如：期中考測驗"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreateQuiz} disabled={!newQuizTitle.trim()}>
                建立
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quiz 測驗管理</CardTitle>
              <CardDescription>管理測驗和題目</CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新增測驗
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedQuizId || quizzes[0]?.id} onValueChange={setSelectedQuizId}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {quizzes.map((quiz) => (
            <TabsTrigger key={quiz.id} value={quiz.id} className="gap-2">
              {quiz.title}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(quiz);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </TabsTrigger>
          ))}
        </TabsList>

        {quizzes.map((quiz) => (
          <TabsContent key={quiz.id} value={quiz.id}>
            <QuizEditor quiz={quiz} onUpdateTitle={handleUpdateQuizTitle} />
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>建立新測驗</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-title">測驗名稱</Label>
              <Input
                id="quiz-title"
                value={newQuizTitle}
                onChange={(e) => setNewQuizTitle(e.target.value)}
                placeholder="例如：期中考測驗"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateQuiz} disabled={!newQuizTitle.trim()}>
              建立
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除測驗「{quizToDelete?.title}」嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作無法復原，測驗及其所有題目將永久刪除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>刪除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
