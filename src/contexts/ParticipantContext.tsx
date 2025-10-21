import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string | null;
  nickname: string;
  joined_at: string;
}

export interface Event {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  join_code: string;
  is_active: boolean;
  qna_enabled: boolean;
  current_mode: 'lobby' | 'quiz' | 'qna' | 'poll';
  current_quiz_id: string | null;
  current_poll_id: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  ended_at: string | null;
}

interface ParticipantContextType {
  event: Event | null;
  participant: EventParticipant | null;
  isLoading: boolean;
  setEvent: (event: Event | null) => void;
  setParticipant: (participant: EventParticipant | null) => void;
}

const ParticipantContext = createContext<ParticipantContextType | undefined>(undefined);

export const ParticipantProvider = ({ children }: { children: ReactNode }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [participant, setParticipant] = useState<EventParticipant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 從 localStorage 恢復狀態
    const savedEventId = localStorage.getItem('participant_event_id');
    const savedParticipantId = localStorage.getItem('participant_id');

    if (savedEventId && savedParticipantId) {
      Promise.all([
        supabase.from('events').select('*').eq('id', savedEventId).single(),
        supabase.from('event_participants').select('*').eq('id', savedParticipantId).single()
      ]).then(([eventRes, participantRes]) => {
        if (eventRes.data) setEvent(eventRes.data as Event);
        if (participantRes.data) setParticipant(participantRes.data as EventParticipant);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  // 監聽活動狀態變化
  useEffect(() => {
    if (!event) return;

    const channel = supabase
      .channel(`event:${event.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'events',
        filter: `id=eq.${event.id}`
      }, (payload) => {
        setEvent(payload.new as Event);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event?.id]);

  return (
    <ParticipantContext.Provider
      value={{
        event,
        participant,
        isLoading,
        setEvent,
        setParticipant
      }}
    >
      {children}
    </ParticipantContext.Provider>
  );
};

export const useParticipantContext = () => {
  const context = useContext(ParticipantContext);
  if (context === undefined) {
    throw new Error('useParticipantContext must be used within a ParticipantProvider');
  }
  return context;
};
