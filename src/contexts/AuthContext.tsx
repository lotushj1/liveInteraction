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
    // 設定 auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // 檢查角色
        if (session?.user) {
          await checkUserRole(session.user.id).catch(err => {
            logger.error('Failed to check user role:', err);
          });
        } else {
          setIsHost(false);
        }

        setIsLoading(false);
      }
    );

    // 檢查現有 session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await checkUserRole(session.user.id).catch(err => {
          logger.error('Failed to check user role on init:', err);
        });
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'host')
        .maybeSingle();

      if (error) throw error;

      // 如果沒有角色記錄，自動創建 host 角色
      if (!data) {
        logger.log('No host role found, creating one...');
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role: 'host' }]);

        if (insertError) {
          logger.error('Error creating host role:', insertError);
          setIsHost(false);
        } else {
          logger.log('Host role created successfully');
          setIsHost(true);
        }
      } else {
        setIsHost(true);
      }
    } catch (error) {
      logger.error('Error checking user role:', error);
      setIsHost(false);
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
