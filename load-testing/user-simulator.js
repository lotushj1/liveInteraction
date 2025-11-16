/**
 * User Simulator - 模擬單個用戶的行為
 * 此腳本模擬一個參與者連接到 Supabase Realtime 並進行互動
 */

import { createClient } from '@supabase/supabase-js';

export class UserSimulator {
  constructor(userId, config) {
    this.userId = userId;
    this.config = config;
    this.client = null;
    this.presenceChannel = null;
    this.broadcastChannel = null;
    this.metrics = {
      connectionTime: 0,
      messagesSent: 0,
      messagesReceived: 0,
      errors: [],
      presenceUpdates: 0,
      startTime: 0,
      endTime: 0,
    };
    this.isConnected = false;
    this.nickname = `TestUser_${userId}`;
  }

  /**
   * 初始化 Supabase 客戶端並建立連接
   */
  async connect() {
    const startTime = Date.now();
    this.metrics.startTime = startTime;

    try {
      // 創建 Supabase 客戶端
      this.client = createClient(
        this.config.supabaseUrl,
        this.config.supabaseKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
          realtime: {
            params: {
              eventsPerSecond: 10,
            },
          },
        }
      );

      // 設置 Presence Channel
      await this.setupPresenceChannel();

      // 設置 Broadcast Channel
      await this.setupBroadcastChannel();

      this.metrics.connectionTime = Date.now() - startTime;
      this.isConnected = true;

      if (this.config.verbose) {
        console.log(`[User ${this.userId}] 已連接 (耗時: ${this.metrics.connectionTime}ms)`);
      }

      return true;
    } catch (error) {
      this.metrics.errors.push({
        type: 'connection',
        message: error.message,
        timestamp: Date.now(),
      });
      console.error(`[User ${this.userId}] 連接失敗:`, error.message);
      return false;
    }
  }

  /**
   * 設置 Presence Channel - 追蹤用戶在線狀態
   */
  async setupPresenceChannel() {
    return new Promise((resolve, reject) => {
      try {
        const channelName = `event-presence-${this.config.eventId}`;

        this.presenceChannel = this.client.channel(channelName, {
          config: {
            presence: {
              key: this.userId,
            },
          },
        });

        this.presenceChannel
          .on('presence', { event: 'sync' }, () => {
            this.metrics.presenceUpdates++;
          })
          .on('presence', { event: 'join' }, () => {
            this.metrics.presenceUpdates++;
          })
          .on('presence', { event: 'leave' }, () => {
            this.metrics.presenceUpdates++;
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              // 發送自己的 presence 狀態
              await this.presenceChannel.track({
                participantId: this.userId,
                nickname: this.nickname,
                currentPage: 'lobby',
                lastActiveAt: Date.now(),
              });
              resolve();
            } else if (status === 'CHANNEL_ERROR') {
              reject(new Error('Presence channel subscription failed'));
            }
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 設置 Broadcast Channel - 接收實時廣播消息
   */
  async setupBroadcastChannel() {
    return new Promise((resolve, reject) => {
      try {
        const channelName = `event-${this.config.eventId}`;

        this.broadcastChannel = this.client.channel(channelName, {
          config: {
            broadcast: { self: false },
          },
        });

        this.broadcastChannel
          .on('broadcast', { event: '*' }, (payload) => {
            this.metrics.messagesReceived++;
            if (this.config.verbose && this.config.logMessages) {
              console.log(`[User ${this.userId}] 收到消息:`, payload.event);
            }
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              resolve();
            } else if (status === 'CHANNEL_ERROR') {
              reject(new Error('Broadcast channel subscription failed'));
            }
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 模擬用戶活動 - 定期更新 presence 和發送消息
   */
  async simulateActivity() {
    if (!this.isConnected) return;

    const activities = ['lobby', 'quiz', 'poll', 'qna'];
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];

    try {
      // 更新 presence 狀態
      await this.presenceChannel.track({
        participantId: this.userId,
        nickname: this.nickname,
        currentPage: randomActivity,
        lastActiveAt: Date.now(),
      });

      this.metrics.messagesSent++;

      // 隨機發送廣播消息（模擬答題或互動）
      if (Math.random() > 0.7) {
        await this.broadcastChannel.send({
          type: 'broadcast',
          event: 'user_action',
          payload: {
            userId: this.userId,
            action: 'answer_submitted',
            timestamp: Date.now(),
          },
        });
        this.metrics.messagesSent++;
      }
    } catch (error) {
      this.metrics.errors.push({
        type: 'activity',
        message: error.message,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 斷開連接並清理資源
   */
  async disconnect() {
    try {
      if (this.presenceChannel) {
        await this.client.removeChannel(this.presenceChannel);
      }
      if (this.broadcastChannel) {
        await this.client.removeChannel(this.broadcastChannel);
      }

      this.metrics.endTime = Date.now();
      this.isConnected = false;

      if (this.config.verbose) {
        console.log(`[User ${this.userId}] 已斷開連接`);
      }
    } catch (error) {
      this.metrics.errors.push({
        type: 'disconnection',
        message: error.message,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 獲取用戶的性能指標
   */
  getMetrics() {
    return {
      userId: this.userId,
      ...this.metrics,
      totalDuration: this.metrics.endTime - this.metrics.startTime,
      errorCount: this.metrics.errors.length,
    };
  }
}
