import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEventParticipants = (eventId: string) => {
  const { data: participants, isLoading } = useQuery({
    queryKey: ['event-participants', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  return {
    participants: participants || [],
    participantCount: participants?.length || 0,
    isLoading,
  };
};
