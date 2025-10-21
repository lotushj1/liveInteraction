import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useParticipantContext } from '@/contexts/ParticipantContext';
import { useNavigate } from 'react-router-dom';

export const useParticipant = () => {
  const { toast } = useToast();
  const { setEvent, setParticipant } = useParticipantContext();
  const navigate = useNavigate();

  const joinEventMutation = useMutation({
    mutationFn: async ({ joinCode, nickname }: { joinCode: string; nickname: string }) => {
      // 1. 驗證並獲取活動
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('join_code', joinCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (eventError || !event) {
        throw new Error('活動不存在或未啟動');
      }

      // 2. 獲取當前使用者
      const { data: currentUser } = await supabase.auth.getUser();
      const userId = currentUser.user?.id || null;

      // 3. 檢查該使用者是否已加入此活動
      if (userId) {
        const { data: existingParticipant } = await supabase
          .from('event_participants')
          .select('*')
          .eq('event_id', event.id)
          .eq('user_id', userId)
          .maybeSingle();

        if (existingParticipant) {
          // 使用者已加入，直接返回現有記錄
          console.log('使用者已加入此活動，使用現有記錄');
          return { event, participant: existingParticipant };
        }
      }

      // 4. 檢查暱稱是否重複（只對新加入的檢查）
      const { data: existingNickname } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', event.id)
        .eq('nickname', nickname)
        .maybeSingle();

      if (existingNickname) {
        throw new Error('此暱稱已被使用，請換一個');
      }

      // 5. 建立新的參與記錄
      const { data: participant, error: participantError } = await supabase
        .from('event_participants')
        .insert({
          event_id: event.id,
          user_id: userId,
          nickname
        })
        .select()
        .single();

      if (participantError || !participant) {
        console.error('加入活動錯誤:', participantError);
        throw new Error('加入活動失敗');
      }

      return { event, participant };
    },
    onSuccess: ({ event, participant }) => {
      // 儲存到 context 和 localStorage
      setEvent(event);
      setParticipant(participant);
      localStorage.setItem('participant_event_id', event.id);
      localStorage.setItem('participant_id', participant.id);

      toast({
        title: "成功加入！",
        description: `歡迎 ${participant.nickname}！`,
      });

      // 導航到等候室
      navigate(`/participant/${event.id}/lobby`);
    },
    onError: (error: any) => {
      toast({
        title: "加入失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const leaveEvent = () => {
    setEvent(null);
    setParticipant(null);
    localStorage.removeItem('participant_event_id');
    localStorage.removeItem('participant_id');
    navigate('/join');
  };

  return {
    joinEvent: joinEventMutation.mutate,
    isJoining: joinEventMutation.isPending,
    leaveEvent,
  };
};
