import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  join_code: string;
  is_active: boolean;
  event_type: 'qna' | 'quiz';
  qna_enabled: boolean;
  current_mode: 'lobby' | 'qna' | 'poll' | 'quiz';
  current_quiz_id: string | null;
  current_poll_id: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  event_type: 'qna' | 'quiz';
  qna_enabled?: boolean;
}

export const useEvents = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            title: input.title,
            description: input.description || null,
            event_type: input.event_type,
            qna_enabled: input.qna_enabled ?? true,
            host_id: (await supabase.auth.getUser()).data.user?.id,
            join_code: '', // 觸發器會自動生成
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "活動已建立！",
        description: "您可以開始邀請參與者加入",
      });
    },
    onError: (error: any) => {
      toast({
        title: "建立失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Event> }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "活動已更新",
      });
    },
    onError: (error: any) => {
      toast({
        title: "更新失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "活動已刪除",
      });
    },
    onError: (error: any) => {
      toast({
        title: "刪除失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const duplicateEventMutation = useMutation({
    mutationFn: async (id: string) => {
      // 1. 獲取原始活動
      const { data: originalEvent, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;

      // 2. 創建新活動（不包含 id, join_code, created_at, updated_at）
      const { data: newEvent, error: createError } = await supabase
        .from('events')
        .insert([
          {
            title: `${originalEvent.title} (副本)`,
            description: originalEvent.description,
            event_type: originalEvent.event_type,
            qna_enabled: originalEvent.qna_enabled,
            host_id: (await supabase.auth.getUser()).data.user?.id,
            is_active: false, // 副本預設為未啟動
            current_mode: 'lobby',
            join_code: '', // 觸發器會自動生成
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      // 3. 如果是 quiz 類型，複製所有 quizzes 和相關資料
      if (originalEvent.event_type === 'quiz') {
        // 獲取原始活動的所有 quizzes
        const { data: originalQuizzes, error: quizzesError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('event_id', id);

        if (quizzesError) throw quizzesError;

        // 複製每個 quiz
        for (const originalQuiz of originalQuizzes || []) {
          const { data: newQuiz, error: quizError } = await supabase
            .from('quizzes')
            .insert([
              {
                event_id: newEvent.id,
                title: originalQuiz.title,
                is_active: false,
                current_question_index: 0,
              },
            ])
            .select()
            .single();

          if (quizError) throw quizError;

          // 複製 quiz questions
          const { data: originalQuestions, error: questionsError } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', originalQuiz.id)
            .order('question_order', { ascending: true });

          if (questionsError) throw questionsError;

          if (originalQuestions && originalQuestions.length > 0) {
            const newQuestions = originalQuestions.map((q) => ({
              quiz_id: newQuiz.id,
              question_text: q.question_text,
              options: q.options,
              question_order: q.question_order,
              time_limit: q.time_limit,
              points: q.points,
              image_url: q.image_url,
            }));

            const { error: insertQuestionsError } = await supabase
              .from('quiz_questions')
              .insert(newQuestions);

            if (insertQuestionsError) throw insertQuestionsError;
          }

          // 複製 content slides
          const { data: originalSlides, error: slidesError } = await supabase
            .from('quiz_content_slides')
            .select('*')
            .eq('quiz_id', originalQuiz.id)
            .order('content_order', { ascending: true });

          if (slidesError) throw slidesError;

          if (originalSlides && originalSlides.length > 0) {
            const newSlides = originalSlides.map((s) => ({
              quiz_id: newQuiz.id,
              content_order: s.content_order,
              title: s.title,
              description: s.description,
              image_url: s.image_url,
              youtube_url: s.youtube_url,
              duration: s.duration,
            }));

            const { error: insertSlidesError } = await supabase
              .from('quiz_content_slides')
              .insert(newSlides);

            if (insertSlidesError) throw insertSlidesError;
          }
        }
      }

      return newEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "活動已複製",
        description: "新活動已建立成功",
      });
    },
    onError: (error: any) => {
      toast({
        title: "複製失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    duplicateEvent: duplicateEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
    isDuplicating: duplicateEventMutation.isPending,
  };
};

export const useEvent = (id: string) => {
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });

  return { event, isLoading, error };
};
