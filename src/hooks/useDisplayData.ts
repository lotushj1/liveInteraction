import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: string;
  title: string;
  current_mode: 'lobby' | 'quiz' | 'poll' | 'qna';
  is_active: boolean;
  current_poll_id: string | null;
  current_quiz_id: string | null;
}

interface Participant {
  id: string;
  nickname: string;
  joined_at: string;
}

interface Question {
  id: string;
  content: string;
  upvote_count: number;
  is_highlighted: boolean;
  status: string;
}

interface Poll {
  id: string;
  title: string;
  poll_type: string;
  options: any;
  is_active: boolean;
}

interface PollResponse {
  response: any;
}

export const useDisplayData = (eventId: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [pollResponses, setPollResponses] = useState<PollResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 獲取活動資訊
  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, current_mode, is_active, current_poll_id, current_quiz_id')
      .eq('id', eventId)
      .single();

    if (!error && data) {
      setEvent(data);
    }
  };

  // 獲取參與者列表
  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from('event_participants')
      .select('id, nickname, joined_at')
      .eq('event_id', eventId)
      .order('joined_at', { ascending: true });

    if (!error && data) {
      setParticipants(data);
    }
  };

  // 獲取 Q&A 問題
  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('id, content, upvote_count, is_highlighted, status')
      .eq('event_id', eventId)
      .eq('status', 'approved')
      .order('upvote_count', { ascending: false });

    if (!error && data) {
      setQuestions(data);
    }
  };

  // 獲取當前投票
  const fetchCurrentPoll = async () => {
    if (!event?.current_poll_id) {
      setCurrentPoll(null);
      setPollResponses([]);
      return;
    }

    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('id', event.current_poll_id)
      .single();

    if (!pollError && pollData) {
      setCurrentPoll(pollData);

      // 獲取投票結果
      const { data: responsesData, error: responsesError } = await supabase
        .from('poll_responses')
        .select('response')
        .eq('poll_id', event.current_poll_id);

      if (!responsesError && responsesData) {
        setPollResponses(responsesData);
      }
    }
  };

  // 初始化數據
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchEvent(),
        fetchParticipants(),
        fetchQuestions(),
      ]);
      setIsLoading(false);
    };

    initData();
  }, [eventId]);

  // 當活動模式改變時，獲取對應數據
  useEffect(() => {
    if (event?.current_mode === 'poll') {
      fetchCurrentPoll();
    }
  }, [event?.current_mode, event?.current_poll_id]);

  // 即時監聽活動變更（優化：使用 payload 直接更新）
  useEffect(() => {
    const eventChannel = supabase
      .channel(`event-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          console.log('[useDisplayData] 事件更新:', payload);
          // 使用 payload.new 直接更新，避免 refetch
          if (payload.new) {
            setEvent(payload.new as Event);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventChannel);
    };
  }, [eventId]);

  // 即時監聽參與者變更（優化：增量更新）
  useEffect(() => {
    const participantsChannel = supabase
      .channel(`participants-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_participants',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('[useDisplayData] 新參與者加入:', payload);
          if (payload.new) {
            setParticipants((prev) => [...prev, payload.new as Participant]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'event_participants',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('[useDisplayData] 參與者離開:', payload);
          if (payload.old) {
            setParticipants((prev) => prev.filter((p) => p.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
    };
  }, [eventId]);

  // 即時監聽問題變更（優化：增量更新和樂觀更新）
  useEffect(() => {
    const questionsChannel = supabase
      .channel(`questions-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('[useDisplayData] 新問題提交:', payload);
          if (payload.new && (payload.new as any).status === 'approved') {
            setQuestions((prev) => [payload.new as Question, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('[useDisplayData] 問題更新:', payload);
          if (payload.new) {
            setQuestions((prev) =>
              prev.map((q) => (q.id === (payload.new as any).id ? (payload.new as Question) : q))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(questionsChannel);
    };
  }, [eventId]);

  // 即時監聽投票回應（優化：增量更新）
  useEffect(() => {
    if (!event?.current_poll_id) return;

    const pollResponsesChannel = supabase
      .channel(`poll-responses-${event.current_poll_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poll_responses',
          filter: `poll_id=eq.${event.current_poll_id}`,
        },
        (payload) => {
          console.log('[useDisplayData] 新投票回應:', payload);
          if (payload.new) {
            setPollResponses((prev) => [...prev, payload.new as PollResponse]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pollResponsesChannel);
    };
  }, [event?.current_poll_id]);

  return {
    event,
    participants,
    questions,
    currentPoll,
    pollResponses,
    isLoading,
  };
};
