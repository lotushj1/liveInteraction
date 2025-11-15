import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isHost: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // 設定 auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        // 檢查角色（但不阻塞 loading 狀態）
        if (session?.user) {
          checkUserRole(session.user.id).catch(err => {
            logger.error('Failed to check user role:', err);
          });
        } else {
          setIsHost(false);
        }

        // 立即設置 loading 為 false，不等待角色檢查
        setIsLoading(false);
      }
    );

    // 檢查現有 session（優化：立即設置 loading 為 false）
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      // 立即設置為 false，不等待角色檢查完成
      setIsLoading(false);

      // 背景執行角色檢查
      if (session?.user) {
        checkUserRole(session.user.id).catch(err => {
          logger.error('Failed to check user role on init:', err);
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      logger.log('Checking user role for:', userId);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'host')
        .maybeSingle();

      if (error) {
        logger.error('Error querying user_roles:', error);
        throw error;
      }

      // 如果沒有角色記錄，自動創建 host 角色
      if (!data) {
        logger.log('No host role found, creating one for user:', userId);

        const { data: insertData, error: insertError } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role: 'host' }])
          .select()
          .single();

        if (insertError) {
          logger.error('Error creating host role:', insertError);
          // 如果是權限錯誤，顯示提示
          if (insertError.code === '42501') {
            toast({
              title: "權限設置問題",
              description: "無法自動創建主持人角色。請聯繫管理員或檢查資料庫 RLS 政策。",
              variant: "destructive",
            });
          }
          setIsHost(false);
        } else {
          logger.log('Host role created successfully:', insertData);
          setIsHost(true);
        }
      } else {
        logger.log('Host role found:', data);
        setIsHost(true);
      }
    } catch (error: any) {
      logger.error('Error in checkUserRole:', error);
      // 即使出錯，也要設置 isHost 為 true，讓用戶至少能進入系統
      logger.log('Setting isHost to true to allow access despite error');
      setIsHost(true);

      toast({
        title: "角色檢查失敗",
        description: "已允許您訪問系統，但部分功能可能受限。",
        variant: "destructive",
      });
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName
          }
        }
      });

      if (error) throw error;

      toast({
        title: "註冊成功！",
        description: "歡迎加入 LivePulse",
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "登入成功！",
        description: "歡迎回來",
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "已登出",
        description: "期待再次見到您",
      });
    } catch (error) {
      logger.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isHost, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
