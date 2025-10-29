import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface Question {
  id: string;
  event_id: string;
  participant_id: string | null;
  content: string;
  upvote_count: number;
  is_highlighted: boolean;
  status: 'pending' | 'approved' | 'answered' | 'rejected';
  created_at: string;
  answered_at?: string | null;
}

export interface QuestionUpvote {
  id: string;
  question_id: string;
  participant_id: string;
  created_at: string;
}

export const useQuestions = (eventId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 獲取問題列表（按投票數和狀態排序）
  const { data: questions, isLoading, error } = useQuery({
    queryKey: ['questions', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('event_id', eventId)
        .order('status', { ascending: true }) // answered 排後面
        .order('upvote_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching questions:', error);
        throw error;
      }

      return data as Question[];
    },
    enabled: !!eventId,
  });

  // 建立問題
  const createQuestionMutation = useMutation({
    mutationFn: async ({ content, participantId }: { content: string; participantId?: string }) => {
      const { data, error } = await supabase
        .from('questions')
        .insert([
          {
            event_id: eventId,
            participant_id: participantId || null,
            content,
            status: 'approved', // 自動核准
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Question;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', eventId] });
      toast({
        title: '問題已提交',
        description: '您的問題已成功送出',
      });
    },
    onError: (error: any) => {
      logger.error('Error creating question:', error);
      toast({
        title: '提交失敗',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 更新問題狀態
  const updateQuestionStatusMutation = useMutation({
    mutationFn: async ({ questionId, status }: { questionId: string; status: Question['status'] }) => {
      const updates: any = { status };

      // 如果標記為已回答，記錄時間
      if (status === 'answered') {
        updates.answered_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', questionId)
        .select()
        .single();

      if (error) throw error;
      return data as Question;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', eventId] });
    },
    onError: (error: any) => {
      logger.error('Error updating question status:', error);
      toast({
        title: '更新失敗',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 標記為高亮
  const toggleHighlightMutation = useMutation({
    mutationFn: async ({ questionId, isHighlighted }: { questionId: string; isHighlighted: boolean }) => {
      const { data, error } = await supabase
        .from('questions')
        .update({ is_highlighted: isHighlighted })
        .eq('id', questionId)
        .select()
        .single();

      if (error) throw error;
      return data as Question;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', eventId] });
    },
    onError: (error: any) => {
      logger.error('Error toggling highlight:', error);
      toast({
        title: '操作失敗',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 刪除問題
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', eventId] });
      toast({
        title: '問題已刪除',
      });
    },
    onError: (error: any) => {
      logger.error('Error deleting question:', error);
      toast({
        title: '刪除失敗',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 投票
  const upvoteMutation = useMutation({
    mutationFn: async ({ questionId, participantId }: { questionId: string; participantId: string }) => {
      // 檢查是否已投票
      const { data: existingVote } = await supabase
        .from('question_upvotes')
        .select('id')
        .eq('question_id', questionId)
        .eq('participant_id', participantId)
        .maybeSingle();

      if (existingVote) {
        // 取消投票
        const { error: deleteError } = await supabase
          .from('question_upvotes')
          .delete()
          .eq('id', existingVote.id);

        if (deleteError) throw deleteError;

        // 減少投票數
        const { error: updateError } = await supabase.rpc('decrement_upvote_count', {
          question_id: questionId,
        });

        if (updateError) {
          // 如果 RPC 函數不存在，手動更新
          const { data: question } = await supabase
            .from('questions')
            .select('upvote_count')
            .eq('id', questionId)
            .single();

          if (question) {
            await supabase
              .from('questions')
              .update({ upvote_count: Math.max(0, question.upvote_count - 1) })
              .eq('id', questionId);
          }
        }

        return { action: 'removed' };
      } else {
        // 新增投票
        const { error: insertError } = await supabase
          .from('question_upvotes')
          .insert([
            {
              question_id: questionId,
              participant_id: participantId,
            },
          ]);

        if (insertError) throw insertError;

        // 增加投票數
        const { error: updateError } = await supabase.rpc('increment_upvote_count', {
          question_id: questionId,
        });

        if (updateError) {
          // 如果 RPC 函數不存在，手動更新
          const { data: question } = await supabase
            .from('questions')
            .select('upvote_count')
            .eq('id', questionId)
            .single();

          if (question) {
            await supabase
              .from('questions')
              .update({ upvote_count: question.upvote_count + 1 })
              .eq('id', questionId);
          }
        }

        return { action: 'added' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', eventId] });
      queryClient.invalidateQueries({ queryKey: ['question-upvotes'] });
    },
    onError: (error: any) => {
      logger.error('Error toggling upvote:', error);
      toast({
        title: '投票失敗',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 檢查用戶是否已對某問題投票
  const { data: userUpvotes } = useQuery({
    queryKey: ['question-upvotes', eventId],
    queryFn: async () => {
      const participantId = localStorage.getItem('participant_id');
      if (!participantId) return [];

      const { data, error } = await supabase
        .from('question_upvotes')
        .select('question_id')
        .eq('participant_id', participantId);

      if (error) {
        logger.error('Error fetching user upvotes:', error);
        return [];
      }

      return data.map(v => v.question_id);
    },
    enabled: !!eventId,
  });

  return {
    questions: questions || [],
    isLoading,
    error,
    createQuestion: createQuestionMutation.mutate,
    isCreating: createQuestionMutation.isPending,
    updateQuestionStatus: updateQuestionStatusMutation.mutate,
    toggleHighlight: toggleHighlightMutation.mutate,
    deleteQuestion: deleteQuestionMutation.mutate,
    upvote: upvoteMutation.mutate,
    userUpvotes: userUpvotes || [],
  };
};
