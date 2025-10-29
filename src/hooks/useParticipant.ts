import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useParticipantContext } from '@/contexts/ParticipantContext';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { STORAGE_KEYS } from '@/lib/constants';

export const useParticipant = () => {
  const { toast } = useToast();
  const { setEvent, setParticipant } = useParticipantContext();
  const navigate = useNavigate();

  const joinEventMutation = useMutation({
    mutationFn: async ({ joinCode, nickname }: { joinCode: string; nickname: string }) => {
      logger.log('[useParticipant] Joining event with code:', joinCode);

      // 1. 驗證並獲取活動
      logger.log('[useParticipant] Step 1: Fetching event...');
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('join_code', joinCode.toUpperCase())
        .single();

      if (eventError) {
        logger.error('[useParticipant] Event fetch error:', eventError);
        logger.error('[useParticipant] Error details:', {
          code: eventError.code,
          message: eventError.message,
          details: eventError.details,
          hint: eventError.hint
        });
        if (eventError.code === 'PGRST116') {
          throw new Error('活動代碼不正確，請檢查後重試');
        }
        throw new Error(`查詢活動失敗: ${eventError.message}`);
      }

      if (!event) {
        logger.error('[useParticipant] No event found with code:', joinCode);
        throw new Error('找不到活動');
      }

      logger.log('[useParticipant] Event found:', event);

      // 檢查活動是否已結束
      if (event.ended_at) {
        logger.log('[useParticipant] Event has ended:', event.ended_at);
        throw new Error('此活動已結束');
      }

      // 2. 獲取當前使用者
      logger.log('[useParticipant] Step 2: Getting current user...');
      const { data: currentUser } = await supabase.auth.getUser();
      const userId = currentUser.user?.id || null;
      logger.log('[useParticipant] User ID:', userId || 'anonymous');

      // 3. 檢查該使用者是否已加入此活動
      if (userId) {
        logger.log('[useParticipant] Step 3: Checking existing participant...');
        const { data: existingParticipant } = await supabase
          .from('event_participants')
          .select('*')
          .eq('event_id', event.id)
          .eq('user_id', userId)
          .maybeSingle();

        if (existingParticipant) {
          // 使用者已加入，直接返回現有記錄
          logger.log('[useParticipant] User already joined, using existing record');
          return { event, participant: existingParticipant };
        }
      }

      // 4. 檢查暱稱是否重複（只對新加入的檢查）
      logger.log('[useParticipant] Step 4: Checking nickname availability...');
      const { data: existingNickname, error: nicknameError } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', event.id)
        .eq('nickname', nickname)
        .maybeSingle();

      if (nicknameError) {
        logger.error('[useParticipant] Nickname check error:', nicknameError);
      }

      if (existingNickname) {
        logger.log('[useParticipant] Nickname already taken');
        throw new Error('此暱稱已被使用，請換一個');
      }

      // 5. 建立新的參與記錄
      logger.log('[useParticipant] Step 5: Creating participant record...');
      const { data: participant, error: participantError } = await supabase
        .from('event_participants')
        .insert({
          event_id: event.id,
          user_id: userId,
          nickname
        })
        .select()
        .single();

      if (participantError) {
        logger.error('[useParticipant] Participant creation error:', participantError);
        logger.error('[useParticipant] Error details:', {
          code: participantError.code,
          message: participantError.message,
          details: participantError.details,
          hint: participantError.hint
        });
        throw new Error(`加入活動失敗: ${participantError.message}`);
      }

      if (!participant) {
        logger.error('[useParticipant] No participant data returned');
        throw new Error('加入活動失敗：無法創建參與記錄');
      }

      logger.log('[useParticipant] Successfully joined event:', participant);
      return { event, participant };
    },
    onSuccess: ({ event, participant }) => {
      // 儲存到 context 和 localStorage
      setEvent(event);
      setParticipant(participant);
      localStorage.setItem(STORAGE_KEYS.PARTICIPANT_EVENT_ID, event.id);
      localStorage.setItem(STORAGE_KEYS.PARTICIPANT_ID, participant.id);

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
    localStorage.removeItem(STORAGE_KEYS.PARTICIPANT_EVENT_ID);
    localStorage.removeItem(STORAGE_KEYS.PARTICIPANT_ID);
    navigate('/join');
  };

  return {
    joinEvent: joinEventMutation.mutate,
    isJoining: joinEventMutation.isPending,
    leaveEvent,
  };
};
