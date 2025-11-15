import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Quiz {
  id: string;
  event_id: string;
  title: string;
  is_active: boolean;
  current_question_index: number;
  created_at: string;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: Array<{
    id: number;
    text: string;
    isCorrect: boolean;
  }>;
  question_order: number;
  time_limit: number;
  points: number;
  image_url?: string;
  created_at: string;
}

interface ContentSlide {
  id: string;
  quiz_id: string;
  content_order: number;
  title?: string;
  description?: string;
  image_url?: string;
  youtube_url?: string;
  duration: number;
  created_at: string;
}

export function useQuizzes(eventId: string) {
  return useQuery({
    queryKey: ['quizzes', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Quiz[];
    },
    enabled: !!eventId,
  });
}

export function useQuiz(quizId: string | null) {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      if (!quizId) return null;
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (error) throw error;
      return data as Quiz;
    },
    enabled: !!quizId,
  });
}

export function useQuizQuestions(quizId: string | null) {
  return useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: async () => {
      if (!quizId) return [];
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('question_order', { ascending: true });

      if (error) throw error;
      return data as QuizQuestion[];
    },
    enabled: !!quizId,
  });
}

export function useCreateQuiz() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, title }: { eventId: string; title: string }) => {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({ event_id: eventId, title })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.eventId] });
      toast({ title: '測驗已建立' });
    },
    onError: () => {
      toast({ title: '建立測驗失敗', variant: 'destructive' });
    },
  });
}

export function useUpdateQuiz() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data, error } = await supabase
        .from('quizzes')
        .update({ title })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', data.id] });
      queryClient.invalidateQueries({ queryKey: ['quizzes', data.event_id] });
      toast({ title: '測驗已更新' });
    },
    onError: () => {
      toast({ title: '更新測驗失敗', variant: 'destructive' });
    },
  });
}

export function useDeleteQuiz() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (error) throw error;
      return { id, eventId };
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.eventId] });
      toast({ title: '測驗已刪除' });
    },
    onError: () => {
      toast({ title: '刪除測驗失敗', variant: 'destructive' });
    },
  });
}

export function useCreateQuestion() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (question: Omit<QuizQuestion, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert(question)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', data.quiz_id] });
      toast({ title: '題目已新增' });
    },
    onError: () => {
      toast({ title: '新增題目失敗', variant: 'destructive' });
    },
  });
}

export function useUpdateQuestion() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<QuizQuestion> & { id: string }) => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', data.quiz_id] });
      toast({ title: '題目已更新' });
    },
    onError: () => {
      toast({ title: '更新題目失敗', variant: 'destructive' });
    },
  });
}

export function useDeleteQuestion() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quizId }: { id: string; quizId: string }) => {
      const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
      if (error) throw error;
      return { id, quizId };
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', variables.quizId] });
      toast({ title: '題目已刪除' });
    },
    onError: () => {
      toast({ title: '刪除題目失敗', variant: 'destructive' });
    },
  });
}

export function useReorderQuestions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quizId, questions }: { quizId: string; questions: { id: string; question_order: number }[] }) => {
      const updates = questions.map((q) =>
        supabase
          .from('quiz_questions')
          .update({ question_order: q.question_order })
          .eq('id', q.id)
      );

      const results = await Promise.all(updates);

      // 檢查是否有錯誤
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        const errorMessages = errors.map(e => e.error?.message).filter(Boolean).join(', ');
        throw new Error(`重新排序失敗: ${errorMessages}`);
      }

      return quizId;
    },
    onSuccess: (quizId) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizId] });
    },
    onError: (error: Error) => {
      toast({
        title: '重新排序失敗',
        description: error.message,
        variant: 'destructive'
      });
    },
  });
}

// Content Slides Hooks
export function useContentSlides(quizId: string | null) {
  return useQuery({
    queryKey: ['content-slides', quizId],
    queryFn: async () => {
      if (!quizId) return [];
      const { data, error } = await supabase
        .from('quiz_content_slides')
        .select('*')
        .eq('quiz_id', quizId)
        .order('content_order', { ascending: true });

      if (error) throw error;
      return data as ContentSlide[];
    },
    enabled: !!quizId,
  });
}

export function useCreateContentSlide() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slide: Omit<ContentSlide, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('quiz_content_slides')
        .insert(slide)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['content-slides', data.quiz_id] });
      toast({ title: '內容穿插已新增' });
    },
    onError: () => {
      toast({ title: '新增內容穿插失敗', variant: 'destructive' });
    },
  });
}

export function useUpdateContentSlide() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContentSlide> & { id: string }) => {
      const { data, error } = await supabase
        .from('quiz_content_slides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['content-slides', data.quiz_id] });
      toast({ title: '內容穿插已更新' });
    },
    onError: () => {
      toast({ title: '更新內容穿插失敗', variant: 'destructive' });
    },
  });
}

export function useDeleteContentSlide() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quizId }: { id: string; quizId: string }) => {
      const { error } = await supabase.from('quiz_content_slides').delete().eq('id', id);
      if (error) throw error;
      return { id, quizId };
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-slides', variables.quizId] });
      toast({ title: '內容穿插已刪除' });
    },
    onError: () => {
      toast({ title: '刪除內容穿插失敗', variant: 'destructive' });
    },
  });
}
