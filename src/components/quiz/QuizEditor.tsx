import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Check, X, Sparkles, Film } from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import { QuestionEditor } from './QuestionEditor';
import { ContentSlideEditor } from './ContentSlideEditor';
import { AIQuestionGenerator } from './AIQuestionGenerator';
import {
  useQuizQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useContentSlides,
  useCreateContentSlide,
  useUpdateContentSlide,
  useDeleteContentSlide,
} from '@/hooks/useQuiz';
import { useMembership } from '@/contexts/MembershipContext';
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

interface QuizEditorProps {
  quiz: {
    id: string;
    title: string;
  };
  onUpdateTitle: (title: string) => void;
}

export function QuizEditor({ quiz, onUpdateTitle }: QuizEditorProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(quiz.title);
  const [editorOpen, setEditorOpen] = useState(false);
  const [slideEditorOpen, setSlideEditorOpen] = useState(false);
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);

  const { data: questions = [], isLoading } = useQuizQuestions(quiz.id);
  const { data: slides = [] } = useContentSlides(quiz.id);
  const { isPremium } = useMembership();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const createSlide = useCreateContentSlide();
  const updateSlide = useUpdateContentSlide();
  const deleteSlide = useDeleteContentSlide();

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== quiz.title) {
      onUpdateTitle(editedTitle);
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(quiz.title);
    setIsEditingTitle(false);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setEditorOpen(true);
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setEditorOpen(true);
  };

  const handleSaveQuestion = (questionData: any) => {
    if (editingQuestion) {
      updateQuestion.mutate({
        id: editingQuestion.id,
        ...questionData,
      });
    } else {
      createQuestion.mutate({
        quiz_id: quiz.id,
        question_order: questions.length,
        ...questionData,
      });
    }
  };

  const handleDeleteClick = (questionId: string) => {
    setQuestionToDelete(questionId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (questionToDelete) {
      deleteQuestion.mutate({ id: questionToDelete, quizId: quiz.id });
    }
    setDeleteConfirmOpen(false);
    setQuestionToDelete(null);
  };

  const handleAIGenerate = (generatedQuestions: any[]) => {
    // 批量新增 AI 生成的問題
    generatedQuestions.forEach((questionData, index) => {
      createQuestion.mutate({
        quiz_id: quiz.id,
        question_order: questions.length + index,
        ...questionData,
      });
    });
  };

  // Content Slide handlers
  const handleAddSlide = () => {
    setEditingSlide(null);
    setSlideEditorOpen(true);
  };

  const handleEditSlide = (slide: any) => {
    setEditingSlide(slide);
    setSlideEditorOpen(true);
  };

  const handleSaveSlide = (slideData: any) => {
    if (editingSlide) {
      updateSlide.mutate({
        id: editingSlide.id,
        ...slideData,
      });
    } else {
      createSlide.mutate({
        quiz_id: quiz.id,
        content_order: questions.length + slides.length,
        ...slideData,
      });
    }
  };

  const handleDeleteSlideClick = (slideId: string) => {
    setSlideToDelete(slideId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmSlideDelete = () => {
    if (slideToDelete) {
      deleteSlide.mutate({ id: slideToDelete, quizId: quiz.id });
    }
    setDeleteConfirmOpen(false);
    setSlideToDelete(null);
  };

  const totalItems = questions.length + slides.length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="max-w-md"
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={handleSaveTitle}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CardTitle>📝 {quiz.title}</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(true)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">載入中...</div>
          ) : totalItems === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">還沒有題目或內容</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={handleAddQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  新增第一題
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddSlide}
                  className="gap-2"
                >
                  <Film className="w-4 h-4" />
                  新增內容穿插
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAiGeneratorOpen(true)}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  AI 生成題目
                  {isPremium && <span className="text-xs text-yellow-600">✨</span>}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onEdit={() => handleEditQuestion(question)}
                    onDelete={() => handleDeleteClick(question.id)}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button onClick={handleAddQuestion} className="gap-2">
                  <Plus className="w-4 h-4" />
                  新增題目
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddSlide}
                  className="gap-2"
                >
                  <Film className="w-4 h-4" />
                  新增內容穿插
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAiGeneratorOpen(true)}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  AI 生成題目
                  {isPremium && <span className="text-xs text-yellow-600">✨</span>}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <QuestionEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        question={editingQuestion}
        onSave={handleSaveQuestion}
      />

      <ContentSlideEditor
        open={slideEditorOpen}
        onOpenChange={setSlideEditorOpen}
        slide={editingSlide}
        onSave={handleSaveSlide}
      />

      <AIQuestionGenerator
        open={aiGeneratorOpen}
        onOpenChange={setAiGeneratorOpen}
        onGenerate={handleAIGenerate}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {questionToDelete ? '確定要刪除這個題目嗎？' : '確定要刪除這個內容嗎？'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              此操作無法復原，{questionToDelete ? '題目' : '內容穿插'}將永久刪除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={questionToDelete ? handleConfirmDelete : handleConfirmSlideDelete}>
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
