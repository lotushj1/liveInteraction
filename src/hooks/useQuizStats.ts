import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface QuizStats {
  totalQuestions: number;
  totalResponses: number;
  averageScore: number;
  participantCount: number;
}

interface QuestionStats {
  questionId: string;
  questionText: string;
  totalResponses: number;
  correctResponses: number;
  averageTime: number;
  correctRate: number;
}

export function useQuizStats(eventId: string) {
  return useQuery({
    queryKey: ['quiz-stats', eventId],
    queryFn: async () => {
      // 獲取該活動的所有測驗
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('event_id', eventId);

      if (quizzesError) throw quizzesError;

      const quizIds = quizzes?.map(q => q.id) || [];

      if (quizIds.length === 0) {
        return {
          totalQuestions: 0,
          totalResponses: 0,
          averageScore: 0,
          participantCount: 0,
        };
      }

      // 獲取題目數量
      const { count: questionCount } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .in('quiz_id', quizIds);

      // 獲取回答統計
      const { data: responses } = await supabase
        .from('quiz_responses')
        .select('is_correct, points_earned, participant_id')
        .in('quiz_id', quizIds);

      // 獲取參與者數量
      const { count: participantCount } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      const totalResponses = responses?.length || 0;
      const averageScore = totalResponses > 0
        ? (responses?.reduce((sum, r) => sum + r.points_earned, 0) || 0) / totalResponses
        : 0;

      return {
        totalQuestions: questionCount || 0,
        totalResponses,
        averageScore: Math.round(averageScore),
        participantCount: participantCount || 0,
      } as QuizStats;
    },
    enabled: !!eventId,
  });
}

export function useQuestionStats(quizId: string) {
  return useQuery({
    queryKey: ['question-stats', quizId],
    queryFn: async () => {
      // 獲取該測驗的所有題目
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('id, question_text')
        .eq('quiz_id', quizId)
        .order('question_order', { ascending: true });

      if (questionsError) throw questionsError;

      if (!questions || questions.length === 0) {
        return [];
      }

      // 對每個題目獲取統計
      const stats = await Promise.all(
        questions.map(async (question) => {
          const { data: responses } = await supabase
            .from('quiz_responses')
            .select('is_correct, response_time')
            .eq('question_id', question.id);

          const totalResponses = responses?.length || 0;
          const correctResponses = responses?.filter(r => r.is_correct).length || 0;
          const averageTime = totalResponses > 0
            ? Math.round((responses?.reduce((sum, r) => sum + r.response_time, 0) || 0) / totalResponses)
            : 0;
          const correctRate = totalResponses > 0
            ? (correctResponses / totalResponses) * 100
            : 0;

          return {
            questionId: question.id,
            questionText: question.question_text,
            totalResponses,
            correctResponses,
            averageTime,
            correctRate: Math.round(correctRate * 10) / 10,
          } as QuestionStats;
        })
      );

      return stats;
    },
    enabled: !!quizId,
  });
}

export function useParticipantStats(eventId: string, participantId: string) {
  return useQuery({
    queryKey: ['participant-stats', eventId, participantId],
    queryFn: async () => {
      // 獲取該活動的所有測驗
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('id')
        .eq('event_id', eventId);

      const quizIds = quizzes?.map(q => q.id) || [];

      if (quizIds.length === 0) {
        return {
          totalAnswered: 0,
          correctAnswers: 0,
          totalPoints: 0,
          averageTime: 0,
        };
      }

      // 獲取該參與者的所有回答
      const { data: responses } = await supabase
        .from('quiz_responses')
        .select('is_correct, response_time, points_earned')
        .in('quiz_id', quizIds)
        .eq('participant_id', participantId);

      const totalAnswered = responses?.length || 0;
      const correctAnswers = responses?.filter(r => r.is_correct).length || 0;
      const totalPoints = responses?.reduce((sum, r) => sum + r.points_earned, 0) || 0;
      const averageTime = totalAnswered > 0
        ? Math.round((responses?.reduce((sum, r) => sum + r.response_time, 0) || 0) / totalAnswered)
        : 0;

      return {
        totalAnswered,
        correctAnswers,
        totalPoints,
        averageTime,
        correctRate: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0,
      };
    },
    enabled: !!eventId && !!participantId,
  });
}
