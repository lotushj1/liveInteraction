import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

type MembershipTier = 'free' | 'premium';

interface MembershipContextType {
  tier: MembershipTier;
  isPremium: boolean;
  features: {
    aiQuestionGeneration: boolean;
    maxEventsPerMonth: number;
    maxQuestionsPerQuiz: number;
  };
}

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

export function MembershipProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tier, setTier] = useState<MembershipTier>('free');

  useEffect(() => {
    // TODO: 未來從 Supabase 或支付系統獲取會員資格
    // 目前為模擬邏輯，可以根據用戶 email 或 user_metadata 判斷
    if (user) {
      // 模擬：檢查 localStorage 是否有 premium 標記
      const storedTier = localStorage.getItem('membership_tier') as MembershipTier;
      setTier(storedTier || 'free');
    }
  }, [user]);

  const isPremium = tier === 'premium';

  const features = {
    aiQuestionGeneration: isPremium,
    maxEventsPerMonth: isPremium ? 100 : 10,
    maxQuestionsPerQuiz: isPremium ? 100 : 20,
  };

  return (
    <MembershipContext.Provider value={{ tier, isPremium, features }}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (context === undefined) {
    throw new Error('useMembership must be used within a MembershipProvider');
  }
  return context;
}
