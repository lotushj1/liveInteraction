import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ParticipantPresence {
  participantId: string;
  nickname: string;
  currentPage: 'lobby' | 'quiz' | 'poll' | 'qna';
  lastActiveAt: number;
  isOnline: boolean;
}

interface UseParticipantPresenceOptions {
  eventId: string;
  participantId?: string;
  nickname?: string;
  enabled?: boolean;
}

export const useParticipantPresence = ({
  eventId,
  participantId,
  nickname,
  enabled = true,
}: UseParticipantPresenceOptions) => {
  const [presenceState, setPresenceState] = useState<Record<string, ParticipantPresence>>({});
  const [onlineCount, setOnlineCount] = useState(0);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !eventId) return;

    console.log(`[Presence] 初始化頻道: event-${eventId}`);

    const presenceChannel = supabase.channel(`event-presence-${eventId}`, {
      config: {
        presence: {
          key: participantId || 'anonymous',
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        console.log('[Presence] 同步狀態:', state);
        
        // 轉換 presence state 為我們的格式
        const presenceMap: Record<string, ParticipantPresence> = {};
        Object.entries(state).forEach(([key, presences]) => {
          const presence = presences[0] as any;
          presenceMap[key] = {
            participantId: key,
            nickname: presence.nickname || 'Anonymous',
            currentPage: presence.currentPage || 'lobby',
            lastActiveAt: presence.lastActiveAt || Date.now(),
            isOnline: true,
          };
        });
        
        setPresenceState(presenceMap);
        setOnlineCount(Object.keys(presenceMap).length);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[Presence] 參與者加入:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[Presence] 參與者離開:', key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log('[Presence] 訂閱狀態:', status);
        
        if (status === 'SUBSCRIBED' && participantId) {
          // 發送自己的 presence 狀態
          const myPresence = {
            participantId,
            nickname: nickname || 'Anonymous',
            currentPage: 'lobby',
            lastActiveAt: Date.now(),
          };
          
          await presenceChannel.track(myPresence);
          console.log('[Presence] 追蹤自己的狀態:', myPresence);
        }
      });

    setChannel(presenceChannel);

    return () => {
      console.log('[Presence] 清理頻道');
      supabase.removeChannel(presenceChannel);
    };
  }, [eventId, participantId, nickname, enabled]);

  // 更新自己的狀態
  const updatePresence = useCallback(
    async (updates: Partial<ParticipantPresence>) => {
      if (!channel || !participantId) return;

      const currentPresence = presenceState[participantId] || {};
      const newPresence = {
        ...currentPresence,
        ...updates,
        lastActiveAt: Date.now(),
      };

      await channel.track(newPresence);
      console.log('[Presence] 更新狀態:', newPresence);
    },
    [channel, participantId, presenceState]
  );

  // 更新當前頁面
  const updateCurrentPage = useCallback(
    async (page: 'lobby' | 'quiz' | 'poll' | 'qna') => {
      await updatePresence({ currentPage: page });
    },
    [updatePresence]
  );

  // 獲取所有在線參與者
  const getOnlineParticipants = useCallback(() => {
    return Object.values(presenceState).filter(p => p.isOnline);
  }, [presenceState]);

  // 獲取特定頁面的參與者數量
  const getParticipantCountByPage = useCallback(
    (page: 'lobby' | 'quiz' | 'poll' | 'qna') => {
      return Object.values(presenceState).filter(
        p => p.isOnline && p.currentPage === page
      ).length;
    },
    [presenceState]
  );

  return {
    presenceState,
    onlineCount,
    updatePresence,
    updateCurrentPage,
    getOnlineParticipants,
    getParticipantCountByPage,
  };
};
