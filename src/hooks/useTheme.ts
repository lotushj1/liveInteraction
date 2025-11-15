import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // 從 localStorage 讀取使用者偏好，如果沒有則使用淺色模式
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return savedTheme || 'light';
    } catch (error) {
      console.error('Failed to read theme from localStorage:', error);
      return 'light';
    }
  });

  useEffect(() => {
    try {
      const root = window.document.documentElement;

      // 移除之前的主題 class
      root.classList.remove('light', 'dark');

      // 添加新的主題 class
      root.classList.add(theme);

      // 儲存到 localStorage
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Failed to apply theme:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, toggleTheme };
}
