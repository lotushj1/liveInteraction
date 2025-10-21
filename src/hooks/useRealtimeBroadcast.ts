import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { RealtimeEvent, RealtimeEventType } from '@/lib/realtimeEvents';

interface UseRealtimeBroadcastOptions {
  channelName: string;
  onEvent?: (event: RealtimeEvent) => void;
  enabled?: boolean;
}

export const useRealtimeBroadcast = ({
  channelName,
  onEvent,
  enabled = true,
}: UseRealtimeBroadcastOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    console.log(`[Broadcast] 訂閱頻道: ${channelName}`);

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false }, // 不接收自己發送的消息
      },
    });

    channel
      .on('broadcast', { event: '*' }, (payload) => {
        const event = payload.payload as RealtimeEvent;
        console.log(`[Broadcast] 收到事件: ${event.type}`, event);
        onEvent?.(event);
      })
      .subscribe((status) => {
        console.log(`[Broadcast] 訂閱狀態: ${status}`);
      });

    channelRef.current = channel;

    return () => {
      console.log(`[Broadcast] 取消訂閱: ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [channelName, enabled, onEvent]);

  // 發送廣播事件
  const broadcast = useCallback(
    async (event: RealtimeEvent) => {
      if (!channelRef.current) {
        console.error('[Broadcast] 頻道未初始化');
        return;
      }

      console.log(`[Broadcast] 發送事件: ${event.type}`, event);
      
      await channelRef.current.send({
        type: 'broadcast',
        event: event.type,
        payload: event,
      });
    },
    []
  );

  // 發送特定類型的事件
  const broadcastEvent = useCallback(
    async (type: RealtimeEventType, data: any, eventId: string) => {
      const { EVENT_PRIORITY_MAP, EventPriority } = await import('@/lib/realtimeEvents');
      const event: RealtimeEvent = {
        type,
        priority: EVENT_PRIORITY_MAP[type] || EventPriority.HIGH,
        timestamp: Date.now(),
        eventId,
        data,
        version: 1,
      };
      await broadcast(event);
    },
    [broadcast]
  );

  return {
    broadcast,
    broadcastEvent,
    isConnected: channelRef.current !== null,
  };
};
