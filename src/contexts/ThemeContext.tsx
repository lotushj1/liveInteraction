import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // 從 localStorage 讀取已儲存的主題設定
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'system';
  });

  // 計算實際應用的主題（考慮系統偏好）
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;

    // 移除之前的主題類別
    root.classList.remove('light', 'dark');

    let resolvedTheme: 'light' | 'dark';

    if (theme === 'system') {
      // 使用系統偏好
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      resolvedTheme = systemTheme;
    } else {
      resolvedTheme = theme;
    }

    // 應用主題
    root.classList.add(resolvedTheme);
    setActualTheme(resolvedTheme);

    // 儲存到 localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 監聽系統主題變更
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      const newTheme = e.matches ? 'dark' : 'light';
      root.classList.add(newTheme);
      setActualTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
